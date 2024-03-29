const db = require('../models');
const { StatusCode } = require('status-code-enum');
const {createMetricsLog, 
    getUserMetricsLog, 
    getTotalTimeSpentPerMonth,
    getTotalSessionAttendedPerMonth,
    getAvgAssessmentGradePerMonth,
    getEngagementLevelPerMonth,
    getTotalTimeSpentPerDay,
    getTotalSessionAttendedPerDay,
    getAvgAssessmentGradePerDay,
    getEngagementLevelPerDay
} = require('../controller/metrics_logsController');

const MetricsLogs = db.metrics_logs;

// Test cases for create metrics log
describe('MetricsLogs Controller', () => {
    describe('createMetricsLog', () => {
        it('should create a new metrics log', async () => {
            const req = {
                body: {
                    userId: 1,
                    metricsId: 1,
                    date: '2022-01-01',
                    val: 60
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            MetricsLogs.create = jest.fn(() => Promise.resolve({ id: 1 }));
            await createMetricsLog(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith({ id: 1 });
        });

    });
});

// Test cases for get all metrics log by userID
describe('MetricsLogs Controller', () => {
    describe('getUserMetricsLog', () => {
        it('should get all metrics log by userID', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ id: 1 }, { id: 2 }]));
            await getUserMetricsLog(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
        });

    });
});

// Test cases for get "Total Time Spent" by userID per month for each month of the last 12 months
describe('MetricsLogs Controller', () => {
    describe('getTotalTimeSpentPerMonth', () => {
        it('should get "Total Time Spent" by userID per month for each month of the last 12 months', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            const currentDate = new Date();
            const last12Months = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ month: 1, totalTimeSpent: 60 }, { month: 2, totalTimeSpent: 120 }]));
            await getTotalTimeSpentPerMonth(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ month: 1, totalTimeSpent: 60 }, { month: 2, totalTimeSpent: 120 }]);
        });
    });
});

// Test cases for get "Total Session attended" by userID per month for each month of the last 12 months
describe('MetricsLogs Controller', () => {
    describe('getTotalSessionAttendedPerMonth', () => {
        it('should get "Total Session attended" by userID per month for each month of the last 12 months', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            const currentDate = new Date();
            const last12Months = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ month: 1, totalSessionAttended: 5 }, { month: 2, totalSessionAttended: 10 }]));
            await getTotalSessionAttendedPerMonth(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ month: 1, totalSessionAttended: 5 }, { month: 2, totalSessionAttended: 10 }]);
        });
    });
});

// Test cases for get "Average Assessment Grade" by userID per month for each month of the last 12 months
describe('MetricsLogs Controller', () => {
    describe('getAvgAssessmentGradePerMonth', () => {
        it('should get "Average Assessment Grade" by userID per month for each month of the last 12 months', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            const currentDate = new Date();
            const last12Months = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ month: 1, avgAssessmentGrade: 80 }, { month: 2, avgAssessmentGrade: 90 }]));
            await getAvgAssessmentGradePerMonth(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ month: 1, avgAssessmentGrade: 80 }, { month: 2, avgAssessmentGrade: 90 }]);
        });
    });
});

// Test cases for get "Engagement Level" by userID per month for each month of the last 12 months
describe('MetricsLogs Controller', () => {
    describe('getEngagementLevelPerMonth', () => {
        it('should get "Engagement Level" by userID per month for each month of the last 12 months', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            const currentDate = new Date();
            const last12Months = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ month: 1, engagementLevel: 1 }, { month: 2, engagementLevel: 2 }]));
            await getEngagementLevelPerMonth(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ month: 1, engagementLevel: 1 }, { month: 2, engagementLevel: 2 }]);
        });
    });
});

// Test cases for get "Total Time Spent" by userID per day for each day of the last 30 days
describe('MetricsLogs Controller', () => {
    describe('getTotalTimeSpentPerDay', () => {
        it('should get "Total Time Spent" by userID per day for each day of the last 30 days', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            const currentDate = new Date();
            const last30Days = new Date(currentDate.setDate(currentDate.getDate() - 30));
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ day: 1, totalTimeSpent: 60 }, { day: 2, totalTimeSpent: 120 }]));
            await getTotalTimeSpentPerDay(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ day: 1, totalTimeSpent: 60 }, { day: 2, totalTimeSpent: 120 }]);
        });
    });
});

// Test cases for get "Total Session attended" by userID per day for each day of the last 30 days
describe('MetricsLogs Controller', () => {
    describe('getTotalSessionAttendedPerDay', () => {
        it('should get "Total Session attended" by userID per day for each day of the last 30 days', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            const currentDate = new Date();
            const last30Days = new Date(currentDate.setDate(currentDate.getDate() - 30));
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ day: 1, totalSessionAttended: 5 }, { day: 2, totalSessionAttended: 10 }]));
            await getTotalSessionAttendedPerDay(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ day: 1, totalSessionAttended: 5 }, { day: 2, totalSessionAttended: 10 }]);
        });
    });
});

// Test cases for get "Average Assessment Grade" by userID per day for each day of the last 30 days
describe('MetricsLogs Controller', () => {
    describe('getAvgAssessmentGradePerDay', () => {
        it('should get "Average Assessment Grade" by userID per day for each day of the last 30 days', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            const currentDate = new Date();
            const last30Days = new Date(currentDate.setDate(currentDate.getDate() - 30));
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ day: 1, avgAssessmentGrade: 80 }, { day: 2, avgAssessmentGrade: 90 }]));
            await getAvgAssessmentGradePerDay(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ day: 1, avgAssessmentGrade: 80 }, { day: 2, avgAssessmentGrade: 90 }]);
        });
    });
});

// Test cases for get "Engagement Level" by userID per day for each day of the last 30 days
describe('MetricsLogs Controller', () => {
    describe('getEngagementLevelPerDay', () => {
        it('should get "Engagement Level" by userID per day for each day of the last 30 days', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            const currentDate = new Date();
            const last30Days = new Date(currentDate.setDate(currentDate.getDate() - 30));
            MetricsLogs.findAll = jest.fn(() => Promise.resolve([{ day: 1, engagementLevel: 1 }, { day: 2, engagementLevel: 2 }]));
            await getEngagementLevelPerDay(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
            expect(res.send).toHaveBeenCalledWith([{ day: 1, engagementLevel: 1 }, { day: 2, engagementLevel: 2 }]);
        });
    });
});



