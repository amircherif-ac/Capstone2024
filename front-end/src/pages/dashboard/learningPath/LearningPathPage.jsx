import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';

const API_URL = 'http://localhost:5007';

const LearningPathPage = (props) => {

    const [recommendation, setRecommendation] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
            //================================================================================
            // Adjust the URL to get the recommendation for the current user
            // UserID need to be passed to the API to get the recommendation
            // const response = await fetch(`${API_URL}/suggestion/${props.thisUser.id}`);
            //================================================================================ 
            const response = await fetch(`${API_URL}/suggestion`);
            const data = await response.json();

            setRecommendation(data);
            } catch (error) {
            console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }
    , []);


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
                        {/* add suggested courses here */}
                        <Typography variant="h5">Suggested Courses:</Typography>
                        {recommendation && recommendation.length > 0 ? (
                            recommendation.map(course => (
                                <li key={course.courseID}>
                                    <Typography variant="h7">{course.courseTitle}</Typography>
                                </li>
                            ))
                        ) : (
                        <Typography variant="h7">No course recommendations available.</Typography>
                        )}
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default LearningPathPage;
