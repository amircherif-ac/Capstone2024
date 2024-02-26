import { useEffect, useRef, useState } from "react"
import { User } from "models"
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Avatar } from "@mui/material";
import { MicOff } from "@mui/icons-material";

export interface Props {
    user: User
    isLocalUser: boolean
    borderPrimary: boolean
    stream: MediaStream | undefined
    heightClass: string
}

const VideoPane = (props: Props): JSX.Element => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [cameraHidden, setCameraHidden] = useState(false)
    const [micMuted, setMicMuted] = useState(false)

    useEffect(() => {
        if (props.stream === undefined) {
            setCameraHidden(true)
            setMicMuted(true)
            return
        }

        setCameraHidden(props.stream?.getVideoTracks().length === 0)
        setMicMuted(props.stream?.getAudioTracks().length === 0)

        setTimeout(() => {
            if (props.stream === undefined) {
                return
            }

            if (videoRef === undefined) {
                return
            }

            if (videoRef.current === null) {
                return
            }

            if (props.isLocalUser) {
                videoRef.current.muted = true
            }

            videoRef.current.srcObject = props.stream
            videoRef.current.addEventListener('loadedmetadata', (ev) => {
                videoRef.current?.play()
            })

        }, 500);
    }, [videoRef, props.stream])

    useEffect(() => {
        return () => {
            props.stream?.getTracks().forEach((track) => {
                track.stop()
            })
        }
    }, [props.stream])

    return (
        <div className={`flow-up-animation w-full h-full bg-black border-primary border-b-0 border-[5px] flex flex-col`}>
            <div className="flex flex-col items-center h-full">
                {
                    cameraHidden
                        ? <div className="h-full flex flex-col items-center justify-center">
                            <Avatar className="mb-5 h-[100px] w-[100px]" />
                            <VideocamOffIcon className="text-white text-5xl" />
                        </div>
                        : <video ref={videoRef} className={`bg-black mirrored-x ${props.heightClass !== "" ? props.heightClass : 'h-[250px]'}`} />
                }
            </div>
            <div className={`min-h-[10px] bg-primary font-jakarta-sans text-white text-xl flex flex-row justify-between`}>
                <h1>{props.user.name}</h1>
                {
                    micMuted &&
                    <MicOff className="text-red-500" />
                }
            </div>
        </div>
    )
}

export default VideoPane
