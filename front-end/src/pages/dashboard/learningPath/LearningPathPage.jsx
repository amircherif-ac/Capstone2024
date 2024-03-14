import React from 'react';
import { Container, Typography } from '@mui/material';

// import {
//     User,
// } from "models/lib/types";

const LearningPathPage = () => {
    return (
        <div className="h-full w-full p-5 flex flex-row flow-up-animation">
            <div className="h-full w-full">
                <div className="bg-white h-full rounded-xl shadow-slate-500 shadow-md flex flex-col mr-5 overflow-hidden">
                    <Container>
                        <Typography variant="h5">Learning Path</Typography>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default LearningPathPage;
