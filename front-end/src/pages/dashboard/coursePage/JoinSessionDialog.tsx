import { Close } from "@mui/icons-material"
import { Autocomplete, Button, Dialog, IconButton, TextField } from "@mui/material"
import { Session, User } from 'models'
import { useEffect, useRef, useState } from "react"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DevicePrompt, { DeviceIDCollector } from "../../../components/DevicePrompt";


export type JoinSessionDialogProps = {
    show: boolean
    session: Session | null,
    onClose: () => void,
    onJoinClick: (sessionToJoin: Session,
        selectedVideoDeviceID: string,
        selectedAudioDeviceID: string,
        muteOnJoin: boolean,
        hidCameraOnJoin: boolean) => void,
}

const JoinSessionDialog = (props: JoinSessionDialogProps) => {
    const [slideDirection, setSlideDirection] = useState("");
    const [attendeeList, setAttendeeList] = useState<User[]>([])
    const deviceCollector = useRef<DeviceIDCollector>(null)

    useEffect(() => {
        if (props.session?.attendees === undefined) {
            return
        }

        setAttendeeList(props.session.attendees)
    }, [props.session])

    const renderAttendeeString = (): string => {
        if (attendeeList.length === 0) {
            return "No Attendees"
        }

        let attendeeString = ""

        attendeeList.forEach((attendee) => {
            attendeeString += `${attendee.name}\n`
        })

        return attendeeString
    }

    return (
        <div>
            <Dialog open={props.show} fullWidth={true}>
                <div className="flex flex-row overflow-hidden">
                    <div className="bg-primary w-[75px] min-w-[75px] z-10 shadow-lg">
                    </div>
                    <div className="flex flex-col p-5 flex-1 min-w-[525px]">
                        <div className="flex flex-row justify-between items-center mb-5">
                            <h1 className="font-jakarta-sans text-2xl">Join Session</h1>
                            <IconButton className='m-5 bg-secondary text-white transition ease-in-out hover:-translate-y
                        hover:scale-110 hover:bg-red-500 duration-300' onClick={() => {
                                    props.onClose()
                                }}><Close /></IconButton>
                        </div>
                        <div className={`flex flex-row min-w-[1000px] h-full ${slideDirection} mb-5`}>
                            <div className="flex flex-col w-[485px] min-w-[485px] mr-5">
                                <TextField value={props.session?.host.name} className="mb-5" label="Tutor" />
                                <TextField multiline rows={12} label="Attendees" value={renderAttendeeString()} className="mb-5" />
                            </div>
                            <DevicePrompt
                                hideSave={true}
                                columnStyle={true}
                                mute={false}
                                ref={deviceCollector} />
                        </div>
                        <div className={`flex flex-row ${slideDirection === "" || slideDirection === "slide-left" ? 'justify-end' : 'justify-between'}`}>
                            {
                                slideDirection === "" || slideDirection === "slide-right" &&
                                <Button className={`first-letter:font-jakarta-sans`}
                                    variant='outlined'
                                    color='info'
                                    onClick={() => {
                                        setSlideDirection("slide-left")
                                    }}>
                                    <ArrowBackIcon />
                                </Button>

                            }
                            <Button disabled={slideDirection === "slide-right" && !deviceCollector.current?.hasPermission} className="font-jakarta-sans  text-white
                            transition hover:bg-indigo-500 duration-300" variant="contained" onClick={() => {
                                    if (slideDirection === "" || slideDirection === "slide-left") {
                                        setSlideDirection("slide-right")
                                        return
                                    }

                                    if (props.session === null) {
                                        return
                                    }

                                    if (deviceCollector.current === null) {
                                        return
                                    }

                                    if (!deviceCollector.current.hasPermission) {
                                        return
                                    }

                                    const [selectedVideoDeviceID, selectedAudioDeviceID] = deviceCollector.current?.getDeviceIDs()
                                    const muted = deviceCollector.current.getMute()
                                    const hideCamera = deviceCollector.current.getHideCamera()

                                    props.onJoinClick(props.session, selectedVideoDeviceID, selectedAudioDeviceID, muted, hideCamera)
                                    props.onClose()
                                }}>{slideDirection === "" || slideDirection === "slide-left" ? "Next" : "Join"}</Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default JoinSessionDialog
