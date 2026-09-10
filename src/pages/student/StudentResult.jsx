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
  // FETCH RESULT
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
        "Fetching attempt:",
        attemptId
      );


      const response = await api.get(
        `/api/attempts/${attemptId}`
      );


      console.log(
        "Attempt response:",
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
    result.student?.name ||
    "Student";


  const studentEmail =
    result.student?.email ||
    "";


  const testName =
    result.test?.name ||
    result.testName ||
    "Test";


  const score =
    Number(result.score ?? 0);


  const totalMarks =
    Number(
      result.totalMarks ??
      result.test?.totalMarks ??
      0
    );


  const percentage =
    totalMarks > 0
      ? (score / totalMarks) * 100
      : 0;


  const status =
    result.status || "UNKNOWN";


  const passed =
    status === "PASSED";


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="min-vh-100 bg-light">


      {/* ================= NAVBAR ================= */}

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


      {/* ================= RESULT CONTENT ================= */}

      <div className="container py-5">

        <div className="row justify-content-center">

          <div className="col-md-8">

            <div className="card shadow border-0">

              <div className="card-body text-center p-5">


                {/* ================= STUDENT NAME ================= */}

                <h3 className="fw-bold text-primary mb-1">

                  {studentName}

                </h3>


                {/* STUDENT EMAIL */}

                {studentEmail && (

                  <p className="text-muted mb-3">

                    {studentEmail}

                  </p>

                )}


                {/* TITLE */}

                <h2 className="fw-bold mb-4">

                  Test Result

                </h2>


                {/* TEST NAME */}

                <h4 className="mb-4">

                  {testName}

                </h4>


                {/* STATUS */}

                <div className="mb-4">

                  {passed ? (

                    <span
                      className="
                        badge
                        bg-success
                        fs-5
                        px-4
                        py-2
                      "
                    >
                      PASSED
                    </span>

                  ) : (

                    <span
                      className="
                        badge
                        bg-danger
                        fs-5
                        px-4
                        py-2
                      "
                    >
                      FAILED
                    </span>

                  )}

                </div>


                {/* SCORE */}

                <div className="mb-4">

                  <h1 className="display-3 fw-bold">

                    {score}

                    <span className="fs-3 text-muted">

                      {" "}
                      / {totalMarks}

                    </span>

                  </h1>


                  <p className="text-muted">
                    Score
                  </p>

                </div>


                {/* ================= DETAILS ================= */}

                <div className="row g-3 mb-4">


                  {/* PERCENTAGE */}

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


                  {/* STATUS */}

                  <div className="col-md-6">

                    <div className="card bg-light border-0">

                      <div className="card-body">

                        <h6 className="text-muted">

                          Status

                        </h6>


                        <h3
                          className={
                            passed
                              ? "text-success fw-bold"
                              : "text-danger fw-bold"
                          }
                        >

                          {status}

                        </h3>

                      </div>

                    </div>

                  </div>


                </div>


                {/* ================= STUDENT INFORMATION ================= */}

                <div className="card bg-light border-0 mb-4">

                  <div className="card-body text-start">

                    <h5 className="fw-bold mb-3">

                      Student Information

                    </h5>


                    <p className="mb-2">

                      <strong>Name:</strong>{" "}

                      {studentName}

                    </p>


                    {studentEmail && (

                      <p className="mb-2">

                        <strong>Email:</strong>{" "}

                        {studentEmail}

                      </p>

                    )}


                    <p className="mb-0">

                      <strong>Attempt ID:</strong>{" "}

                      {attemptId}

                    </p>

                  </div>

                </div>


                {/* ================= BACK BUTTON ================= */}

                <button
                  className="
                    btn
                    btn-primary
                    btn-lg
                    px-5
                    mt-3
                  "
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

        </div>

      </div>

    </div>

  );

}


export default StudentResult;