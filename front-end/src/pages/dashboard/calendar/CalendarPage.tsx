import { Autocomplete, Button, CircularProgress, createFilterOptions, Dialog, Divider, IconButton, List, ListItem, ListItemButton, TextField } from "@mui/material";
import { Course, User, Event, CreateEventRequest } from "models/lib/types";
import { useEffect, useState } from "react";
import Calendar, { CalendarTileProperties } from "react-calendar"
import 'react-calendar/dist/Calendar.css';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { Close } from "@mui/icons-material";
import dayjs, { Dayjs } from 'dayjs';
import { DateTimePicker, StaticDateTimePicker } from "@mui/x-date-pickers";
import axios, { AxiosResponse } from "axios";

type Props = {
    courses: Course[]
    thisUser?: User
    userEnrolledCourses: Course[]
}

const currentDay = dayjs().format('YYYY-MM-DD');

const CalendarPage = (props: Props) => {
    const [selectedDate, onDateChange] = useState(new Date())
    const [showCreateEventDialog, setShowCreateEventDialog] = useState(false)

    const [userEvents, setUserEvents] = useState<Event[]>([])
    const [enrolledEvents, setEnrolledEvents] = useState<Event[]>([])

    const [isLoading, setIsLoading] = useState(true)

    // Create New Event States
    const [newEventTitle, setNewEventTitle] = useState<string>("")
    const [newEventDescription, setNewEventDescription] = useState<string>("")
    const [selectedCourse, setSelectedCourse] = useState<Course>(props.courses[0])
    const [newEventStartDate, setNewEventStartDate] = useState<Dayjs | null>(dayjs(currentDay))
    const [newEventEndDate, setNewEventEndDate] = useState<Dayjs | null>(dayjs(currentDay))
    const [newEventLocation, setNewEventLocation] = useState<string>("")

    // Create Event Errors
    const [titleError, setTitleError] = useState<string>("")
    const [descriptionError, setDescriptionError] = useState("")
    const [selectedCourseError, setSelectedCourseError] = useState("")
    const [eventDateError, setEventDateError] = useState("")
    const [locationError, setLocationError] = useState<string>("")

    useEffect(() => {
        if (props.thisUser === undefined) {
            return
        }

        fetchEnrolledEvents()
        fetchUserCreatedEvents()
    }, [])

    const fetchEnrolledEvents = async () => {
        setIsLoading(true)
        let enrolledEvents: Event[] = []

        setTimeout(async () => {
            for (let i = 0; i < props.userEnrolledCourses.length; i++) {
                let response = await axios.get<any, AxiosResponse<Event[]>>(process.env.REACT_APP_BACKEND_API_HOST + "/api/calendar/course/" + props.userEnrolledCourses[i].courseId, {
                    headers: {
                        Authorization: `Bearer ${props.thisUser?.accessToken}`
                    }
                })


                enrolledEvents.push(...response.data)
            }

            setEnrolledEvents(enrolledEvents)
            setIsLoading(false)
        }, 1000);
    }

    const fetchUserCreatedEvents = async () => {
        let response = await axios.get<any, AxiosResponse<any, Event[]>>(process.env.REACT_APP_BACKEND_API_HOST + "/api/calendar/user/" + props.thisUser?.id, {
            headers: {
                Authorization: `Bearer ${props.thisUser?.accessToken}`
            }
        })

        setUserEvents(response.data)
    }

    const renderCalendarEvents = (calendarTile: CalendarTileProperties) => {
        let eventHtml: JSX.Element[] = []

        enrolledEvents.forEach((event, idx) => {
            let eventStartDate = new Date(event.triggeredAt)

            if (calendarTile.date.getDate() === eventStartDate.getDate() &&
                calendarTile.date.getMonth() === eventStartDate.getMonth() &&
                calendarTile.date.getFullYear() === eventStartDate.getFullYear()) {
                eventHtml.push(
                    <div className={`flex flex-row justify-between items-center`} >
                        <h1 className="font-jakarta-sans text-sm">{event.title}</h1>
                        <h1 className="font-jakarta-sans text-sm">{`${eventStartDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} `}</h1>
                    </div>
                )
            }
        })

        return (
            <div className="w-full flex flex-col">
                {eventHtml}
            </div>
        )
    }

    const subjectFilterOptions = createFilterOptions<Course>({
        limit: 500,
    });


    const handleCreateNewEvent = () => {
        if (newEventTitle === "") {
            setTitleError("Event Title cannot be empty")
            return
        }

        if (newEventDescription === "") {
            setDescriptionError("Event Description cannot be empty")
            return
        }

        if (selectedCourse === undefined) {
            setSelectedCourseError("Please select the course that this event relates to")
            return
        }

        if (newEventEndDate === null || newEventStartDate === null) {
            setEventDateError("You must specify a start and end date for the event")
            return;
        }

        if (newEventEndDate < newEventStartDate) {
            setEventDateError("Event end date cannot be before start date")
            return
        }

        if (newEventLocation === "") {
            setLocationError("Event Location cannot be empty")
            return
        }

        if (props.thisUser === undefined) {
            return;
        }


        let request: CreateEventRequest = {
            userId: parseInt(props.thisUser.id),
            courseId: selectedCourse.courseId,
            title: newEventTitle,
            eventDescription: newEventDescription,
            scheduledAt: dayjs(currentDay).toString(),
            scheduleEndTime: newEventEndDate.toString(),
            triggeredAt: newEventStartDate.toString(),
            location: newEventLocation
        }

        console.log(JSON.stringify(request))

        axios.post<any, AxiosResponse<any, Event>>(process.env.REACT_APP_BACKEND_API_HOST + "/api/calendar/create",
            request,
            {
                headers: {
                    Authorization: `Bearer ${props.thisUser?.accessToken} `
                }
            }).then(response => {
                setShowCreateEventDialog(false)
                clearEventForm()
                clearFormErrors()
                fetchEnrolledEvents()
            }).catch(error => {
                // TODO
                console.log(error)
            })

    }

    const formHasErrors = (): boolean => {
        return titleError !== "" ||
            descriptionError !== "" ||
            selectedCourseError !== "" ||
            eventDateError !== "" ||
            locationError !== ""
    }

    const clearFormErrors = () => {
        setTitleError("")
        setDescriptionError("")
        setSelectedCourseError("")
        setEventDateError("")
        setLocationError("")
    }

    const clearEventForm = () => {
        setNewEventTitle("")
        setNewEventDescription("")
        setNewEventDescription("")
        setNewEventLocation("")
        setNewEventStartDate(dayjs(currentDay))
        setNewEventEndDate(dayjs(currentDay))
        setSelectedCourse(props.courses[0])
    }

    return (
        <div className="w-full p-5 flex flex-col flow-up-animation overflow-y-auto">
            <Dialog open={showCreateEventDialog} fullWidth maxWidth="md" onClose={(e) => {
                setShowCreateEventDialog(false)
                clearEventForm()
                clearFormErrors()
            }}>
                <div className="flex flow-row">
                    <div className="bg-primary w-[75px]"></div>
                    <div className="p-5 bg-white flex flex-col mb-5 w-full">
                        <div className="flex flex-row justify-between items-center mb-5">
                            <h1 className="font-jakarta-sans text-3xl">Create an Event</h1>
                            <IconButton
                                className="bg-secondary text-white transition ease-in-out hover:-translate-y
                                hover:scale-110 hover:bg-red-500 duration-300"
                                onClick={() => {
                                    setShowCreateEventDialog(false)
                                    clearEventForm()
                                    clearFormErrors()
                                }}
                            >
                                <Close />
                            </IconButton>
                        </div>
                        <TextField className="mb-5" label="Event Title" error={titleError !== ""} helperText={titleError} value={newEventTitle} onChange={(e) => {
                            setNewEventTitle(e.target.value)
                            clearFormErrors()
                        }} />
                        <TextField multiline rows={5} className="mb-5" error={descriptionError !== ""} helperText={descriptionError} value={newEventDescription} label="Event Description" onChange={(e) => {
                            setNewEventDescription(e.target.value)
                            clearFormErrors()
                        }} />

                        <Autocomplete<Course>
                            onChange={(event, value) => {
                                if (value === null) {
                                    return
                                }

                                setSelectedCourse(value)
                            }}
                            value={selectedCourse}
                            filterOptions={subjectFilterOptions}
                            isOptionEqualToValue={(option, value) => {
                                return (
                                    option.courseId === value.courseId
                                );
                            }}
                            getOptionLabel={(course) => {
                                return (
                                    course.subject.courseCode
                                        .courseCode +
                                    course.subject.courseNumber
                                );
                            }}
                            autoComplete
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    className="font-jakarta-sans mb-5"
                                    label="Subject"
                                    error={selectedCourseError !== ""}
                                    helperText={selectedCourseError}
                                    onChange={() => clearFormErrors()}
                                />
                            )}
                            options={props.courses}
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker className="mb-5"
                                label="From"
                                value={newEventStartDate}
                                onChange={(newDate) => {
                                    clearFormErrors()
                                    setNewEventStartDate(newDate)
                                }}
                                minDate={dayjs(currentDay)}
                            />

                            <DateTimePicker className="mb-5"
                                label="To"
                                value={newEventEndDate}
                                onChange={(newDate) => {
                                    clearFormErrors()
                                    setNewEventEndDate(newDate)
                                }}
                                minDate={dayjs(currentDay)} />
                        </LocalizationProvider>

                        <TextField className="mb-5" value={newEventLocation} label="Event Location" onChange={(e) => {
                            clearFormErrors()
                            setNewEventLocation(e.target.value)
                        }} helperText={locationError} error={locationError !== ""} />

                        <div className="flex flex-row justify-center">
                            <Button variant="contained" className="bg-primary h-[50px]" onClick={handleCreateNewEvent}>Create Event</Button>
                        </div>
                    </div>
                </div>
            </Dialog>
            {
                isLoading &&
                <div className="h-full w-full flex flex-col items-center justify-center">
                    <CircularProgress />
                </div>
            }
            {
                !isLoading &&
                <div className="flow-up-animation">
                    <Calendar className={"w-full font-jakarta-sans rounded-xl shadow-md border-0 mb-5"}
                        onChange={onDateChange}
                        value={selectedDate}
                        tileClassName="h-[100px] border-black"
                        tileContent={renderCalendarEvents} />


                    <Button onClick={() => setShowCreateEventDialog(true)} variant="contained" className="max-w-[150px] bg-primary mb-5">
                        <h1 className="text-white font-jakarta-sans">Create an event</h1>
                    </Button>

                    <div className="min-h-fit w-full bg-white mt-5 rounded-xl flex flex-col shadow-md">
                        <div className=" rounded-xl flex flex-col overflow-hidden shadow-md">
                            <div className="bg-secondary h-[75px] flex-row flex">
                                <div className="bg-primary flex flex-row items-center justify-center">
                                    <h1 className="font-jakarta-sans text-xl text-white m-5">Events Coming Up</h1>
                                </div>
                            </div>

                            <List disablePadding className="w-full">
                                {enrolledEvents.map((event, idx) => {
                                    let eventStartDate = new Date(event.triggeredAt)
                                    let eventEndDate = new Date(event.scheduleEndTime)

                                    return <ListItem disablePadding className="w-full">
                                        <div className={`w-full ${idx % 2 === 0 ? 'bg-gray-200' : ''}`}>
                                            <ListItemButton>
                                                <div className={`flex flex-col w-full p-5`}>
                                                    <div className="flex flex-row w-full">
                                                        <div className="flex flex-col w-1/2">
                                                            <div className="flex flex-row items-center justify-start mb-5">
                                                                <h1 className="font-jakarta-sans text-md w-[150px] mr-5">Event Name:</h1>
                                                                <h1 className="font-jakarta-sans text-md font-extralight">{event.title}</h1>
                                                            </div>
                                                            <div className="flex flex-row items-center justify-start mb-5">
                                                                <h1 className="font-jakarta-sans text-md w-[150px] mr-5">Description:</h1>
                                                                <h1 className="font-jakarta-sans text-md font-extralight">{event.eventDescription}</h1>
                                                            </div>
                                                            <div className="flex flex-row items-center justify-start mb-5">
                                                                <h1 className="font-jakarta-sans text-md w-[150px] mr-5">Course:</h1>
                                                                <h1 className="font-jakarta-sans text-md font-extralight">{event.course.subject.courseCode.courseCode + event.course.subject.courseNumber}</h1>
                                                            </div>
                                                            <div className="flex flex-row items-center justify-start mb-5">
                                                                <h1 className="font-jakarta-sans text-md w-[150px] mr-5">Tutor:</h1>
                                                                <h1 className="font-jakarta-sans text-md font-extralight">{`${event.user.firstName} ${event.user.lastName} `}</h1>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col w-1/2">
                                                            <div className="flex flex-row items-center justify-start mb-5">
                                                                <h1 className="font-jakarta-sans text-md w-[150px] mr-5">When:</h1>
                                                                <h1 className="font-jakarta-sans text-md font-extralight">{eventStartDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}</h1>
                                                            </div>
                                                            <div className="flex flex-row items-center justify-start mb-5">
                                                                <h1 className="font-jakarta-sans text-md w-[150px] mr-5">Ends:</h1>
                                                                <h1 className="font-jakarta-sans text-md font-extralight">{eventEndDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}</h1>
                                                            </div>
                                                            <div className="flex flex-row items-center justify-start mb-5">
                                                                <h1 className="font-jakarta-sans text-md w-[150px] mr-5">Location:</h1>
                                                                <h1 className="font-jakarta-sans text-md font-extralight">{event.location}</h1>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ListItemButton>
                                        </div>
                                    </ListItem>
                                })}
                            </List>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default CalendarPage;
