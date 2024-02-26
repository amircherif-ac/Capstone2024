import * as React from "react";
import {
    Dialog,
    IconButton,
    Button,
    Box,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { Close } from "@mui/icons-material";
import axios, { AxiosResponse } from "axios";
import { GetEnrolledUsersResponse, EnrolledUser } from "../../../model/Enrollment"
import { Course, User } from 'models'
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid"

type CreateTutorProps = {
    enrolledUsers: EnrolledUser[],
    show: boolean,
    thisUser: User,
    isTeacher: boolean,
    course: Course,
    onClose: () => void,
    refreshEnrolled: (courseId: number) => void
}

const CreateTutorDialog = (props: CreateTutorProps) => {

    // const [tableData, setTableData] = useState<EnrolledUser[]>(props.enrolledUsers);
    // useEffect(()=>{
    //     setTableData( props.enrolledUsers.map((obj, idx) => {      
    //         return { ...obj, id: idx};
    //     }));
    // },[props.enrolledUsers]);

    const [pageSize, setPageSize] = useState({
        pageSize: 10,
        page: 0,
    });
    let tableData = props.enrolledUsers;
    tableData = props.enrolledUsers.map((obj, idx) => {
        return { ...obj, id: idx };
    });
    let permission: boolean = false;
    if (props.thisUser.roleID?.toString() === "3" || props.isTeacher) {
        permission = true;
    }

    const tableColumns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 100, },
        {
            field: 'firstName', headerName: 'First Name', width: 225,
            valueGetter: (tableData) => tableData.row.user.firstName
        },
        {
            field: 'lastName', headerName: 'Last Name', width: 200,
            valueGetter: (tableData) => tableData.row.user.lastName
        },
        {
            field: 'email', headerName: 'Email', width: 250,
            valueGetter: (tableData) => tableData.row.user.email
        },
        { field: 'Role', headerName: 'Role', width: 120 },
        {
            field: "Tutor", headerName: 'Tutor', width: 150, align: 'center', headerAlign: 'center',
            renderCell: (cellData) => {
                function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, cellData: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) {
                    interface PostData {
                        selectedUserId: number;
                        courseId: number;
                    }
                    const postData: PostData = {
                        selectedUserId: cellData.row.user.userID,
                        courseId: cellData.row.courseID
                    };
                    // if role == tutor then make api post to tutor endpoint         
                    axios.post<PostData>(process.env.REACT_APP_BACKEND_API_HOST +
                        "/api/tutor/register", postData, {
                        timeout: 5000,
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem(
                                "accessToken"
                            )}`,
                        },
                    })
                        .then(async (response) => {
                            //console.log(response.data);
                            props.refreshEnrolled(cellData.row.courseID)
                        })
                        .catch(error => {
                            console.log(error);
                        });

                }

                function handleRemoveClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, cellData: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) {
                    interface PostData {
                        selectedUserId: number;
                        courseId: number;
                    }
                    const postData: PostData = {
                        selectedUserId: cellData.row.user.userID,
                        courseId: cellData.row.courseID
                    };
                    // if role == tutor then make api post to tutor endpoint         
                    // Removing tutor permission of the user in that course
                    axios.delete<any>(
                        process.env.REACT_APP_BACKEND_API_HOST + "/api/tutor/remove",
                        {
                            timeout: 5000,
                            headers: {
                                Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
                            },
                            data: postData // Add postData inside the configuration object
                        }
                    ).then(response => {
                        console.log(response.data);
                    })
                        .catch(error => {
                            console.log(error);
                        });
                }

                return (
                    <div className="ml-2">
                        {
                            cellData.row.Role !== "Tutor" &&
                            <Button
                                variant="contained"
                                className="bg-primary hover:bg-blue-500 duration-300 font-jakarta-sans"
                                onClick={(event) => {
                                    // let enrolled = getEnrolledStudents(props.course.courseId)
                                    // setShowCreateTutorDialog(true);
                                    // do axios call 
                                    handleClick(event, cellData);

                                }}
                            >
                                {/* <GroupIcon className="mr-3" /> */}
                                Assign
                            </Button>
                        }
                        {
                            cellData.row.Role === "Tutor" &&
                            <Button
                                variant="contained"
                                className="bg-red-700 hover:bg-red-500 duration-300 font-jakarta-sans"
                                onClick={(event) => {
                                    // let enrolled = getEnrolledStudents(props.course.courseId)
                                    // setShowCreateTutorDialog(true);
                                    // do axios call 
                                    handleRemoveClick(event, cellData);

                                }}
                            >
                                {/* <GroupIcon className="mr-3" /> */}
                                Remove
                            </Button>
                        }
                    </div>

                );
            }
        }
    ];
    return (
        <div className="">
            <Dialog open={props.show} fullWidth={true} maxWidth="xl" onClose={props.onClose}>
                <div className="flex flex-row h-[600px]">
                    <div className="flex flex-col w-[75px] bg-primary"></div>
                    <div className="flex flex-col p-5 flex-1 min-w-[525px]">

                        <div className="flex mb-3">
                            <div className="flex w-4/5 items-center justify-start">
                                <h1 className="font-jakarta-sans text-3xl">
                                    Participants
                                </h1>
                            </div>
                            <div className="flex w-1/5 items-center justify-end">
                                <IconButton className='m-5 bg-secondary text-white transition ease-in-out hover:-translate-y
                                            hover:scale-110 hover:bg-red-500 duration-300'
                                    onClick={() => {
                                        props.onClose()
                                    }}>
                                    <Close />
                                </IconButton>
                            </div>
                        </div>
                        <DataGrid
                            rows={tableData}
                            columns={tableColumns}
                            getRowId={(row: any) => row.id}
                            paginationModel={pageSize}
                            onPaginationModelChange={setPageSize}
                            pageSizeOptions={[10, 25, 50]}
                            columnVisibilityModel={{
                                // Hide columns status and traderName, the other columns will remain visible
                                Tutor: permission
                            }}
                        />

                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default CreateTutorDialog;
