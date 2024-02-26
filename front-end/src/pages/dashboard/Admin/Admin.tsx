import React, { useState } from "react";
import { Course, User } from "models";
// import { Autocomplete, Button, Dropdown, Input } from "react-chat-engine-advanced";
import { Button, TextField, Card, CardContent, Grid } from "@mui/material";
import { Close } from "@mui/icons-material";
import {
  Dialog,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import axios from "axios";


function sanitizeString(str: string) {
  // remove HTML tags
  str = str.replace(/<[^>]*>?/gm, '');

  // remove special characters
  str = str.replace(/[^\w\s]/gi, '');

  // removes all spaces from a string
  str = str.replace(/\s/g, '');

  // return sanitized string
  return str;
}



async function setAccessControlMatrix() {
  var teacherData: any[] = []
  var tutorData: any[] = []
  await axios.get<any>(process.env.REACT_APP_BACKEND_API_HOST +
    "/api/tutor/", {
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem(
        "accessToken"
      )}`,
    },
  }).then(response => {
    console.log(response.data);
    tutorData = response.data
  })
    .catch(error => {
      console.log(error);
    });

  await axios.get<any>(process.env.REACT_APP_BACKEND_API_HOST +
    "/api/teacher/", {
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem(
        "accessToken"
      )}`,
    },
  }).then(response => {
    console.log(response.data);
    teacherData = response.data
  })
    .catch(error => {
      console.log(error);
    });

  // let table: any[] = []

  console.log("")
  const table = [];

  // Add tutors to the table
  for (let i = 0; i < tutorData.length; i++) {
    table.push({
      "id": tutorData[i].userID,
      "firstName": tutorData[i].user.firstName,
      "lastName": tutorData[i].user.lastName,
      "course": tutorData[i].course.subject.courseCode.courseCode + tutorData[i].course.subject.courseNumber,
      "role": "Tutor"
    })

  }

  // Add tutors to the table
  for (let i = 0; i < teacherData.length; i++) {
    table.push({
      "id": teacherData[i].userID,
      "firstName": teacherData[i].user.firstName,
      "lastName": teacherData[i].user.lastName,
      "course": teacherData[i].course.subject.courseCode.courseCode + teacherData[i].course.subject.courseNumber,
      "role": "Teacher"
    })
  }

  return table;



}


export type AdminPageProps = {
  thisUser: User;
  setSnackBarMessage: (message: string) => void
};

let adminWindowOpen = true;
let selectedCourse = "";


async function setRoleForUser(username: string, role: string, course: string, setSnackBarMessage: (message: string) => void) {
  username = sanitizeString(username)
  course = sanitizeString(course)
  let id = -1
  let getCourseId = -1

  // Getting the userId for the user that is having their permissions altered
  await axios.get<any>(process.env.REACT_APP_BACKEND_API_HOST +
    "/api/user/username/" + username, {
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem(
        "accessToken"
      )}`,
    },
  }).then(response => {
    console.log(response.data);
    id = response.data.userID
  })
    .catch(error => {
      console.log(error);
    });

  // Getting the courseId for the course 
  await axios.get<any>(process.env.REACT_APP_BACKEND_API_HOST +
    "/api/courses/id/" + course, {
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem(
        "accessToken"
      )}`,
    },
  }).then(response => {
    console.log(`the course response: ${response.data}`)
    console.log(response.data);
    getCourseId = response.data.courseId
  })
    .catch(error => {
      console.log(`the course error: ${error}`);
    });

  interface PostData {
    selectedUserId: number;
    courseId: number;
  }

  const postData: PostData = {
    selectedUserId: id,
    courseId: getCourseId
  };


  // if role == tutor then make api post to tutor endpoint
  if (role === "tutor") {

    axios.post<PostData>(process.env.REACT_APP_BACKEND_API_HOST +
      "/api/tutor/register", postData, {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(
          "accessToken"
        )}`,
      },
    })
      .then(response => {
        console.log(`the courseID: ${getCourseId}`)
        console.log(response.data);
        setSnackBarMessage(`Successfully made ${username} a tutor for ${course}!`)
      })
      .catch(error => {
        setSnackBarMessage(`${username} already is a tutor for ${course}!`)
        console.log(error);
      });

    return
  }

  if (role === "teacher") {
    // TODO: add same exact logic but for teacher endpoint
    axios.post<PostData>(process.env.REACT_APP_BACKEND_API_HOST +
      "/api/teacher/register", postData, {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(
          "accessToken"
        )}`,
      },
    })
      .then(response => {
        console.log(response.data);
        setSnackBarMessage(`Successfully made ${username} a teacher for ${course}!`)
      })
      .catch(error => {
        setSnackBarMessage(`${username} already is a teacher for ${course}!`)
        console.log(error);
      });

    return
  }

  console.log("Entry done")
  return 0;
}

async function kickUserFromCourse(username: string, course: string, setSnackBarMessage: (message: string) => void) {
  username = sanitizeString(username)
  course = sanitizeString(course)
  let id = -1
  let getCourseId = -1

  // Getting the userId for the user that is having their permissions altered
  await axios.get<any>(process.env.REACT_APP_BACKEND_API_HOST +
    "/api/user/username/" + username, {
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem(
        "accessToken"
      )}`,
    },
  }).then(response => {
    console.log(response.data);
    id = response.data.userID
  })
    .catch(error => {
      console.log(error);
    });

  // Getting the courseId for the course 
  await axios.get<any>(process.env.REACT_APP_BACKEND_API_HOST +
    "/api/courses/id/" + course, {
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem(
        "accessToken"
      )}`,
    },
  }).then(response => {
    console.log(response.data);
    getCourseId = response.data.courseId
  })
    .catch(error => {
      console.log(error);
    });

  interface PostData {
    selectedUserId: number;
    courseId: number;
  }

  const postData: PostData = {
    selectedUserId: id,
    courseId: getCourseId
  };

  // Removing teacher permission of the user in that course
  axios.delete<any>(
    process.env.REACT_APP_BACKEND_API_HOST + "/api/teacher/remove",
    {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
      data: postData // Add postData inside the configuration object
    }
  ).then(response => {
    console.log(response.data);
    setSnackBarMessage(`Successfully removed ${username} from being a teacher for ${course}!`)
  })
    .catch(error => {
      console.log(error);
    });

  // Removing tutor permission of the user in that course
  axios.delete<any>(
    process.env.REACT_APP_BACKEND_API_HOST + "/api/tutor/remove",
    {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
      data: postData // Add postData inside the configuration object
    }
  ).then(response => {
    console.log(response.data);
    setSnackBarMessage(`Successfully removed ${username} from being a tutor for ${course}!`)
  })
    .catch(error => {
      console.log(error);
    });

  // removing user from enrollment for course
  axios.delete<any>(
    process.env.REACT_APP_BACKEND_API_HOST + "/api/enrollment/withdraw",
    {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
      data: postData // Add postData inside the configuration object
    }
  ).then(response => {
    setSnackBarMessage(`Successfully removed ${username} from being enrolled in ${course}!`)
    console.log(response.data);
  })
    .catch(error => {
      console.log(error);
    });
  return 0;
}

// Temporary placeholder code
let tableData = [
  {
    "id": 1,
    "firstName": "Patience",
    "lastName": "Eeles",
    "email": "peeles0@prlog.org"
  }, {
    "id": 2,
    "firstName": "Morgan",
    "lastName": "Adan",
    "email": "madan1@mail.ru"
  }, {
    "id": 3,
    "firstName": "Tiffany",
    "lastName": "Wallentin",
    "email": "twallentin2@statcounter.com"
  }, {
    "id": 4,
    "firstName": "Malia",
    "lastName": "Burgen",
    "email": "mburgen3@simplemachines.org"
  }
]

export const Admin = (props: AdminPageProps) => {
  const [username, setUsername] = useState("");
  const [course, setCourse] = useState("");

  // this doesnt work 
  // TODO: fix this
  //  const tableData = await setAccessControlMatrix()

  return (

    <div className=" flow-up-animation w-full h-full">
      <div className="bg-primary w-[75px]" />
      <div className="bg-white h-full ">
        <div className="bg-white flex flex-row w-full">

          <div className="flex flex-col h-full w-full p-5 justify-between">
            <div className="flex flex-col mb-5">
              <div className="flex flex justify-between items-center mb-10">
                <p className="font-jakarta-sans text-xl">
                  Change permissions of a user
                </p>

              </div>

              <Grid container direction={"column"} spacing={1}>
                <Grid item>
                  <TextField
                    label="Username"

                    required
                    // fullWidth
                    autoFocus

                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setUsername(event.target.value);
                    }}
                  />
                </Grid>

                <Grid item>
                  <TextField
                    label="Course"

                    required
                    // fullWidth
                    // autoFocus

                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setCourse(event.target.value);
                    }}
                  />
                </Grid>

              </Grid>
            </div>
            <div className="flex flex-row">
              <Grid container direction={"row"} spacing={1}>
                <Grid item>
                  <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ marginTop: 1 }}

                    onClick={() => {
                      console.log(username, course);
                      // Add logic for making user a teacher
                      setRoleForUser(username, "teacher", course, props.setSnackBarMessage);
                    }}
                  >
                    Make Teacher
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ marginTop: 1 }}

                    onClick={() => {
                      console.log(username, course);
                      // Add logic for making user a tutor
                      setRoleForUser(username, "tutor", course, props.setSnackBarMessage);
                    }}
                  >
                    Make Tutor
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ marginTop: 1 }}

                    onClick={() => {
                      console.log(username, course);
                      // Add logic for kicking user from course
                      kickUserFromCourse(username, course, props.setSnackBarMessage)
                    }}
                  >
                    Kick user from course
                  </Button>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>
      </div>

      {/* <TableContainer component={Paper}>
          <Table aria-label="simple table">
              <TableHead>
                  <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                  {
                      tableData.map((row)=>(
                      <TableRow
                          key={row.id}
                          sx={{'&:last-child td, &:last-child th':{ border:0}}}
                      >
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.firstName}</TableCell>
                          <TableCell>{row.lastName}</TableCell>
                          <TableCell>{row.email}</TableCell>
                      </TableRow>
                      ))
                  }

              </TableBody>
              
          </Table>
      </TableContainer>   */}


    </div>
  );

};

export default Admin;

