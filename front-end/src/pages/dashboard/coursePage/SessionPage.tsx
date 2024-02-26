import { Camera, Close, Mic } from "@mui/icons-material";
import { Button, ButtonGroup, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { Socket } from "socket.io-client";
import { User, Session, SessionUpdate, EndSessionRequest, LeaveSessionRequest } from "models"
import VideoPane from "../../../components/VideoPane"
import {
    HOST_ENDED_SESSION,
    LEAVE_SESSION,
    STOP_SESSION,
    USER_JOINED_SESSION,
    USER_LEAVED_SESSION
} from "models";
import ErrorDialog from '../../../components/ErrorDialog'
import Peer, { MediaConnection } from "peerjs";
import MicIcon from '@mui/icons-material/Mic';
import Tooltip from '@mui/material/Tooltip';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicOffIcon from '@mui/icons-material/MicOff';
import LyricsTwoToneIcon from '@mui/icons-material/LyricsTwoTone';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";


type SessionPageProps = {
    isHost: boolean,
    webSocket?: Socket
    peerConnection?: Peer
    thisUser: User
    session: Session
    onLeaveSessionCallback: () => void
    videoDeviceID: string,
    audioDeviceID: string,
    muted: boolean,
    cameraHidden: boolean
}

const SessionPage = (props: SessionPageProps) => {
    const [attendeeVideos, setAttendeeVideos] = useState<{ [userID: string]: JSX.Element }>({})
    const [session, setSession] = useState<Session>(props.session)
    const [showHostEndedSessionDialog, setHostEndedSessionDialog] = useState(false)
    const [thisUserStream, setThisUserStream] = useState<MediaStream | undefined>(undefined)
    const [hostUserStream, setHostUserStream] = useState<MediaStream | undefined>(undefined)
    const [peers, setPeers] = useState<{ [userID: string]: [MediaConnection, User] }>({})
    const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null)
    const [muted, setMuted] = useState(props.muted)
    const [cameraHidden, setCameraHidden] = useState(props.cameraHidden)
    const [text, setText] = useState('');
    const handleSpeechResult = (result: string) => { setText(result); }
    const { transcript, resetTranscript } = useSpeechRecognition()

    useEffect(() => {
        if (transcript.length > 50) {
            resetTranscript()
        }

    }, [transcript])

    useEffect(() => {
        if (muted && cameraHidden) {
            return
        }

        SpeechRecognition.startListening({ continuous: true, language: 'en-US' })

        navigator.mediaDevices.getUserMedia({
            video: cameraHidden ? false : { deviceId: props.videoDeviceID },
            audio: muted ? false : { deviceId: props.audioDeviceID }
        }).then((stream) => {
            setThisUserStream(stream)
            stream.getAudioTracks()
        }).catch(err => {
            setHostEndedSessionDialog(true)
        })

        return () => {
            SpeechRecognition.stopListening()
        }
    }, [])

    useEffect(() => {
        return () => {
            thisUserStream?.getTracks().forEach((track) => {
                track.stop()
            })
        }

    }, [thisUserStream])

    useEffect(() => {
        // Set a listener to respond to calls
        // from joining users
        props.peerConnection?.on('call', incomingCall => {
            let callingUser: User = incomingCall.metadata.user
            let undefStream: boolean = incomingCall.metadata.noStream
            peers[callingUser.id] = [incomingCall, callingUser]
            setPeers(peers)

            incomingCall.answer(thisUserStream)

            if (undefStream) {
                if (callingUser.id.toString() === props.session.host.id.toString()) {
                    setHostUserStream(undefined)
                } else {
                    addNewAttendeeVideo(callingUser, undefined)
                }
            }

            incomingCall.on('stream', callingUserStream => {

                if (callingUser.id.toString() === props.session.host.id.toString()) {
                    setHostUserStream(callingUserStream)
                    return
                }

                addNewAttendeeVideo(callingUser, callingUserStream)
            })
        })

        return () => {
            props.peerConnection?.off('call')
        }
    }, [thisUserStream])

    useEffect(() => {
        if (muted) {
            SpeechRecognition.stopListening()
            return
        }

        SpeechRecognition.startListening({ continuous: true, language: 'en-US' })
    }, [muted])

    useEffect(() => {
        // Add listener for when we enter a session
        // and want to get updates for the users joining
        props.webSocket?.on(USER_JOINED_SESSION, (update: SessionUpdate) => {
            setSession(update.session)
            callUser(update.user)
            setSnackBarMessage(`${update.user.name} has joined the session`)
        })

        // Add listener for when we enter a session
        // and want to get updates for the users leaving
        props.webSocket?.on(USER_LEAVED_SESSION, (update: SessionUpdate) => {
            setSession(update.session)

            delete attendeeVideos[update.user.id]
            delete peers[update.user.id]

            setAttendeeVideos(attendeeVideos)
            setPeers(peers)

            setSnackBarMessage(`${update.user.name} has left the session`)
        })

        props.webSocket?.on(HOST_ENDED_SESSION, () => {
            leaveSession()
            setHostEndedSessionDialog(true)
        })

        // Every time the local user changes his stream
        // we need to send the new state of the stream to all the connected peers
        Object.keys(peers).forEach((userID) => {
            sendNewStream(peers[userID][1])
        })

        return () => {
            props.webSocket?.off(USER_JOINED_SESSION)
            props.webSocket?.off(USER_LEAVED_SESSION)
            props.webSocket?.off(HOST_ENDED_SESSION)
        }
    }, [thisUserStream])

    useEffect(() => {
        stopDeviceStreams()

        if (muted && cameraHidden) {
            setThisUserStream(undefined)
            return
        }

        navigator.mediaDevices.getUserMedia({
            audio: muted ? false : { deviceId: props.audioDeviceID },
            video: cameraHidden ? false : { deviceId: props.videoDeviceID },
        }).then((stream) => {
            setThisUserStream(stream)
        }).catch(err => {
            setHostEndedSessionDialog(true)
        })

        return () => {
            stopDeviceStreams()
        }

    }, [muted, cameraHidden])

    const callUser = (user: User) => {
        if (user.id.toString() === props.session.host.id.toString()) {
            setHostUserStream(undefined)
        } else {
            addNewAttendeeVideo(user, undefined)
        }
        setTimeout(() => {

            const call = props.peerConnection?.call(
                user.peerID,
                thisUserStream === undefined ? new MediaStream() : thisUserStream,
                { metadata: { user: props.thisUser, noStream: thisUserStream === undefined } }
            )

            if (call === undefined) {
                return
            }

            peers[user.id] = [call, user]
            setPeers(peers)

            call.on('stream', (joiningUserStream) => {
                if (user.id.toString() === props.session.host.id.toString()) {
                    setHostUserStream(joiningUserStream)
                    return
                }

                addNewAttendeeVideo(user, joiningUserStream)
            })
        }, 500);
    }

    const sendNewStream = (user: User) => {
        props.peerConnection?.call(
            user.peerID,
            thisUserStream === undefined ? new MediaStream() : thisUserStream,
            { metadata: { user: props.thisUser, noStream: thisUserStream === undefined } }
        )
    }

    const stopDeviceStreams = () => {
        thisUserStream?.getTracks().forEach((track) => {
            track.stop()
            thisUserStream.removeTrack(track)
        })
    }

    const addNewAttendeeVideo = (joiningUser: User, joiningUserStream: MediaStream | undefined) => {
        attendeeVideos[joiningUser.id] = <VideoPane
            key={joiningUser.id}
            stream={joiningUserStream}
            borderPrimary={false}
            isLocalUser={false}
            user={joiningUser}
            heightClass="h-[250px]" />

        let newState: { [userID: string]: JSX.Element } = {}
        Object.keys(attendeeVideos).forEach((userID) => {
            newState[userID] = attendeeVideos[userID]
        })

        setAttendeeVideos(newState)
    }

    const determineButtonText = (): string => {
        if (props.isHost) {
            return "End Session"
        }

        return "Leave Session"
    }

    const leaveSession = () => {
        if (props.isHost) {
            props.webSocket?.emit(STOP_SESSION, { sessionID: props.session?.id } as EndSessionRequest)
        } else {
            props.webSocket?.emit(LEAVE_SESSION, { sessionID: props.session?.id } as LeaveSessionRequest)
        }

        Object.keys(peers).forEach((userID) => {
            peers[userID][0].close()
        })
    }

    return (
        <div className="w-screen bg-tertiary overflow-y-hidden" >
            {
                snackBarMessage !== null &&
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={snackBarMessage !== null}
                    autoHideDuration={5000}
                    onClose={() => {
                        setSnackBarMessage(null)
                    }}
                    message={snackBarMessage} />
            }

            <ErrorDialog
                dialogTitle="Host ended session"
                errorMessage="The host has ended the live session."
                buttonClickCallback={() => {
                    setHostEndedSessionDialog(false)
                    leaveSession()
                    props.onLeaveSessionCallback()
                }}
                show={showHostEndedSessionDialog}
                buttonText="Leave" />
            <div className="flex flex-row h-full">
                <div className="flex-1 flow-up-animation flex flex-col">
                    <div className="flex flex-row justify-between items-center p-5">
                        <h1 className='font-jakarta-sans text-2xl'>Live Session</h1>
                        <Button className="font-jakarta-sans bg-primary text-white
                            shadow-slate-500 shadow-sm
                            transition hover:bg-red-500 duration-300 h-[50px]" onClick={() => {
                                leaveSession()
                                props.onLeaveSessionCallback()
                            }}><Close className="mr-5" />{determineButtonText()}</Button>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center items-center">
                        <VideoPane
                            stream={props.isHost ? thisUserStream : hostUserStream}
                            borderPrimary={true}
                            isLocalUser={props.isHost}
                            user={session.host}
                            heightClass="h-full" />
                        <div className="text-white bg-black">{transcript}</div>
                    </div>
                    <div className="bg-primary h-[175px] flex flex-col items-center min-h-fit justify-center">
                        <ButtonGroup>
                            <Tooltip title={muted ? "Unmute" : "Mute"} arrow>
                                <Button variant="contained" onClick={() => {
                                    setMuted(!muted)
                                }}>
                                    {
                                        muted
                                            ? <MicOffIcon />
                                            : <MicIcon />
                                    }
                                </Button>
                            </Tooltip>
                            <Tooltip title={cameraHidden ? "Show Video" : "Hide Video"} arrow>
                                <Button variant="contained" onClick={() => {
                                    setCameraHidden(!cameraHidden)
                                }}>
                                    {
                                        cameraHidden
                                            ? <VideocamOffIcon />
                                            : <VideocamIcon />
                                    }
                                </Button>
                            </Tooltip>
                            <Button variant="contained" onClick={() => {

                            }}>
                                <LyricsTwoToneIcon />
                            </Button>
                        </ButtonGroup>

                    </div>
                </div>
                <div className="bg-secondary overflow-y-auto flex flex-col z-10 shadow-lg shadow-black w-[500px]">
                    <div className="p-5 flow-up-animation">
                        <h1 className="font-jakarta-sans text-2xl text-white">Attendees</h1>
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                        {
                            session.attendees.length === 0 &&
                            <div className="flow-up-animation flex flex-col items-center h-full justify-center">
                                <PersonOffIcon className='text-white h-[50px] w-[50px] mb-5 opacity-50' />
                                <h1 className="text-white text-2xl font-jakarta-sans font-extralight opacity-50">No attendees present.</h1>
                            </div>
                        }
                        {
                            session.attendees.length > 0 &&
                            <div className="flex flex-col m-5 overflow-y-auto">
                                {Object.keys(attendeeVideos).map((userID) => {
                                    if (userID === props.thisUser.id) {
                                        return
                                    }

                                    return (
                                        <div className="mb-5">
                                            {attendeeVideos[userID]}
                                        </div>
                                    )
                                })}
                            </div>
                        }
                        {
                            !props.isHost &&
                            <div className="bg-red-900 p-5 flex flex-col items-center">
                                <VideoPane
                                    stream={thisUserStream}
                                    borderPrimary={true}
                                    isLocalUser={true}
                                    user={props.thisUser}
                                    heightClass="h-[250px]" />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div >
    )
}

export default SessionPage;
