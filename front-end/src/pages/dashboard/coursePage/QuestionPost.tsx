import React, { useState } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Avatar } from "@mui/material";
import { Course, Post, Reply, User, PatchRequest } from "models";
import axios from "axios";

export type QuestionPostProps = {
  thisUser: User;
  authorUser?: User;
  Course: Course;
  id: number;
  post: Post;
  replies?: Reply[];
  isVerified: boolean;
  isTeacher: boolean;
  isTutor: boolean;
  showThreadDialogCallback: (
    post: Post,
    author: string,
    replies: Reply[]
  ) => void;
};

export const QuestionPost = (props: QuestionPostProps) => {
  let style =
    "bg-white mb-5 flow-up-animation rounded-xl shadow-slate-500 shadow-sm flex flex-col overflow-hidden ";
  const animationDelay: string = `${0.1 * props.id}s`;
  let date = new Date(props.post.post_date);
  const [isVerified, setIsVerified] = useState(props.isVerified);

  const verifyPost = async (verifyPost: boolean) => {
    let response = await axios.patch<PatchRequest>(
      process.env.REACT_APP_BACKEND_API_HOST + "/api/post/verify",
      {
        postId: props.post.postID,
        isVerified: verifyPost,
        roleId: props.thisUser.roleID,
        courseId: props.Course.courseId,
      },
      {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${props.thisUser.accessToken}`,
        },
      }
    );

    if (response.status >= 400) {
      // Handle error
      console.log(`post ${props.id} verification attempt did not work`);
      return;
    }

    setIsVerified(verifyPost);
  };

  return (
    <div className={style} style={{ animationDelay }}>
      <div className="">
        <div className="flex flex-row justify-between items-center mb-5 pt-5 pl-5">
          <div className="flex flex-row items-center">
            <Avatar className="mr-3" />
            <p className="font-jakarta-sans text-xl">
              <b>{props.authorUser.name}</b> asks:
            </p>
          </div>
          <p className="font-jakarta-sans mr-5">
            {" "}
            {date.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </p>
        </div>
        <div className="mt-5 ml-5 mr-5  flex flex-row items-center">
          <h1 className="font-jakarta-sans font-bold mr-2 text-xs">Subject:</h1>
          <h1 className="font-jakarta-sans text-xs">
            {props.Course.subject.courseCode.courseCode +
              props.Course.subject.courseNumber}
          </h1>
        </div>
        <div className="m-5 flex flex-row items-center">
          <h1 className="font-jakarta-sans font-extrabold mr-2 text-2xl">
            {props.post.post_title}
          </h1>
        </div>
      </div>
      <div className="h-[50px] bg-secondary flex flex-row">
        <div className="flex-1 flex flex-row items-center">
          <ChatBubbleOutlineIcon className="text-white ml-4" />
          <h1 className="font-jakarta-sans text-white ml-2">
            {props.replies.length}{" "}
            {props.replies.length === 1 ? "Reply" : "Replies"}
          </h1>
        </div>
        <div className="flex-row flex z-10">
          {!isVerified &&
            (props.thisUser.roleID?.toString() === "3" ||
              props.isTeacher ||
              props.isTutor) && (
              <div
                className="bg-primary w-[125px] z-10 shadow-slate-500 shadow-md flex flex-row items-center p-5 transition ease-in-out hover:-translate-y
                        hover:bg-indigo-500 duration-300 hover:cursor-pointer mr-5 justify-center"
                onClick={() => {
                  verifyPost(true);
                }}
              >
                <h1 className="font-jakarta-sans text-white">Approve</h1>
              </div>
            )}
          {isVerified &&
            (props.thisUser.roleID?.toString() === "3" ||
              props.isTeacher ||
              props.isTutor) && (
              <div
                className="bg-primary w-[125px] z-10 shadow-slate-500 shadow-md flex flex-row items-center p-5 transition ease-in-out hover:-translate-y
                        hover:bg-indigo-500 duration-300 hover:cursor-pointer mr-5 justify-center"
                onClick={() => {
                  verifyPost(false);
                }}
              >
                <h1 className="font-jakarta-sans text-white">Unapprove</h1>
              </div>
            )}
          <div
            className="bg-primary w-[125px] z-10 shadow-slate-500 shadow-md flex flex-row items-center p-5 transition ease-in-out hover:-translate-y
                     hover:bg-indigo-500 duration-300 hover:cursor-pointer"
            onClick={(event) => {
              props.showThreadDialogCallback(
                props.post,
                props.authorUser.name,
                props.replies
              );
            }}
          >
            <h1 className="font-jakarta-sans text-white">Thread</h1>
            <ArrowForwardIosIcon className="text-white ml-4"></ArrowForwardIosIcon>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPost;
