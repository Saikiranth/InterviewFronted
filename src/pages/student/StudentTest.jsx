import {
  useEffect,
  useRef,
  useState
} from "react";

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
  // ATTEMPT STATE
  // =========================================================

  const [attemptId, setAttemptId] = useState(null);

  const attemptIdRef = useRef(null);


  // =========================================================
  // TIMER STATE
  // =========================================================

  const [expiresAt, setExpiresAt] =
    useState(null);

  const [timeLeft, setTimeLeft] =
    useState(null);

  const timerRef = useRef(null);

  const timerExpiredRef = useRef(false);


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
  // VIOLATION STATE
  // =========================================================

  const [violations, setViolations] =
    useState([]);

  const [violationCount, setViolationCount] =
    useState(0);

  const [lastViolation, setLastViolation] =
    useState("");

  const MAX_VIOLATIONS = 5;


  // =========================================================
  // REFS
  // =========================================================

  const autoSubmittingRef =
    useRef(false);

  const isSubmittingRef =
    useRef(false);

  const lastFocusViolationRef =
    useRef(0);

  const cameraStreamRef =
    useRef(null);

  const screenStreamRef =
    useRef(null);

  const videoRef =
    useRef(null);


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
          `/api/student/tests/${testId}`,
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
          "You are not allowed to access this test."
        );

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        navigate("/login");

      } else {

        alert(
          error.response?.data ||
          "Failed to load test."
        );
      }

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // FORMAT TIMER
  // =========================================================

  const formatTime = (seconds) => {

    if (
      seconds === null ||
      seconds < 0
    ) {

      return "00:00";
    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(remainingSeconds).padStart(2, "0")
    );
  };


  // =========================================================
  // START TIMER
  // =========================================================

  const startTimer = (expiryTime) => {

    if (!expiryTime) {
      return;
    }

    setExpiresAt(expiryTime);

    timerExpiredRef.current = false;

    if (timerRef.current) {

      clearInterval(
        timerRef.current
      );
    }

    const calculateRemaining = () => {

      const expiry =
        new Date(expiryTime).getTime();

      const now =
        Date.now();

      const remaining =
        Math.max(
          0,
          Math.floor(
            (expiry - now) / 1000
          )
        );

      setTimeLeft(remaining);

      if (remaining <= 0) {

        clearInterval(
          timerRef.current
        );

        if (
          !timerExpiredRef.current &&
          !isSubmittingRef.current
        ) {

          timerExpiredRef.current = true;

          alert(
            "⏰ Time is over. Your test will be submitted automatically."
          );

          handleSubmit(true);
        }
      }
    };

    calculateRemaining();

    timerRef.current =
      setInterval(
        calculateRemaining,
        1000
      );
  };


  // =========================================================
  // TIMER CLEANUP
  // =========================================================

  useEffect(() => {

    return () => {

      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );

      }

    };

  }, []);


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

        cameraStreamRef.current =
          stream;

        if (videoRef.current) {

          videoRef.current.srcObject =
            stream;

        }

        setCameraReady(true);

        setMicrophoneReady(true);

        stream
          .getVideoTracks()
          .forEach((track) => {

            track.onended = () => {

              setCameraReady(false);

              if (
                proctoringStarted &&
                !isSubmittingRef.current
              ) {

                registerViolation(
                  "Camera access was stopped"
                );
              }

              setProctoringError(
                "Camera access was stopped. Please enable your camera again."
              );
            };

          });

        stream
          .getAudioTracks()
          .forEach((track) => {

            track.onended = () => {

              setMicrophoneReady(false);

              if (
                proctoringStarted &&
                !isSubmittingRef.current
              ) {

                registerViolation(
                  "Microphone access was stopped"
                );
              }

              setProctoringError(
                "Microphone access was stopped."
              );
            };

          });

      } catch (error) {

        console.error(
          "Camera/Microphone error:",
          error
        );

        setCameraReady(false);

        setMicrophoneReady(false);

        if (
          error.name ===
          "NotAllowedError"
        ) {

          setCameraError(
            "Camera and microphone permission was denied. Please allow access."
          );

        } else if (
          error.name ===
          "NotFoundError"
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
  // SCREEN SHARE
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

        screenStreamRef.current =
          stream;

        setScreenReady(true);

        const videoTrack =
          stream.getVideoTracks()[0];

        if (videoTrack) {

          videoTrack.onended = () => {

            setScreenReady(false);

            if (
              proctoringStarted &&
              !isSubmittingRef.current
            ) {

              registerViolation(
                "Screen sharing was stopped"
              );
            }

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
          error.name ===
          "NotAllowedError"
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
  // REGISTER VIOLATION
  // =========================================================

  const registerViolation =
    async (reason) => {

      if (!proctoringStarted) {
        return;
      }

      if (isSubmittingRef.current) {
        return;
      }

      const currentAttemptId =
        attemptIdRef.current;

      if (!currentAttemptId) {
        return;
      }

      const timestamp =
        new Date().toLocaleTimeString();

      const violation = {

        id:
          Date.now() +
          Math.random(),

        reason,

        timestamp
      };

      setViolations(
        (previous) => [
          ...previous,
          violation
        ]
      );

      setViolationCount(
        (previous) =>
          previous + 1
      );

      setLastViolation(reason);

      setProctoringError(
        `⚠️ Violation detected: ${reason}`
      );

      try {

        await api.post(
          `/api/proctoring/violation/${currentAttemptId}`,
          {
            violationType: reason,
            description: reason
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

      } catch (error) {

        console.error(
          "Failed to save violation:",
          error
        );
      }
    };


  // =========================================================
  // VIOLATION LIMIT
  // =========================================================

  const checkViolationLimit =
    (count) => {

      if (
        count >= MAX_VIOLATIONS &&
        !autoSubmittingRef.current &&
        !submitting
      ) {

        autoSubmittingRef.current =
          true;

        setTimeout(() => {

          alert(
            "Maximum number of proctoring violations reached. Your test will be submitted automatically."
          );

          handleSubmit(true);

        }, 500);
      }
    };


  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    checkViolationLimit(
      violationCount
    );

  }, [
    violationCount,
    proctoringStarted
  ]);


  // =========================================================
  // TAB SWITCH
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const handleVisibilityChange =
      () => {

        if (
          document.hidden &&
          !isSubmittingRef.current
        ) {

          const now =
            Date.now();

          if (
            now -
            lastFocusViolationRef.current >
            1000
          ) {

            lastFocusViolationRef.current =
              now;

            registerViolation(
              "Browser tab/window was switched"
            );
          }
        }
      };


    const handleBlur = () => {

      if (
        isSubmittingRef.current
      ) {
        return;
      }

      const now =
        Date.now();

      if (
        now -
        lastFocusViolationRef.current >
        1000
      ) {

        lastFocusViolationRef.current =
          now;

        registerViolation(
          "Test window lost focus"
        );
      }
    };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "blur",
      handleBlur
    );


    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );
    };

  }, [proctoringStarted]);


  // =========================================================
  // FULLSCREEN DETECTION
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const handleFullscreenChange =
      () => {

        if (
          document.fullscreenElement
        ) {

          setFullscreenReady(true);

        } else {

          setFullscreenReady(false);

          if (
            !isSubmittingRef.current
          ) {

            registerViolation(
              "Fullscreen mode was exited"
            );
          }
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

  }, [proctoringStarted]);


  // =========================================================
  // COPY
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const handleCopy =
      (event) => {

        event.preventDefault();

        registerViolation(
          "Copy operation was attempted"
        );
      };


    document.addEventListener(
      "copy",
      handleCopy
    );


    return () => {

      document.removeEventListener(
        "copy",
        handleCopy
      );

    };

  }, [proctoringStarted]);


  // =========================================================
  // PASTE
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const handlePaste =
      (event) => {

        event.preventDefault();

        registerViolation(
          "Paste operation was attempted"
        );
      };


    document.addEventListener(
      "paste",
      handlePaste
    );


    return () => {

      document.removeEventListener(
        "paste",
        handlePaste
      );

    };

  }, [proctoringStarted]);


  // =========================================================
  // CUT
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const handleCut =
      (event) => {

        event.preventDefault();

        registerViolation(
          "Cut operation was attempted"
        );
      };


    document.addEventListener(
      "cut",
      handleCut
    );


    return () => {

      document.removeEventListener(
        "cut",
        handleCut
      );

    };

  }, [proctoringStarted]);


  // =========================================================
  // RIGHT CLICK
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const handleContextMenu =
      (event) => {

        event.preventDefault();

        registerViolation(
          "Right-click was attempted"
        );
      };


    document.addEventListener(
      "contextmenu",
      handleContextMenu
    );


    return () => {

      document.removeEventListener(
        "contextmenu",
        handleContextMenu
      );

    };

  }, [proctoringStarted]);


  // =========================================================
  // KEYBOARD SHORTCUTS
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const handleKeyDown =
      (event) => {

        if (event.key === "F12") {

          event.preventDefault();

          registerViolation(
            "Developer tools shortcut F12 was attempted"
          );

          return;
        }


        if (
          event.ctrlKey &&
          event.shiftKey &&
          event.key.toLowerCase() === "i"
        ) {

          event.preventDefault();

          registerViolation(
            "Developer tools shortcut Ctrl+Shift+I was attempted"
          );

          return;
        }


        if (
          event.ctrlKey &&
          event.shiftKey &&
          event.key.toLowerCase() === "j"
        ) {

          event.preventDefault();

          registerViolation(
            "Developer tools shortcut Ctrl+Shift+J was attempted"
          );

          return;
        }


        if (
          event.ctrlKey &&
          event.key.toLowerCase() === "u"
        ) {

          event.preventDefault();

          registerViolation(
            "View-source shortcut Ctrl+U was attempted"
          );

          return;
        }


        if (
          event.ctrlKey &&
          event.key.toLowerCase() === "c"
        ) {

          event.preventDefault();

          registerViolation(
            "Copy shortcut Ctrl+C was attempted"
          );

          return;
        }


        if (
          event.ctrlKey &&
          event.key.toLowerCase() === "v"
        ) {

          event.preventDefault();

          registerViolation(
            "Paste shortcut Ctrl+V was attempted"
          );

          return;
        }


        if (
          event.ctrlKey &&
          event.key.toLowerCase() === "x"
        ) {

          event.preventDefault();

          registerViolation(
            "Cut shortcut Ctrl+X was attempted"
          );

          return;
        }
      };


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [proctoringStarted]);


  // =========================================================
  // CAMERA MONITOR
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const checkCamera =
      setInterval(() => {

        const stream =
          cameraStreamRef.current;

        if (!stream) {
          return;
        }

        const videoTracks =
          stream.getVideoTracks();

        const audioTracks =
          stream.getAudioTracks();


        if (
          videoTracks.length === 0 ||
          !videoTracks[0].enabled ||
          videoTracks[0].readyState ===
            "ended"
        ) {

          setCameraReady(false);
        }


        if (
          audioTracks.length === 0 ||
          !audioTracks[0].enabled ||
          audioTracks[0].readyState ===
            "ended"
        ) {

          setMicrophoneReady(false);
        }

      }, 2000);


    return () => {

      clearInterval(
        checkCamera
      );

    };

  }, [proctoringStarted]);


  // =========================================================
  // SCREEN MONITOR
  // =========================================================

  useEffect(() => {

    if (!proctoringStarted) {
      return;
    }

    const checkScreenShare =
      setInterval(() => {

        const stream =
          screenStreamRef.current;

        if (!stream) {
          return;
        }

        const tracks =
          stream.getVideoTracks();

        if (
          tracks.length === 0 ||
          tracks[0].readyState ===
            "ended"
        ) {

          setScreenReady(false);
        }

      }, 2000);


    return () => {

      clearInterval(
        checkScreenShare
      );

    };

  }, [proctoringStarted]);


  // =========================================================
  // START PROCTORED TEST
  // =========================================================

  const startProctoredTest =
    async () => {

      setProctoringError("");

      if (!cameraReady) {

        setProctoringError(
          "Please allow camera access before starting the test."
        );

        return;
      }


      if (!microphoneReady) {

        setProctoringError(
          "Please allow microphone access before starting the test."
        );

        return;
      }


      if (!screenReady) {

        setProctoringError(
          "Please start screen sharing before starting the test."
        );

        return;
      }


      if (!document.fullscreenElement) {

        try {

          await document.documentElement.requestFullscreen();

        } catch (error) {

          console.error(
            "Fullscreen error:",
            error
          );

          setProctoringError(
            "Please allow fullscreen mode before starting the test."
          );

          return;
        }
      }


      setFullscreenReady(true);


      // =====================================================
      // CREATE / RESUME BACKEND ATTEMPT
      // =====================================================

      try {

        const response =
          await api.post(
            `/api/student/tests/${testId}/start`,
            {},
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
          "Start test response:",
          response.data
        );


        const data =
          response.data;


        const newAttemptId =
          data.attemptId;


        if (!newAttemptId) {

          setProctoringError(
            "Unable to create test attempt."
          );

          return;
        }


        // =================================================
        // UPDATE TEST DATA
        // =================================================

        setTest(
          (previous) => ({
            ...previous,

            id:
              data.testId,

            name:
              data.testName,

            topic:
              data.topic,

            testType:
              data.testType,

            totalQuestions:
              data.totalQuestions,

            totalMarks:
              data.totalMarks,

            questions:
              data.questions || []
          })
        );


        // =================================================
        // ATTEMPT ID
        // =================================================

        setAttemptId(
          newAttemptId
        );

        attemptIdRef.current =
          newAttemptId;


        // =================================================
        // START TIMER
        // =================================================

        startTimer(
          data.expiresAt
        );


        // =================================================
        // START PROCTORING
        // =================================================

        setProctoringStarted(
          true
        );


      } catch (error) {

        console.error(
          "Failed to start test:",
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

          return;
        }


        if (
          error.response?.status === 403
        ) {

          setProctoringError(
            "You are not allowed to start this test."
          );

          return;
        }


        if (
          error.response?.status === 410
        ) {

          setProctoringError(
            "This test time has already expired."
          );

          return;
        }


        setProctoringError(
          error.response?.data ||
          "Unable to start the test. Please try again."
        );
      }
    };


  // =========================================================
  // CLEANUP MEDIA
  // =========================================================

  const stopMediaStreams =
    () => {

      if (cameraStreamRef.current) {

        cameraStreamRef.current
          .getTracks()
          .forEach((track) => {

            track.onended = null;

            track.stop();

          });

        cameraStreamRef.current =
          null;
      }


      if (screenStreamRef.current) {

        screenStreamRef.current
          .getTracks()
          .forEach((track) => {

            track.onended = null;

            track.stop();

          });

        screenStreamRef.current =
          null;
      }
    };


  // =========================================================
  // PAGE CLEANUP
  // =========================================================

  useEffect(() => {

    return () => {

      isSubmittingRef.current =
        true;

      stopMediaStreams();

      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );
      }
    };

  }, []);


  // =========================================================
  // TEXT ANSWER
  // =========================================================

  const handleTextAnswer =
    (
      questionId,
      value
    ) => {

      setAnswers(
        (previous) => ({

          ...previous,

          [questionId]:
            value

        })
      );
    };


  // =========================================================
  // MCQ ANSWER
  // =========================================================

  const handleMCQAnswer =
    (
      questionId,
      optionId
    ) => {

      setAnswers(
        (previous) => ({

          ...previous,

          [questionId]:
            optionId

        })
      );
    };


  // =========================================================
  // MSQ ANSWER
  // =========================================================

  const handleMSQAnswer =
    (
      questionId,
      optionId
    ) => {

      setAnswers(
        (previous) => {

          const current =
            previous[questionId] ||
            [];


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

  const handleSubmit =
    async (
      automaticSubmit = false
    ) => {

      if (!test) {
        return;
      }


      if (submitting) {
        return;
      }


      if (!attemptIdRef.current) {

        alert(
          "Test attempt was not started. Please start the test first."
        );

        return;
      }


      // -----------------------------------------------------
      // UNANSWERED QUESTIONS
      // -----------------------------------------------------

      if (!automaticSubmit) {

        const unansweredQuestions =
          test.questions.filter(
            (question) => {

              const answer =
                answers[
                  question.id
                ];


              if (
                test.testType ===
                "MSQ"
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
      }


      // -----------------------------------------------------
      // MARK SUBMITTING
      // -----------------------------------------------------

      isSubmittingRef.current =
        true;

      setSubmitting(true);


      // STOP TIMER IMMEDIATELY

      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );
      }


      try {

        const formattedAnswers =
          test.questions.map(
            (question) => {

              const answer =
                answers[
                  question.id
                ];


              // MCQ / MSQ

              if (
                test.testType ===
                  "MCQ" ||
                test.testType ===
                  "MSQ"
              ) {

                return {

                  questionId:
                    question.id,

                  answer:
                    null,

                  selectedOptionIds:
                    test.testType ===
                    "MSQ"

                      ? answer || []

                      : answer
                        ? [answer]
                        : []
                };
              }


              // THEORETICAL / CODING

              return {

                questionId:
                  question.id,

                answer:
                  answer || "",

                selectedOptionIds:
                  []
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
              attemptId:
                attemptIdRef.current,

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


        // -----------------------------------------------------
        // STOP MEDIA
        // -----------------------------------------------------

        stopMediaStreams();


        // -----------------------------------------------------
        // EXIT FULLSCREEN
        // -----------------------------------------------------

        if (
          document.fullscreenElement
        ) {

          try {

            await document.exitFullscreen();

          } catch (error) {

            console.log(
              "Could not exit fullscreen."
            );
          }
        }


        // -----------------------------------------------------
        // ATTEMPT ID
        // -----------------------------------------------------

        const submittedAttemptId =
          response.data.attemptId ||
          attemptIdRef.current;


        if (!submittedAttemptId) {

          alert(
            "Test submitted, but attempt ID was not returned."
          );

          return;
        }


        navigate(
          `/student/result/${submittedAttemptId}`
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


        } else if (
          error.response?.status === 410
        ) {

          alert(
            "The test time has expired."
          );

          stopMediaStreams();

          navigate(
            `/student/result/${attemptIdRef.current}`
          );


        } else {

          alert(
            error.response?.data ||
            "Failed to submit the test."
          );

          isSubmittingRef.current =
            false;
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
  // PROCTORING SETUP
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

                    <br />

                    <strong>
                      Time Limit:
                    </strong>{" "}

                    30 Minutes

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


                  {/* SCREEN */}

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


                  {proctoringError && (

                    <div className="alert alert-danger">

                      ⚠️ {proctoringError}

                    </div>

                  )}


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

                    <strong>
                      Important:
                    </strong>

                    <ul className="mb-0 mt-2">

                      <li>
                        Test duration is 30 minutes.
                      </li>

                      <li>
                        Timer starts when you click Start Test.
                      </li>

                      <li>
                        Refreshing the page will not reset the timer.
                      </li>

                      <li>
                        Do not switch tabs.
                      </li>

                      <li>
                        Do not stop screen sharing.
                      </li>

                      <li>
                        Do not disable your camera.
                      </li>

                      <li>
                        Keep fullscreen enabled.
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
  // TIMER STYLE
  // =========================================================

  const timerDanger =
    timeLeft !== null &&
    timeLeft <= 300;


  // =========================================================
  // MAIN TEST UI
  // =========================================================

  return (

    <div className="min-vh-100 bg-light">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar navbar-dark bg-dark">

        <div className="container">

          <span className="navbar-brand fw-bold">

            Interview Readiness

          </span>


          <div className="d-flex align-items-center gap-2 flex-wrap">

            {/* TIMER */}

            <span
              className={
                timerDanger
                  ? "badge bg-danger fs-6 px-3 py-2"
                  : "badge bg-primary fs-6 px-3 py-2"
              }
            >

              ⏱️ Time Left:{" "}

              {formatTime(timeLeft)}

            </span>


            <span className="badge bg-success">

              📷 Camera

            </span>


            <span className="badge bg-success">

              🖥️ Screen

            </span>


            <span className="badge bg-success">

              🔲 Fullscreen

            </span>


            <span
              className={
                violationCount === 0
                  ? "badge bg-success"
                  : violationCount < 4
                    ? "badge bg-warning text-dark"
                    : "badge bg-danger"
              }
            >

              ⚠️ Violations:{" "}
              {violationCount}/{MAX_VIOLATIONS}

            </span>

          </div>

        </div>

      </nav>


      {/* =====================================================
          TIMER WARNING
      ===================================================== */}

      {timerDanger &&
        timeLeft > 0 && (

          <div className="container mt-3">

            <div className="alert alert-danger text-center fw-bold">

              ⏰ Only{" "}
              {formatTime(timeLeft)}
              {" "}remaining!

            </div>

          </div>

        )}


      {/* =====================================================
          PROCTORING WARNING
      ===================================================== */}

      {proctoringError && (

        <div className="container mt-3">

          <div className="alert alert-danger">

            {proctoringError}

          </div>

        </div>

      )}


      {/* =====================================================
          LAST VIOLATION
      ===================================================== */}

      {lastViolation && (

        <div className="container">

          <div className="alert alert-warning">

            <strong>
              Latest violation:
            </strong>{" "}

            {lastViolation}

          </div>

        </div>

      )}


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="container py-4">


        {/* TEST INFORMATION */}

        <div className="card shadow-sm mb-4">

          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center">

              <h2 className="fw-bold mb-0">

                {test.name}

              </h2>


              <div
                className={
                  timerDanger
                    ? "alert alert-danger mb-0 py-2 px-3 fw-bold"
                    : "alert alert-primary mb-0 py-2 px-3 fw-bold"
                }
              >

                ⏱️{" "}
                {formatTime(timeLeft)}

              </div>

            </div>


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


        {/* PROCTORING STATUS */}

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


            <div className="row mt-3">

              <div className="col-md-3">

                <span
                  className={
                    cameraReady
                      ? "text-success"
                      : "text-danger"
                  }
                >

                  📷 Camera{" "}

                  {cameraReady
                    ? "✓"
                    : "✗"}

                </span>

              </div>


              <div className="col-md-3">

                <span
                  className={
                    microphoneReady
                      ? "text-success"
                      : "text-danger"
                  }
                >

                  🎤 Microphone{" "}

                  {microphoneReady
                    ? "✓"
                    : "✗"}

                </span>

              </div>


              <div className="col-md-3">

                <span
                  className={
                    screenReady
                      ? "text-success"
                      : "text-danger"
                  }
                >

                  🖥️ Screen{" "}

                  {screenReady
                    ? "✓"
                    : "✗"}

                </span>

              </div>


              <div className="col-md-3">

                <span
                  className={
                    fullscreenReady
                      ? "text-success"
                      : "text-danger"
                  }
                >

                  🔲 Fullscreen{" "}

                  {fullscreenReady
                    ? "✓"
                    : "✗"}

                </span>

              </div>

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


        {/* VIOLATIONS */}

        {violations.length > 0 && (

          <div className="card shadow-sm mb-4">

            <div className="card-body">

              <h5 className="fw-bold text-danger">

                ⚠️ Proctoring Violations

              </h5>


              <div className="table-responsive">

                <table className="table table-sm table-bordered mb-0">

                  <thead>

                    <tr>

                      <th>
                        #
                      </th>

                      <th>
                        Violation
                      </th>

                      <th>
                        Time
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {violations.map(
                      (violation, index) => (

                        <tr
                          key={
                            violation.id
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {violation.reason}
                          </td>

                          <td>
                            {violation.timestamp}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}


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


                {/* THEORETICAL */}

                {test.testType ===
                  "THEORETICAL" && (

                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Enter your answer..."
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


                {/* LOGICAL CODING */}

                {test.testType ===
                  "LOGICAL_CODING" && (

                  <textarea
                    className="form-control font-monospace"
                    rows="8"
                    placeholder="Write your solution/code here..."
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


                {/* MCQ */}

                {test.testType ===
                  "MCQ" && (

                  <div className="mt-3">

                    {question.options?.map(
                      (option) => (

                        <div
                          className="form-check mb-2"
                          key={option.id}
                        >

                          <input
                            className="form-check-input"
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
                            className="form-check-label"
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


                {/* MSQ */}

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
                            className="form-check mb-2"
                            key={option.id}
                          >

                            <input
                              className="form-check-input"
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
                              className="form-check-label"
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


        {/* SUBMIT */}

        {test.questions.length > 0 && (

          <div className="text-center mb-5">

            <button
              className="btn btn-success btn-lg px-5"
              onClick={() =>
                handleSubmit(false)
              }
              disabled={
                submitting ||
                timeLeft === 0
              }
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
