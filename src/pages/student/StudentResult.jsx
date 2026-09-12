
import {
  useEffect,
  useState
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../../services/api";


function StudentResult() {

  const navigate = useNavigate();

  const { attemptId } = useParams();

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // FETCH DETAILED RESULT
  // =========================================================

  useEffect(() => {

    fetchResult();

  }, [attemptId]);


  const fetchResult = async () => {

    try {

      setLoading(true);

      setError("");


      if (!attemptId) {

        setError("Invalid attempt ID.");

        return;

      }


      console.log(
        "Fetching detailed result:",
        attemptId
      );


      const response = await api.get(
        `/api/attempts/${attemptId}/result`
      );


      console.log(
        "Detailed result response:",
        response.data
      );


      setResult(response.data);


    } catch (error) {

      console.error(
        "Failed to load result:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem("token");

        localStorage.removeItem("role");

        localStorage.removeItem("user");

        setError(
          "Session expired. Please login again."
        );


      } else if (
        error.response?.status === 403
      ) {

        setError(
          "You are not allowed to view this result."
        );


      } else if (
        error.response?.status === 404
      ) {

        setError(
          "Result not found."
        );


      } else {

        setError(
          "Failed to load result."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    localStorage.removeItem("user");

    navigate("/login");

  };


  // =========================================================
  // CONVERT STUDENT ANSWER INTO OPTION IDS
  // =========================================================

  const getSelectedOptionIds = (studentAnswer) => {

    if (!studentAnswer) {
      return [];
    }


    // If backend stores something like:
    // [1,2]
    // ["1","2"]
    // 1,2

    let value = String(studentAnswer).trim();


    if (!value) {
      return [];
    }


    // Remove square brackets

    value = value
      .replace(/^\[/, "")
      .replace(/\]$/, "");


    // Remove quotes

    value = value.replace(/"/g, "");

    value = value.replace(/'/g, "");


    return value
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

  };


  // =========================================================
  // CHECK WHETHER OPTION WAS SELECTED
  // =========================================================

  const isOptionSelected = (
    studentAnswer,
    optionId
  ) => {

    const selectedIds =
      getSelectedOptionIds(studentAnswer);


    return selectedIds.includes(
      String(optionId)
    );

  };


  // =========================================================
  // GET TEST TYPE
  // =========================================================

  const getTestType = (answer) => {

    return String(
      answer?.testType || ""
    ).toUpperCase();

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="min-vh-100 bg-light">

        <nav className="navbar navbar-dark bg-dark">

          <div className="container">

            <span className="navbar-brand fw-bold">
              Interview Readiness
            </span>

          </div>

        </nav>


        <div className="container mt-5 text-center">

          <div
            className="spinner-border text-primary"
            role="status"
          ></div>


          <p className="mt-3">
            Loading result...
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div className="min-vh-100 bg-light">

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
              Dashboard
            </button>

          </div>

        </nav>


        <div className="container mt-5">

          <div className="alert alert-danger">
            {error}
          </div>


          {error.includes(
            "Session expired"
          ) ? (

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/login")
              }
            >
              Login Again
            </button>

          ) : (

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

          )}

        </div>

      </div>

    );

  }


  // =========================================================
  // NO RESULT
  // =========================================================

  if (!result) {

    return (

      <div className="container mt-5">

        <div className="alert alert-warning">

          Result information is not available.

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
  // RESULT DATA
  // =========================================================

  const studentName =
    result.studentName ||
    "Student";


  const studentEmail =
    result.studentEmail ||
    "";


  const testName =
    result.testName ||
    "Test";


  const score =
    Number(result.score ?? 0);


  const totalMarks =
    Number(result.totalMarks ?? 0);


  const percentage =
    Number(result.percentage ?? 0);


  const status =
    result.status ||
    "UNKNOWN";


  const passed =
    String(status).toUpperCase() === "PASSED";


  const answers =
    Array.isArray(result.answers)
      ? result.answers
      : [];


  // =========================================================
  // UI
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


          <div className="d-flex gap-2">

            <button
              className="btn btn-outline-light"
              onClick={() =>
                navigate(
                  "/student/dashboard"
                )
              }
            >
              Dashboard
            </button>


            <button
              className="btn btn-outline-light"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </nav>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="container py-5">


        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="card shadow border-0 mb-4">

          <div className="card-body text-center p-5">


            <h3 className="fw-bold text-primary mb-1">

              {studentName}

            </h3>


            {studentEmail && (

              <p className="text-muted">

                {studentEmail}

              </p>

            )}


            <h2 className="fw-bold mb-3">

              Test Result

            </h2>


            <h4 className="mb-4">

              {testName}

            </h4>


            <div className="mb-4">

              <span
                className={
                  passed
                    ? "badge bg-success fs-5 px-4 py-2"
                    : "badge bg-danger fs-5 px-4 py-2"
                }
              >

                {status}

              </span>

            </div>


            {/* SCORE */}

            <h1 className="display-3 fw-bold">

              {score}

              <span className="fs-3 text-muted">

                {" "} / {totalMarks}

              </span>

            </h1>


            <p className="text-muted">

              Score

            </p>


            <div className="row g-3 mt-3">


              <div className="col-md-6">

                <div className="card bg-light border-0">

                  <div className="card-body">

                    <h6 className="text-muted">

                      Percentage

                    </h6>


                    <h3 className="fw-bold">

                      {percentage.toFixed(2)}%

                    </h3>

                  </div>

                </div>

              </div>


              <div className="col-md-6">

                <div className="card bg-light border-0">

                  <div className="card-body">

                    <h6 className="text-muted">

                      Attempt ID

                    </h6>


                    <h3 className="fw-bold">

                      {attemptId}

                    </h3>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            ANSWER REVIEW
        =================================================== */}

        <div className="card shadow border-0">

          <div className="card-body p-4">

            <h3 className="fw-bold mb-4">

              Answer Review

            </h3>


            {answers.length === 0 ? (

              <div className="alert alert-info">

                No answers were submitted for this attempt.

              </div>

            ) : (

              answers.map(
                (answer, index) => {

                  const testType =
                    getTestType(answer);


                  const isObjective =
                    testType === "MCQ" ||
                    testType === "MSQ";


                  return (

                    <div
                      key={
                        answer.answerId ||
                        answer.questionId ||
                        index
                      }
                      className="card border mb-4"
                    >

                      <div className="card-body">


                        {/* =================================
                            QUESTION HEADER
                        ================================= */}

                        <div className="d-flex justify-content-between align-items-start mb-3">

                          <div>

                            <h5 className="fw-bold mb-1">

                              {index + 1}.{" "}

                              {answer.question}

                            </h5>


                            {testType && (

                              <span className="badge bg-secondary">

                                {testType}

                              </span>

                            )}

                          </div>


                          <span
                            className={
                              answer.correct
                                ? "badge bg-success ms-3"
                                : "badge bg-danger ms-3"
                            }
                          >

                            {answer.correct
                              ? "Correct"
                              : "Incorrect"}

                          </span>

                        </div>


                        {/* =================================
                            DIFFICULTY
                        ================================= */}

                        {answer.difficulty && (

                          <p className="text-muted">

                            Difficulty:{" "}

                            <strong>
                              {answer.difficulty}
                            </strong>

                          </p>

                        )}


                        {/* =================================
                            MCQ / MSQ OPTIONS
                        ================================= */}

                        {isObjective &&
                          answer.options &&
                          answer.options.length > 0 && (

                          <div className="mb-4">

                            <h6 className="fw-bold mb-3">

                              Options

                            </h6>


                            {answer.options.map(
                              (option) => {

                                const selected =
                                  isOptionSelected(
                                    answer.studentAnswer,
                                    option.id
                                  );


                                const correct =
                                  Boolean(
                                    option.correct
                                  );


                                let optionClass =
                                  "border rounded p-3 mb-2";


                                if (
                                  selected &&
                                  correct
                                ) {

                                  optionClass +=
                                    " border-success bg-success-subtle";

                                } else if (
                                  selected &&
                                  !correct
                                ) {

                                  optionClass +=
                                    " border-danger bg-danger-subtle";

                                } else if (
                                  !selected &&
                                  correct
                                ) {

                                  optionClass +=
                                    " border-success bg-success-subtle";

                                }


                                return (

                                  <div
                                    key={option.id}
                                    className={optionClass}
                                  >

                                    <div className="d-flex justify-content-between align-items-center">

                                      <span className="fw-semibold">

                                        {option.optionText}

                                      </span>


                                      <div className="d-flex gap-2">

                                        {selected && (

                                          <span
                                            className={
                                              correct
                                                ? "badge bg-success"
                                                : "badge bg-danger"
                                            }
                                          >

                                            {correct
                                              ? "Your Answer ✓"
                                              : "Your Answer ✗"}

                                          </span>

                                        )}


                                        {correct && (

                                          <span className="badge bg-success">

                                            Correct Answer

                                          </span>

                                        )}

                                      </div>

                                    </div>


                                  </div>

                                );

                              }
                            )}

                          </div>

                        )}


                        {/* =================================
                            OBJECTIVE ANSWER SUMMARY
                        ================================= */}

                        {isObjective && (

                          <div className="mb-3">

                            <h6 className="fw-bold">

                              Your Selected Answer

                            </h6>


                            <div
                              className={
                                answer.correct
                                  ? "border border-success rounded p-3 bg-success-subtle"
                                  : "border border-danger rounded p-3 bg-danger-subtle"
                              }
                            >

                              {answer.studentAnswer
                                ? answer.studentAnswer
                                : "No answer submitted"}

                            </div>

                          </div>

                        )}


                        {/* =================================
                            THEORETICAL / CODING / LOGICAL
                        ================================= */}

                        {!isObjective && (

                          <>

                            <div className="mb-3">

                              <h6 className="fw-bold">

                                Your Answer

                              </h6>


                              <div
                                className={
                                  answer.correct
                                    ? "border border-success rounded p-3 bg-success-subtle"
                                    : "border border-danger rounded p-3 bg-danger-subtle"
                                }
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word"
                                }}
                              >

                                {answer.studentAnswer
                                  ? answer.studentAnswer
                                  : "No answer submitted"}

                              </div>

                            </div>


                            <div className="mb-3">

                              <h6 className="fw-bold">

                                Correct / Expected Answer

                              </h6>


                              <div
                                className="border border-success rounded p-3 bg-success-subtle"
                                style={{
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word"
                                }}
                              >

                                {answer.correctAnswer
                                  ? answer.correctAnswer
                                  : "Not available"}

                              </div>

                            </div>

                          </>

                        )}


                        {/* =================================
                            MARKS
                        ================================= */}

                        <div className="d-flex justify-content-between align-items-center border-top pt-3">

                          <span className="fw-bold">

                            Marks

                          </span>


                          <span
                            className={
                              answer.correct
                                ? "text-success fw-bold fs-5"
                                : "text-danger fw-bold fs-5"
                            }
                          >

                            {answer.marks}

                            {" / "}

                            {answer.maxMarks}

                          </span>

                        </div>

                      </div>

                    </div>

                  );

                }
              )

            )}

          </div>

        </div>


        {/* ===================================================
            BACK BUTTON
        =================================================== */}

        <div className="text-center mt-4">

          <button
            className="btn btn-primary btn-lg px-5"
            onClick={() =>
              navigate(
                "/student/results"
              )
            }
          >

            Back to Results

          </button>

        </div>


      </div>

    </div>

  );

}


export default StudentResult;

