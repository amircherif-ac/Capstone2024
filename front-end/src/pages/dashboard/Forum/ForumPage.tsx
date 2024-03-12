import CircularProgress from "@mui/material/CircularProgress";
import axios, { AxiosResponse } from "axios";
import {
  User,
  Course,
  UserEnrolledCoursesResponse,
  GetUserResponse,
  Post,
  Reply,
  Tags,
} from "models";
import React, { useEffect, useState } from "react";
import QuestionPost from "../coursePage/QuestionPost";
import { ThreadDialog } from "../coursePage/ThreadDialog";
import { response } from "express";

// This is what the page needs to work
export type ForumPageProps = {
  isTeacher: boolean;
  isTutor: any;
  enrolledCourses: Course[];
  thisUser: User;
};

const ForumPage = (props: ForumPageProps) => {
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState<string | null>(
    null
  );
  const [questionPosts, setQuestionPosts] = useState<
    [Post, User, Reply[], Course][]
  >([]);
  const [threadAuthorUsername, setThreadAuthorUsername] = useState<string>("");
  const [threadPost, setThreadPost] = useState<Post | undefined>(undefined);
  const [threadReplies, setThreadReplies] = useState<Reply[]>([]);
  const [showThreadDialog, setShowThreadDialog] = useState(false);

  // Called once when the user navigates to the forum page.
  //Fetches all of the posts from the classes the user is currently enrolled in
  useEffect(() => {
    for (const course of props.enrolledCourses) {
      fetchPostsFromEnrolledCourses(course.courseId);
    }
  }, []);

  // This function fetches the posts from the classes the user is enrolled in along with the replies
  const fetchPostsFromEnrolledCourses = (courseId: number) => {
    setIsLoadingPosts(true);

    setTimeout(() => {
      //This is how you fetch the posts for a course
      axios
        .get<any, AxiosResponse<Post[]>>(
          // The following 3 lines point to the query in the API
          process.env.REACT_APP_BACKEND_API_HOST +
            "/api/post/course/" +
            courseId,
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
          let postMapping: [Post, User, Reply[], Course][] = [];

          for (let i = 0; i < posts.length; i++) {
            //This fetches the responses the user has made on each fetched post
            let authorUserResponse = await axios.get<
              any,
              AxiosResponse<GetUserResponse>
            >(
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
            //this returns all the replies of the specified post
            let repliesResponse = await axios.get<any, AxiosResponse<Reply[]>>(
              process.env.REACT_APP_BACKEND_API_HOST +
                "/api/reply/" +
                posts[i].postID,
              {
                timeout: 5000,
                headers: {
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
            let courseResponse = await axios.get<any, AxiosResponse<Course>>(
              process.env.REACT_APP_BACKEND_API_HOST +
                "/api/courses/" +
                posts[i].courseID,
              {
                timeout: 5000,
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            let courseReturned: Course = courseResponse.data;

            //console.log("This is the course that was returned", courseReturned);

            postMapping.push([
              posts[i],
              authorUser,
              repliesResponse.data,
              courseReturned,
            ]);
          }

          setIsLoadingPosts(false);
          // update client recoil state
          setQuestionPosts((prev) =>
            prev ? [...prev, ...postMapping] : postMapping
          );

          //console.log("fetchPostsFromEnrolledCourses fetched", postMapping);
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

  // This is needed to open up the replies of a post
  const onClickThread = (post: Post, author: User, replies: Reply[]) => {
    setThreadAuthorUsername(author.name);
    setThreadPost(post);
    setThreadReplies(replies);
    setShowThreadDialog(true);
  };

  return (
    <>
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

      <div className="h-full w-full p-5 flex flex-col flow-up-animation overflow-y-auto">
        <div className="mr-5 h-full">
          {isLoadingPosts && (
            <div className="flex flex-col h-[400px] items-center justify-center">
              <CircularProgress />
            </div>
          )}

          {!isLoadingPosts && questionPosts.length === 0 && (
            <div className="flex flex-col h-[400px] items-center justify-center flow-up-animation">
              {/* <QuestionAnswerIcon className="opacity-50 text-3xl" /> */}
              <p className="font-jakarta-sans text-2xl opacity-50">
                No questions found
              </p>
            </div>
          )}

          {/* This is what needs to be modified for posts to appear */}
          {!isLoadingPosts && questionPosts.length > 0 && (
            <div className="flex-col h-full w-full flow-up-animation pb-20">
              {questionPosts.map(([post, author, replies, course], idx) => {
                return (
                  <QuestionPost
                    thisUser={props.thisUser}
                    isVerified={post.is_post_verified}
                    isTeacher={props.isTeacher}
                    isTutor={props.isTutor}
                    authorUser={author}
                    post={post}
                    id={idx}
                    replies={replies}
                    Course={course}
                    showThreadDialogCallback={() => {
                      onClickThread(post, author, replies);
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default ForumPage;
