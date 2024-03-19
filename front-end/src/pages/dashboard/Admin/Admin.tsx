import React, { useState } from "react";
import { Course, Post, Post_Rating, Post_User_Rating, User } from "models";
import { Button, TextField, Card, CardContent, Grid } from "@mui/material";
import axios, { AxiosResponse } from "axios";
import { response } from "express";

function sanitizeString(str: string) {
  // remove HTML tags
  str = str.replace(/<[^>]*>?/gm, "");

  // remove special characters
  str = str.replace(/[^\w\s]/gi, "");

  // removes all spaces from a string
  str = str.replace(/\s/g, "");

  // return sanitized string
  return str;
}

async function setAccessControlMatrix() {
  var teacherData: any[] = [];
  var tutorData: any[] = [];
  await axios
    .get<any>(process.env.REACT_APP_BACKEND_API_HOST + "/api/tutor/", {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      tutorData = response.data;
    })
    .catch((error) => {
      console.log(error);
    });

  await axios
    .get<any>(process.env.REACT_APP_BACKEND_API_HOST + "/api/teacher/", {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      teacherData = response.data;
    })
    .catch((error) => {
      console.log(error);
    });

  // let table: any[] = []

  console.log("");
  const table = [];

  // Add tutors to the table
  for (let i = 0; i < tutorData.length; i++) {
    table.push({
      id: tutorData[i].userID,
      firstName: tutorData[i].user.firstName,
      lastName: tutorData[i].user.lastName,
      course:
        tutorData[i].course.subject.courseCode.courseCode +
        tutorData[i].course.subject.courseNumber,
      role: "Tutor",
    });
  }

  // Add tutors to the table
  for (let i = 0; i < teacherData.length; i++) {
    table.push({
      id: teacherData[i].userID,
      firstName: teacherData[i].user.firstName,
      lastName: teacherData[i].user.lastName,
      course:
        teacherData[i].course.subject.courseCode.courseCode +
        teacherData[i].course.subject.courseNumber,
      role: "Teacher",
    });
  }

  return table;
}

export type AdminPageProps = {
  thisUser: User;
  setSnackBarMessage: (message: string) => void;
};

let adminWindowOpen = true;
let selectedCourse = "";

async function setRoleForUser(
  username: string,
  role: string,
  course: string,
  setSnackBarMessage: (message: string) => void
) {
  username = sanitizeString(username);
  course = sanitizeString(course);
  let id = -1;
  let getCourseId = -1;

  // Getting the userId for the user that is having their permissions altered
  await axios
    .get<any>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/user/username/" + username,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      id = response.data.userID;
    })
    .catch((error) => {
      console.log(error);
    });

  // Getting the courseId for the course
  await axios
    .get<any>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/courses/id/" + course,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then((response) => {
      console.log(`the course response: ${response.data}`);
      console.log(response.data);
      getCourseId = response.data.courseId;
    })
    .catch((error) => {
      console.log(`the course error: ${error}`);
    });

  interface PostData {
    selectedUserId: number;
    courseId: number;
  }

  const postData: PostData = {
    selectedUserId: id,
    courseId: getCourseId,
  };

  // if role == tutor then make api post to tutor endpoint
  if (role === "tutor") {
    axios
      .post<PostData>(
        process.env.REACT_APP_BACKEND_API_HOST + "/api/tutor/register",
        postData,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        console.log(`the courseID: ${getCourseId}`);
        console.log(response.data);
        setSnackBarMessage(
          `Successfully made ${username} a tutor for ${course}!`
        );
      })
      .catch((error) => {
        setSnackBarMessage(`${username} already is a tutor for ${course}!`);
        console.log(error);
      });

    return;
  }

  if (role === "teacher") {
    // TODO: add same exact logic but for teacher endpoint
    axios
      .post<PostData>(
        process.env.REACT_APP_BACKEND_API_HOST + "/api/teacher/register",
        postData,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        setSnackBarMessage(
          `Successfully made ${username} a teacher for ${course}!`
        );
      })
      .catch((error) => {
        setSnackBarMessage(`${username} already is a teacher for ${course}!`);
        console.log(error);
      });

    return;
  }

  console.log("Entry done");
  return 0;
}

async function kickUserFromCourse(
  username: string,
  course: string,
  setSnackBarMessage: (message: string) => void
) {
  username = sanitizeString(username);
  course = sanitizeString(course);
  let id = -1;
  let getCourseId = -1;

  // Getting the userId for the user that is having their permissions altered
  await axios
    .get<any>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/user/username/" + username,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      id = response.data.userID;
    })
    .catch((error) => {
      console.log(error);
    });

  // Getting the courseId for the course
  await axios
    .get<any>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/courses/id/" + course,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      getCourseId = response.data.courseId;
    })
    .catch((error) => {
      console.log(error);
    });

  interface PostData {
    selectedUserId: number;
    courseId: number;
  }

  const postData: PostData = {
    selectedUserId: id,
    courseId: getCourseId,
  };

  // Removing teacher permission of the user in that course
  axios
    .delete<any>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/teacher/remove",
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        data: postData, // Add postData inside the configuration object
      }
    )
    .then((response) => {
      console.log(response.data);
      setSnackBarMessage(
        `Successfully removed ${username} from being a teacher for ${course}!`
      );
    })
    .catch((error) => {
      console.log(error);
    });

  // Removing tutor permission of the user in that course
  axios
    .delete<any>(process.env.REACT_APP_BACKEND_API_HOST + "/api/tutor/remove", {
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
      data: postData, // Add postData inside the configuration object
    })
    .then((response) => {
      console.log(response.data);
      setSnackBarMessage(
        `Successfully removed ${username} from being a tutor for ${course}!`
      );
    })
    .catch((error) => {
      console.log(error);
    });

  // removing user from enrollment for course
  axios
    .delete<any>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/enrollment/withdraw",
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        data: postData, // Add postData inside the configuration object
      }
    )
    .then((response) => {
      setSnackBarMessage(
        `Successfully removed ${username} from being enrolled in ${course}!`
      );
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  return 0;
}

// Temporary placeholder code -- No idea what this does M
let tableData = [
  {
    id: 1,
    firstName: "Patience",
    lastName: "Eeles",
    email: "peeles0@prlog.org",
  },
  {
    id: 2,
    firstName: "Morgan",
    lastName: "Adan",
    email: "madan1@mail.ru",
  },
  {
    id: 3,
    firstName: "Tiffany",
    lastName: "Wallentin",
    email: "twallentin2@statcounter.com",
  },
  {
    id: 4,
    firstName: "Malia",
    lastName: "Burgen",
    email: "mburgen3@simplemachines.org",
  },
];

const fetchQuestionPosts = () => {
  axios
    .get<any, AxiosResponse<Post[]>>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/post/course/" + 300,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then(async (response) => {
      console.log("fetchQuestionPosts response", response);
    })
    .catch((err) => {
      console.log("fetchTagsERROR", err);
    });
};

// Depending on the tagID, this function creates a csv file with all posts that have been assigned to that tag
const fetchPostsByTagID = (tagID: number) => {
  axios
    .get<any, AxiosResponse<Post[]>>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/post/tags/" + tagID,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then(async (response) => {
      const posts: Post[] = response.data as Post[];

      const csvData = convertToCSV(posts);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "posts.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((err) => {
      console.log("fetchTagsERROR", err);
    });
};

// As the name implies, this function converts an array of Posts into a CSV string.
const convertToCSV = (data: Post[]): string => {
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((post) => {
    // Stringify the tags array
    const tagsString = JSON.stringify(post.tags);
    // Create an array of all values (except tags) and add the stringified tags
    const values = Object.values(post).filter((val) => val !== post.tags);
    values.push(tagsString);
    return values.join(",");
  });
  return `${header}\n${rows.join("\n")}`;
};

// This method tests if the user can vote on a post
const testCreatePostRating = () => {
  const request: Post_User_Rating = {
    userID: 1,
    postID: 5,
    rating: 1,
  };
  axios
    .post<Post_User_Rating>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/post/createRating",
      request,
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then((response) => {
      //console.log("This is the result of creating a post rating", response);
      //ADD MORE LOGIC HERE
    })
    .catch((error) => {
      console.log("Error in createPostRating", error);
    });
};

// This method fetches the user's vote rating to be displayed on the front-end
const testFindPostRating = () => {
  const request: Post_User_Rating = {
    userID: 2,
    postID: 5,
    rating: 1,
  };
  axios
    .get<Post_User_Rating>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/post/findRating/1/5/",
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then((response) => {
      console.log("This is the result of finding a post rating", response.data);
      //ADD MORE LOGIC HERE
    })
    .catch((error) => {
      console.log("Error in testFindPostRating", error);
    });
};

// This method test if the user can change the rating they gave on a post
const testUpdatePostRating = () => {
  const request: Post_User_Rating = {
    userID: 2,
    postID: 5,
    rating: 1,
  };
  axios
    .put<Post_User_Rating>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/post/update/1/5/1",
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then((response) => {
      console.log("This is the result of updating a post rating", response);
      //ADD MORE LOGIC HERE
    })
    .catch((error) => {
      console.log("Error in testUpdatePostRating", error);
    });
};

// This method fetches the total count of votes a post has
const testFetchPostVotes = () => {
  axios
    .get<Post_Rating>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/post/countRating/5",
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      }
    )
    .then((response) => {
      console.log(
        "This is the result of updating a post rating",
        response.data[0].rating
      );
      //ADD MORE LOGIC HERE
    })
    .catch((error) => {
      console.log("Error in testUpdatePostRating", error);
    });
};

export const Admin = (props: AdminPageProps) => {
  const [username, setUsername] = useState("");
  const [course, setCourse] = useState("");
  const [tagId, setTagId] = useState(-1);

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
                <p className="font-jakarta-sans text-xl">TEST AREA BUTTONS!</p>
              </div>
            </div>

            <Grid item>
              <TextField
                label="Tag ID"
                required
                // fullWidth
                autoFocus
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setTagId(parseInt(event.target.value));
                }}
              />
            </Grid>

            <div className="flex flex-row">
              <Grid container direction={"row"} spacing={1}>
                <Grid item>
                  <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ marginTop: 1 }}
                    onClick={() => testFindPostRating()}
                  >
                    testFindPostRating
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ marginTop: 1 }}
                    onClick={() => fetchPostsByTagID(tagId)}
                  >
                    FetchPostsByTagID
                  </Button>
                </Grid>

                <Grid item>
                  <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ marginTop: 1 }}
                    onClick={() => testUpdatePostRating()}
                  >
                    testUpdatePostRating
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ marginTop: 1 }}
                    onClick={() => testFetchPostVotes()}
                  >
                    testFetchPostVotes
                  </Button>
                </Grid>
                {/* <Grid item>
                  <Button
                    type="submit"
                    // fullWidth
                    variant="contained"
                    sx={{ marginTop: 1 }}
                    onClick={() => {}}
                  >
                    WIP 3
                  </Button>
                </Grid> */}
              </Grid>
            </div>
          </div>
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
                      setRoleForUser(
                        username,
                        "teacher",
                        course,
                        props.setSnackBarMessage
                      );
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
                      setRoleForUser(
                        username,
                        "tutor",
                        course,
                        props.setSnackBarMessage
                      );
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
                      kickUserFromCourse(
                        username,
                        course,
                        props.setSnackBarMessage
                      );
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
function async(
  response: any
): (
  value: AxiosResponse<Post[], any>
) => AxiosResponse<Post[], any> | PromiseLike<AxiosResponse<Post[], any>> {
  throw new Error("Function not implemented.");
}
