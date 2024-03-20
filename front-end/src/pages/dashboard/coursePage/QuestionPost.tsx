import React, { useEffect, useState } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { Avatar } from "@mui/material";
import {
  Course,
  Post,
  Reply,
  User,
  PatchRequest,
  Post_Rating,
  Post_User_Rating,
} from "models";
import axios from "axios";
import ArrowCircleUpTwoToneIcon from "@mui/icons-material/ArrowCircleUpTwoTone";
import ArrowCircleDownTwoToneIcon from "@mui/icons-material/ArrowCircleDownTwoTone";

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
  ratings: number;
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
  const [rating, setRating] = useState(props.ratings);
  const [isUpvoted, setIsUpvoted] = useState<boolean>(false);
  const [isDownvoted, setIsDownvoted] = useState<boolean>(false);
  const [hasUserVoted, setHasUserVoted] = useState<boolean>(false);
  const UPVOTE_VALUE = 1;
  const DOWNVOTE_VALUE = -1;
  const NEUTRAL_VALUE = 0;

  useEffect(() => {
    userPostRating();
  }, []);

  useEffect(() => {
    // Any operations that depend on the updated state can be performed here
    // For example, updating post ratings

    if (isUpvoted && !isDownvoted) {
      updatePostRating(UPVOTE_VALUE);
    } else if (!isUpvoted && isDownvoted) {
      updatePostRating(DOWNVOTE_VALUE);
    } else if (!isUpvoted && !isDownvoted) {
      updatePostRating(NEUTRAL_VALUE);
    } else {
      console.log("ERROR UPDATING USER VOTE UP AND DOWN ARE TRUE");
    }
    //updatedPostRatings();
  }, [isUpvoted, isDownvoted]);

  useEffect(() => {
    //console.log("hasUserVoted:", hasUserVoted);
  }, [hasUserVoted]);

  // This function determines if the user: upvoted, downvoted or removed his rating to a post
  const userPostRating = () => {
    axios
      .get<Post_User_Rating>(
        process.env.REACT_APP_BACKEND_API_HOST +
          "/api/post/findRating/" +
          props.thisUser.id +
          "/" +
          props.post.postID,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        //console.log("This is the result of finding a post rating", response);

        const userPostRating = response.data;

        // Set the state values for the user's rating
        if (Object.keys(userPostRating).length === 0) {
          //No changes
          return;
        } else {
          if (userPostRating.rating == UPVOTE_VALUE) {
            setIsUpvoted((prevValue) => !prevValue);
            setHasUserVoted((prevValue) => !prevValue);
            return;
          } else if (userPostRating.rating == DOWNVOTE_VALUE) {
            setIsDownvoted((prevValue) => !prevValue);
            setHasUserVoted((prevValue) => !prevValue);
          }
        }
      })
      .catch((error) => {
        console.log("Error in testFindPostRating", error);
      });
  };

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

  //UNCOMMENT CREATE
  const updateUpvote = () => {
    setIsUpvoted((prevValue) => !prevValue);
    setIsDownvoted(false); // Reset isDownvoting

    if (!hasUserVoted) {
      createPostRating(UPVOTE_VALUE);
      setHasUserVoted((prevValue) => !prevValue);
    }
  };

  //UNCOMMENT CREATE
  const updateDownvote = () => {
    setIsDownvoted((prevValue) => !prevValue);
    setIsUpvoted(false); // Reset isUpvoted

    if (!hasUserVoted) {
      createPostRating(DOWNVOTE_VALUE);
      setHasUserVoted((prevValue) => !prevValue);
    }
  };

  const createPostRating = async (rating: number) => {
    const request: Post_User_Rating = {
      userID: parseInt(props.thisUser.id),
      postID: props.post.postID,
      rating: rating,
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

  const updatePostRating = async (rating: number) => {
    axios
      .put<Post_User_Rating>(
        process.env.REACT_APP_BACKEND_API_HOST +
          "/api/post/update/" +
          parseInt(props.thisUser.id) +
          "/" +
          props.post.postID +
          "/" +
          rating,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        //console.log("This is the result of updating a post rating", response);
        //ADD MORE LOGIC HERE
      })
      .catch((error) => {
        console.log("Error in testUpdatePostRating", error);
      });
  };

  const updatedPostRatings = async () => {
    axios
      .get<Post_Rating>(
        process.env.REACT_APP_BACKEND_API_HOST +
          "/api/post/countRating/" +
          props.post.postID,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        const updatedRating = parseInt(response.data[0].rating);

        console.log(
          "This is the result of updating a post rating",
          updatedRating
        );

        // Check if updatedRating is NaN
        if (isNaN(updatedRating)) {
          // If it is, set rating to 0
          setRating(0);
        } else {
          // Otherwise, set rating to the parsed integer value of updatedRating
          // THIS DOES NOT UPDATE IN REAL TIME
          setRating(updatedRating);
        }
      })
      .catch((error) => {
        console.log("Error in testUpdatePostRating", error);
      });
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
        <div className="flex-row flex z-5">
          <div
            className="bg-primary w-[125px] z-10 shadow-slate-500 shadow-md flex flex-row items-center p-5 transition ease-in-out 
                        mr-5 justify-center"
          >
            {isUpvoted && !isDownvoted ? (
              <>
                <ArrowCircleUpTwoToneIcon
                  className="text-green-500 mr-5 hover:bg-green-500 duration-300 hover:cursor-pointer"
                  onClick={() => updateUpvote()}
                />
              </>
            ) : (
              <>
                <ArrowCircleUpTwoToneIcon
                  className="text-white mr-5 hover:bg-green-500 duration-300 hover:cursor-pointer"
                  onClick={() => updateUpvote()}
                />
              </>
            )}
            <h1 className="text-white">{rating}</h1>
            {!isUpvoted && isDownvoted ? (
              <>
                <ArrowCircleDownTwoToneIcon
                  className="text-red-500 ml-5 hover:bg-red-500 duration-300 hover:cursor-pointer"
                  onClick={() => updateDownvote()}
                />
              </>
            ) : (
              <>
                <ArrowCircleDownTwoToneIcon
                  className="text-white ml-5 hover:bg-red-500 duration-300 hover:cursor-pointer"
                  onClick={() => updateDownvote()}
                />
              </>
            )}
          </div>
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
