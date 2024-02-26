export type Question = {
    ID: string,
    author: string,
    create_date: number,
    last_update_date: number,
    message: string,
    replies?: Reply[],
}

export type Post = {
    postID: number,
    userID: number,
    is_post_verified: boolean
    courseID: number,
    post_title: string,
    post_text: string,
    post_date: number,
    post_image_path: string,
}

export type Reply = {
    replyID: number,
    postID: number,
    userID: number,
    is_reply_verified: boolean,
    reply_text: string,
    reply_date: number,
    reply_image_path: string
}

export type PostRequest = {
    userId: number,
    courseId: number,
    postTitle: string,
    postText: string,
    postImagePath: string,
}

export type PatchRequest = {
    postId: number,
    isVerified: boolean,
}
