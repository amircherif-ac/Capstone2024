const db = require('../models');
const { StatusCode } = require('status-code-enum');
const {createMetricsLog, 
    getUserMetricsLog, 
    getTotalTimeSpentPerMonth,
    getTotalSessionAttendedPerMonth
} = require('../controller/metrics_logsController');

const MetricsLogs = db.metrics_logs;

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

        it('should return an error message if the metrics log creation fails', async () => {
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
            MetricsLogs.create = jest.fn(() => Promise.reject(new Error('Failed to create metrics log')));
            await createMetricsLog(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.ServerErrorInternal);
            expect(res.send).toHaveBeenCalledWith({ message: 'Failed to create metrics log' });
        });
    });
});

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

        it('should return an error message if the metrics log retrieval fails', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            MetricsLogs.findAll = jest.fn(() => Promise.reject(new Error('Failed to retrieve metrics log')));
            await getUserMetricsLog(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.ServerErrorInternal);
            expect(res.send).toHaveBeenCalledWith({ message: 'Failed to retrieve metrics log' });
        });
    });
});

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

        it('should return an error message if the metrics log retrieval fails', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            MetricsLogs.findAll = jest.fn(() => Promise.reject(new Error('Failed to retrieve metrics log')));
            await getTotalTimeSpentPerMonth(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.ServerErrorInternal);
            expect(res.send).toHaveBeenCalledWith({ message: 'Failed to retrieve metrics log' });
        });
    });
});

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

        it('should return an error message if the metrics log retrieval fails', async () => {
            const req = {
                params: {
                    userID: 1
                }
            };
            const res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
            MetricsLogs.findAll = jest.fn(() => Promise.reject(new Error('Failed to retrieve metrics log')));
            await getTotalSessionAttendedPerMonth(req, res);
            expect(res.status).toHaveBeenCalledWith(StatusCode.ServerErrorInternal);
            expect(res.send).toHaveBeenCalledWith({ message: 'Failed to retrieve metrics log' });
        });
    });
});
