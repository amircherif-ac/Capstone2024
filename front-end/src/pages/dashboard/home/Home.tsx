import { CircularProgress, Divider, List, ListItem, Avatar, ListItemButton } from "@mui/material";
import { useEffect, useState } from "react";
import CampaignIcon from '@mui/icons-material/Campaign';
import { Course, Post, User } from "models/lib/types";
import Calendar from 'react-calendar'
import axios, { AxiosResponse } from "axios";
import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';
import NewReleasesTwoToneIcon from '@mui/icons-material/NewReleasesTwoTone';

type Props = {
    enrolledCourses: Course[]
    thisUser?: User
    enrolledCourseClickCallback: (course: Course) => void
}

const Home = (props: Props) => {
    const [announcements, setAnnouncements] = useState<string[]>([])
    const [followedCourses, setFollowedCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [events, setEvents] = useState<string[]>([])
    const [userEnrolledCoursePosts, setUserEnrolledCoursePosts] = useState<{ [courseID: string]: [Course, Post[]] }>({})


    const fetchEnrolledCoursePosts = async () => {
        setIsLoading(true)

        let enrolledPosts: { [courseID: string]: [Course, Post[]] } = {}

        for (let i = 0; i < props.enrolledCourses.length; i++) {
            let response = await axios.get<any, AxiosResponse<Post[]>>(process.env.REACT_APP_BACKEND_API_HOST + '/api/post/course/verified/' + props.enrolledCourses[i].courseId,
                { timeout: 5000, headers: { Authorization: `Bearer ${props.thisUser?.accessToken}` } })

            if (response.data.length === 0) {
                continue
            }

            enrolledPosts[props.enrolledCourses[i].courseId] = [props.enrolledCourses[i], response.data]
        }

        setUserEnrolledCoursePosts(enrolledPosts)
        setIsLoading(false)
    }

    useEffect(() => {
        if (props.enrolledCourses.length === 0) {
            return
        }

        fetchEnrolledCoursePosts()
    }, [props.enrolledCourses])

    return (
        <div className="h-full w-full p-5 flex flex-row flow-up-animation">
            <div className="h-full w-full">
                <div className="bg-white h-full rounded-xl shadow-slate-500 shadow-md flex flex-col mr-5 overflow-hidden">
                    <div className="bg-secondary flex flex-row">
                        <div className="bg-primary p-5">
                            <p className="font-jakarta-sans text-xl text-white">Announcements</p>
                        </div>
                    </div>

                    {
                        isLoading &&
                        <div className="flex flex-col items-center h-full w-full justify-center">
                            <CircularProgress />
                        </div>
                    }

                    {
                        !isLoading && Object.keys(userEnrolledCoursePosts).length === 0 &&
                        <div className="flex flex-col items-center h-full w-full justify-center flow-up-animation">
                            <CampaignIcon className="opacity-50 text-3xl" />
                            <p className="font-jakarta-sans opacity-50 text-xl">No announcements</p>
                        </div>
                    }

                    {
                        !isLoading && Object.keys(userEnrolledCoursePosts).length >= 0 &&
                        <div className="h-full w-full">
                            <List disablePadding>
                                {

                                    Object.keys(userEnrolledCoursePosts).map((courseID) => {
                                        let [course, posts] = userEnrolledCoursePosts[courseID]

                                        let postHtml: JSX.Element[] = []

                                        posts.forEach(post => {
                                            postHtml.push(
                                                <ListItem disablePadding className="h-[100px] bg-gray-200">
                                                    <ListItemButton className="h-full" onClick={() => {
                                                        props.enrolledCourseClickCallback(course)
                                                    }}>
                                                        <NewReleasesTwoToneIcon className=" w-[50px]" ></NewReleasesTwoToneIcon>

                                                        <h1 className=" w-[280px]">  A new question has been posed for:     </h1>
                                                        <h1 className="font-jakarta-sans w-[125px]">
                                                            {course.subject.courseCode.courseCode + course.subject.courseNumber}
                                                        </h1>
                                                        <h1 className="font-jakarta-sans text-3xl">
                                                            {post.post_title}
                                                        </h1>
                                                        <h1 ></h1>
                                                    </ListItemButton>
                                                </ListItem>
                                            )
                                        })

                                        return postHtml
                                    })
                                }
                            </List>
                        </div>
                    }
                </div>
            </div>
            {/* <div className="flex-1 flex flex-col h-full">
                <div className="bg-white h-full rounded-xl shadow-slate-500 shadow-md flex flex-col overflow-hidden">
                    <div className="flex flex-row bg-secondary">
                        <div className="bg-primary p-5">
                            <p className="font-jakarta-sans text-lg text-white">Calendar</p>
                        </div>
                    </div>

                    {
                        isLoading &&
                        <div className="flex flex-col items-center h-full w-full justify-center">
                            <CircularProgress />
                        </div>
                    }

                    {
                        !isLoading &&
                        <div className="flex flex-col items-center p-5">
                            <Calendar className="font-jakarta-sans mb-5" />
                            <p className="font-jakarta-sans opacity-50 text-xl">Events</p>
                        </div>
                    }
                </div>
            </div> */}

        </div >
    )
}

export default Home;
