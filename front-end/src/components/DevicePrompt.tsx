import { Autocomplete, Button, FormControlLabel, Switch, TextField } from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import MicIcon from '@mui/icons-material/Mic';
import { VideoCall } from "@mui/icons-material"
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

export type DeviceIDCollector = {
    getDeviceIDs: () => [string, string]
    getMute: () => boolean
    getHideCamera: () => boolean
    hasPermission: boolean
}

type Props = {
    mute: boolean
    columnStyle: boolean
    hideSave: boolean
    onSave?: () => void
}

export const VideoDeviceID = 'study_hero_video_id'
export const AudioDeviceID = 'study_hero_audio_id'
export const MuteMe = 'study_hero_mute_join'
export const HideVideo = 'study_hero_hide_video_join'

const DevicePrompt = forwardRef<DeviceIDCollector, Props>((props, ref) => {
    const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([])
    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([])
    const [selectedVideoInput, setSelectedVideoInput] = useState<MediaDeviceInfo | null>(null)
    const [selectedAudioInput, setSelectedAudioInput] = useState<MediaDeviceInfo | null>(null)
    const [selectedVideoDeviceID, setSelectedVideoDeviceID] = useState<string>("")
    const [selectedAudioDeviceID, setSelectedAudioDeviceID] = useState<string>("")
    const [noPermissionError, setNoPermissionError] = useState(true)
    const [thisUserStream, setUserStream] = useState<MediaStream | null>(null)
    const [muteOnJoin, setMuteOnJoin] = useState(sessionStorage.getItem(MuteMe) !== null && sessionStorage.getItem(MuteMe) === '1')
    const [hideCameraOnJoin, setHideCameraOnJoin] = useState(sessionStorage.getItem(HideVideo) !== null && sessionStorage.getItem(HideVideo) === '1')
    const preview = useRef<HTMLVideoElement>(null)

    useImperativeHandle(ref, () => ({
        getDeviceIDs() {
            return [selectedVideoDeviceID, selectedAudioDeviceID]
        },
        getHideCamera() {
            return hideCameraOnJoin
        },
        getMute() {
            return muteOnJoin
        },
        hasPermission: !noPermissionError
    }))

    useEffect(() => {
        const savedVideoDeviceID = sessionStorage.getItem(VideoDeviceID)
        const savedAudioDeviceID = sessionStorage.getItem(AudioDeviceID)

        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        }).then((stream) => {
            setNoPermissionError(false)

            navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
                mediaDevices.forEach((device) => {
                    if (device.kind === "videoinput") {
                        videoInputDevices.push(device)
                        return
                    }

                    if (device.kind === "audioinput") {
                        audioInputDevices.push(device)
                        return
                    }
                })
                setVideoInputDevices(videoInputDevices)
                setAudioInputDevices(audioInputDevices)

                if (videoInputDevices.length > 0) {
                    setSelectedVideoInput(videoInputDevices[0])
                    setSelectedVideoDeviceID(videoInputDevices[0].deviceId)
                }

                if (audioInputDevices.length > 0) {
                    setSelectedAudioInput(audioInputDevices[0])
                    setSelectedAudioDeviceID(audioInputDevices[0].deviceId)
                }

                if (savedVideoDeviceID !== null) {
                    mediaDevices.forEach((device) => {
                        if (device.deviceId === savedVideoDeviceID) {
                            setSelectedVideoInput(device)
                            setSelectedVideoDeviceID(device.deviceId)
                        }
                    })
                }

                if (savedAudioDeviceID !== null) {
                    mediaDevices.forEach((device) => {
                        if (device.deviceId === savedAudioDeviceID) {
                            setSelectedAudioInput(device)
                            setSelectedAudioDeviceID(device.deviceId)
                        }
                    })
                }

                stream.getTracks().forEach((track) => {
                    track.stop()
                })
            })
        }).catch(reason => {
            setNoPermissionError(true)
        })

        return () => {
            setVideoInputDevices([])
            setAudioInputDevices([])
            setSelectedVideoInput(null)
            setSelectedAudioInput(null)
        }
    }, [])

    useEffect(() => {
        stopDeviceStreams()

        if (muteOnJoin && hideCameraOnJoin) {
            return
        }

        navigator.mediaDevices.getUserMedia({
            audio: !muteOnJoin,
            video: !hideCameraOnJoin,
        }).then((stream) => {
            setNoPermissionError(false)
            setUserStream(stream)
        }).catch(err => {
            setNoPermissionError(true)
        })

        return () => {
            stopDeviceStreams()
        }

    }, [muteOnJoin, hideCameraOnJoin])

    useEffect(() => {
        return () => {
            stopDeviceStreams()
        }
    }, [thisUserStream])

    useEffect(() => {
        if (preview.current === null || thisUserStream === null) {
            return
        }

        preview.current.srcObject = thisUserStream
        preview.current.muted = props.mute
        preview.current.addEventListener('loadedmetadata', (ev) => {
            preview.current?.play()
        })

    }, [preview, thisUserStream])

    useEffect(() => {
        if (selectedAudioInput === null || thisUserStream === null) {
            return
        }

        navigator.mediaDevices.getUserMedia({
            audio: { deviceId: selectedAudioInput.deviceId }
        }).then((audioStream) => {
            let currentAudioTrack = thisUserStream?.getAudioTracks()[0]

            if (currentAudioTrack !== undefined) {
                thisUserStream?.removeTrack(currentAudioTrack)
            }

            thisUserStream?.addTrack(audioStream.getTracks()[0])
            setUserStream(thisUserStream)
        })

        setSelectedAudioDeviceID(selectedAudioInput.deviceId)

    }, [selectedAudioInput])

    useEffect(() => {
        if (selectedVideoInput === null || thisUserStream === null) {
            return
        }

        navigator.mediaDevices.getUserMedia({
            video: { deviceId: selectedVideoInput.deviceId },
            audio: { deviceId: selectedAudioInput?.deviceId }
        }).then((newStream) => {
            setUserStream(newStream)
        })

        setSelectedVideoDeviceID(selectedVideoInput.deviceId)

    }, [selectedVideoInput])

    const savePreferences = () => {
        sessionStorage.setItem(VideoDeviceID, selectedVideoDeviceID)
        sessionStorage.setItem(AudioDeviceID, selectedAudioDeviceID)
        sessionStorage.setItem(MuteMe, muteOnJoin ? "1" : "0")
        sessionStorage.setItem(HideVideo, hideCameraOnJoin ? "1" : "0")

        if (props.onSave !== undefined) {
            props.onSave()
        }
    }

    const stopDeviceStreams = () => {
        thisUserStream?.getTracks().forEach((track) => {
            track.stop()
            thisUserStream.removeTrack(track)
        })

        if (preview.current !== null) {
            preview.current.srcObject = null
        }
    }

    return (
        <div className={`w-full flex ${props.columnStyle ? 'flex-col' : 'flex-row'}`}>
            <div className={`flex flex-col ${props.columnStyle ? 'w-full' : 'w-1/2'}`}>
                <Autocomplete<MediaDeviceInfo>
                    onChange={(event, device) => {
                        if (device !== null) {
                            setSelectedVideoInput(device)
                        }
                    }}
                    isOptionEqualToValue={(option, device) => {
                        return option.deviceId === device.deviceId;
                    }}
                    value={selectedVideoInput}
                    className="mb-5 font-jakarta-sans"
                    renderInput={(params) => <TextField error={noPermissionError} {...params} className="font-jakarta-sans" label="Video Device" />}
                    options={videoInputDevices} />
                <Autocomplete<MediaDeviceInfo>
                    onChange={(event, device) => {
                        if (device !== null) {
                            setSelectedAudioInput(device)
                        }
                    }}
                    isOptionEqualToValue={(option, device) => {
                        return option.deviceId === device.deviceId;
                    }}
                    value={selectedAudioInput}
                    className="mb-5 font-jakarta-sans"
                    renderInput={(params) => <TextField error={noPermissionError} {...params} className="font-jakarta-sans" label="Microphone" />}
                    options={audioInputDevices} />

                {
                    noPermissionError &&
                    <div className="flex flex-col items-center">
                        <h1 className="font-jakarta-sans text-md italic mb-5">
                            Media device access is required to participate in a live session.
                            In order to proceed, you must provide us with permission to access these devices.
                        </h1>
                    </div>

                }
                {
                    !noPermissionError && !hideCameraOnJoin &&
                    <video className="bg-black mirrored-x max-h-[250px]" ref={preview} />
                }
                {
                    !noPermissionError && hideCameraOnJoin &&
                    <div className="bg-black min-h-[250px] h-[250px] flex flex-col items-center justify-center">
                        <VideocamOffIcon className="text-white" />
                    </div>
                }
            </div>
            <div className={`flex ${props.columnStyle ? 'flex-row mt-5' : 'flex-col ml-5'} justify-between flex-1`}>
                <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                        <FormControlLabel control={<Switch checked={muteOnJoin} onChange={(e) => {
                            setMuteOnJoin(e.target.checked)
                        }} />} label="Mute Me On Join" />
                        <MicIcon />
                    </div>
                    <div className="flex flex-row items-center">
                        <FormControlLabel control={<Switch checked={hideCameraOnJoin} onChange={(e) => {
                            setHideCameraOnJoin(e.target.checked)
                        }} />} label="Turn Off Video On Join" />
                        <VideoCall />
                    </div>
                </div>
                {
                    !props.hideSave &&
                    <div className="flex flex-row justify-end">
                        <Button onClick={() => {
                            savePreferences()
                        }} variant="contained" className="font-jakarta-sans hover:bg-blue-500 duration-300 bg-primary w-[100px]">Save</Button>
                    </div>
                }
            </div>
        </div>
    )
})

export default DevicePrompt
