import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import axios, { AxiosResponse } from "axios";
import {
  Course,
  CreateSessionRequest,
  CreateSessionResponse,
  CREATE_SESSION,
  CREATE_SESSION_RESPONSE,
  GetUserResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  JOIN_SESSION,
  JOIN_SESSION_RESPONSE,
  Post,
  PostRequest,
  Reply,
  REQUEST_SESSIONS,
  Session,
  SESSIONS_UPDATE,
  User,
  WithdrawRequest,
} from "models";
import { useEffect, useState } from "react";
import ErrorDialog from "../../../components/ErrorDialog";
import {
  Search as SearchIcon,
  Add,
  QuestionAnswer as QuestionAnswerIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Group as GroupIcon,
} from "@mui/icons-material/";

import QuestionPost from "./QuestionPost";
import ThreadDialog from "./ThreadDialog";
import { Socket } from "socket.io-client";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import NewSessionDialog from "./NewSessionDialog";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import SessionPage from "./SessionPage";
import Peer from "peerjs";
import JoinSessionDialog from "./JoinSessionDialog";
import CreateTutorDialog from "./CreateTutorDialog";
import {
  GetEnrolledUsersResponse,
  EnrolledUser,
} from "../../../model/Enrollment";

export type CoursePageProps = {
  isTeacher: boolean;
  isTutor: any;
  course: Course;
  thisUser: User;
  webSocket?: Socket;
  peerConnection?: Peer;
  onWithdraw: (course: Course) => void;
  onSubmitNewQuestion: (course: Course) => void;
  hideSideNav: (show: boolean) => void;
  inLiveSessionCallback: (inLiveSession: boolean) => void;
};

enum SortStrategy {
  Newest = 1,
  Oldest,
}

const CoursePage = (props: CoursePageProps) => {
  const courseCode =
    props.course.subject.courseCode.courseCode +
    props.course.subject.courseNumber;
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState<string | null>(
    null
  );
  const [sortStrategy, setSortStrategy] = useState<SortStrategy>(
    SortStrategy.Newest
  );
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [questionPosts, setQuestionPosts] = useState<[Post, User, Reply[]][]>(
    []
  );
  const [newQuestionDialogOpen, setNewQuestionDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostTitleError, setNewPostTitleError] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostContentError, setNewPostContentError] = useState(false);
  const [isSubmittingNewPost, setIsSubmittingNewPost] = useState(false);
  const [showThreadDialog, setShowThreadDialog] = useState(false);
  const [threadReplies, setThreadReplies] = useState<Reply[]>([]);
  const [threadAuthorUsername, setThreadAuthorUsername] = useState<string>("");
  const [threadPost, setThreadPost] = useState<Post | undefined>(undefined);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [onlineSessions, setOnlineSessions] = useState<Session[]>([]);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showCreateTutorDialog, setShowCreateTutorDialog] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [isHosting, setIsHosting] = useState<boolean | null>(false);
  const [inLiveSessionView, setInLiveSessionView] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [showJoinSessionDialog, setShowJoinSessionDialog] = useState(false);
  const [videoDeviceID, setVideoDeviceID] = useState("");
  const [audioDeviceID, setAudioDeviceID] = useState("");
  const [muteOnJoin, setMuteOnJoin] = useState(false);
  const [hideCameraOnJoin, setHideCameraOnJoin] = useState(false);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [isTutor, setIsTutor] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    fetchQuestionPosts();
  }, []);

  useEffect(() => {
    props.inLiveSessionCallback(inLiveSessionView);
  }, [inLiveSessionView]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingSessions(false);

      // On component construction,
      // add an event listener to get constant updates
      // on new sessions being created in real time.
      props.webSocket?.on(SESSIONS_UPDATE, (sessions: Session[]) => {
        let filteredSessions: Session[] = [];

        sessions.forEach((session) => {
          if (session.course.courseId === props.course.courseId) {
            filteredSessions.push(session);
          }
        });

        setOnlineSessions(filteredSessions);
      });

      // Do a one time request to get the current live sessions
      props.webSocket?.emit(REQUEST_SESSIONS);
    }, 1000);

    // On component destruction,
    // unregister the live session updates,
    // as they are no longer needed.
    // Also disconnect from the p2p server.
    return () => {
      props.webSocket?.off(SESSIONS_UPDATE);
    };
  }, []);

  const fetchQuestionPosts = () => {
    setIsLoadingPosts(true);

    setTimeout(() => {
      //This is how you fetch the posts for a course
      axios
        .get<any, AxiosResponse<Post[]>>(
          // The following 3 lines point to the query in the API
          process.env.REACT_APP_BACKEND_API_HOST +
            "/api/post/course/" +
            props.course.courseId,
          {
            timeout: 5000,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            },
          }
        )
        .then(async (response) => {
          //The response contains all the posts of the course and the users attached to the posts
          let posts = response.data;
          let postMapping: [Post, User, Reply[]][] = [];

          for (let i = 0; i < posts.length; i++) {
            //This fetches the responses the user has made on each fetched post
            let authorUserResponse = await axios.get<
              any,
              AxiosResponse<GetUserResponse>
            >(
              //This API call is not documented
              process.env.REACT_APP_BACKEND_API_HOST +
                "/api/user/" +
                posts[i].userID,
              {
                timeout: 5000,
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            if (authorUserResponse.status != 200) {
              setIsLoadingPosts(false);
              setErrorDialogMessage(
                "could not fetch questions for course authorUserResponse.status != 200"
              );
              return;
            }
            //this is what is causing problems!
            //this returns all the replies of the specified post
            let repliesResponse = await axios.get<any, AxiosResponse<Reply[]>>(
              process.env.REACT_APP_BACKEND_API_HOST +
                "/api/reply/" +
                posts[i].postID,
              {
                timeout: 5000,
                headers: {
                  //this authorization - weirdly enough it works when getting the posts and userResponses
                  Authorization: `Bearer ${sessionStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            let authorUser: User = {
              id: authorUserResponse.data.userID.toString(),
              name: authorUserResponse.data.username,
              peerID: "",
              accessToken: "",
            };
            postMapping.push([posts[i], authorUser, repliesResponse.data]);
          }

          setIsLoadingPosts(false);
          setQuestionPosts(postMapping);
        })
        .catch((err) => {
          console.log("fetchQuestionPostsERROR", err);
          setIsLoadingPosts(false);
          setErrorDialogMessage(
            "could not fetch questions for course, there was an error"
          );
        });
    }, 1000);
  };

  const submitNewQuestionPost = () => {
    setIsSubmittingNewPost(true);

    if (newPostTitle === "") {
      setNewPostTitleError(true);
      setIsSubmittingNewPost(false);
      return;
    }

    if (newPostContent === "") {
      setNewPostContentError(true);
      setIsSubmittingNewPost(false);
      return;
    }

    if (props.thisUser === undefined) {
      setNewQuestionDialogOpen(false);
      setErrorDialogMessage("could not submit question post");
      setIsSubmittingNewPost(false);
      return;
    }

    const request: PostRequest = {
      userId: parseInt(props.thisUser.id),
      courseId: props.course.courseId,
      postTitle: newPostTitle,
      postText: newPostContent,
      postImagePath: "", //TODO
    };

    setTimeout(() => {
      axios
        .post<PostRequest>(
          process.env.REACT_APP_BACKEND_API_HOST + "/api/post/create",
          request,
          {
            timeout: 5000,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            },
          }
        )
        .then((response) => {
          setIsSubmittingNewPost(false);
          setNewQuestionDialogOpen(false);
          props.onSubmitNewQuestion(props.course);
          setNewPostTitle("");
          setNewPostContent("");
          fetchQuestionPosts();
        })
        .catch((error) => {
          setIsSubmittingNewPost(false);
          setErrorDialogMessage("could not submit question post");
          setNewQuestionDialogOpen(false);
          setNewPostTitle("");
          setNewPostContent("");
        });
    }, 1000);
  };

  const getEnrolledStudents = (courseId: number) => {
    // Getting the userId for the user that is having their permissions altered
    axios
      .get<any, AxiosResponse<GetEnrolledUsersResponse>>(
        process.env.REACT_APP_BACKEND_API_HOST +
          "/api/enrollment/courseStudentsV2/" +
          courseId,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        //console.log(response.data);
        setEnrolledUsers(response.data.enrollees);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getCourseTutors = (courseId: number) => {
    // Getting the userId for the user that is having their permissions altered
    axios
      .get<any>(
        process.env.REACT_APP_BACKEND_API_HOST +
          "/api/tutor/course/" +
          courseId,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        // response.data.foreach((element:any)=>{
        //     console.log(element)
        // })
        for (let index = 0; index < response.data.length; index++) {
          let userId = response.data[index].userID.toString();
          if (userId === props.thisUser.id) {
            setIsTutor(true);
            return;
          }
        }
        setIsTutor(false);
        return;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getCourseTeachers = (courseId: number) => {
    // Getting the userId for the user that is having their permissions altered
    axios
      .get<any>(
        process.env.REACT_APP_BACKEND_API_HOST +
          "/api/teacher/course/" +
          courseId,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        // response.data.foreach((element:any)=>{
        //     console.log(element)
        // })
        for (let index = 0; index < response.data.length; index++) {
          let userId = response.data[index].userID.toString();
          if (userId === props.thisUser.id) {
            setIsTeacher(true);
            return;
          }
        }
        setIsTeacher(false);
        return;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const withdrawFromCourse = () => {
    setIsWithdrawing(true);

    if (props.thisUser === undefined) {
      setErrorDialogMessage("could not withdraw from course.");
      setWithdrawDialogOpen(false);
      setIsWithdrawing(false);
      return;
    }

    let request: WithdrawRequest = {
      selectedUserId: parseInt(props.thisUser.id),
      courseId: props.course.courseId,
    };

    setTimeout(() => {
      axios
        .delete<WithdrawRequest>(
          process.env.REACT_APP_BACKEND_API_HOST + "/api/enrollment/withdraw",
          {
            timeout: 5000,
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            },
            data: request,
          }
        )
        .then((response) => {
          setIsWithdrawing(false);
          props.onWithdraw(props.course);
        })
        .catch((error) => {
          setErrorDialogMessage("could not withdraw from course.");
          setWithdrawDialogOpen(false);
          setIsWithdrawing(false);
        });
    }, 1000);
  };

  const onClickThread = (post: Post, author: User, replies: Reply[]) => {
    setThreadAuthorUsername(author.name);
    setThreadPost(post);
    setThreadReplies(replies);
    setShowThreadDialog(true);
  };

  const enterSessionViewAsHost = (session: Session) => {
    setIsHosting(true);
    props.hideSideNav(false);
    setInLiveSessionView(true);
    setCurrentSession(session);
    setShowNewSessionDialog(false);
  };

  const enterSessionViewAsAttendee = (session: Session) => {
    setIsHosting(false);
    props.hideSideNav(false);
    setInLiveSessionView(true);
    setCurrentSession(session);
    setShowNewSessionDialog(false);
  };

  const joinSession = (
    sessionToJoin: Session,
    selectedVideoDeviceID: string,
    selectedAudioDeviceID: string,
    muteOnJoin: boolean,
    hideCameraOnJoin: boolean
  ) => {
    setMuteOnJoin(muteOnJoin);
    setHideCameraOnJoin(hideCameraOnJoin);
    try {
      props.webSocket?.once(
        JOIN_SESSION_RESPONSE,
        (response: JoinSessionResponse) => {
          if (response.error !== null) {
            setErrorDialogMessage(`could not join session: ${response.error}`);
            return;
          }

          if (response.session === null) {
            setErrorDialogMessage("could not join session");
            return;
          }

          setVideoDeviceID(selectedVideoDeviceID);
          setAudioDeviceID(selectedAudioDeviceID);
          enterSessionViewAsAttendee(response.session);
        }
      );

      props.webSocket?.emit(JOIN_SESSION, {
        sessionID: sessionToJoin.id,
      } as JoinSessionRequest);
    } catch (err) {
      setErrorDialogMessage(`error trying to connect to session: ${err}`);
    }
  };

  const requestNewSession = (
    videoDeviceID: string,
    audioDeviceID: string,
    course: Course,
    maxAttendees: number,
    mute: boolean,
    hideCamera: boolean
  ) => {
    try {
      props.webSocket?.once(
        CREATE_SESSION_RESPONSE,
        (response: CreateSessionResponse) => {
          if (response.error !== null && response.error !== undefined) {
            setErrorDialogMessage(
              `could not create session: ${response.error}`
            );
            return;
          }

          if (response.session === null || response.session === undefined) {
            setErrorDialogMessage("could not create session");
            return;
          }

          setVideoDeviceID(videoDeviceID);
          setAudioDeviceID(audioDeviceID);
          setMuteOnJoin(mute);
          setHideCameraOnJoin(hideCamera);
          enterSessionViewAsHost(response.session);
        }
      );

      props.webSocket?.emit(CREATE_SESSION, {
        course: course,
        maxAttendees: maxAttendees,
      } as CreateSessionRequest);
    } catch (err) {
      setErrorDialogMessage(`error trying to create a session: ${err}`);
    }
  };

  const exitLiveSessionView = () => {
    setInLiveSessionView(false);
    setCurrentSession(null);
    setIsHosting(null);
    props.hideSideNav(true);
  };

  if (inLiveSessionView && (currentSession === null || isHosting === null)) {
    setErrorDialogMessage(
      "Something went wrong when attempting to join a live session"
    );
  }

  function getProperView() {
    if (props.thisUser.roleID?.toString() === "3") {
      return "Viewing as Admin";
    } else if (isTeacher) {
      return "Viewing as Teacher";
    } else if (isTutor) {
      return "Viewing as Tutor";
    } else {
      return "";
    }
  }

  return (
    <>
      {getCourseTutors(props.course.courseId)}
      {getCourseTeachers(props.course.courseId)}
      {inLiveSessionView && currentSession !== null && isHosting !== null ? (
        <SessionPage
          videoDeviceID={videoDeviceID}
          audioDeviceID={audioDeviceID}
          muted={muteOnJoin}
          cameraHidden={hideCameraOnJoin}
          peerConnection={props.peerConnection}
          session={currentSession}
          webSocket={props.webSocket}
          onLeaveSessionCallback={exitLiveSessionView.bind(this)}
          isHost={isHosting}
          thisUser={props.thisUser}
        />
      ) : (
        <div className="h-full w-full p-5 flex flex-col flow-up-animation overflow-y-auto">
          {showNewSessionDialog && (
            <NewSessionDialog
              show={showNewSessionDialog}
              onClose={() => {
                setShowNewSessionDialog(false);
              }}
              courseOptions={[props.course]}
              thisUser={props.thisUser}
              onCreateCallback={requestNewSession}
            />
          )}

          {showJoinSessionDialog && (
            <JoinSessionDialog
              show={showJoinSessionDialog}
              onClose={() => {
                setShowJoinSessionDialog(false);
              }}
              session={currentSession}
              onJoinClick={joinSession}
            />
          )}

          {errorDialogMessage !== null && (
            <ErrorDialog
              dialogTitle="Something went wrong"
              show={errorDialogMessage !== null}
              errorMessage={errorDialogMessage}
              buttonClickCallback={() => {
                setErrorDialogMessage(null);
              }}
              buttonText="Ok"
            />
          )}

          {showThreadDialog && (
            <ThreadDialog
              replies={threadReplies}
              showDialog={showThreadDialog}
              authorUsername={threadAuthorUsername}
              thisUser={props.thisUser}
              post={threadPost}
              parentDialogCloseCallback={() => {
                setThreadAuthorUsername("");
                setThreadPost(undefined);
                setThreadReplies([]);
                setShowThreadDialog(false);
              }}
            />
          )}

          {showCreateTutorDialog && (
            <CreateTutorDialog
              enrolledUsers={enrolledUsers}
              show={showCreateTutorDialog}
              course={props.course}
              refreshEnrolled={getEnrolledStudents}
              onClose={() => {
                setShowCreateTutorDialog(false);
              }}
              thisUser={props.thisUser}
              isTeacher={isTeacher}
            />
          )}

          {withdrawDialogOpen && (
            <Dialog
              open={withdrawDialogOpen}
              maxWidth="sm"
              fullWidth={true}
              onClose={() => {
                setWithdrawDialogOpen(false);
              }}
            >
              {/* This handles withdrawing from a course logic */}
              <div className="flex flex-row">
                <div className="w-[75px] bg-primary"></div>
                <div className="flex flex-col flex-1 p-5">
                  <p className="font-jakarta-sans text-2xl mb-5">Withdraw</p>
                  <p className="font-jakarta-sans text-lg opacity-70 mb-5">
                    Do you really wish to withdraw from {courseCode}?
                  </p>
                  <div className="flex flex-row justify-end">
                    <Button
                      className="mr-5 font-jakarta-sans"
                      onClick={() => {
                        setWithdrawDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary font-jakarta-sans"
                      variant="contained"
                      onClick={() => {
                        withdrawFromCourse();
                      }}
                    >
                      {isWithdrawing ? (
                        <CircularProgress className="text-white" size="25px" />
                      ) : (
                        "Yes"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog>
          )}

          {/* This is the dialog for creating a new question */}
          {newQuestionDialogOpen && (
            <Dialog
              open={newQuestionDialogOpen}
              maxWidth="sm"
              fullWidth={true}
              onClose={() => {
                setNewQuestionDialogOpen(false);
                setNewPostTitle("");
                setNewPostContent("");
              }}
            >
              <div className="flex flex-row">
                <div className="w-[75px] bg-primary"></div>
                <div className="flex flex-col flex-1 p-5">
                  <p className="font-jakarta-sans text-2xl mb-5">
                    Ask a question about {courseCode}
                  </p>
                  <TextField
                    className="font-jakarta-sans mb-5"
                    value={newPostTitle}
                    onChange={(event) => {
                      setNewPostTitle(event.target.value);
                      setNewPostTitleError(false);
                    }}
                    label="Title"
                    error={newPostTitleError}
                    helperText={
                      newPostTitleError
                        ? "Question cannot have an empty title"
                        : ""
                    }
                  />
                  <TextField
                    className="font-jakarta-sans mb-5"
                    value={newPostContent}
                    onChange={(event) => {
                      setNewPostContent(event.target.value);
                      setNewPostContentError(false);
                    }}
                    label="Question"
                    multiline
                    rows={10}
                    error={newPostContentError}
                    helperText={
                      newPostContentError
                        ? "Question cannot have an empty body"
                        : ""
                    }
                  />
                  <div className="flex flex-row justify-end">
                    <Button
                      className="mr-5 font-jakarta-sans"
                      onClick={() => {
                        setNewQuestionDialogOpen(false);
                        setNewPostTitle("");
                        setNewPostContent("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary font-jakarta-sans"
                      variant="contained"
                      onClick={() => {
                        submitNewQuestionPost();
                      }}
                    >
                      {isSubmittingNewPost ? (
                        <CircularProgress className="text-white" size="25px" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog>
          )}

          <div className="flex flex-row w-full justify-between items-start min-h-[50px]">
            <div className="flex flex-row h-full ml-2">
              <h1 className="text-lg font-semibold text-slate-800">
                {getProperView()}
              </h1>
            </div>
            <div className="mr-2">
              <Button
                variant="contained"
                className="bg-primary hover:bg-blue-500 duration-300 font-jakarta-sans"
                onClick={() => {
                  let enrolled = getEnrolledStudents(props.course.courseId);
                  setShowCreateTutorDialog(true);
                  // do axios call
                }}
              >
                <GroupIcon className="mr-3" />
                Participants
              </Button>
            </div>
          </div>

          {/* This segment is for displaying the courseCode, courseTitle, withdraw button and courseDescription */}
          <div className="flex flex-col items-center rounded-xl overflow-hidden shadow-sm shadow-slate-500 justify-between bg-white mb-5 min-h-[200px]">
            <div className="bg-secondary flex flex-row w-full justify-between items-center">
              <div className="flex flex-row h-full items-center">
                <div className="bg-primary p-5 h-full">
                  <p className="font-jakarta-sans text-xl text-white">
                    {courseCode}
                  </p>
                </div>
                <p className="font-jakarta-sans p-5 text-xl text-white h-full">
                  {props.course.courseTitle}
                </p>
              </div>
              <div className="bg-secondary p-5">
                <Button
                  variant="contained"
                  className="font-jakarta-sans bg-primary hover:bg-red-500 duration-300"
                  onClick={() => {
                    setWithdrawDialogOpen(true);
                  }}
                >
                  Withdraw
                </Button>
              </div>
            </div>
            <div className="overflow-auto">
              <p className="font-jakarta-sans px-5 py-3 text-justify">
                {props.course.description}
              </p>
            </div>
          </div>

          {/* This part displays the Question Board, ASK A QUESTION button and sort/search features */}
          <div className="flex flex-row w-full min-h-[200px]">
            <div className="flex flex-col items-center mb-5 w-1/2 mr-5">
              <div className="bg-white w-full rounded-xl shadow-sm shadow-slate-500 overflow-hidden flex flex-col">
                {/* Question board header */}
                <div className="bg-secondary flex flex-row w-full justify-between items-center">
                  <div className="bg-primary p-5 h-full">
                    <p className="font-jakarta-sans text-xl text-white">
                      Question Board
                    </p>
                  </div>
                  <div className="bg-secondary p-5 flex flex-row justify-end">
                    <Button
                      variant="contained"
                      className="bg-primary hover:bg-blue-500 duration-300 font-jakarta-sans"
                      onClick={() => {
                        setNewQuestionDialogOpen(true);
                      }}
                    >
                      <Add className="mr-2" /> Ask a question
                    </Button>
                  </div>
                </div>

                {/* Question board filters here */}
                <div className="w-full p-5 flex flex-row justify-evenly">
                  <FormControl className="w-1/2 mr-5">
                    <InputLabel>Sort</InputLabel>
                    <Select
                      value={sortStrategy}
                      onChange={(e) => {
                        setSortStrategy(e.target.value as SortStrategy);
                      }}
                      label="Sort"
                    >
                      <MenuItem value={SortStrategy.Newest}>Newest</MenuItem>
                      <MenuItem value={SortStrategy.Oldest}>Oldest</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField className="" label="Search" type="search" />
                  <div className="flex flex-row items-center justify-center">
                    <IconButton
                      className="bg-primary transition ease-in-out
                            hover:-translate-y hover:scale-110 hover:bg-indigo-500 
                            duration-300"
                    >
                      <SearchIcon className="text-white" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center mb-5 w-1/2">
              <div className="bg-white w-full rounded-xl shadow-sm shadow-slate-500 overflow-hidden flex flex-col">
                {/* Live Tutors header */}
                <div className="bg-secondary flex flex-row w-full justify-between items-center">
                  <div className="bg-primary p-5 h-full">
                    <p className="font-jakarta-sans text-xl text-white">
                      Live Tutors
                    </p>
                  </div>
                  <div className="bg-secondary p-5 flex flex-row justify-end">
                    {(props.thisUser.roleID?.toString() === "3" ||
                      isTutor ||
                      isTeacher) && (
                      <Button
                        variant="contained"
                        className="bg-primary hover:bg-blue-500 duration-300 font-jakarta-sans"
                        onClick={() => {
                          setShowNewSessionDialog(true);
                        }}
                      >
                        <VideoCallIcon className="mr-3" />
                        Start a live session
                      </Button>
                    )}
                  </div>
                </div>

                {/* Live Tutor filters here */}
                <div className="w-full p-5 flex flex-row justify-evenly">
                  <FormControl className="w-1/2 mr-5">
                    <InputLabel>Sort</InputLabel>
                    <Select
                      value={sortStrategy}
                      onChange={(e) => {
                        setSortStrategy(e.target.value as SortStrategy);
                      }}
                      label="Sort"
                    >
                      <MenuItem value={SortStrategy.Newest}>Newest</MenuItem>
                      <MenuItem value={SortStrategy.Oldest}>Oldest</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField className="" label="Search" type="search" />
                  <div className="flex flex-row items-center justify-center">
                    <IconButton
                      className="bg-primary transition ease-in-out
                            hover:-translate-y hover:scale-110 hover:bg-indigo-500 
                            duration-300"
                    >
                      <SearchIcon className="text-white" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* This is the part where the posts are rendered */}
          <div className="flex-1 flex flex-row">
            <div className="w-1/2 mr-5 h-full">
              {/* Question posts here */}

              {isLoadingPosts && (
                <div className="flex flex-col h-[400px] items-center justify-center">
                  <CircularProgress />
                </div>
              )}

              {!isLoadingPosts && questionPosts.length === 0 && (
                <div className="flex flex-col h-[400px] items-center justify-center flow-up-animation">
                  <QuestionAnswerIcon className="opacity-50 text-3xl" />
                  <p className="font-jakarta-sans text-2xl opacity-50">
                    No questions found
                  </p>
                </div>
              )}

              {/* This is what needs to be modified for posts to appear */}
              {!isLoadingPosts && questionPosts.length > 0 && (
                <div className="flex flex-col h-full w-full flow-up-animation pb-20">
                  {questionPosts.map(([post, author, replies], idx) => {
                    return (
                      <QuestionPost
                        thisUser={props.thisUser}
                        isVerified={post.is_post_verified}
                        isTeacher={isTeacher}
                        isTutor={isTutor}
                        authorUser={author}
                        post={post}
                        id={idx}
                        replies={replies}
                        Course={props.course}
                        showThreadDialogCallback={() => {
                          onClickThread(post, author, replies);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            <div className="w-1/2 overflow-y-auto">
              {isLoadingSessions && (
                <div className="h-[400px] flex flex-col items-center justify-center">
                  <CircularProgress />
                </div>
              )}

              {!isLoadingSessions && onlineSessions.length === 0 && (
                <div className="h-[400px] flex flex-col items-center justify-center flow-up-animation">
                  <VideoCallIcon className="opacity-50 text-3xl" />
                  <p className="font-jakarta-sans text-2xl opacity-50">
                    No live sessions
                  </p>
                </div>
              )}

              {!isLoadingSessions && onlineSessions.length > 0 && (
                <div className="flex flex-col">
                  {onlineSessions.map((session, idx) => {
                    const animationDelay: string = `${0.1 * idx}s`;
                    return (
                      <div
                        key={idx}
                        style={{ animationDelay }}
                        className="bg-white shadow-slate-500
                                            shadow-md flow-up-animation rounded-xl overflow-hidden"
                      >
                        <div className="flex flex-col">
                          <div className="flex flex-row justify-between items-center m-5">
                            <div className="flex flex-row items-center">
                              <Avatar />
                              <h1 className="font-jakarta-sans ml-5 text-xl">
                                <b>{session.host.name}</b>
                              </h1>
                            </div>
                            <div>
                              <div className="w-[15px] h-[15px] bg-green-400 rounded-full animate-ping relative" />
                              <div className="w-[15px] h-[15px] bg-green-500 rounded-full relative top-[-15px]" />
                            </div>
                          </div>
                          <div className="bg-secondary h-[40px] flex flex-row justify-between">
                            <div className="flex flex-row items-center p-5">
                              <PermIdentityOutlinedIcon className="text-white" />
                              <h1 className="font-jakarta-sans text-white ml-1">
                                {session.attendees.length}
                              </h1>
                            </div>
                            <div
                              onClick={() => {
                                setCurrentSession(session);
                                setShowJoinSessionDialog(true);
                              }}
                              className="bg-primary z-10 shadow-slate-500 shadow-md flex flex-row items-center transition ease-in-out hover:-translate-y
                                                                         hover:bg-indigo-500 duration-300 hover:cursor-pointer"
                            >
                              <h1 className="font-jakarta-sans text-white mt-5 ml-5 mb-5">
                                Join
                              </h1>
                              <ArrowForwardIosIcon className="text-white ml-2 mr-3"></ArrowForwardIosIcon>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoursePage;
