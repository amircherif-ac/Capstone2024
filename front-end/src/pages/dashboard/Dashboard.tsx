import {
    Autocomplete,
    Avatar,
    Button,
    CircularProgress,
    createFilterOptions,
    Dialog,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Snackbar,
    TextField,
} from "@mui/material";
import Peer from "peerjs";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import MenuIcon from "@mui/icons-material/Menu";
import {
    School,
    Home as HomeIcon,
    AutoStories,
    ExpandMore,
    Add,
    CalendarMonth,
    Logout,
    AccountBox,
    Close,
    Message as MessageIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Book,
    Speed,
    Forum
} from "@mui/icons-material";
import {
    Course,
    User,
    EnrollRequest,
    UserEnrolledCoursesResponse,
    GetUserResponse,
} from "models";
import Home from "./home/Home";
import axios, { AxiosResponse } from "axios";
import ErrorDialog from "../../components/ErrorDialog";
import { useNavigate } from "react-router-dom";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import CoursePage from "./coursePage/CoursePage";
import ProfilePage from "./profile/ProfilePage";
import CalendarPage from "./calendar/CalendarPage";
import LearningPathPage from "./learningPath/LearningPathPage";
import UserDashboardPage from "./userDashboard/UserDashboardPage";

import Admin from "./Admin/Admin";


import Messages from "./messages/Messages";
import FontSlider from "../../globalFontSlider";
import CustomSelect from '../../themeSelector';

type DashboardProps = {
    webSocket?: Socket;
    peerConnection?: Peer;
    thisUser?: User;
};


export enum Page {
    Home = 1,
    QuestionBoard,
    LiveTutors,
    Calendar,
    Profile,
    Notifications,
    Messages,
    Settings,
    SavedAnswers,
    CoursePage,
    LearningPath,
    UserDashboard,
    Admin
}

const Dashboard = (props: DashboardProps) => {
    const redirect = useNavigate();
    const [isFetchingCourses, setIsFetchingCourses] = useState(true);
    const [isFetchingEnrolledCourses, setIsFetchingEnrolledCourses] =
        useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
    const [profileMenuAnchor, setProfileMenuAnchor] =
        useState<null | HTMLDivElement>(null);
    const [thisUser, setThisUser] = useState<User | undefined>(props.thisUser);
    const [enrollCourseDialogOpen, setEnrollCourseDialogOpen] = useState(false);
    const [fatalErrorDialog, setFatalErrorDialog] = useState(false);
    const [fatalErrorMessage, setFatalErrorMessage] = useState("");
    const profileMenuOpened = Boolean(profileMenuAnchor);
    const [cachedCourses, setCachedCourses] = useState<Course[]>([]);
    const [cachedCourseMap, setCachedCourseMap] = useState<{
        [courseID: string]: Course;
    }>({});
    const [selectedCourseToEnroll, setSelectedCourseToEnroll] =
        useState<Course | null>(null);
    const [invalidCourseSelection, setInvalidCourseSelection] = useState(false);
    const [isEnrollingInCourse, setIsEnrollingInCourse] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);
    const [selectedCoursePage, setSelectedCoursePage] = useState<string>("");
    const [showSideNav, setShowSideNav] = useState(true);
    const [inLiveSession, setInLiveSession] = useState(false);

    useEffect(() => {
        if (thisUser === undefined) {
            const userID = sessionStorage.getItem("userID");
            const username = sessionStorage.getItem("username");
            const peerID = sessionStorage.getItem("peerID");
            const accessToken = sessionStorage.getItem("accessToken");
            const email = sessionStorage.getItem("email");
            const role = sessionStorage.getItem("role");
            const roleID = sessionStorage.getItem("roleID");
            const firstName = sessionStorage.getItem("firstName");
            const lastName = sessionStorage.getItem("lastName");

            // If user info is not in session storage, force them to login again
            if (
                userID === null ||
                username === null ||
                peerID === null ||
                accessToken === null ||
                email === null ||
                role === null ||
                roleID === null ||
                firstName === null ||
                lastName === null
            ) {
                setFatalErrorMessage(
                    "Our services are currently unavailable. Please try logging in again."
                );
                setFatalErrorDialog(true);
                return;
            }

            setThisUser({
                id: userID,
                name: username,
                peerID: peerID,
                accessToken: accessToken,
                email: email,
                role: role,
                roleID: roleID,
                firstName: firstName,
                lastName: lastName,
            });
        }
    }, []);

    useEffect(() => {
        if (
            props.webSocket === undefined ||
            props.peerConnection === undefined
        ) {
            setFatalErrorDialog(true);
            setFatalErrorMessage(
                "Our services are currently unavailable. Please try logging in again."
            );
            return;
        }

        props.webSocket?.on("disconnect", (reason) => {
            setFatalErrorDialog(true);
            setFatalErrorMessage(
                "Our services are currently unavailable. Please try logging in again."
            );
        });

        props.peerConnection?.on("disconnected", (thisUserID) => {
            setFatalErrorDialog(true);
            setFatalErrorMessage(
                "Our services are currently unavailable. Please try logging in again."
            );
        });
    }, []);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchEnrolledCourses();
    }, [thisUser]);

    const hideSideNav = (show: boolean) => {
        setShowSideNav(show);
    };

    const onHomePageEnrolledCourseClick = (course: Course) => {
        setSelectedCoursePage(course.subject.courseCode.courseCode + course.subject.courseNumber)
        setCurrentPage(Page.CoursePage)
    }

    const fetchCourses = () => {
        setIsFetchingCourses(true);

        axios
            .get<any, AxiosResponse<Course[]>>(
                process.env.REACT_APP_BACKEND_API_HOST + "/api/courses",
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem(
                            "accessToken"
                        )}`,
                    },
                }
            )
            .then((response) => {
                const [courseArray, courseMap] = produceCourseCache(
                    response.data
                );
                setCachedCourses(courseArray);
                setCachedCourseMap(courseMap);
                setIsFetchingCourses(false);
            })
            .catch((error) => {
                setIsFetchingCourses(false);
                setFatalErrorDialog(true);
                setFatalErrorMessage(
                    "Our services are currently unavailable. Please try logging in again."
                );
            });
    };

    const fetchEnrolledCourses = () => {
        setIsFetchingEnrolledCourses(true);

        setTimeout(() => {
            axios
                .get<any, AxiosResponse<UserEnrolledCoursesResponse>>(
                    process.env.REACT_APP_BACKEND_API_HOST +
                    "/api/enrollment/studentCourses/" +
                    thisUser?.id,
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
                    let courses: Course[] = [];

                    response.data.courses.forEach((enrolledCourse) => {
                        enrolledCourse.course.courseId =
                            enrolledCourse.courseID;
                        courses.push(enrolledCourse.course);
                    });

                    setEnrolledCourses(courses);
                    setIsFetchingEnrolledCourses(false);
                })
                .catch((error) => {
                    setIsFetchingEnrolledCourses(false);
                    setFatalErrorDialog(true);
                    setFatalErrorMessage(
                        "Our services are currently unavailable. Please try logging in again."
                    );
                });
        }, 1000);
    };

    const onWithdraw = (course: Course) => {
        setIsFetchingEnrolledCourses(true);
        fetchEnrolledCourses();
        setSelectedCoursePage("");
        setTimeout(() => {
            setSnackBarMessage(
                `Successfully withdrew from ${course.subject.courseCode.courseCode +
                course.subject.courseNumber
                }.`
            );
        }, 1000);

        if (currentPage === Page.CoursePage) {
            setCurrentPage(Page.Home);
        }
    };

    const onSubmitProfileChanges = () => {
        axios
            .get<any, AxiosResponse<GetUserResponse>>(
                process.env.REACT_APP_BACKEND_API_HOST +
                "/api/user/" +
                thisUser?.id,
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
                sessionStorage.setItem("userID", String(response.data.userID));
                sessionStorage.setItem("username", response.data.username);
                sessionStorage.setItem("email", response.data.email);
                sessionStorage.setItem("role", response.data.role);
                sessionStorage.setItem("roleID", response.data.roleID);
                sessionStorage.setItem("firstName", response.data.firstName);
                sessionStorage.setItem("lastName", response.data.lastName);

                if (thisUser === undefined) {
                    setFatalErrorDialog(true);
                    setFatalErrorMessage(
                        "could not retrieve important data. Try logging back in."
                    );
                    return;
                }

                setThisUser({
                    id: response.data.userID.toString(),
                    name: response.data.username,
                    peerID: thisUser.peerID,
                    accessToken: thisUser.accessToken,
                    email: response.data.email,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    role: response.data.role,
                    roleID: response.data.roleID,
                });
            })
            .catch((err) => {
                setFatalErrorDialog(true);
                setFatalErrorMessage(
                    "could not retrieve important data. Try logging back in."
                );
            });
    };

    const showSnackBarMessage = (message: string) => {
        setSnackBarMessage(message);
    };

    const onSubmitNewQuestion = (course: Course) => {
        setSnackBarMessage(
            `Successfully posted question for ${course.subject.courseCode.courseCode +
            course.subject.courseNumber
            }.`
        );
    };

    const logoutUser = () => {
        sessionStorage.clear();
        props.peerConnection?.disconnect();
        props.webSocket?.disconnect();
        redirect("/signin");
    };

    const subjectFilterOptions = createFilterOptions<Course>({
        limit: 500,
    });

    const produceCourseCache = (
        courses: Course[]
    ): [Course[], { [courseCode: string]: Course }] => {
        let mapping: { [courseCode: string]: Course } = {};

        courses?.forEach((course) => {
            mapping[
                course.subject.courseCode.courseCode +
                course.subject.courseNumber
            ] = course;
        });

        let unDuppedCourses: Course[] = [];

        Object.keys(mapping).forEach((courseCode) => {
            unDuppedCourses.push(mapping[courseCode]);
        });

        return [unDuppedCourses, mapping];
    };

    const enrollInCourse = (user: User, course: Course) => {
        setIsEnrollingInCourse(true);

        const numericUserID = parseInt(user.id);
        const request: EnrollRequest = {
            userId: numericUserID,
            courseId: course.courseId,
        };

        axios
            .post<EnrollRequest, AxiosResponse<any>>(
                process.env.REACT_APP_BACKEND_API_HOST +
                "/api/enrollment/enroll",
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
                setIsEnrollingInCourse(false);
                setEnrollCourseDialogOpen(false);

                if (response.data.message !== undefined) {
                    setSnackBarMessage(
                        `You are already enrolled in ${course.subject.courseCode.courseCode +
                        course.subject.courseNumber
                        }.`
                    );
                    return;
                }

                setSnackBarMessage(
                    `Successfully enrolled in ${course.subject.courseCode.courseCode +
                    course.subject.courseNumber
                    }.`
                );
                fetchEnrolledCourses();
            });
    };

    const inLiveSessionCallback = (inLiveSession: boolean) => {
        setInLiveSession(inLiveSession);
    };

    if (thisUser === undefined) {
        redirect("/signin");
        return <></>;
    }

    function renderAdminControl(roleID: string): import("react").ReactNode {
        if (Number(roleID) == 3) {
            // return the admin control
            return (
                <ListItem // Navigation: ADMIN
                    disablePadding
                    className={`${currentPage === Page.Admin // Change this
                        ? "bg-primary"
                        : ""
                        } `}
                >
                    <ListItemButton
                        className="h-[75px]"
                        onClick={() => {
                            if (inLiveSession) {
                                setErrorMessage(
                                    "You are currently in a live session. Please end or leave the session before changing tab."
                                );
                                return;
                            }

                            setCurrentPage(Page.Admin);
                            setSelectedCoursePage("");
                        }}
                    >
                        <ListItemIcon>
                            <AdminPanelSettingsIcon className="text-white" />
                        </ListItemIcon>
                        <p className="font-jakarta-sans text-white text-md">
                            Admin Control
                        </p>
                    </ListItemButton>
                </ListItem>)
        }
        // console.log("admin control")
        return
    }

    return (
        <div className="flex flex-col w-screen h-screen bg-tertiary overflow-y-hidden">
            {fatalErrorDialog && (
                <ErrorDialog
                    dialogTitle="Something went wrong"
                    errorMessage={fatalErrorMessage}
                    buttonClickCallback={logoutUser}
                    show={fatalErrorDialog}
                    buttonText="Ok"
                />
            )}

            {errorMessage !== null && (
                <ErrorDialog
                    dialogTitle="Something went wrong"
                    errorMessage={errorMessage}
                    buttonClickCallback={() => {
                        setErrorMessage(null);
                    }}
                    show={true}
                    buttonText="Ok"
                />
            )}

            {snackBarMessage !== null && (
                <Snackbar
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    open={snackBarMessage !== null}
                    autoHideDuration={5000}
                    onClose={() => {
                        setSnackBarMessage(null);
                    }}
                    message={snackBarMessage}
                />
            )}

            {enrollCourseDialogOpen && (
                <Dialog
                    open={enrollCourseDialogOpen}
                    maxWidth="sm"
                    fullWidth
                    onClose={() => {
                        setEnrollCourseDialogOpen(false);
                        setInvalidCourseSelection(false);
                    }}
                >
                    <div className="bg-white flex flex-row w-full">
                        <div className="bg-primary w-[75px]" />
                        <div className="flex flex-col h-full w-full p-5 justify-between">
                            <div className="flex flex-col mb-5">
                                <div className="flex flex-row justify-between items-center mb-10">
                                    <p className="font-jakarta-sans text-xl">
                                        Enroll in a Course
                                    </p>
                                    <IconButton
                                        className="bg-secondary text-white transition ease-in-out hover:-translate-y
                hover:scale-110 hover:bg-red-500 duration-300"
                                        onClick={() => {
                                            setEnrollCourseDialogOpen(false);
                                            setInvalidCourseSelection(false);
                                        }}
                                    >
                                        <Close />
                                    </IconButton>
                                </div>
                                <Autocomplete<Course>
                                    onChange={(event, value) => {
                                        setInvalidCourseSelection(false);
                                        setSelectedCourseToEnroll(value);
                                    }}
                                    value={selectedCourseToEnroll}
                                    filterOptions={subjectFilterOptions}
                                    isOptionEqualToValue={(option, value) => {
                                        return (
                                            option.courseId === value.courseId
                                        );
                                    }}
                                    getOptionLabel={(course) => {
                                        return (
                                            course.subject.courseCode
                                                .courseCode +
                                            course.subject.courseNumber
                                        );
                                    }}
                                    autoComplete
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            className="font-jakarta-sans"
                                            label="Subject"
                                            error={invalidCourseSelection}
                                            helperText={
                                                invalidCourseSelection
                                                    ? "Please select a course to enroll in."
                                                    : ""
                                            }
                                        />
                                    )}
                                    options={
                                        cachedCourses !== undefined
                                            ? cachedCourses
                                            : []
                                    }
                                />
                            </div>
                            <div className="flex flex-row">
                                <Button
                                    variant="contained"
                                    className="font-jakarta-sans bg-primary hover:bg-blue-500 duration-300"
                                    onClick={() => {
                                        if (
                                            selectedCourseToEnroll === null ||
                                            thisUser === undefined
                                        ) {
                                            setInvalidCourseSelection(true);
                                            return;
                                        }

                                        enrollInCourse(
                                            thisUser,
                                            selectedCourseToEnroll
                                        );
                                    }}
                                >
                                    Enroll
                                </Button>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}

            <div className="flex flex-row w-full h-[75px] bg-primary justify-between z-10 min-h-[75px] drop-shadow-md shadow-md">
                <div className="flex flex-row items-center">
                    <IconButton
                        className={`ml-5 ${showSideNav
                            ? "bg-secondary shadow-black shadow-md"
                            : ""
                            }`}
                        onClick={() => {
                            setShowSideNav(!showSideNav);
                        }}
                    >
                        <MenuIcon className="text-white text-3xl" />
                    </IconButton>
                    <School className="text-white text-2xl ml-5" />
                    <p className="font-jakarta-sans text-white ml-5 text-2xl">
                        Study Hero
                    </p>
                </div>
                <div className="flex flex-row items-center font-jakarta-sans text-white text-2xl">
                    <CustomSelect />
                    </div>

                    <div className="flex flex-row items-center font-jakarta-sans text-white text-2xl">
                        <FontSlider />
                    </div>
                <div
                    className="flex flex-row items-center transition ease-in-out hover:bg-blue-600 pl-5 pr-5 min-w-[300px] justify-end"
                    onClick={(e) => {
                        setProfileMenuAnchor(e.currentTarget);
                    }}
                >   
                   
                    <p className="font-jakarta-sans text-white text-2xl mr-5">
                        Hey, {thisUser?.name}
                    </p>
                    <Avatar className="mr-5" />
                    <ExpandMore className="text-white" />
                </div>
                <Menu
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    open={profileMenuOpened}
                    anchorEl={profileMenuAnchor}
                    onClose={() => {
                        setProfileMenuAnchor(null);
                    }}
                >
                    <MenuItem
                        className="min-w-[300px]  flex flex-row justify-between"
                        onClick={() => {
                            setProfileMenuAnchor(null);
                            setCurrentPage(Page.Profile);
                            setSelectedCoursePage("");
                        }}
                    >
                        <p className="font-jakarta-sans">Profile</p>
                        <AccountBox />
                    </MenuItem>


                    <MenuItem
                        className="min-w-[300px] w-full flex flex-row justify-between"
                        onClick={() => {
                            setProfileMenuAnchor(null);
                            logoutUser();
                        }}
                    >
                        <p className="font-jakarta-sans">Sign out</p>
                        <Logout />
                    </MenuItem>
                </Menu>
            </div>
            <div className="h-full flex flex-row overflow-y-auto">
                <div
                    className={`max-w-[250px] flex flex-col h-full overflow-y-auto bg-secondary ${showSideNav ? "slide-left-full" : "slide-right-full"
                        }`}
                >
                    <List
                        disablePadding
                        className={`${showSideNav ? "" : "hidden"}`}
                    >
                        {
                            // idk why this works but it does so just leave it and dont touch, thanks
                            thisUser.roleID == '3' && (renderAdminControl(thisUser.roleID))
                        }
                        <ListItem
                            disablePadding
                            className={`${currentPage === Page.Home ? "bg-primary" : ""
                                } `}
                        >

                            <ListItemButton
                                className={`h-[75px]`}
                                onClick={() => {
                                    if (inLiveSession) {
                                        setErrorMessage(
                                            "You are currently in a live session. Please end or leave the session before changing tab."
                                        );
                                        return;
                                    }

                                    setCurrentPage(Page.Home);
                                    setSelectedCoursePage("");
                                }}
                            >
                                <ListItemIcon>
                                    <HomeIcon className="text-white" />
                                </ListItemIcon>
                                <p className="font-jakarta-sans text-white text-md">
                                    Home
                                </p>
                            </ListItemButton>
                        </ListItem>
                        <ListItem
                            disablePadding
                            className={`${currentPage === Page.Calendar
                                ? "bg-primary"
                                : ""
                                } `}
                        >
                            <ListItemButton
                                className="h-[75px]"
                                onClick={() => {
                                    if (inLiveSession) {
                                        setErrorMessage(
                                            "You are currently in a live session. Please end or leave the session before changing tab."
                                        );
                                        return;
                                    }

                                    setCurrentPage(Page.Calendar);
                                    setSelectedCoursePage("");
                                }}
                            >
                                <ListItemIcon>
                                    <CalendarMonth className="text-white" />
                                </ListItemIcon>
                                <p className="font-jakarta-sans text-white text-md">
                                    Calendar
                                </p>
                            </ListItemButton>
                        </ListItem>
                        <ListItem // Navigation: Message
                            disablePadding
                            className={`${currentPage === Page.Messages // Change this
                                ? "bg-primary"
                                : ""
                                } `}
                        >
                            <ListItemButton
                                className="h-[75px]"
                                onClick={() => {
                                    if (inLiveSession) {
                                        setErrorMessage(
                                            "You are currently in a live session. Please end or leave the session before changing tab."
                                        );
                                        return;
                                    }

                                    setCurrentPage(Page.Messages);
                                    setSelectedCoursePage("");
                                }}
                            >
                                <ListItemIcon>
                                    <MessageIcon className="text-white" />
                                </ListItemIcon>
                                <p className="font-jakarta-sans text-white text-md">
                                    Messages
                                </p>
                            </ListItemButton>
                        </ListItem>

                        {/*Forum*/}
                        <ListItem disablePadding>
                        <ListItemButton
                                className="h-[75px]"
                                onClick={() => {
                                    if (inLiveSession) {
                                        setErrorMessage(
                                            "You are currently in a live session. Please end or leave the session before enrolling in a new course."
                                        );
                                        return;
                                    }
                                    // setCurrentPage(Page.UserDashboard);
                                    // setSelectedCoursePage("");
                                }}
                            >
                                <ListItemIcon>
                                    <Forum className="text-white" />
                                </ListItemIcon>
                                <p className="font-jakarta-sans text-white text-md">
                                    Forum
                                </p>
                            </ListItemButton>
                        </ListItem>

                        {/* user Dashboard */}
                        <ListItem disablePadding>
                        <ListItemButton
                                className="h-[75px]"
                                onClick={() => {
                                    if (inLiveSession) {
                                        setErrorMessage(
                                            "You are currently in a live session. Please end or leave the session before enrolling in a new course."
                                        );
                                        return;
                                    }
                                    setCurrentPage(Page.UserDashboard);
                                    setSelectedCoursePage("");
                                }}
                            >
                                <ListItemIcon>
                                    <Speed className="text-white" />
                                </ListItemIcon>
                                <p className="font-jakarta-sans text-white text-md">
                                    Performance
                                </p>
                            </ListItemButton>
                        </ListItem>

                        {/* Learning Path */}
                        <ListItem disablePadding>
                        <ListItemButton
                                className="h-[75px]"
                                onClick={() => {
                                    if (inLiveSession) {
                                        setErrorMessage(
                                            "You are currently in a live session. Please end or leave the session before enrolling in a new course."
                                        );
                                        return;
                                    }
                                    setCurrentPage(Page.LearningPath);
                                    setSelectedCoursePage("");
                                }}
                            >
                                <ListItemIcon>
                                    <Book className="text-white" />
                                </ListItemIcon>
                                <p className="font-jakarta-sans text-white text-md">
                                    Learning Path
                                </p>
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                className="h-[75px]"
                                onClick={() => {
                                    if (inLiveSession) {
                                        setErrorMessage(
                                            "You are currently in a live session. Please end or leave the session before enrolling in a new course."
                                        );
                                        return;
                                    }

                                    setEnrollCourseDialogOpen(true);
                                }}
                            >
                                <ListItemIcon>
                                    <Add className="text-white" />
                                </ListItemIcon>
                                <p className="font-jakarta-sans text-white text-md">
                                    Enroll in a Course
                                </p>
                            </ListItemButton>
                        </ListItem>
                        <ListItem className="z-10 h-[75px]">
                            <ListItemIcon>
                                <AutoStories className="text-white" />
                            </ListItemIcon>
                            <p className="font-jakarta-sans text-white text-md">
                                Your Courses
                            </p>
                            <ExpandMore className="text-white ml-5" />
                        </ListItem>




                        {isFetchingEnrolledCourses && (
                            <div className="flex flex-col items-center justify-center h-[100px]">
                                <CircularProgress className="text-white text-sm" />
                            </div>
                        )}
                        {enrolledCourses.length === 0 &&
                            !isFetchingEnrolledCourses && (
                                <ListItem>
                                    <div className="flow-up-animation">
                                        <p className="text-white opacity-50 font-jakarta-sans">
                                            You are not enrolled in any course.
                                        </p>
                                    </div>
                                </ListItem>
                            )}
                        {enrolledCourses.length > 0 &&
                            !isFetchingEnrolledCourses &&
                            enrolledCourses.map((course, idx) => (
                                <ListItem disablePadding key={idx}>
                                    <ListItemButton
                                        className={`h-[75px] flow-up-animation ${selectedCoursePage ===
                                            course.subject.courseCode
                                                .courseCode +
                                            course.subject.courseNumber
                                            ? "bg-primary"
                                            : ""
                                            }`}
                                        onClick={() => {
                                            // No need to re-render if the user selects the page he's already on
                                            if (
                                                selectedCoursePage ===
                                                course.subject.courseCode
                                                    .courseCode +
                                                course.subject.courseNumber
                                            ) {
                                                return;
                                            }

                                            if (inLiveSession) {
                                                setErrorMessage(
                                                    "You are currently in a live session. Please end or leave the session before changing tab."
                                                );
                                                return;
                                            }

                                            // Hacky way to force the child component to re-render
                                            setSelectedCoursePage("");
                                            setTimeout(() => {
                                                setSelectedCoursePage(
                                                    course.subject.courseCode
                                                        .courseCode +
                                                    course.subject
                                                        .courseNumber
                                                );
                                            }, 50);
                                            setCurrentPage(Page.CoursePage);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <TurnedInIcon className="text-white" />
                                        </ListItemIcon>
                                        <p className="font-jakarta-sans text-white text-md">
                                            {course.subject.courseCode
                                                .courseCode +
                                                course.subject.courseNumber}
                                        </p>
                                    </ListItemButton>
                                </ListItem>


                            ))}
                    </List>
                </div>

                {currentPage === Page.Home && <Home thisUser={props.thisUser} enrolledCourses={enrolledCourses} enrolledCourseClickCallback={onHomePageEnrolledCourseClick} />}

                {
                    currentPage === Page.Calendar &&
                    <CalendarPage
                        userEnrolledCourses={enrolledCourses}
                        thisUser={props.thisUser}
                        courses={cachedCourses} />
                }

                {currentPage === Page.Admin && <Admin setSnackBarMessage={(message: string) => {
                    setSnackBarMessage(message)
                }} thisUser={thisUser} />}

                {currentPage === Page.Messages && <Messages thisUser={thisUser} />}

                {currentPage === Page.Profile && (
                    <ProfilePage
                        showSnackBarMessage={showSnackBarMessage}
                        onSubmitProfileChanges={onSubmitProfileChanges}
                        onWithdraw={onWithdraw}
                        thisUser={thisUser}
                        enrolledCourses={enrolledCourses}
                    />
                )}

                {currentPage === Page.LearningPath && (
                    <LearningPathPage />
                )}

                {currentPage === Page.UserDashboard && (
                    <UserDashboardPage />
                )}

                {currentPage === Page.CoursePage &&
                    selectedCoursePage !== "" && (
                        <CoursePage
                            webSocket={props.webSocket}
                            inLiveSessionCallback={inLiveSessionCallback}
                            peerConnection={props.peerConnection}
                            hideSideNav={hideSideNav}
                            course={cachedCourseMap[selectedCoursePage]}
                            thisUser={thisUser}
                            onWithdraw={onWithdraw}
                            onSubmitNewQuestion={onSubmitNewQuestion} isTeacher={false} isTutor={undefined} />
                    )}
            </div>
        </div>
    );
};

export default Dashboard;
