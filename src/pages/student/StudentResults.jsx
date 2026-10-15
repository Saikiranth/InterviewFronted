import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function StudentResults() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/student/results");

      setResults(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load results:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        alert("Session expired. Please login again.");

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        navigate("/login");
      } else {
        alert("Failed to load results.");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleDashboard = () => {
    navigate("/student/dashboard");
  };

  const handlePerformance = () => {
    navigate("/student/performance");
  };

  const handleResult = (attemptId) => {
    navigate(`/student/result/${attemptId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading results...
        </p>

      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar navbar-dark bg-dark">

        <div className="container">

          <span className="navbar-brand fw-bold">
            Interview Readiness
          </span>

          <div className="d-flex align-items-center gap-2">

            <button
              className="btn btn-outline-light"
              onClick={handleDashboard}
            >
              Dashboard
            </button>

            <button
              className="btn btn-outline-light"
              onClick={handlePerformance}
            >
              Performance
            </button>

            <span className="text-white ms-2">
              Student
            </span>

            <button
              className="btn btn-outline-light"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* ================= MAIN CONTENT ================= */}

      <div className="container py-4">

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h2 className="fw-bold mb-1">
              My Results
            </h2>

            <p className="text-muted mb-0">
              View your completed test results and scores.
            </p>

          </div>

          <button
            className="btn btn-outline-primary"
            onClick={fetchResults}
          >
            🔄 Refresh
          </button>

        </div>

        {/* ================= NO RESULTS ================= */}

        {results.length === 0 ? (

          <div className="card shadow-sm border-0">

            <div className="card-body text-center py-5">

              <h5 className="fw-bold">
                No Results Available
              </h5>

              <p className="text-muted">
                You have not completed any tests yet.
              </p>

              <button
                className="btn btn-primary"
                onClick={handleDashboard}
              >
                Go to Dashboard
              </button>

            </div>

          </div>

        ) : (

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead className="table-dark">

                    <tr>

                      <th>#</th>

                      <th>Student</th>

                      <th>Test Name</th>

                      <th>Score</th>

                      <th>Total Marks</th>

                      <th>Percentage</th>

                      <th>Status</th>

                      <th>Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {results.map((result, index) => {

                      // Backend returns flat fields (attemptId, testName);
                      // older shapes (id, test.name) are still supported.
                      const attemptId =
                        result.attemptId ?? result.id;

                      const studentName =
                        result.studentName ||
                        result.student?.name ||
                        "Student";

                      const studentEmail =
                        result.studentEmail ||
                        result.student?.email ||
                        "";

                      const testName =
                        result.testName ||
                        result.test?.name ||
                        "Test";

                      const score =
                        Number(result.score ?? 0);

                      const totalMarks =
                        Number(result.totalMarks ?? 0);

                      const percentage =
                        totalMarks > 0
                          ? (score / totalMarks) * 100
                          : 0;

                      const status =
                        result.status || "UNKNOWN";

                      const underReview =
                        status === "PENDING_REVIEW";

                      const progressClass =
                        underReview
                          ? "bg-warning"
                          : percentage >= 40
                            ? "bg-success"
                            : "bg-danger";

                      return (

                        <tr key={attemptId ?? index}>

                          <td>
                            {index + 1}
                          </td>

                          {/* STUDENT NAME */}

                          <td>
                            <strong>
                              {studentName}
                            </strong>

                            {studentEmail && (
                              <small className="d-block text-muted">
                                {studentEmail}
                              </small>
                            )}
                          </td>

                          {/* TEST NAME */}

                          <td>
                            <strong>
                              {testName}
                            </strong>
                          </td>

                          {/* SCORE */}

                          <td>
                            {score}
                            {underReview && (
                              <small className="d-block text-muted">
                                provisional
                              </small>
                            )}
                          </td>

                          {/* TOTAL MARKS */}

                          <td>
                            {totalMarks}
                          </td>

                          {/* PERCENTAGE */}

                          <td>

                            <div className="d-flex align-items-center gap-2">

                              <span>
                                {percentage.toFixed(2)}%
                              </span>

                              <div
                                className="progress"
                                style={{
                                  width: "100px",
                                  height: "8px"
                                }}
                              >

                                <div
                                  className={`progress-bar ${progressClass}`}
                                  role="progressbar"
                                  style={{
                                    width: `${Math.min(
                                      percentage,
                                      100
                                    )}%`
                                  }}
                                ></div>

                              </div>

                            </div>

                          </td>

                          {/* STATUS */}

                          <td>

                            {status === "PASSED" ? (

                              <span className="badge bg-success">
                                PASSED
                              </span>

                            ) : status === "FAILED" ? (

                              <span className="badge bg-danger">
                                FAILED
                              </span>

                            ) : underReview ? (

                              <span className="badge bg-warning text-dark">
                                UNDER REVIEW
                              </span>

                            ) : (

                              <span className="badge bg-secondary">
                                {status}
                              </span>

                            )}

                          </td>

                          {/* ACTION */}

                          <td>

                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() =>
                                handleResult(attemptId)
                              }
                              disabled={attemptId == null}
                            >
                              View Result
                            </button>

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default StudentResults;
