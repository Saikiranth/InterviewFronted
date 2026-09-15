```jsx
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
      handleFullscreenC
```
