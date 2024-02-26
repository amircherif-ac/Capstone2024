import {
    Avatar,
    Button,
    CircularProgress,
    Dialog,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    MenuItem,
    Select,
    Snackbar,
    Switch,
    TextField,
} from "@mui/material";
import {
    Course,
    UpdateUserRequest,
    User,
    WithdrawRequest,
} from "models/lib/types";
import { AutoStories, VideoCall } from "@mui/icons-material";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ErrorDialog from "../../../components/ErrorDialog";
import DevicePrompt, {
    DeviceIDCollector,
} from "../../../components/DevicePrompt";

type Props = {
    thisUser?: User;
    enrolledCourses: Course[];
    onWithdraw: (course: Course) => void;
    onSubmitProfileChanges: () => void;
    showSnackBarMessage: (message: string) => void;
};

const ProfilePage = (props: Props) => {
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isWaitingForCourseRefresh, setIsWaitingForCourseRefresh] =
        useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState<string | null>(
        null
    );
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
    const [courseToWithdraw, setCourseToWithdraw] = useState<Course | null>(
        null
    );
    const [allowEdit, setAllowEdit] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSavingChanges, setIsSavingChanges] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const deviceCollector = useRef<DeviceIDCollector>(null);

    useEffect(() => {
        setIsWaitingForCourseRefresh(false);
    }, [props.enrolledCourses]);

    useEffect(() => {
        resetUserInfo();
    }, [props.thisUser]);

    const resetUserInfo = () => {
        if (
            props.thisUser === undefined ||
            props.thisUser.firstName === undefined ||
            props.thisUser.lastName === undefined ||
            props.thisUser.email === undefined
        ) {
            return;
        }

        setFirstName(props.thisUser.firstName);
        setLastName(props.thisUser.lastName);
        setEmail(props.thisUser.email);
    };

    const withdrawFromCourse = () => {
        setIsWithdrawing(true);

        if (props.thisUser === undefined || courseToWithdraw === null) {
            setErrorDialogMessage("could not withdraw from course.");
            setWithdrawDialogOpen(false);
            setIsWithdrawing(false);
            return;
        }

        let request: WithdrawRequest = {
            selectedUserId: parseInt(props.thisUser.id),
            courseId: courseToWithdraw.courseId,
        };

        setTimeout(() => {
            axios
                .delete<WithdrawRequest>(
                    process.env.REACT_APP_BACKEND_API_HOST +
                    "/api/enrollment/withdraw",
                    {
                        timeout: 5000,
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem(
                                "accessToken"
                            )}`,
                        },
                        data: request
                    }
                )
                .then((response) => {
                    setIsWithdrawing(false);
                    props.onWithdraw(courseToWithdraw);
                    setWithdrawDialogOpen(false);
                    setIsWaitingForCourseRefresh(true);
                })
                .catch((error) => {
                    setErrorDialogMessage("could not withdraw from course.");
                    setWithdrawDialogOpen(false);
                    setIsWithdrawing(false);
                });
        }, 1000);
    };

    const clearFormErrors = () => {
        setEmailError(false);
        setFirstNameError(false);
        setLastNameError(false);
    };

    const submitChanges = () => {
        setIsSavingChanges(true);

        if (email === "") {
            setEmailError(true);
            setIsSavingChanges(false);
            return;
        }

        if (firstName === "") {
            setFirstNameError(true);
            setIsSavingChanges(false);
            return;
        }

        if (lastName === "") {
            setLastNameError(true);
            setIsSavingChanges(false);
            return;
        }

        if (
            props.thisUser === undefined ||
            props.thisUser.id === undefined ||
            props.thisUser.roleID === undefined
        ) {
            setErrorDialogMessage("could not save changes");
            setIsSavingChanges(false);
            clearFormErrors();
            return;
        }

        let request: UpdateUserRequest = {
            userId: parseInt(props.thisUser?.id),
            username: props.thisUser?.name,
            firstName: firstName,
            lastName: lastName,
            email: email,
            schoolId: "",
            roleId: props.thisUser?.roleID,
        };

        setTimeout(() => {
            axios
                .put<UpdateUserRequest>(
                    process.env.REACT_APP_BACKEND_API_HOST + "/api/user/edit",
                    request,
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
                    setIsSavingChanges(false);
                    clearFormErrors();
                    setAllowEdit(false);
                    props.onSubmitProfileChanges();
                    props.showSnackBarMessage("Profile changes saved!");
                })
                .catch((err) => {
                    setIsSavingChanges(false);
                    clearFormErrors();
                    setAllowEdit(false);
                    setErrorDialogMessage("could not save changes");
                });
        }, 1000);
    };

    return (
        <div className="w-full p-5 flex flex-col flow-up-animation overflow-y-auto mb-10">
            {withdrawDialogOpen && courseToWithdraw !== null && (
                <Dialog
                    open={withdrawDialogOpen}
                    maxWidth="sm"
                    fullWidth={true}
                    onClose={() => {
                        setWithdrawDialogOpen(false);
                        setCourseToWithdraw(null);
                    }}
                >
                    <div className="flex flex-row">
                        <div className="w-[75px] bg-primary"></div>
                        <div className="flex flex-col flex-1 p-5">
                            <p className="font-jakarta-sans text-2xl mb-5">
                                Withdraw
                            </p>
                            <p className="font-jakarta-sans text-lg opacity-70 mb-5">
                                Do you really wish to withdraw from{" "}
                                {courseToWithdraw.subject.courseCode
                                    .courseCode +
                                    courseToWithdraw.subject.courseNumber}
                                ?
                            </p>
                            <div className="flex flex-row justify-end">
                                <Button
                                    className="mr-5 font-jakarta-sans"
                                    onClick={() => {
                                        setWithdrawDialogOpen(false);
                                        setCourseToWithdraw(null);
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
                                        <CircularProgress
                                            className="text-white"
                                            size="25px"
                                        />
                                    ) : (
                                        "Yes"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Dialog>
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

            <div className="min-h-fit">
                <div className="bg-white flex flex-col rounded-xl overflow-hidden shadow-sm shadow-slate-500 mb-5">
                    <div className="bg-secondary flex flex-row">
                        <div className="bg-primary flex flex-row items-center justify-center p-5">
                            <p className="font-jakarta-sans text-xl text-white">
                                My Account
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col p-5">
                        <div className="flex flex-col">
                            <div className="flex flex-row items-center mb-5">
                                <Avatar className="h-[100px] w-[100px] mr-5" />
                            </div>
                            <p className="font-jakarta-sans text-3xl mb-10">
                                {props.thisUser?.name}
                            </p>
                        </div>

                        <div className="flex flex-col p-5 border-[1px] border-black rounded-lg w-fit mb-5">
                            <div className="flex flex-row items-center mb-5">
                                <TextField
                                    className="w-full"
                                    error={emailError}
                                    helperText={emailError && "cannot be empty"}
                                    disabled={!allowEdit}
                                    label="E-mail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        clearFormErrors();
                                        setEmail(e.target.value);
                                    }}
                                ></TextField>
                            </div>
                            <div className="flex flex-row items-center mb-5">
                                <TextField
                                    className="mr-5 w-[300px]"
                                    error={firstNameError}
                                    helperText={
                                        firstNameError && "cannot be empty"
                                    }
                                    disabled={!allowEdit}
                                    label="First Name"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => {
                                        clearFormErrors();
                                        setFirstName(e.target.value);
                                    }}
                                ></TextField>
                                <TextField
                                    className=" w-[300px]"
                                    error={lastNameError}
                                    helperText={
                                        lastNameError && "cannot be empty"
                                    }
                                    disabled={!allowEdit}
                                    label="Last Name"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => {
                                        clearFormErrors();
                                        setLastName(e.target.value);
                                    }}
                                ></TextField>
                            </div>
                            <FormControl
                                className="w-full mb-5"
                                disabled={!allowEdit}
                            >
                                {/* <InputLabel>Account Role</InputLabel>
                                <Select
                                    labelId="Account Role"
                                    value={1}
                                    onChange={(e) => {}}
                                    label="Account Role"
                                >
                                    <MenuItem value={1}>Student</MenuItem>
                                    <MenuItem value={2}>Tutor</MenuItem>
                                    <MenuItem value={3}>Moderator</MenuItem>
                                </Select> */}
                            </FormControl>

                            <div className="flex flex-row items-center mb-5">
                                <TextField
                                    className="w-full"
                                    error={emailError}
                                    helperText={emailError && "cannot be empty"}
                                    disabled={!allowEdit}
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => {
                                        clearFormErrors();
                                        setCurrentPassword(e.target.value);
                                    }}
                                ></TextField>
                            </div>

                            <div className="flex flex-row items-center mb-5">
                                <TextField
                                    className="w-full"
                                    error={emailError}
                                    helperText={emailError && "cannot be empty"}
                                    disabled={!allowEdit}
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        clearFormErrors();
                                        setNewPassword(e.target.value);
                                    }}
                                ></TextField>
                            </div>

                            <div className="flex flex-row items-center mb-5">
                                <TextField
                                    className="w-full"
                                    error={emailError}
                                    helperText={emailError && "cannot be empty"}
                                    disabled={!allowEdit}
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        clearFormErrors();
                                        setConfirmPassword(e.target.value);
                                    }}
                                ></TextField>
                            </div>

                            <div className="flex flex-row justify-between">
                                <Button
                                    className={`${!allowEdit && "bg-primary"
                                        } font-jakarta-sans hover:bg-blue-500 duration-300 w-fit`}
                                    variant={
                                        allowEdit ? "outlined" : "contained"
                                    }
                                    onClick={() => {
                                        if (allowEdit) {
                                            resetUserInfo();
                                        }

                                        clearFormErrors();
                                        setAllowEdit(!allowEdit);
                                    }}
                                >
                                    {allowEdit ? "Cancel" : "Edit"}
                                </Button>

                                {allowEdit && (
                                    <Button
                                        className="font-jakarta-sans hover:bg-blue-500 duration-300 w-fit bg-primary text-white"
                                        onClick={submitChanges}
                                    >
                                        {isSavingChanges ? (
                                            <CircularProgress
                                                className="text-white"
                                                size="25px"
                                            />
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-fit">
                <div className="bg-white flex flex-col rounded-xl shadow-sm shadow-slate-500 mb-5 overflow-hidden">
                    <div className="bg-secondary flex flex-row">
                        <div className="bg-primary flex flex-row items-center justify-center p-5">
                            <p className="font-jakarta-sans text-xl text-white">
                                My Enrolled Courses
                            </p>
                        </div>
                    </div>

                    {!isWaitingForCourseRefresh &&
                        props.enrolledCourses.length === 0 && (
                            <div className="flex flex-col items-center justify-center w-full h-full flow-up-animation p-5">
                                <AutoStories className="texl-2xl opacity-30" />
                                <p className="font-jakarta-sans text-2xl opacity-30">
                                    You are currently not enrolled in any course
                                </p>
                            </div>
                        )}

                    {isWaitingForCourseRefresh && (
                        <div className="flex flex-col items-center justify-center h-[100px]">
                            <CircularProgress />
                        </div>
                    )}

                    {!isWaitingForCourseRefresh &&
                        props.enrolledCourses.length > 0 && (
                            <div className="w-full">
                                <List>
                                    {props.enrolledCourses.map((course) => {
                                        return (
                                            <div key={course.courseId}>
                                                <ListItem
                                                    key={course.courseId}
                                                    className="h-[75px] w-full"
                                                >
                                                    <div className="flex flex-row justify-between w-full">
                                                        <div className="flex flex-row items-center">
                                                            <ListItemIcon>
                                                                <TurnedInIcon className="mr-5" />
                                                            </ListItemIcon>
                                                            <p className="font-jakarta-sans text-md mr-10">
                                                                {course.subject.courseCode.courseCode.trim() +
                                                                    course.subject.courseNumber.trim()}
                                                            </p>
                                                            <p className="font-jakarta-sans text-md mr-10">
                                                                {course.courseTitle.trim()}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="contained"
                                                            className="bg-primary font-jakarta-sans hover:bg-red-500 duration-300"
                                                            onClick={() => {
                                                                setWithdrawDialogOpen(
                                                                    true
                                                                );
                                                                setCourseToWithdraw(
                                                                    course
                                                                );
                                                            }}
                                                        >
                                                            Withdraw
                                                        </Button>
                                                    </div>
                                                </ListItem>
                                                <Divider />
                                            </div>
                                        );
                                    })}
                                </List>
                            </div>
                        )}
                </div>
            </div>

            <div className="min-h-fit">
                <div className="bg-white flex flex-col rounded-xl overflow-hidden shadow-sm shadow-slate-500 mb-10">
                    <div className="bg-secondary flex flex-row">
                        <div className="bg-primary flex flex-row items-center justify-center p-5">
                            <p className="font-jakarta-sans text-xl text-white">
                                Live Session Settings
                            </p>
                        </div>
                    </div>
                    <div className="p-5">
                        <DevicePrompt
                            columnStyle={false}
                            mute={true}
                            hideSave={false}
                            ref={deviceCollector}
                            onSave={() => {
                                props.showSnackBarMessage(
                                    "Live session preferences saved!"
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
