import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

const API_URL = process.env.REACT_APP_BACKEND_API_HOST;

// Dynamic x axis for week view
function getRotatedDays() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = new Date().getDay(); // Get the index of the current day
  const rotatedDays = days.slice(currentDayIndex).concat(days.slice(0, currentDayIndex));
  return rotatedDays;
}

// chart options
const barChartOptions = {
  chart: {
    type: 'bar',
    height: 365,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      borderRadius: 4
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: getRotatedDays(),
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    show: false
  },
  grid: {
    show: false
  }
};

const MonthlyBarChart = (props) => {
  const theme = useTheme();

  const { primary, secondary } = theme.palette.text;
  const info = theme.palette.info.light;

  // Process fetched daily data
  function processDailyData(data) {
    const result = [];
    const currentDate = new Date();
    for (let i = 0; i < 7; i++) {
      const currentDateKey = currentDate.toISOString().split('T')[0];
      // Check if the entry for the current date exists
      const existingEntry = data.find(entry => entry.date === currentDateKey);
      if (existingEntry) {
        result.push(existingEntry); // Add existing entry
      } else {
        result.push({ date: currentDateKey, totalTimeSpent: 0 }); // Add new entry with totalTimeSpent = 0
      }
      currentDate.setDate(currentDate.getDate()-1); // Move to the previous day because ISO week starts from Monday not Sunday
    }
    const reversedResult = result.reverse(); // Reverse the result array to get the data in ascending order
    const processedData = reversedResult.map(entry => {
      return Number(entry.totalTimeSpent.toFixed(2));
    });
    return processedData;
  }

  const [series, setSeries] = useState([
    {
      data: []
    }
  ]);

  const [options, setOptions] = useState(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [info],
      xaxis: {
        labels: {
          style: {
            colors: [secondary, secondary, secondary, secondary, secondary, secondary, secondary]
          }
        }
      },
      tooltip: {
        theme: 'light'
      }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary, info, secondary]);

    useEffect(() => {
    async function setBarChart() {
      try {
        // Total Time Spent for the current week
        const totalTimeSpentCurrentWeekResponse = await fetch(`${API_URL}/api/metrics_logs/totaltimespentday/${props.thisUser.id}`);
        const totalTimeSpentCurrentWeekEntries = await totalTimeSpentCurrentWeekResponse.json();
        const totalTimeSpentCurrentWeek = processDailyData(totalTimeSpentCurrentWeekEntries, "totalTimeSpent");

        setSeries([
          {
            data: totalTimeSpentCurrentWeek
          }
        ]);
        
      }
      catch (error) {
          console.error('Error:', error);
      }
    }
    setBarChart();
  }, );

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="bar" height={365} />
    </div>
  );
};

export default MonthlyBarChart;
