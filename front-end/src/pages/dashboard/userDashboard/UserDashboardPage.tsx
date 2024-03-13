import React from 'react';

import {
    User,
} from "models/lib/types";

type Props = {
    thisUser?: User;
};

const UserDashboardPage = (props: Props) => {

    return (
        <div className="h-full w-full p-5 flex flex-row flow-up-animation">
            <div className="h-full w-full">
                <div className="bg-white h-full rounded-xl shadow-slate-500 shadow-md flex flex-col mr-5 overflow-hidden">
                    {/* blah blah */}
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
