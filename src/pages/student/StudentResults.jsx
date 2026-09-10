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

      console.log("Student Results Response:", response.data);

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

                      const attemptId = result.id;

                      const studentName =
                        result.student?.name ||
                        "Student";

                      const testName =
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

                      return (

                        <tr key={attemptId}>

                          <td>
                            {index + 1}
                          </td>

                          {/* STUDENT NAME */}

                          <td>
                            <strong>
                              {studentName}
                            </strong>

                            {result.student?.email && (
                              <small className="d-block text-muted">
                                {result.student.email}
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
                                  className={`progress-bar ${
                                    percentage >= 40
                                      ? "bg-success"
                                      : "bg-danger"
                                  }`}
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

                            ) : (

                              <span className="badge bg-warning text-dark">
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