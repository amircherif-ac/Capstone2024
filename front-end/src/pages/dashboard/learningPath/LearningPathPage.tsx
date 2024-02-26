import React from 'react';
import { Container, Typography } from '@mui/material';

import {
    User,
} from "models/lib/types";

type Props = {
    thisUser?: User;
};

const LearningPathPage = (props: Props) => {
    return (
        <Container>
            <Typography variant="h3" align="center" style={{ marginTop: '20px' }}>
                Leaning Path
            </Typography>
            <img src="https://blog.braincert.com/content/images/size/w1200/2021/11/b2ap3_large_updatedlearningpath.jpg" alt="Learning Path" style={{ width: '100%', height: 'auto' }} />
        </Container>
    );
};

export default LearningPathPage;
