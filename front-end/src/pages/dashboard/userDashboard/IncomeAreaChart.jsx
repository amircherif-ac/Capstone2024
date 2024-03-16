import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

const API_URL = process.env.REACT_APP_BACKEND_API_HOST;

// chart options
const areaChartOptions = {
  chart: {
    height: 450,
    type: 'area',
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  grid: {
    strokeDashArray: 0
  }
};

const IncomeAreaChart = ({ slot, thisUser }) => {
  const theme = useTheme();

  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState(areaChartOptions);

  // Dynamic x axis for month view
  function getRotatedMonths() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth(); // Get the index of the current month
    const rotatedMonths = months.slice(currentMonthIndex + 1).concat(months.slice(0, currentMonthIndex + 1));
    return rotatedMonths;
  }
  // Dynamic x axis for week view
  function getRotatedDays() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIndex = new Date().getDay(); // Get the index of the current day
    const rotatedDays = days.slice(currentDayIndex).concat(days.slice(0, currentDayIndex));
    return rotatedDays;
  }

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main, theme.palette.info.light, theme.palette.warning.main, theme.palette.error.main],
      xaxis: {
        categories:
          slot === 'month'
            ? getRotatedMonths()
            : getRotatedDays(),
        labels: {
          style: {
            colors: [
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary
            ]
          }
        },
        axisBorder: {
          show: true,
          color: line
        },
        tickAmount: slot === 'month' ? 11 : 7
      },
      yaxis: {
        labels: {
          style: {
            colors: [secondary]
          }
        }
      },
      grid: {
        borderColor: line
      },
      tooltip: {
        theme: 'light'
      }
    }));
  }, [primary, secondary, line, theme, slot]);

  const [series, setSeries] = useState([
    {
      name: 'Total Time Spent',
      data: []
    },
    {
      name: 'Total Session attended',
      data: []
    },
    {
      name: 'Avg Assessment Grade',
      data: []
    },
    {
      name: 'Engagement Level',
      data: []
    }
  ]);

  // Process fetched monthly data
  function processMonthlyData(data, metrics) {
    const result = [];
    for (let month = 1; month <= 12; month++) {
      // Check if the entry for the current month exists
      const existingEntry = data.find(entry => entry.month === month);
      if (existingEntry) {
          result.push(existingEntry); // Add existing entry
      } 
      else {
          switch (metrics) {
            case "totalTimeSpent":
              result.push({ month, totalTimeSpent: 0 }); // Add new entry with totalTimeSpent = 0
              break;
            case "totalSessionAttended":
              result.push({ month, totalSessionAttended: 0 }); // Add new entry with totalSessionAttended = 0
              break;
            case "avgAssessmentGrade":
              result.push({ month, avgAssessmentGrade: 0 }); // Add new entry with avgAssessmentGrade = 0
              break;
            case "engagementLevel":
              result.push({ month, engagementLevel: 0 }); // Add new entry with engagementLevel = 0
            default:
              break;
          }
      }
    }
    const currentMonthIndex = new Date().getMonth(); // Get the index of the current month

    // Sort result array by month
    result.sort((a, b) => a.month - b.month);
    
    // Rotate the array based on the current month
    const rotatedMonths = result.slice(currentMonthIndex+1).concat(result.slice(0, currentMonthIndex+1));
    
    // Extract total time spent for each month
    let totalTimeSpentCurrentYear = [];
    switch (metrics) {
      case "totalTimeSpent":
        totalTimeSpentCurrentYear = rotatedMonths.map(entry => Number(entry.totalTimeSpent.toFixed(2)));
        break;
      case "totalSessionAttended":
        totalTimeSpentCurrentYear = rotatedMonths.map(entry => Number(entry.totalSessionAttended.toFixed(0)));
        break;
      case "avgAssessmentGrade":
        totalTimeSpentCurrentYear = rotatedMonths.map(entry => Number(entry.avgAssessmentGrade.toFixed(2)));
        break;
      case "engagementLevel":
        totalTimeSpentCurrentYear = rotatedMonths.map(entry => Number(entry.engagementLevel.toFixed(2)));
        break;
      default:
        break;

    }
    return totalTimeSpentCurrentYear;
  }

  // Process fetched daily data
  function processDailyData(data, metrics) {
    const result = [];
    const currentDate = new Date();
    for (let i = 0; i < 7; i++) {
      const currentDateKey = currentDate.toISOString().split('T')[0];
      // Check if the entry for the current date exists
      const existingEntry = data.find(entry => entry.date === currentDateKey);
      if (existingEntry) {
        result.push(existingEntry); // Add existing entry
      } else {
        switch (metrics) {
          case "totalTimeSpent":
            result.push({ date: currentDateKey, totalTimeSpent: 0 }); // Add new entry with totalTimeSpent = 0
            break;
          case "totalSessionAttended":
            result.push({ date: currentDateKey, totalSessionAttended: 0 }); // Add new entry with totalSessionAttended = 0
            break;
          case "avgAssessmentGrade":
            result.push({ date: currentDateKey, avgAssessmentGrade: 0 }); // Add new entry with avgAssessmentGrade = 0
            break;
          case "engagementLevel":
            result.push({ date: currentDateKey, engagementLevel: 0 }); // Add new entry with engagementLevel = 0
            break;
          default:
            break;
        }
      }
      currentDate.setDate(currentDate.getDate()-1); // Move to the previous day because ISO week starts from Monday not Sunday
    }
    const reversedResult = result.reverse(); // Reverse the result array to get the data in ascending order
    const processedData = reversedResult.map(entry => {
      switch (metrics) {
        case "totalTimeSpent":
          return Number(entry.totalTimeSpent.toFixed(2));
        case "totalSessionAttended":
          return Number(entry.totalSessionAttended.toFixed(0));
        case "avgAssessmentGrade":
          return Number(entry.avgAssessmentGrade.toFixed(2));
        case "engagementLevel":
          return Number(entry.engagementLevel.toFixed(2));
        default:
          return 0;
      }
    });
    return processedData;
  }

  useEffect(() => {
    async function setOverallPerformance() {
      try {
        // Total Time Spent for the current year
        const totalTimeSpentCurrentYearResponse = await fetch(`${API_URL}/api/metrics_logs/totaltimespentmonth/${thisUser.id}`);
        const totalTimeSpentCurrentYearEntries = await totalTimeSpentCurrentYearResponse.json();
        const totalTimeSpentCurrentYear = processMonthlyData(totalTimeSpentCurrentYearEntries, "totalTimeSpent");

        // Total Time Spent for the current week
        const totalTimeSpentCurrentWeekResponse = await fetch(`${API_URL}/api/metrics_logs/totaltimespentday/${thisUser.id}`);
        const totalTimeSpentCurrentWeekEntries = await totalTimeSpentCurrentWeekResponse.json();
        const totalTimeSpentCurrentWeek = processDailyData(totalTimeSpentCurrentWeekEntries, "totalTimeSpent");

        // Total Session Attended for the current year
        const totalSessionAttendedCurrentYearResponse = await fetch(`${API_URL}/api/metrics_logs/totalsessionattendedmonth/${thisUser.id}`);
        const totalSessionAttendedCurrentYearEntries = await totalSessionAttendedCurrentYearResponse.json();
        const totalSessionAttendedCurrentYear = processMonthlyData(totalSessionAttendedCurrentYearEntries, "totalSessionAttended");

        // Total Session Attended for the current week
        const totalSessionAttendedCurrentWeekResponse = await fetch(`${API_URL}/api/metrics_logs/totalsessionattendedday/${thisUser.id}`);
        const totalSessionAttendedCurrentWeekEntries = await totalSessionAttendedCurrentWeekResponse.json();
        const totalSessionAttendedCurrentWeek = processDailyData(totalSessionAttendedCurrentWeekEntries, "totalSessionAttended");

        // Avg Assessment Grade for the current year
        const avgAssessmentGradeCurrentYearResponse = await fetch(`${API_URL}/api/metrics_logs/avgassessmentgrademonth/${thisUser.id}`);
        const avgAssessmentGradeCurrentYearEntries = await avgAssessmentGradeCurrentYearResponse.json();
        const avgAssessmentGradeCurrentYear = processMonthlyData(avgAssessmentGradeCurrentYearEntries, "avgAssessmentGrade");

        // Avg Assessment Grade for the current week
        const avgAssessmentGradeCurrentWeekResponse = await fetch(`${API_URL}/api/metrics_logs/avgassessmentgradeday/${thisUser.id}`);
        const avgAssessmentGradeCurrentWeekEntries = await avgAssessmentGradeCurrentWeekResponse.json();
        const avgAssessmentGradeCurrentWeek = processDailyData(avgAssessmentGradeCurrentWeekEntries, "avgAssessmentGrade");

        // Engagement Level for the current year
        const engagementLevelCurrentYearResponse = await fetch(`${API_URL}/api/metrics_logs/engagementlevelmonth/${thisUser.id}`);
        const engagementLevelCurrentYearEntries = await engagementLevelCurrentYearResponse.json();
        const engagementLevelCurrentYear = processMonthlyData(engagementLevelCurrentYearEntries, "engagementLevel");

        // Engagement Level for the current week
        const engagementLevelCurrentWeekResponse = await fetch(`${API_URL}/api/metrics_logs/engagementlevelday/${thisUser.id}`);
        const engagementLevelCurrentWeekEntries = await engagementLevelCurrentWeekResponse.json();
        const engagementLevelCurrentWeek = processDailyData(engagementLevelCurrentWeekEntries, "engagementLevel");

        
        setSeries([
          {
            name: 'Total Time Spent',
            data: slot === 'month' ? totalTimeSpentCurrentYear : totalTimeSpentCurrentWeek
          },
          {
            name: 'Total Session Attended',
            data: slot === 'month' ? totalSessionAttendedCurrentYear : totalSessionAttendedCurrentWeek
          },
          {
            name: 'Avg Assessment Grade',
            data: slot === 'month' ? avgAssessmentGradeCurrentYear : avgAssessmentGradeCurrentWeek
          },
          {
            name: 'Engagement Level',
            data: slot === 'month' ? engagementLevelCurrentYear : engagementLevelCurrentWeek
          }
        ]);
      }
      catch (error) {
          console.error('Error:', error);
      }
    }
    setOverallPerformance();
  }, [slot]);

  return <ReactApexChart options={options} series={series} type="area" height={450} />;
};

IncomeAreaChart.propTypes = {
  slot: PropTypes.string
};

export default IncomeAreaChart;
