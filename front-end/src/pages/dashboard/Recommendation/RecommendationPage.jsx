import React, { useEffect, useState } from 'react';
import { Container, Typography, Card} from '@mui/material';

const AI_API_URL = 'http://localhost:5007';
const API_URL = 'http://localhost:5000';

const LearningPathPage = (props) => {

    const [recommendation, setRecommendation] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
            const response = await fetch(`${AI_API_URL}/suggestion/${props.thisUser.id}`);
            const data = await response.json();

            setRecommendation(data);
            } catch (error) {
            console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }
    , []);

    async function enroll(courseId) {
        try {
            const response = await fetch(`${API_URL}/api/enrollment/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: props.thisUser.id,
                    courseId: courseId
                })
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error enrolling:', error);
        }
    }

    return (
        <div className="h-full w-full p-5 flex flex-row flow-up-animation">
            <div className="h-full w-full">
                <div className="bg-white h-full rounded-xl shadow-slate-500 shadow-md flex flex-col mr-5 overflow-hidden">
                    <Container style={{ overflowY: 'scroll', maxHeight: '100%' }}>
                        {recommendation.map((course, index) => (
                            <Card key={index} className="my-4 p-4">
                                <div className="bg-primary p-5 text-white px-4 py-2 rounded-t-md">
                                <Typography variant="h6">{course.courseTitle}</Typography>
                                </div>
                                <Typography variant="body1"> <br/>
                                {course.description}
                                </Typography>
                                <button className="bg-primary p-5 text-white hover:bg-blue-500 duration-300 px-4 py-2 mt-2 rounded-md" 
                                onClick={() => enroll(course.courseId)}
                                variant="contained"
                                >Enroll</button>
                            </Card>
                        ))}
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default LearningPathPage;
