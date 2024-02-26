import React from 'react';
import { useState } from 'react';
// material-ui
import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Grid,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Stack,
    TextField,
    Typography
  } from '@mui/material';

  import MainCard from "C:/Code/Phase3/stp/front-end/src/components/MainCard.js";
  import IncomeAreaChart from "C:/Code/Phase3/stp/front-end/src/pages/dashboard/userDashboard/IncomeAreaChart.js";
  import MonthlyBarChart from "C:/Code/Phase3/stp/front-end/src/pages/dashboard/userDashboard/MonthlyBarChart.js";

import {
    User,
} from "models/lib/types";

type Props = {
    thisUser?: User;
};

const UserDashboardPage = (props: Props) => {
    const [value, setValue] = useState('today');
    const [slot, setSlot] = useState('week');

    return (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
            {/* row 1 */}
            <Grid item xs={12} sx={{ mb: -2.25 }}>
                <Typography variant="h5">Dashboard</Typography>
            </Grid>
            {/* row 2 */}
            <Grid item xs={12} md={7} lg={8}>
                <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Typography variant="h5">Overall Performance</Typography>
                </Grid>
                <Grid item>
                    <Stack direction="row" alignItems="center" spacing={0}>
                    <Button
                        size="small"
                        onClick={() => setSlot('month')}
                        color={slot === 'month' ? 'primary' : 'secondary'}
                        variant={slot === 'month' ? 'outlined' : 'text'}
                    >
                        Month
                    </Button>
                    <Button
                        size="small"
                        onClick={() => setSlot('week')}
                        color={slot === 'week' ? 'primary' : 'secondary'}
                        variant={slot === 'week' ? 'outlined' : 'text'}
                    >
                        Week
                    </Button>
                    </Stack>
                </Grid>
                </Grid>
                {/* <MainCard content={false} sx={{ mt: 1.5 }}>
                <Box sx={{ pt: 1, pr: 2 }}>
                    <IncomeAreaChart slot={slot} />
                </Box>
                </MainCard> */}
            </Grid>
            <Grid item xs={12} md={5} lg={4}>
                <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Typography variant="h5">Total Time Spent</Typography>
                </Grid>
                <Grid item />
                </Grid>
                {/* <MainCard sx={{ mt: 2 }} content={false}>
                <Box sx={{ p: 3, pb: 0 }}>
                    <Stack spacing={2}>
                    <Typography variant="h6" color="textSecondary">
                        This Week Statistics
                    </Typography>
                    <Typography variant="h3">$7,650</Typography>
                    </Stack>
                </Box>
                <MonthlyBarChart />
                </MainCard> */}
            </Grid>
        </Grid>
    );
};

export default UserDashboardPage;
