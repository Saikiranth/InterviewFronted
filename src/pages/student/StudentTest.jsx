import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../../services/api";


function StudentTest() {

  const { testId } = useParams();

  const navigate = useNavigate();


  const [test, setTest] = useState(null);

  const [answers, setAnswers] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);


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
  // UI
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


          <button
            className="btn btn-outline-light"
            onClick={() =>
              navigate(
                "/student/dashboard"
              )
            }
          >

            Back to Dashboard

          </button>

        </div>

      </nav>


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