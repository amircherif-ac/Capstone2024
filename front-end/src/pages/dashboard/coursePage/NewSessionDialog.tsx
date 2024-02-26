import { Close } from "@mui/icons-material";
import { Autocomplete, Button, Checkbox, createFilterOptions, Dialog, IconButton, TextField } from "@mui/material";
import { useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { Course, User } from "models";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DevicePrompt, { DeviceIDCollector } from "../../../components/DevicePrompt";

type NewSessionDialogProps = {
    show: boolean,
    onClose: () => void
    courseOptions: Course[]
    webSocket?: Socket
    thisUser: User,
    onCreateCallback: (videoDeviceID: string,
        audioDeviceID: string,
        course: Course,
        maxAttendees: number,
        mute: boolean,
        hideCamera: boolean) => void,
}

const NewSessionDialog = (props: NewSessionDialogProps) => {
    const [selectedCourse, setSelectedCourse] = useState<Course>(props.courseOptions[0])
    const [limitAttendees, setLimitAttendees] = useState(false);
    const [maxAttendees, setMaxAttendees] = useState(1);
    const [description, setDescription] = useState("");
    const [slideDirection, setSlideDirection] = useState("");
    const deviceCollector = useRef<DeviceIDCollector>(null)

    const subjectFilterOptions = createFilterOptions<Course>({
        limit: 500,
    })

    return (
        <div>
            <Dialog open={props.show} fullWidth={true} onClose={props.onClose}>
                <div className="flex flex-row overflow-hidden">
                    <div className="flex flex-col items-center bg-primary w-[75px] min-w-[75px] z-10 shadow-lg">
                        {
                            slideDirection !== 'slide-right' &&
                            <Checkbox disabled={slideDirection === 'slide-right'} className="text-white mt-[200px]" color='info' checked={limitAttendees} onChange={(ev) => {
                                setLimitAttendees(!limitAttendees)
                            }} />
                        }
                    </div>
                    <div className="flex flex-col p-5 flex-1 min-w-[525px]">
                        <div className="flex flex-row justify-between items-center mb-5">
                            <h1 className="font-jakarta-sans text-2xl">Create a live session</h1>
                            <IconButton className='m-5 bg-secondary text-white transition ease-in-out hover:-translate-y
                        hover:scale-110 hover:bg-red-500 duration-300' onClick={() => {
                                    props.onClose()
                                }}><Close /></IconButton>
                        </div>
                        <div className={`flex flex-row min-w-[1000px] h-full ${slideDirection} mb-5`}>
                            <div className="flex flex-col w-[485px] min-w-[485px] mr-5">
                                <Autocomplete<Course>
                                    filterOptions={subjectFilterOptions}
                                    value={selectedCourse}
                                    isOptionEqualToValue={(option, value) => {
                                        return option.courseId === value.courseId
                                    }}
                                    onChange={(event, option) => {
                                        if (option !== null) {
                                            setSelectedCourse(option)
                                        }
                                    }}
                                    getOptionLabel={(course) => {
                                        return course.subject.courseCode.courseCode + course.subject.courseNumber
                                    }}
                                    autoComplete
                                    className="mb-5 font-jakarta-sans"
                                    renderInput={(params) => <TextField {...params} className="font-jakarta-sans" label="Subject" />}
                                    options={props.courseOptions} />
                                <TextField className="mb-5" disabled={!limitAttendees} type='number' label="Max Attendees" value={maxAttendees} onChange={(ev) => {
                                    let newValue = +ev.target.value
                                    if (newValue > 0) {
                                        setMaxAttendees(+ev.target.value)
                                    }
                                }} />
                                <TextField
                                    className="mb-5"
                                    label="Description (optional)"
                                    multiline={true} rows={8}
                                    value={description}
                                    onChange={(ev) => {
                                        setDescription(ev.target.value)
                                    }} />
                            </div>
                            <DevicePrompt hideSave={true} mute={false} columnStyle={true} ref={deviceCollector} />
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

                                    if (deviceCollector.current === null) {
                                        return
                                    }

                                    if (!deviceCollector.current.hasPermission) {
                                        return
                                    }

                                    const [selectedVideoDeviceID, selectedAudioDeviceID] = deviceCollector.current?.getDeviceIDs()
                                    const mute = deviceCollector.current?.getMute()
                                    const hideCamera = deviceCollector.current?.getHideCamera()

                                    props.onCreateCallback(selectedVideoDeviceID,
                                        selectedAudioDeviceID,
                                        props.courseOptions[0],
                                        maxAttendees,
                                        mute,
                                        hideCamera)
                                    props.onClose()
                                }}>{slideDirection === "" || slideDirection === "slide-left" ? "Next" : "Create"}</Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default NewSessionDialog;

