import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';

const LearningPathPage = (props) => {
    const [userTimeSpent, setUserTimeSpent] = useState([]);
    const API_URL = process.env.REACT_APP_BACKEND_API_HOST

    useEffect(() => {
        async function fetchUserTimeSpent() {
            try {
                const response = await fetch(`${API_URL}/api/timespent/user/${props.thisUser.id}`);
                const resData = await response.json();
                setUserTimeSpent(resData);
            } catch (error) {
                console.error('Error fetching user time spent:', error);
            }
        }

        fetchUserTimeSpent();
    }, []);

    return (
        <div className="h-full w-full p-5 flex flex-row flow-up-animation">
            <div className="h-full w-full">
                <div className="bg-white h-full rounded-xl shadow-slate-500 shadow-md flex flex-col mr-5 overflow-hidden">
                    <Container>
                        <Typography variant="h5">User ID: {props.thisUser.id}</Typography>
                        <Typography variant="h5">First Name: {props.thisUser.firstName}</Typography>
                        <Typography variant="h5">Last Name: {props.thisUser.lastName}</Typography>
                        <Typography variant="h5">Enrolled Courses:</Typography>
                        {props.enrolledCourses.map(course => (
                            <li key={course.courseId}>
                                <Typography variant="h7">{course.courseId} {course.courseTitle}</Typography>
                            </li>
                        ))}
                    </Container>
                    
                    <Container>
                        <Typography variant="h5">=============================</Typography>
                        <Typography variant="h5">User Dashboard API Testing...</Typography>
                        <Typography variant="h5">=============================</Typography>
                        {userTimeSpent.map(log => (
                            <li key={log.logID}>
                                <Typography variant="h7">{log.logID} - {log.timeSpentLog} - {log.date} </Typography>
                            </li>
                        ))}
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default LearningPathPage;
