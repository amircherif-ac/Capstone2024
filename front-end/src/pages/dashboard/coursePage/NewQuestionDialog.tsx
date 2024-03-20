import * as React from "react";
import {
  DialogTitle,
  TextField,
  Dialog,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close, Link, Send } from "@mui/icons-material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import axios from "axios";
import { User, PostRequest, Course } from "models";

interface Props {
  showDialog: boolean;
  cachedCourseCodeMap?: Map<string, number>;
  defaultSelectedCourse: Course | null;
  courseOptions: Course[];
  thisUser: User;
  parentDialogCloseCallback: () => void;
  parentReload: () => void;
}

interface State {
  selectedCourse: Course | null;
  postText: string;
  postTitle: string;
  subjectError: boolean;
  titleError: boolean;
  questionError: boolean;
}

function NewQuestionDialog(props: Props) {
  const [loading, setLoading] = React.useState(false);
  const [state, setState] = React.useState<State>({
    selectedCourse: props.defaultSelectedCourse,
    postText: "",
    postTitle: "",
    subjectError: false,
    titleError: false,
    questionError: false,
  });

  const subjectErrorText =
    "Cannot post a question without a subject selected. Please select a subject.";
  const titleErrorText = "Question must have a title.";
  const questionErrorText = "Question must have text content.";

  React.useEffect(() => {
    setState({
      ...state,
      selectedCourse: props.defaultSelectedCourse,
    });
  }, [props.defaultSelectedCourse]);

  const handleDialogClose = () => {
    props.parentDialogCloseCallback();

    setTimeout(() => {
      setState({
        ...state,
        selectedCourse: props.defaultSelectedCourse,
        titleError: false,
        subjectError: false,
        questionError: false,
        postTitle: "",
        postText: "",
      });
    }, 150);
  };

  const handleDialogSubmit = () => {
    setLoading(true);

    if (state.selectedCourse === null) {
      setState({
        ...state,
        subjectError: true,
      });

      setLoading(false);
      return;
    }

    if (state.postTitle.length === 0) {
      setState({
        ...state,
        titleError: true,
      });

      setLoading(false);
      return;
    }

    if (state.postText.length === 0) {
      setState({
        ...state,
        questionError: true,
      });

      setLoading(false);
    }

    let request: PostRequest = {
      userId: parseInt(props.thisUser.id),
      courseId: state.selectedCourse.courseId,
      postTitle: state.postTitle,
      postText: state.postText,
      postImagePath: "",
    };

    axios
      .post<PostRequest>(
        process.env.REACT_APP_BACKEND_API_HOST + "/api/post/create",
        request,
        {
          timeout: 5000,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((response) => {
        setTimeout(() => {
          setLoading(false);
          props.parentReload();
          handleDialogClose();
        }, 1000);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  const generateErrorString = (): string => {
    if (state.subjectError) {
      return subjectErrorText;
    }

    if (state.titleError) {
      return titleErrorText;
    }

    if (state.questionError) {
      return questionErrorText;
    }

    return "";
  };

  const subjectFilterOptions = createFilterOptions<Course>({
    limit: 500,
  });

  return (
    <div className="">
      <Dialog onClose={handleDialogClose} open={props.showDialog}>
        <div className="flex flex-row justify-between">
          <DialogTitle className="font-jakarta-sans mt-2">
            Ask a Question
          </DialogTitle>
          <IconButton
            className="m-5 bg-secondary text-white transition ease-in-out hover:-translate-y
                hover:scale-110 hover:bg-red-500 duration-300"
            onClick={handleDialogClose}
          >
            <Close />
          </IconButton>
        </div>
        <div className="mb-5">
          <div className="p-5 flex flex-col">
            <Autocomplete<Course>
              filterOptions={subjectFilterOptions}
              value={state.selectedCourse}
              isOptionEqualToValue={(option, value) => {
                return option.courseId === value.courseId;
              }}
              onChange={(event, option) => {
                setState({
                  ...state,
                  subjectError: false,
                  selectedCourse: option,
                });
              }}
              autoComplete
              className="w-1/2 mr-5 mb-5 font-jakarta-sans"
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="font-jakarta-sans"
                  label="Subject"
                />
              )}
              options={props.courseOptions}
            />
            <TextField
              className="w-[500px] font-jakarta-sans mb-5"
              value={state.postTitle}
              onChange={(event) => {
                setState({
                  ...state,
                  titleError: false,
                  postTitle: event.target.value,
                });
              }}
              label="Title"
              error={state.titleError}
            />
            <TextField
              className="w-[500px] font-jakarta-sans"
              value={state.postText}
              onChange={(event) => {
                setState({
                  ...state,
                  questionError: false,
                  postText: event.target.value,
                });
              }}
              label="Question"
              multiline
              rows={10}
              error={
                state.questionError || state.titleError || state.subjectError
              }
              helperText={generateErrorString()}
            />
            <div className="flex flex-row">
              <IconButton
                className="bg-primary text-white w-10 h-10 mt-5 mr-5
               transition ease-in-out hover:-translate-y
                hover:scale-110 hover:bg-indigo-500 duration-300"
                disabled={loading}
                onClick={handleDialogSubmit}
              >
                {loading ? (
                  <div className="flex">
                    <CircularProgress
                      sx={{ padding: "5px" }}
                      className=" text-white"
                    />
                  </div>
                ) : (
                  <Send />
                )}
              </IconButton>
              <IconButton className="bg-primary text-white w-10 h-10 mt-5 mr-5 transition ease-in-out hover:-translate-y hover:scale-110 hover:bg-indigo-500 duration-300">
                <Link></Link>
              </IconButton>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default NewQuestionDialog;
