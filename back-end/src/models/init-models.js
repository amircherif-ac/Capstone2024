var DataTypes = require("sequelize").DataTypes;
var _calendar = require("./calendar");
var _coursecodes = require("./coursecodes");
var _courselevel = require("./courselevel");
var _courses = require("./courses");
var _degree = require("./degree");
var _department = require("./department");
var _direct_messages = require("./direct_messages");
var _enrolled = require("./enrolled");
var _faculty = require("./faculty");
var _meeting_guest = require("./meeting_guest");
var _posts = require("./posts");
var _program = require("./program");
var _replies = require("./replies");
var _role = require("./role");
var _sessions = require("./sessions");
var _subject = require("./subject");
var _teacher = require("./teacher");
var _threads = require("./threads");
var _tutor = require("./tutor");
var _users = require("./users");
var _tags = require("./tags");
var _post_tags = require("./post_tags")
//var _post_rating = require("./post_rating")

function initModels(sequelize) {
  var calendar = _calendar(sequelize, DataTypes);
  var coursecodes = _coursecodes(sequelize, DataTypes);
  var courselevel = _courselevel(sequelize, DataTypes);
  var courses = _courses(sequelize, DataTypes);
  var degree = _degree(sequelize, DataTypes);
  var department = _department(sequelize, DataTypes);
  var direct_messages = _direct_messages(sequelize, DataTypes);
  var enrolled = _enrolled(sequelize, DataTypes);
  var faculty = _faculty(sequelize, DataTypes);
  var meeting_guest = _meeting_guest(sequelize, DataTypes);
  var posts = _posts(sequelize, DataTypes);
  var post_tags = _post_tags(sequelize, DataTypes);
//  var post_rating = _post_rating(sequelize, DataTypes);
  var program = _program(sequelize, DataTypes);
  var replies = _replies(sequelize, DataTypes);
  var role = _role(sequelize, DataTypes);
  var sessions = _sessions(sequelize, DataTypes);
  var subject = _subject(sequelize, DataTypes);
  var tags = _tags(sequelize, DataTypes);
  var teacher = _teacher(sequelize, DataTypes); 
  var threads = _threads(sequelize, DataTypes);
  var tutor = _tutor(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  calendar.belongsToMany(users, { as: 'userID_users_meeting_guests', through: meeting_guest, foreignKey: "eventID", otherKey: "userID" });
  users.belongsToMany(calendar, { as: 'eventID_calendars', through: meeting_guest, foreignKey: "userID", otherKey: "eventID" });

  courses.belongsToMany(users, { as: 'userID_users', through: enrolled, foreignKey: "courseID", otherKey: "userID" });
  users.belongsToMany(courses, { as: 'courseID_courses', through: enrolled, foreignKey: "userID", otherKey: "courseID" });
  
  courses.belongsToMany(users, { as: 'userID_users_teachers', through: teacher, foreignKey: "courseID", otherKey: "userID" });
  users.belongsToMany(courses, { as: 'courseID_courses_teachers', through: teacher, foreignKey: "userID", otherKey: "courseID" });

  courses.belongsToMany(users, { as: 'userID_users_tutors', through: tutor, foreignKey: "courseID", otherKey: "userID" });
  users.belongsToMany(courses, { as: 'courseID_courses_tutors', through: tutor, foreignKey: "userID", otherKey: "courseID" }); 
  
  tags.belongsToMany(posts, {as: 'postID_posts_tags', through: post_tags, foreignKey: "tagID", otherKey: "postID"});
  posts.belongsToMany(tags, {as: 'tagID_tags_post', through: post_tags, foreignKey: "postID", otherKey: "tagID"});

  meeting_guest.belongsTo(calendar, { as: "event", foreignKey: "eventID"});
  calendar.hasMany(meeting_guest, { as: "meeting_guests", foreignKey: "eventID"});

  subject.belongsTo(coursecodes, { as: "courseCode", foreignKey: "courseCodeID"});
  coursecodes.hasMany(subject, { as: "subjects", foreignKey: "courseCodeID"});

  courses.belongsTo(courselevel, { as: "courseLevel", foreignKey: "courseLevelID"});
  courselevel.hasMany(courses, { as: "courses", foreignKey: "courseLevelID"});

  calendar.belongsTo(courses, { as: "course", foreignKey: "courseID"});
  courses.hasMany(calendar, { as: "calendars", foreignKey: "courseID"});

  enrolled.belongsTo(courses, { as: "course", foreignKey: "courseID"});
  courses.hasMany(enrolled, { as: "enrolleds", foreignKey: "courseID"});

  posts.belongsTo(courses, { as: "course", foreignKey: "courseID"});
  courses.hasMany(posts, { as: "posts", foreignKey: "courseID"});

  teacher.belongsTo(courses, { as: "course", foreignKey: "courseID"});
  courses.hasMany(teacher, { as: "teachers", foreignKey: "courseID"});

  tutor.belongsTo(courses, { as: "course", foreignKey: "courseID"});
  courses.hasMany(tutor, { as: "tutors", foreignKey: "courseID"});

  courses.belongsTo(degree, { as: "degree", foreignKey: "degreeID"});
  degree.hasMany(courses, { as: "courses", foreignKey: "degreeID"});

  courses.belongsTo(department, { as: "department", foreignKey: "departmentID"});
  department.hasMany(courses, { as: "courses", foreignKey: "departmentID"});

  courses.belongsTo(faculty, { as: "faculty", foreignKey: "facultyID"});
  faculty.hasMany(courses, { as: "courses", foreignKey: "facultyID"});

  replies.belongsTo(posts, { as: "post", foreignKey: "postID"});
  posts.hasMany(replies, { as: "replies", foreignKey: "postID"});

  courses.belongsTo(program, { as: "program", foreignKey: "programID"});
  program.hasMany(courses, { as: "courses", foreignKey: "programID"});

  threads.belongsTo(replies, { as: "reply", foreignKey: "reply_ID"});
  replies.hasMany(threads, { as: "threads", foreignKey: "reply_ID"});

  users.belongsTo(role, { as: "role", foreignKey: "roleID"});
  role.hasMany(users, { as: "users", foreignKey: "roleID"});

  courses.belongsTo(subject, { as: "subject", foreignKey: "subjectID"});
  subject.hasMany(courses, { as: "courses", foreignKey: "subjectID"});

  calendar.belongsTo(users, { as: "user", foreignKey: "userID"});
  users.hasMany(calendar, { as: "calendars", foreignKey: "userID"});

  direct_messages.belongsTo(users, { as: "sender", foreignKey: "senderID"});
  users.hasMany(direct_messages, { as: "direct_messages", foreignKey: "senderID"});
  
  direct_messages.belongsTo(users, { as: "recipient", foreignKey: "recipientID"});
  users.hasMany(direct_messages, { as: "recipient_direct_messages", foreignKey: "recipientID"});
  
  enrolled.belongsTo(users, { as: "user", foreignKey: "userID"});
  users.hasMany(enrolled, { as: "enrolleds", foreignKey: "userID"});

  meeting_guest.belongsTo(users, { as: "user", foreignKey: "userID"});
  users.hasMany(meeting_guest, { as: "meeting_guests", foreignKey: "userID"});

  posts.belongsTo(users, { as: "user", foreignKey: "userID"});
  users.hasMany(posts, { as: "posts", foreignKey: "userID"});

  replies.belongsTo(users, { as: "user", foreignKey: "userID"});
  users.hasMany(replies, { as: "replies", foreignKey: "userID"});

  teacher.belongsTo(users, { as: "user", foreignKey: "userID"});
  users.hasMany(teacher, { as: "teachers", foreignKey: "userID"});

  threads.belongsTo(users, { as: "user", foreignKey: "userID"});
  users.hasMany(threads, { as: "threads", foreignKey: "userID"});

  tutor.belongsTo(users, { as: "user", foreignKey: "userID"});
  users.hasMany(tutor, { as: "tutors", foreignKey: "userID"});

  return {
    calendar,
    coursecodes,
    courselevel,
    courses,
    degree,
    department,
    direct_messages,
    enrolled,
    faculty,
    meeting_guest,
    posts,
    post_tags,
//    post_rating,
    program,
    replies,
    role,
    sessions,
    subject,
    tags,
    teacher,
    threads,
    tutor,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
