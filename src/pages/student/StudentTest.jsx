
import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../../services/api";


function StudentTest() {

  const { testId } = useParams();

  const navigate = useNavigate();


  // =========================================================
  // TEST STATE
  // =========================================================

  const [test, setTest] = useState(null);

  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);


  // =========================================================
  // PROCTORING STATE
  // =========================================================

  const [proctoringStarted, setProctoringStarted] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [microphoneReady, setMicrophoneReady] =
    useState(false);

  const [screenReady, setScreenReady] =
    useState(false);

  const [fullscreenReady, setFullscreenReady] =
    useState(false);

  const [proctoringError, setProctoringError] =
    useState("");

  const [cameraError, setCameraError] =
    useState("");

  const [screenError, setScreenError] =
    useState("");


  // =========================================================
  // MEDIA REFERENCES
  // =========================================================

  const cameraStreamRef = useRef(null);

  const screenStreamRef = useRef(null);

  const videoRef = useRef(null);


  // =========================================================
  // TOKEN
  // =========================================================

  const token =
    localStorage.getItem("token");


  // =========================================================
  // FETCH TEST
  // =========================================================

  useEffect(() => {

    fetchTest();

  }, [testId]);


  const fetchTest = async () => {

    try {

      setLoading(true);


      if (!token) {

        alert(
          "Session expired. Please login again."
        );

        navigate("/login");

        return;
      }


      const response =
        await api.get(
          `/api/tests/${testId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      console.log(
        "Test response:",
        response.data
      );


      setTest(response.data);


    } catch (error) {

      console.error(
        "Failed to load test:",
        error
      );


      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {

        alert(
          "Session expired. Please login again."
        );

        localStorage.removeItem("token");

        localStorage.removeItem("role");

        navigate("/login");

      } else {

        alert(
          "Failed to load test."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // CAMERA + MICROPHONE
  // =========================================================

  const requestCameraAndMicrophone =
    async () => {

      try {

        setCameraError("");

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true
            }
          );


        cameraStreamRef.current = stream;


        // Attach stream to video element
        if (videoRef.current) {

          videoRef.current.srcObject =
            stream;

        }


        setCameraReady(true);

        setMicrophoneReady(true);


        console.log(
          "Camera and microphone access granted."
        );


        // Detect if camera/microphone is stopped
        stream.getVideoTracks().forEach(
          (track) => {

            track.onended = () => {

              setCameraReady(false);

              setProctoringError(
                "Camera access was stopped. Please enable your camera again."
              );

            };

          }
        );


        stream.getAudioTracks().forEach(
          (track) => {

            track.onended = () => {

              setMicrophoneReady(false);

              setProctoringError(
                "Microphone access was stopped."
              );

            };

          }
        );


      } catch (error) {

        console.error(
          "Camera/Microphone error:",
          error
        );


        setCameraReady(false);

        setMicrophoneReady(false);


        if (
          error.name === "NotAllowedError"
        ) {

          setCameraError(
            "Camera and microphone permission was denied. Please allow access."
          );

        } else if (
          error.name === "NotFoundError"
        ) {

          setCameraError(
            "Camera or microphone was not found."
          );

        } else {

          setCameraError(
            "Unable to access camera and microphone."
          );

        }

      }

    };


  // =========================================================
  // SCREEN SHARING
  // =========================================================

  const requestScreenShare =
    async () => {

      try {

        setScreenError("");

        const stream =
          await navigator.mediaDevices.getDisplayMedia(
            {
              video: true,
              audio: false
            }
          );


        screenStreamRef.current = stream;


        setScreenReady(true);


        console.log(
          "Screen sharing started."
        );


        const videoTrack =
          stream.getVideoTracks()[0];


        if (videoTrack) {

          videoTrack.onended = () => {

            setScreenReady(false);

            setProctoringError(
              "Screen sharing was stopped. Please start screen sharing again."
            );

          };

        }


      } catch (error) {

        console.error(
          "Screen sharing error:",
          error
        );


        setScreenReady(false);


        if (
          error.name === "NotAllowedError"
        ) {

          setScreenError(
            "Screen sharing was cancelled. Please share your screen."
          );

        } else {

          setScreenError(
            "Unable to start screen sharing."
          );

        }

      }

    };


  // =========================================================
  // FULLSCREEN
  // =========================================================

  const enterFullscreen =
    async () => {

      try {

        if (!document.fullscreenElement) {

          await document.documentElement.requestFullscreen();

        }

        setFullscreenReady(true);

      } catch (error) {

        console.error(
          "Fullscreen error:",
          error
        );

        setFullscreenReady(false);

        setProctoringError(
          "Unable to enter fullscreen mode."
        );

      }

    };


  // =========================================================
  // FULLSCREEN CHANGE DETECTION
  // =========================================================

  useEffect(() => {

    const handleFullscreenChange =
      () => {

        if (document.fullscreenElement) {

          setFullscreenReady(true);

        } else {

          setFullscreenReady(false);

        }

      };


    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );


    return () => {

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

    };

  }, []);


  // =========================================================
  // START PROCTORED TEST
  // =========================================================

  const startProctoredTest =
    async () => {

      setProctoringError("");


      // Camera check
      if (!cameraReady) {

        setProctoringError(
          "Please allow camera access before starting the test."
        );

        return;

      }


      // Microphone check
      if (!microphoneReady) {

        setProctoringError(
          "Please allow microphone access before starting the test."
        );

        return;

      }


      // Screen check
      if (!screenReady) {

        setProctoringError(
          "Please start screen sharing before starting the test."
        );

        return;

      }


      // Fullscreen
      if (!document.fullscreenElement) {

        try {

          await document.documentElement.requestFullscreen();

        } catch (error) {

          setProctoringError(
            "Please allow fullscreen mode before starting the test."
          );

          return;

        }

      }


      setFullscreenReady(true);

      setProctoringStarted(true);

    };


  // =========================================================
  // CLEANUP MEDIA STREAMS
  // =========================================================

  const stopMediaStreams =
    () => {

      if (cameraStreamRef.current) {

        cameraStreamRef.current
          .getTracks()
          .forEach(
            (track) => track.stop()
          );

        cameraStreamRef.current = null;

      }


      if (screenStreamRef.current) {

        screenStreamRef.current
          .getTracks()
          .forEach(
            (track) => track.stop()
          );

        screenStreamRef.current = null;

      }

    };


  // =========================================================
  // CLEANUP WHEN PAGE IS LEFT
  // =========================================================

  useEffect(() => {

    return () => {

      stopMediaStreams();

    };

  }, []);


  // =========================================================
  // TEXT ANSWER
  // =========================================================

  const handleTextAnswer = (
    questionId,
    value
  ) => {

    setAnswers(
      (previous) => ({

        ...previous,

        [questionId]: value

      })
    );

  };


  // =========================================================
  // MCQ ANSWER
  // =========================================================

  const handleMCQAnswer = (
    questionId,
    optionId
  ) => {

    setAnswers(
      (previous) => ({

        ...previous,

        [questionId]: optionId

      })
    );

  };


  // =========================================================
  // MSQ ANSWER
  // =========================================================

  const handleMSQAnswer = (
    questionId,
    optionId
  ) => {

    setAnswers(
      (previous) => {

        const current =
          previous[questionId] || [];


        if (
          current.includes(optionId)
        ) {

          return {

            ...previous,

            [questionId]:
              current.filter(
                (id) =>
                  id !== optionId
              )

          };

        }


        return {

          ...previous,

          [questionId]: [

            ...current,

            optionId

          ]

        };

      }
    );

  };


  // =========================================================
  // SUBMIT TEST
  // =========================================================

  const handleSubmit = async () => {

    if (!test) {

      return;

    }


    // -----------------------------------------
    // CHECK UNANSWERED QUESTIONS
    // -----------------------------------------

    const unansweredQuestions =
      test.questions.filter(
        (question) => {

          const answer =
            answers[question.id];


          if (
            test.testType === "MSQ"
          ) {

            return (
              !answer ||
              answer.length === 0
            );

          }


          return (
            answer === undefined ||
            answer === ""
          );

        }
      );


    if (
      unansweredQuestions.length > 0
    ) {

      const confirmSubmit =
        window.confirm(
          `You have ${unansweredQuestions.length} unanswered question(s). Do you want to submit anyway?`
        );


      if (!confirmSubmit) {

        return;

      }

    }


    // -----------------------------------------
    // SUBMIT
    // -----------------------------------------

    try {

      setSubmitting(true);


      const formattedAnswers =
        test.questions.map(
          (question) => {

            const answer =
              answers[question.id];


            // ===============================
            // MCQ / MSQ
            // ===============================

            if (
              test.testType === "MCQ" ||
              test.testType === "MSQ"
            ) {

              return {

                questionId:
                  question.id,

                answer: null,

                selectedOptionIds:
                  test.testType === "MSQ"

                    ? answer || []

                    : answer
                      ? [answer]
                      : []

              };

            }


            // ===============================
            // THEORETICAL / LOGICAL
            // ===============================

            return {

              questionId:
                question.id,

              answer:
                answer || "",

              selectedOptionIds: []

            };

          }
        );


      console.log(
        "Submitting answers:",
        formattedAnswers
      );


      const response =
        await api.post(

          `/api/tests/${testId}/submit`,

          {
            answers:
              formattedAnswers
          },

          {
            headers: {

              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json"

            }

          }

        );


      console.log(
        "Submit response:",
        response.data
      );


      // =========================================
      // STOP CAMERA AND SCREEN SHARE
      // =========================================

      stopMediaStreams();


      // =========================================
      // EXIT FULLSCREEN
      // =========================================

      if (document.fullscreenElement) {

        try {

          await document.exitFullscreen();

        } catch (error) {

          console.log(
            "Could not exit fullscreen."
          );

        }

      }


      // =========================================
      // GET ATTEMPT ID
      // =========================================

      const attemptId =
        response.data.attemptId;


      if (!attemptId) {

        alert(
          "Test submitted, but attempt ID was not returned."
        );

        return;

      }


      // =========================================
      // GO TO RESULT PAGE
      // =========================================

      navigate(
        `/student/result/${attemptId}`
      );


    } catch (error) {

      console.error(
        "Failed to submit test:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        alert(
          "Session expired. Please login again."
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "role"
        );

        navigate("/login");


      } else if (
        error.response?.status === 403
      ) {

        alert(
          "You are not allowed to submit this test."
        );


      } else {

        console.error(
          "Server response:",
          error.response?.data
        );


        alert(
          error.response?.data ||
          "Failed to submit the test."
        );

      }

    } finally {

      setSubmitting(false);

    }

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="container mt-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading test...
        </p>

      </div>

    );

  }


  // =========================================================
  // TEST NOT FOUND
  // =========================================================

  if (!test) {

    return (

      <div className="container mt-5">

        <div className="alert alert-danger">

          Test not found.

        </div>


        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(
              "/student/dashboard"
            )
          }
        >

          Back to Dashboard

        </button>

      </div>

    );

  }


  // =========================================================
  // PROCTORING SETUP SCREEN
  // =========================================================

  if (!proctoringStarted) {

    return (

      <div className="min-vh-100 bg-light">

        <nav className="navbar navbar-dark bg-dark">

          <div className="container">

            <span className="navbar-brand fw-bold">

              Interview Readiness

            </span>

          </div>

        </nav>


        <div className="container py-5">

          <div className="row justify-content-center">

            <div className="col-lg-8">

              <div className="card shadow">

                <div className="card-body p-4">


                  <h2 className="fw-bold text-center mb-3">

                    🔐 Test Security Check

                  </h2>


                  <p className="text-center text-muted">

                    Before starting the test, please
                    complete the following security checks.

                  </p>


                  {/* TEST INFORMATION */}

                  <div className="alert alert-info">

                    <strong>
                      Test:
                    </strong>{" "}

                    {test.name}

                    <br />

                    <strong>
                      Questions:
                    </strong>{" "}

                    {test.totalQuestions}

                    <br />

                    <strong>
                      Total Marks:
                    </strong>{" "}

                    {test.totalMarks}

                  </div>


                  {/* CAMERA */}

                  <div className="card mb-3">

                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center">

                        <div>

                          <h5 className="mb-1">

                            📷 Camera

                          </h5>

                          <small className="text-muted">

                            Camera access is required
                            during the test.

                          </small>

                        </div>


                        <span
                          className={
                            cameraReady
                              ? "badge bg-success"
                              : "badge bg-danger"
                          }
                        >

                          {cameraReady
                            ? "Ready"
                            : "Not Ready"}

                        </span>

                      </div>


                      {!cameraReady && (

                        <button
                          className="btn btn-primary mt-3"
                          onClick={
                            requestCameraAndMicrophone
                          }
                        >

                          Allow Camera & Microphone

                        </button>

                      )}

                    </div>

                  </div>


                  {/* CAMERA PREVIEW */}

                  {cameraReady && (

                    <div className="text-center mb-3">

                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="rounded border"
                        style={{
                          width: "320px",
                          height: "240px",
                          objectFit: "cover"
                        }}
                      />

                    </div>

                  )}


                  {/* CAMERA ERROR */}

                  {cameraError && (

                    <div className="alert alert-danger">

                      {cameraError}

                    </div>

                  )}


                  {/* MICROPHONE */}

                  <div className="card mb-3">

                    <div className="card-body">

                      <div className="d-flex justify-content-between">

                        <div>

                          <h5 className="mb-1">

                            🎤 Microphone

                          </h5>

                          <small className="text-muted">

                            Microphone access is required.

                          </small>

                        </div>


                        <span
                          className={
                            microphoneReady
                              ? "badge bg-success"
                              : "badge bg-danger"
                          }
                        >

                          {microphoneReady
                            ? "Ready"
                            : "Not Ready"}

                        </span>

                      </div>

                    </div>

                  </div>


                  {/* SCREEN SHARE */}

                  <div className="card mb-3">

                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center">

                        <div>

                          <h5 className="mb-1">

                            🖥️ Screen Sharing

                          </h5>

                          <small className="text-muted">

                            Your screen must remain shared
                            during the assessment.

                          </small>

                        </div>


                        <span
                          className={
                            screenReady
                              ? "badge bg-success"
                              : "badge bg-danger"
                          }
                        >

                          {screenReady
                            ? "Ready"
                            : "Not Ready"}

                        </span>

                      </div>


                      {!screenReady && (

                        <button
                          className="btn btn-primary mt-3"
                          onClick={
                            requestScreenShare
                          }
                        >

                          🖥️ Share My Screen

                        </button>

                      )}

                    </div>

                  </div>


                  {/* SCREEN ERROR */}

                  {screenError && (

                    <div className="alert alert-danger">

                      {screenError}

                    </div>

                  )}


                  {/* FULLSCREEN */}

                  <div className="card mb-3">

                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-center">

                        <div>

                          <h5 className="mb-1">

                            🔲 Fullscreen

                          </h5>

                          <small className="text-muted">

                            The test will run in fullscreen mode.

                          </small>

                        </div>


                        <span
                          className={
                            fullscreenReady
                              ? "badge bg-success"
                              : "badge bg-warning text-dark"
                          }
                        >

                          {fullscreenReady
                            ? "Ready"
                            : "Required"}

                        </span>

                      </div>


                      {!fullscreenReady && (

                        <button
                          className="btn btn-outline-primary mt-3"
                          onClick={
                            enterFullscreen
                          }
                        >

                          🔲 Enter Fullscreen

                        </button>

                      )}

                    </div>

                  </div>


                  {/* ERROR */}

                  {proctoringError && (

                    <div className="alert alert-danger">

                      ⚠️ {proctoringError}

                    </div>

                  )}


                  {/* START TEST */}

                  <div className="text-center mt-4">

                    <button
                      className="btn btn-success btn-lg px-5"
                      onClick={
                        startProctoredTest
                      }
                      disabled={
                        !cameraReady ||
                        !microphoneReady ||
                        !screenReady
                      }
                    >

                      🚀 Start Test

                    </button>

                  </div>


                  <div className="alert alert-warning mt-4 mb-0">

                    <strong>Important:</strong>

                    <ul className="mb-0 mt-2">

                      <li>
                        Do not switch tabs during the test.
                      </li>

                      <li>
                        Do not stop screen sharing.
                      </li>

                      <li>
                        Do not disable your camera.
                      </li>

                      <li>
                        Keep the test in fullscreen mode.
                      </li>

                    </ul>

                  </div>


                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    );

  }


  // =========================================================
  // MAIN TEST UI
  // =========================================================

  return (

    <div className="min-vh-100 bg-light">


      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar navbar-dark bg-dark">

        <div className="container">

          <span className="navbar-brand fw-bold">

            Interview Readiness

          </span>


          <div className="d-flex align-items-center gap-2">

            <span className="badge bg-success">

              📷 Camera

            </span>

            <span className="badge bg-success">

              🖥️ Screen

            </span>

            <span className="badge bg-success">

              🔲 Fullscreen

            </span>

          </div>

        </div>

      </nav>


      {/* =========================
          PROCTORING WARNING
      ========================= */}

      {proctoringError && (

        <div className="container mt-3">

          <div className="alert alert-danger">

            ⚠️ {proctoringError}

          </div>

        </div>

      )}


      {/* =========================
          CONTENT
      ========================= */}

      <div className="container py-4">


        {/* TEST INFORMATION */}

        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <h2 className="fw-bold">

              {test.name}

            </h2>


            <div className="row mt-3">


              <div className="col-md-3">

                <strong>
                  Topic
                </strong>

                <p>

                  {test.topic?.name ||
                    "N/A"}

                </p>

              </div>


              <div className="col-md-3">

                <strong>
                  Test Type
                </strong>

                <p>

                  {test.testType}

                </p>

              </div>


              <div className="col-md-3">

                <strong>
                  Questions
                </strong>

                <p>

                  {test.totalQuestions}

                </p>

              </div>


              <div className="col-md-3">

                <strong>
                  Total Marks
                </strong>

                <p>

                  {test.totalMarks}

                </p>

              </div>


            </div>

          </div>

        </div>


        {/* CAMERA PREVIEW */}

        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center">

              <h5 className="fw-bold mb-0">

                🔐 Proctoring Active

              </h5>

              <span className="badge bg-success">

                Monitoring

              </span>

            </div>


            <div className="mt-3">

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="rounded border"
                style={{
                  width: "180px",
                  height: "135px",
                  objectFit: "cover"
                }}
              />

            </div>

          </div>

        </div>


        {/* NO QUESTIONS */}

        {test.questions.length === 0 && (

          <div className="alert alert-warning">

            No questions have been added
            to this test yet.

          </div>

        )}


        {/* QUESTIONS */}

        {test.questions.map(
          (question, index) => (

            <div
              className="card shadow-sm mb-4"
              key={question.id}
            >

              <div className="card-body">


                {/* QUESTION HEADER */}

                <div className="d-flex justify-content-between">

                  <h5 className="fw-bold">

                    {index + 1}.{" "}

                    {question.question}

                  </h5>


                  <span className="badge bg-primary">

                    {question.marks} Mark

                  </span>

                </div>


                <p className="text-muted">

                  Difficulty:{" "}

                  {question.difficulty}

                </p>


                {/* =========================
                    THEORETICAL
                ========================= */}

                {test.testType ===
                  "THEORETICAL" && (

                  <textarea

                    className="form-control"

                    rows="4"

                    placeholder=
                      "Enter your answer..."

                    value={
                      answers[
                        question.id
                      ] || ""
                    }

                    onChange={
                      (event) =>
                        handleTextAnswer(
                          question.id,
                          event.target.value
                        )
                    }

                  />

                )}


                {/* =========================
                    LOGICAL CODING
                ========================= */}

                {test.testType ===
                  "LOGICAL_CODING" && (

                  <textarea

                    className=
                      "form-control font-monospace"

                    rows="8"

                    placeholder=
                      "Write your solution/code here..."

                    value={
                      answers[
                        question.id
                      ] || ""
                    }

                    onChange={
                      (event) =>
                        handleTextAnswer(
                          question.id,
                          event.target.value
                        )
                    }

                  />

                )}


                {/* =========================
                    MCQ
                ========================= */}

                {test.testType ===
                  "MCQ" && (

                  <div className="mt-3">

                    {question.options?.map(
                      (option) => (

                        <div
                          className=
                            "form-check mb-2"

                          key={option.id}
                        >

                          <input

                            className=
                              "form-check-input"

                            type="radio"

                            name={
                              `question-${question.id}`
                            }

                            id={
                              `option-${option.id}`
                            }

                            checked={
                              answers[
                                question.id
                              ] === option.id
                            }

                            onChange={() =>
                              handleMCQAnswer(
                                question.id,
                                option.id
                              )
                            }

                          />


                          <label

                            className=
                              "form-check-label"

                            htmlFor={
                              `option-${option.id}`
                            }

                          >

                            {option.optionText}

                          </label>

                        </div>

                      )
                    )}

                  </div>

                )}


                {/* =========================
                    MSQ
                ========================= */}

                {test.testType ===
                  "MSQ" && (

                  <div className="mt-3">

                    {question.options?.map(
                      (option) => {

                        const selected =
                          answers[
                            question.id
                          ] || [];


                        return (

                          <div
                            className=
                              "form-check mb-2"

                            key={option.id}
                          >

                            <input

                              className=
                                "form-check-input"

                              type="checkbox"

                              id={
                                `option-${option.id}`
                              }

                              checked={
                                selected.includes(
                                  option.id
                                )
                              }

                              onChange={() =>
                                handleMSQAnswer(
                                  question.id,
                                  option.id
                                )
                              }

                            />


                            <label

                              className=
                                "form-check-label"

                              htmlFor={
                                `option-${option.id}`
                              }

                            >

                              {option.optionText}

                            </label>

                          </div>

                        );

                      }
                    )}

                  </div>

                )}

              </div>

            </div>

          )
        )}


        {/* =========================
            SUBMIT BUTTON
        ========================= */}

        {test.questions.length > 0 && (

          <div className="text-center mb-5">

            <button

              className=
                "btn btn-success btn-lg px-5"

              onClick={handleSubmit}

              disabled={submitting}

            >

              {submitting
                ? "Submitting..."
                : "Submit Test"}

            </button>

          </div>

        )}

      </div>

    </div>

  );

}


export default StudentTest;
