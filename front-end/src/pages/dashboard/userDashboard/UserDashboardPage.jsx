import React from 'react';
import { useState, useEffect } from 'react';

// material-ui
import {
  Box,
  Button,
  Grid,
  Stack,
  Typography
} from '@mui/material';

// project import
import IncomeAreaChart from './IncomeAreaChart';
import MonthlyBarChart from './MonthlyBarChart';
import MainCard from '../../../components/MainCard';
import AnalyticComp from '../../../components/third-party/AnalyticComp';

const API_URL = process.env.REACT_APP_BACKEND_API_HOST;

const UserDashboardPage = (props) => {

  const [slot, setSlot] = useState('week');
  const [userTimeSpentThisMonth, setUserTimeSpentThisMonth] = useState(0);
  const [TimeSpentThisMonthCompareToLast, setTimeSpentThisMonthCompareToLast] = useState(0);
  const [TimeSpentThisMonthCompareToLastColor, setTimeSpentThisMonthCompareToLastColor] = useState("primary");
  const [TimeSpentThisMonthCompareToLastArrow, setTimeSpentThisMonthCompareToLastArrow] = useState(false);

  const [userSessionAttendedThisMonth, setUserSessionAttendedThisMonth] = useState(0);
  const [SessionAttendedThisMonthCompareToLast, setSessionAttendedThisMonthCompareToLast] = useState(0);
  const [SessionAttendedThisMonthCompareToLastColor, setSessionAttendedThisMonthCompareToLastColor] = useState("primary");
  const [SessionAttendedThisMonthCompareToLastArrow, setSessionAttendedThisMonthCompareToLastArrow] = useState(false);

  const [userAvgAssessmentGrade, setUserAvgAssessmentGrade] = useState(0);
  const [userAvgAssessmentGradeCompareToLast, setUserAvgAssessmentGradeCompareToLast] = useState(0);
  const [userAvgAssessmentGradeCompareToLastColor, setUserAvgAssessmentGradeCompareToLastColor] = useState("primary");
  const [userAvgAssessmentGradeCompareToLastArrow, setUserAvgAssessmentGradeCompareToLastArrow] = useState(false);

  const [userEngagementLevel, setUserEngagementLevel] = useState(0);
  const [userEngagementLevelCompareToLast, setUserEngagementLevelCompareToLast] = useState(0);
  const [userEngagementLevelCompareToLastColor, setUserEngagementLevelCompareToLastColor] = useState("primary");
  const [userEngagementLevelCompareToLastArrow, setUserEngagementLevelCompareToLastArrow] = useState(false);

  // calculate letter grade out of percentage
  function percentageToLetterGrade(percentage) {
    if (percentage >= 90) {
        return 'A+';
    } else if (percentage >= 85) {
        return 'A';
    } else if (percentage >= 80) {
        return 'A-';
    } else if (percentage >= 77) {
        return 'B+';
    } else if (percentage >= 73) {
        return 'B';
    } else if (percentage >= 70) {
        return 'B-';
    } else if (percentage >= 67) {
        return 'C+';
    } else if (percentage >= 63) {
        return 'C';
    } else if (percentage >= 60) {
        return 'C-';
    } else if (percentage >= 57) {
        return 'D+';
    } else if (percentage >= 53) {
        return 'D';
    } else if (percentage >= 50) {
        return 'D-';
    } else {
        return 'FNS';
    }
  }

  function engagementLevelToDescription(engagementLevel) {
    if (engagementLevel >= 4.30) {
        return 'Outstanding';
    } else if (engagementLevel >= 4.00) {
        return 'Outstanding';
    } else if (engagementLevel >= 3.70) {
        return 'Outstanding';
    } else if (engagementLevel >= 3.30) {
        return 'Very good';
    } else if (engagementLevel >= 3.00) {
        return 'Very good';
    } else if (engagementLevel >= 2.70) {
        return 'Very good';
    } else if (engagementLevel >= 2.30) {
        return 'Satisfactory';
    } else if (engagementLevel >= 2.00) {
        return 'Satisfactory';
    } else if (engagementLevel >= 1.70) {
        return 'Satisfactory';
    } else if (engagementLevel >= 1.30) {
        return 'Marginal pass';
    } else if (engagementLevel >= 1.00) {
        return 'Marginal pass';
    } else if (engagementLevel >= 0.70) {
        return 'Marginal pass';
    } else {
        return 'Failure';
    }
}

  useEffect(() => {
    async function totalTimeSpentCurrentMonth() {
      try {
          const response = await fetch(`${API_URL}/api/metrics_logs/totaltimespentmonth/${props.thisUser.id}`);
          const data = await response.json();

          // Get the current month
          const currentMonth = new Date().getMonth() + 1;
          // Get the last month
          const lastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
  
          // Find the object for the current month
          const thisMonthData = data.find(item => item.month === currentMonth);

          // Find the object for the last month
          const lastMonthData = data.find(item => item.month === lastMonth);
  
          // Extract totalTimeSpent for the current month
          const thisMonthTotalTimeSpent = thisMonthData ? thisMonthData.totalTimeSpent : 0;
          setUserTimeSpentThisMonth(thisMonthTotalTimeSpent);

          // Extract totalTimeSpent for the last month
          const lastMonthTotalTimeSpent = lastMonthData ? lastMonthData.totalTimeSpent : 0;

          // Compare the total time spent for the current month to the last month (percentage increase or decrease)
          if (lastMonthTotalTimeSpent != 0 ) {
              const compareResult = ((thisMonthTotalTimeSpent - lastMonthTotalTimeSpent) / lastMonthTotalTimeSpent) * 100;
              if (compareResult < 0) {
                setTimeSpentThisMonthCompareToLast(Math.abs(compareResult));
                setTimeSpentThisMonthCompareToLastColor("warning");
                setTimeSpentThisMonthCompareToLastArrow(true);
              }
              else{
                setTimeSpentThisMonthCompareToLast(compareResult);
              }
          }
          else {
            setTimeSpentThisMonthCompareToLastColor("secondary");
          }

      } catch (error) {
          console.error('Error fetching user time spent:', error);
      }
    }
    totalTimeSpentCurrentMonth();
  }, []);

  useEffect(() => {
    async function totalSessionAttendedCurrentMonth() {
      try {
          const response = await fetch(`${API_URL}/api/metrics_logs/totalsessionattendedmonth/${props.thisUser.id}`);
          const data = await response.json();
          
          // Get the current month
          const currentMonth = new Date().getMonth() + 1;
          // Get the last month
          const lastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;

          // Find the object for the current month
          const thisMonthData = data.find(item => item.month === currentMonth);

          // Find the object for the last month
          const lastMonthData = data.find(item => item.month === lastMonth);

          // Extract totalSessionAttended for the current month
          const thisMonthTotalSessionAttended = thisMonthData ? thisMonthData.totalSessionAttended : 0;
          setUserSessionAttendedThisMonth(thisMonthTotalSessionAttended);

          // Extract totalSessionAttended for the last month  
          const lastMonthTotalSessionAttended = lastMonthData ? lastMonthData.totalSessionAttended : 0;

          // Compare the total session attended for the current month to the last month (percentage increase or decrease)
          if (lastMonthTotalSessionAttended != 0) {
              const compareResult = ((thisMonthTotalSessionAttended - lastMonthTotalSessionAttended) / lastMonthTotalSessionAttended) * 100;
              if (compareResult < 0) {
                setSessionAttendedThisMonthCompareToLast(Math.abs(compareResult));
                setSessionAttendedThisMonthCompareToLastColor("warning");
                setSessionAttendedThisMonthCompareToLastArrow(true);
              }
              else{
                  setSessionAttendedThisMonthCompareToLast(compareResult);
              }
          }
          else {
            setSessionAttendedThisMonthCompareToLastColor("secondary");
        }

      } catch (error) {
          console.error('Error fetching user session attended:', error);
      }
    }
    totalSessionAttendedCurrentMonth();
  }
  , []);

  useEffect(() => {
    async function AvgAssessmentGradeCurrentMonth() {
      try {
          const response = await fetch(`${API_URL}/api/metrics_logs/avgassessmentgrademonth/${props.thisUser.id}`);
          const data = await response.json();
          
          // Get the current month
          const currentMonth = new Date().getMonth() + 1;
          // Get the last month
          const lastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;

          // Find the object for the current month
          const thisMonthData = data.find(item => item.month === currentMonth);

          // Find the object for the last month
          const lastMonthData = data.find(item => item.month === lastMonth);

          // Extract AvgAssessmentGrade for the current month
          const thisMonthAvgAssessmentGrade = thisMonthData ? thisMonthData.avgAssessmentGrade : 0;
          setUserAvgAssessmentGrade(percentageToLetterGrade(thisMonthAvgAssessmentGrade));

          // Extract AvgAssessmentGrade for the last month
          const lastMonthAvgAssessmentGrade = lastMonthData ? lastMonthData.avgAssessmentGrade : 0;

          // Compare the total session attended for the current month to the last month (percentage increase or decrease)
          if (lastMonthAvgAssessmentGrade != 0) {
              const compareResult = ((thisMonthAvgAssessmentGrade - lastMonthAvgAssessmentGrade) / lastMonthAvgAssessmentGrade) * 100;
              if (compareResult < 0) {
                setUserAvgAssessmentGradeCompareToLast(Math.abs(compareResult));
                setUserAvgAssessmentGradeCompareToLastColor("warning");
                setUserAvgAssessmentGradeCompareToLastArrow(true);
              }
              else{
                  setUserAvgAssessmentGradeCompareToLast(compareResult);
              }
          }

      } catch (error) {
          console.error('Error fetching user session attended:', error);
      }
    }
    AvgAssessmentGradeCurrentMonth();
  }
  , []);

  useEffect(() => {
    async function EngagementLevelCurrentMonth() {
      try {
          const response = await fetch(`${API_URL}/api/metrics_logs/engagementlevelmonth/${props.thisUser.id}`);
          const data = await response.json();
          
          // Get the current month
          const currentMonth = new Date().getMonth() + 1;
          // Get the last month
          const lastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;

          // Find the object for the current month
          const thisMonthData = data.find(item => item.month === currentMonth);

          // Find the object for the last month
          const lastMonthData = data.find(item => item.month === lastMonth);

          // Extract EngagementLevel for the current month
          const thisMonthEngagementLevel = thisMonthData ? thisMonthData.engagementLevel : 0;
          setUserEngagementLevel(engagementLevelToDescription(thisMonthEngagementLevel));

          // Extract EngagementLevel for the last month
          const lastMonthEngagementLevel = lastMonthData ? lastMonthData.engagementLevel : 0;

          // Compare the total session attended for the current month to the last month (percentage increase or decrease)
          if (lastMonthEngagementLevel != 0) {
              const compareResult = ((thisMonthEngagementLevel - lastMonthEngagementLevel) / lastMonthEngagementLevel) * 100;
              if (compareResult < 0) {
                setUserEngagementLevelCompareToLast(Math.abs(compareResult));
                setUserEngagementLevelCompareToLastColor("warning");
                setUserEngagementLevelCompareToLastArrow(true);
              }
              else{
                  setUserEngagementLevelCompareToLast(compareResult);
              }
          }

      } catch (error) {
          console.error('Error fetching user session attended:', error);
      }
    }
    EngagementLevelCurrentMonth();
  }
  , []);

  return (
      <div className="h-full w-full p-5 flex flex-row flow-up-animation">
          <div className="h-full w-full">
              <div className="bg-white h-full rounded-xl shadow-slate-500 shadow-md flex flex-col mr-5 overflow-hidden">
                  
              <Grid container rowSpacing={4.5} columnSpacing={2.75}>
                {/* row 1 */}
                <Grid item xs={12} sx={{ mb: -2.25 }}>
                  <Typography variant="h6">Dashboard</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <AnalyticComp title="Total Time Spent" 
                  count={userTimeSpentThisMonth + " hours"} 
                  percentage={Number(TimeSpentThisMonthCompareToLast.toFixed(1))} 
                  color={TimeSpentThisMonthCompareToLastColor}
                  isLoss={TimeSpentThisMonthCompareToLastArrow} 
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <AnalyticComp title="Total Seesion attended" 
                  count={Number(userSessionAttendedThisMonth.toFixed(0)) + " session"} 
                  percentage={Number(SessionAttendedThisMonthCompareToLast.toFixed(1))} 
                  color={SessionAttendedThisMonthCompareToLastColor}
                  isLoss={SessionAttendedThisMonthCompareToLastArrow}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <AnalyticComp title="Avg Assessment grade" 
                  count={userAvgAssessmentGrade}
                  percentage={Number(userAvgAssessmentGradeCompareToLast.toFixed(2))}
                  color={userAvgAssessmentGradeCompareToLastColor}
                  isLoss={userAvgAssessmentGradeCompareToLastArrow}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <AnalyticComp title="Engagement Level" 
                  count={userEngagementLevel}
                  percentage={Number(userEngagementLevelCompareToLast.toFixed(2))}
                  color={userEngagementLevelCompareToLastColor}
                  isLoss={userEngagementLevelCompareToLastArrow}
                  />
                </Grid>

                <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />

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
                  <MainCard content={false} sx={{ mt: 1.5 }}>
                    <Box sx={{ pt: 1, pr: 2 }}>
                      <IncomeAreaChart slot={slot} thisUser={props.thisUser}/>
                    </Box>
                  </MainCard>
                </Grid>
                <Grid item xs={12} md={5} lg={4}>
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                      <Typography variant="h5">Total Time Spent</Typography>
                    </Grid>
                    <Grid item />
                  </Grid>
                  <MainCard sx={{ mt: 2 }} content={false}>
                    <Box sx={{ p: 3, pb: 0 }}>
                      <Stack spacing={2}>
                        <Typography variant="h6" color="textSecondary">
                          This Week
                        </Typography>
                        <Typography variant="h3">21.57 hours</Typography>
                      </Stack>
                    </Box>
                    <MonthlyBarChart thisUser={props.thisUser}/>
                  </MainCard>
                </Grid>
              </Grid>
                  
              </div>
          </div>
      </div>
  );
};

export default UserDashboardPage;

