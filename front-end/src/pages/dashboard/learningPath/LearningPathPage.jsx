import React from 'react';
import { Container, Typography } from '@mui/material';

const LearningPathPage = (props) => {

    // async function getUserTimeSpent() {
    //     const response = await fetch('http://localhost:5000/api/timespent/user/{props.thisUser.id}');
    //     const resData = await response.json();
    //     return resData;
    // }

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
                        {/* {getUserTimeSpent().map(timespent => (
                            <li key={timespent.logID}>
                            <Typography variant="h7">{timespent.logID} {timespent.date}</Typography>
                            </li>
                        ))} */}
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default LearningPathPage;
