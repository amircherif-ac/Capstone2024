import React from "react";
import { User } from "models";
import { MultiChatWindow, useMultiChatLogic, MultiChatSocket } from 'react-chat-engine-advanced'

// TODO: Fix string if we change the projectID and private key
const projectId = "04dbe821-c987-407d-960c-eb2dc98930d1";
//const projectId = process.env.REACT_APP_PROJECT_ID;
// const username: string = 'student1'
const secret: string = "1234"

export type MessagePageProps = {
  thisUser: User;

};

export const Messages = (props: MessagePageProps) => {
  const username = props.thisUser.name
  console.log(props.thisUser.roleID)
  const chatprops = useMultiChatLogic(String(projectId), username, secret)
  return (


    <div className='flow-up-animation w-full'>
      <MultiChatSocket {...chatprops} />
      <MultiChatWindow {...chatprops} />
    </div>
  )
}

export default Messages;
