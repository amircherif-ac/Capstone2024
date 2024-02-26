import { Close } from "@mui/icons-material";
import {
    CircularProgress,
    Dialog,
    DialogTitle,
    IconButton,
    TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import { Send } from "@mui/icons-material";
import axios, { AxiosResponse } from "axios";
import { GetUserResponse, Post, Reply, User } from "models";

export type ThreadProps = {
    post?: Post;
    replies: Reply[];
    showDialog: boolean;
    authorUsername: string;
    thisUser?: User;
    parentDialogCloseCallback: () => void;
};

export type ReplyRequest = {
    userId?: number;
    postId?: number;
    replyText?: string;
    replyImagePath?: string;
};

export const ThreadDialog = (props: ThreadProps) => {
    const [replyString, setReplyString] = useState("");
    const [loading, setLoading] = useState(false);
    const [replyHtml, setReplyHtml] = useState<JSX.Element[]>([]);
    const threadEndRef = React.useRef<HTMLDivElement>(null);
    const [replyError, setReplyError] = useState(false);

    useEffect(() => {
        if (!props.showDialog) {
            return;
        }

        setLoading(true);

        axios
            .get<any, AxiosResponse<Reply[]>>(
                process.env.REACT_APP_BACKEND_API_HOST +
                    "/api/reply/" +
                    props.post?.postID,
                {
                    timeout: 5000,
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            )
            .then((response) => {
                return renderReplies(response.data);
            })
            .then((response) => {
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
            });
    }, [props.showDialog]);

    useEffect(() => {
        threadEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [replyHtml]);

    const renderReplies = async (replies: Reply[]) => {
        let newReplyHtml: JSX.Element[] = [];
        for (let idx = 0; idx < replies.length; idx++) {
            let userResponse = await axios.get<
                any,
                AxiosResponse<GetUserResponse>
            >(
                process.env.REACT_APP_BACKEND_API_HOST +
                    "/api/user/" +
                    replies[idx].userID,
                {
                    timeout: 5000,
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            );

            // Handle error TODO
            if (userResponse.status !== 200) {
                setLoading(false);
                return;
            }

            let topDivStyle = "m-5 flex flex-col";

            if (idx === replies.length - 1) {
                topDivStyle += " flow-up-animation";
            }

            newReplyHtml.push(
                <div className={topDivStyle} key={idx}>
                    <div
                        key={idx}
                        className="flex flex-row justify-end items-center"
                    >
                        <h1 className="font-jakarta-sans mr-5">
                            {userResponse.data.username}
                        </h1>
                        <Avatar />
                    </div>
                    <div
                        style={{
                            width: "0",
                            height: "0",
                            borderLeft: "10px solid transparent",
                            borderRight: "10px solid transparent",
                            borderBottom: "20px solid white",
                        }}
                        className="ml-[1090px] mt-5"
                    ></div>
                    <div className="flex flex-row justify-end">
                        <div className="bg-white rounded-xl p-5 break-words shadow-xl z-10">
                            {replies[idx].reply_text}
                        </div>
                    </div>
                </div>
            );
        }

        setReplyHtml(newReplyHtml);
    };

    const handleDialogClose = () => {
        props.parentDialogCloseCallback();
    };

    const handleReplySubmit = async () => {
        setLoading(true);

        if (replyString.length === 0) {
            setReplyError(true);
            setLoading(false);
            return;
        }

        if (props.thisUser === undefined) {
            setReplyError(true);
            setLoading(false);
            return;
        }

        let req: ReplyRequest = {
            userId: parseInt(props.thisUser?.id),
            postId: props.post?.postID,
            replyText: replyString,
            replyImagePath: "",
        };

        let response = await axios.post<ReplyRequest>(
            process.env.REACT_APP_BACKEND_API_HOST + "/api/reply/create",
            req,
            {
                timeout: 5000,
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem(
                        "accessToken"
                    )}`,
                },
            }
        );

        // Handle error TODO
        if (response.status !== 200) {
            setLoading(false);
            return;
        }

        // Fetch the updated responses from backend
        let repliesResponse = await axios.get<any, AxiosResponse<Reply[]>>(
            process.env.REACT_APP_BACKEND_API_HOST +
                "/api/reply/" +
                props.post?.postID,
            {
                timeout: 5000,
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem(
                        "accessToken"
                    )}`,
                },
            }
        );

        // Handle error TODO
        if (repliesResponse.status !== 200) {
            setLoading(false);
            return;
        }

        await renderReplies(repliesResponse.data);
        setReplyString("");
        setLoading(false);
    };

    return (
        <div className="">
            <Dialog
                open={props.showDialog}
                onClose={handleDialogClose}
                fullWidth={true}
                maxWidth="lg"
            >
                <div className="flex flex-col">
                    <div className="flex flex-row justify-between">
                        <DialogTitle className="font-jakarta-sans mt-2">
                            {props.post?.post_title}
                        </DialogTitle>
                        <IconButton
                            className="m-5 bg-secondary text-white transition ease-in-out hover:-translate-y
                                hover:scale-110 hover:bg-red-500 duration-300"
                            onClick={handleDialogClose}
                        >
                            <Close />
                        </IconButton>
                    </div>
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex flex-col overflow-y-auto h-[500px] pt-5 pb-5">
                            <div className="flex flex-col ml-5 mr-5 bg-tertiary rounded-xl justify-end">
                                <div className="flex flex-row items-center">
                                    <Avatar className="m-5" />
                                    <h1 className="font-jakarta-sans text-xl">
                                        {props.authorUsername}
                                    </h1>
                                </div>
                                <div
                                    style={{
                                        width: "0",
                                        height: "0",
                                        borderLeft: "10px solid transparent",
                                        borderRight: "10px solid transparent",
                                        borderBottom: "20px solid white",
                                    }}
                                    className="ml-8"
                                ></div>
                                <div className="bg-white rounded-xl top-3 ml-5 mr-5 mb-5 p-5 break-words shadow-xl z-10">
                                    {props.post?.post_text}
                                </div>
                                {replyHtml}
                            </div>
                            <div ref={threadEndRef} className="mt-5"></div>
                        </div>
                        <div className="bg-primary z-10 shadow-[0px_-15px_40px_rgba(0,0,0,0.35)] flex flex-row">
                            <div className="bg-white m-5 p-3 rounded-md w-full flex flex-row items-center">
                                <TextField
                                    error={replyError}
                                    helperText={
                                        replyError
                                            ? "Reply text cannot be empty"
                                            : ""
                                    }
                                    disabled={loading}
                                    fullWidth={true}
                                    multiline
                                    rows={3}
                                    label="Reply"
                                    value={replyString}
                                    onChange={(event) => {
                                        setReplyString(event.target.value);
                                        setReplyError(false);
                                    }}
                                />
                                <IconButton
                                    className=" bg-primary text-white transition ease-in-out
                            hover:-translate-y hover:scale-110 hover:bg-indigo-500 ml-5
                            duration-300"
                                    onClick={handleReplySubmit}
                                >
                                    {loading ? (
                                        <CircularProgress className=" text-white h-6 w-6" />
                                    ) : (
                                        <Send />
                                    )}
                                </IconButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ThreadDialog;
