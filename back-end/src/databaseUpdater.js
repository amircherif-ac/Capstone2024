// Updates StudyHero's database with data from Concordia's API periodically

const axios = require('axios');
const db = require('./models')
require('dotenv').config();


// Concordia API Credentials
const username = process.env.CONCORDIA_API_USERNAME;
const password = process.env.CONCORDIA_API_PASSWORD;

// Uncomment to FORCE update
SyncDataBaseWithAPI();

//  Dates to syncDB
// May 3rd
// September 2nd
// December 30th
let targetDates = ["2023-09-02", "2023-05-03", "2023-12-30"];

// Refresh rate which the current date is checked to see if it is time to sync the DB
const refreshRate = 43200000; // 12 hours in milliseconds

function runFunctionOnDate(func, dateString) {
    let currentDate = new Date();

    for (let i = 0; i < dateString.length; i++) {
        let targetDate = new Date(dateString[i]);
        if (currentDate.getMonth() === targetDate.getMonth() && currentDate.getDate() === targetDate.getDate() + 1) {
            //Begin Program
            console.log("Studyhero syncing database with Concordia API!");
            console.log("Starting...");
            func();
        }
    }

}



setInterval(function () {
    runFunctionOnDate(SyncDataBaseWithAPI, targetDates);
}, refreshRate);



// Will verify that a table has the proper constants
async function syncTableWithApi(apiUrl, db, tableName, apiKey, dbKey, username, password) {
    console.log(`Syncing ${tableName} table...`);
    try {
        // Get data from the API
        const apiResponse = await axios.get(apiUrl, {
            auth: { username, password }
        });
        const apiData = apiResponse.data;

        // Create a dictionary of the key from the API
        const dataFromApi = {};
        apiData.forEach(item => dataFromApi[item[apiKey]] = item[apiKey]);

        // Get a list of the key from the DB
        const dbData = await db[tableName].findAll({ attributes: [dbKey] });
        const dataFromDb = dbData.map(item => item.dataValues[dbKey]);

        // Finds the elements that are on the API but not in our DB
        const elementsForInsert = Object.keys(dataFromApi).filter(x => !dataFromDb.includes(dataFromApi[x]));

        // Inserting into DB
        if (elementsForInsert.length > 0) {
            for (let i = 0; i < elementsForInsert.length; i++) {
                db[tableName].create({ [dbKey]: elementsForInsert[i] });
            }
            console.log(`Inserted the values: ${elementsForInsert} into ${tableName} table.`);
            console.log(`${tableName} table sync completed!`);
            console.log(`${tableName} is up to date!`);
        }
        else {
            console.log(`No need to insert anything into the ${tableName} table.`);
            console.log(`${tableName} is up to date!`);
        }

    } catch (error) {
        console.log(error);
        console.log(`Something went wrong while syncing ${tableName}, is NOT up to date!`);
    }


}

async function syncDB() {
    // // Syncing faculty table
    await syncTableWithApi('https://opendata.concordia.ca/API/v1/course/faculty/filter/*/*', db, 'faculty', 'facultyCode', 'facultyName', username, password)

    // // // It is normal that this API endpoint also uses faculty, it is how it was designed (on Concordias end).
    await syncTableWithApi('https://opendata.concordia.ca/API/v1/course/faculty/filter/*/*', db, 'department', 'deparmentDescription', 'departmentName', username, password)

    // // Syncing program table (aka faculty name/description)
    // // TODO: figure out why endpoint is returning nothing.
    await syncTableWithApi('https://opendata.concordia.ca/API/v1/course/exle/filter/*/*/*/*/*/*/*/*/*/*', db, 'program', 'Program', 'programName', username, password);

    // Syncs courselevels table
    await syncTableWithApi('https://opendata.concordia.ca/API/v1/course/catalog/filter/*/*/*', db, 'course_level', 'career', 'courseLevel', username, password);

    // // Syncs Degree table
    await syncTableWithApi('https://opendata.concordia.ca/API/v1/course/schedule/filter/*/*/*', db, 'degree', 'career', 'degreeName', username, password);

    // Syncs coursecodes table
    await syncCourseCode('https://opendata.concordia.ca/API/v1/course/catalog/filter/*/*/*', db, username, password);


}

async function syncCourseCode(apiUrl, db, username, password) {
    try {
        // Get data from the API
        const apiResponse = await axios.get(apiUrl, {
            auth: { username, password }
        });
        const apiData = apiResponse.data;

        // Dictionary for all course codes and their primarykeys to avoid doing many queries
        const keysFromCourseCodes = {};
        let dataFromCourseCodes = await db.course_codes.findAll();
        for (let i = 0; i < dataFromCourseCodes.length; i++) {
            keysFromCourseCodes[dataFromCourseCodes[i].dataValues.courseCode] = dataFromCourseCodes[i].dataValues.courseCodeID
        }

        // Checking already existing values in DB, then adding them if they do not exist
        for (let i = 0; i < apiData.length; i++) {
            if (!keysFromCourseCodes[apiData[i].subject]) {
                // If its not in the DB then insert
                keysFromCourseCodes[apiData[i].subject] = 'NEWVAL' + i;
                await db.course_codes.create({ courseCode: apiData[i].subject });
            }
        }

    } catch (error) {
        console.log(error);
    }
}



async function syncCourseTable(apiUrl, db, tableName, username, password) {
    try {
        // Get data from the API
        const apiResponse = await axios.get(apiUrl, {
            auth: { username, password }
        });
        const apiData = apiResponse.data;

        const courseLevelDB = await db.course_level.findAll();
        // getting courseCodeID depending on what subject is
        const courseCodeID = await db.course_codes.findAll()
        const courseCodeDB = {}
        for (let i = 0; i < courseCodeID.length; i++) {
            courseCodeDB[courseCodeID[i].dataValues.courseCode] = courseCodeID[i].dataValues.courseCodeID;
        }

        const courseLevelDB_dict = {};
        for (let i = 0; i < courseLevelDB.length; i++) {
            courseLevelDB_dict[courseLevelDB[i].dataValues.courseLevel] = courseLevelDB[i].dataValues.courseLevelID;
        }

        // Courses from API formatted in an array for it to be added to the database

        // dictionary for faculty for facultyCode
        const facultyID_dict = {};
        const facultyTableDB = await db.faculty.findAll();
        for (let i = 0; i < facultyTableDB.length; i++) {
            facultyID_dict[facultyTableDB[i].dataValues.facultyName] = facultyTableDB[i].dataValues.facultyID;
        }
        // dictionary for department for departmentDescription
        const departmentID_dict = {};
        const departmentTableDB = await db.department.findAll();
        for (let i = 0; i < departmentTableDB.length; i++) {
            departmentID_dict[departmentTableDB[i].dataValues.departmentName] = departmentTableDB[i].dataValues.departmentID;
        }
        //  dictionary for degreeID for career
        const degreeID_dict = {};
        const degreeTableDB = await db.degree.findAll();
        for (let i = 0; i < degreeTableDB.length; i++) {
            degreeID_dict[degreeTableDB[i].dataValues.degreeName] = degreeTableDB[i].dataValues.degreeID;
        }

        // Api call to get schedule and extra data about courses
        const apiResponseSchedule = await axios.get('https://opendata.concordia.ca/API/v1/course/schedule/filter/*/*/*', {
            auth: { username, password }
        });
        const data = apiResponseSchedule.data;

        const coursesFromAPI = []
        for (let i = 0; i < apiData.length; i++) {

            // Used for
            let primaryKey = await db.subject.findOne({
                where: {
                    courseCodeID: courseCodeDB[apiData[i].subject],
                    courseNumber: apiData[i].catalog
                }
            })
            let courseTitle = apiData[i].title;
            let schoolID = apiData[i].ID;
            let website = 'WEBSITE';
            let facultyID = 1;
            let departmentID = 1;
            let degreeID = 1;
            for (let k = 0; k < data.length; k++) {
                if (apiData[i].ID == data[k].courseID) {
                    facultyID = facultyID_dict[data[k].facultyCode];
                    departmentID = departmentID_dict[data[k].departmentDescription];
                    degreeID = degreeID_dict[data[k].career];
                }
            }

            let programID = 1; // may be deprecated
            let courseLevelID = courseLevelDB_dict[apiData[i].career]; // this is UGRD etc.
            let subjectID = primaryKey.dataValues.subjectID;
            coursesFromAPI.push([schoolID, facultyID, departmentID, courseLevelID, degreeID, subjectID, courseTitle, 'DESCRIPTION', website])
        }

        // Get a list of the key from the DB
        const dbData = await db.courses.findAll();
        const dbDataSorted = [];
        for (let i = 0; i < dbData.length; i++) {
            dbDataSorted.push([dbData[i].dataValues.school_key,
            dbData[i].dataValues.facultyID,
            dbData[i].dataValues.departmentID,
            dbData[i].dataValues.courseLevelID,
            dbData[i].dataValues.degreeID,
            dbData[i].dataValues.subjectID,
            dbData[i].dataValues.courseTitle,
                'DESCRIPTION',
                'WEBSITE'
            ]);
        }

        // Rows to be added into database that do not exist in DB
        const diff = coursesFromAPI.filter(course => !dbDataSorted.some(dbCourse => JSON.stringify(dbCourse) == JSON.stringify(course)));

        // Inserting rows that were not found in DB
        for (let i = 0; i < diff.length; i++) {
            await db.courses.create({
                school_key: diff[i][0],
                facultyID: diff[i][1],
                departmentID: diff[i][2],
                // programID: diff[i][3],
                courseLevelID: diff[i][3],
                degreeID: diff[i][4],
                subjectID: diff[i][5],
                courseTitle: diff[i][6],
                description: diff[i][7],
                website: diff[i][8]
            })

        }


        // Api call to get every description for every course
        const apiResponseDescription = await axios.get('https://opendata.concordia.ca/API/v1/course/description/filter/*', {
            auth: { username, password }
        });
        const descriptionData = apiResponseDescription.data;

        // Updating descriptions of everyrow by school ID
        for (let i = 0; i < descriptionData.length; i++) {
            await db.courses.update({
                description: descriptionData[i].description
            }, {
                where: {
                    school_key: descriptionData[i].ID
                }
            });

        }

    } catch (error) {
        console.log(error);
        console.log(`Something went wrong while syncing ${tableName}, is NOT up to date!`);
    }
}


async function syncSubjectTable(apiUrl, db, tableName, username, password) {
    // Dictionary for all course codes and their primarykeys to avoid doing many queries
    const keysFromCourseCodes = {};
    let dataFromCourseCodes = await db.course_codes.findAll();
    for (let i = 0; i < dataFromCourseCodes.length; i++) {
        keysFromCourseCodes[dataFromCourseCodes[i].dataValues.courseCode] = dataFromCourseCodes[i].dataValues.courseCodeID
    }

    console.log(`Syncing ${tableName} table...`);
    try {
        // Get data from the API
        const apiResponse = await axios.get(apiUrl, {
            auth: { username, password }
        });
        const apiData = apiResponse.data;


        const subjectValueAPI = [];
        for (let i = 0; i < apiData.length; i++) {
            subjectValueAPI.push([apiData[i].subject, apiData[i].catalog]);
        }
        // These are all the SUBJECTS + course number from the API. These values should be inserted into DB if they do not exist
        let UNIQUEsubjectValueAPI = subjectValueAPI.filter((tuple, index) => {
            return index === subjectValueAPI.findIndex(t => t[0] === tuple[0] && t[1] === tuple[1])
        });
        // Converting text of coursecode into the coursecodeID that exists on the DB
        for (let i = 0; i < UNIQUEsubjectValueAPI.length; i++) {
            UNIQUEsubjectValueAPI[i][0] = keysFromCourseCodes[UNIQUEsubjectValueAPI[i][0]]
        }

        // Getting already existing entries in DB from subject
        let dataFromSubject = await db.subject.findAll();
        let subjectValueDB = [];
        for (let i = 0; i < dataFromSubject.length; i++) {
            subjectValueDB.push([dataFromSubject[i].dataValues.courseCodeID, dataFromSubject[i].dataValues.courseNumber])
        }

        // Getting difference of subjectValueDB and UNIQUEsubjectValueAPI, to know what is missing from DB. The difference will be added to DB
        const toBeAddedToSubjectTableDB = UNIQUEsubjectValueAPI.filter(tuple => {
            return !subjectValueDB.find(t => t[0] === tuple[0] && t[1] === tuple[1])
        });

        // Inserting all values with appropriate key found in DB
        for (let i = 0; i < toBeAddedToSubjectTableDB.length; i++) {
            db.subject.create(
                {
                    courseCodeID: toBeAddedToSubjectTableDB[i][0],
                    courseNumber: toBeAddedToSubjectTableDB[i][1]
                }
            );
        }
        console.log(`${tableName} is up to date!`);

    }
    catch (error) {
        console.log(error);
    }
}

// Main function
async function SyncDataBaseWithAPI() {
    // Syncing everything
    await syncDB();
    await syncSubjectTable('https://opendata.concordia.ca/API/v1/course/catalog/filter/*/*/*', db, 'subject', username, password);
    await syncCourseTable('https://opendata.concordia.ca/API/v1/course/catalog/filter/*/*/*', db, 'subject', username, password);

    // Finish program 
    console.log("Studyhero database sync complete!");
}

