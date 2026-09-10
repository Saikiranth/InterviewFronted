import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminResults() {

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // FETCH RESULTS
  // =========================================================

  const fetchResults = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get("/api/attempts");

      console.log(
        "Admin Results Response:",
        response.data
      );

      setResults(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error loading results:",
        error
      );

      if (error.response?.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        window.location.href = "/login";

      } else if (error.response?.status === 403) {

        setError(
          "You are not authorized to view results."
        );

      } else {

        setError(
          "Failed to load results."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOAD RESULTS
  // =========================================================

  useEffect(() => {

    fetchResults();

  }, []);


  // =========================================================
  // TEST TYPE
  // =========================================================

  const getTestTypeName = (type) => {

    switch (type) {

      case "MCQ":
        return "MCQ";

      case "MSQ":
        return "MSQ";

      case "LOGICAL_CODING":
        return "Logical Coding";

      case "THEORETICAL":
        return "Theoretical";

      default:
        return type || "Unknown";

    }

  };


  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status) => {

    if (status === "PASSED") {

      return (
        <span className="badge bg-success">
          PASSED
        </span>
      );

    }

    if (status === "FAILED") {

      return (
        <span className="badge bg-danger">
          FAILED
        </span>
      );

    }

    if (status === "COMPLETED") {

      return (
        <span className="badge bg-primary">
          COMPLETED
        </span>
      );

    }

    return (
      <span className="badge bg-warning text-dark">
        {status || "UNKNOWN"}
      </span>
    );

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="p-4 text-center">

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


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="p-4">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="mb-1">
            Test Results
          </h2>

          <p className="text-muted mb-0">
            View student test attempts and performance
          </p>

        </div>


        <button
          className="btn btn-primary"
          onClick={fetchResults}
        >
          🔄 Refresh
        </button>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="alert alert-danger">
          {error}
        </div>

      )}


      {/* =====================================================
          NO RESULTS
      ===================================================== */}

      {!error && results.length === 0 ? (

        <div className="alert alert-info">
          No test results found.
        </div>

      ) : (

        <div className="card shadow-sm">

          {/* CARD HEADER */}

          <div className="card-header bg-white">

            <strong>
              Total Attempts: {results.length}
            </strong>

          </div>


          {/* CARD BODY */}

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-bordered table-hover align-middle">

                <thead className="table-dark">

                  <tr>

                    <th>
                      Attempt ID
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Test
                    </th>

                    <th>
                      Test Type
                    </th>

                    <th>
                      Score
                    </th>

                    <th>
                      Percentage
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {results.map((result) => {

                    // =================================================
                    // CORRECT BACKEND MAPPING
                    // =================================================

                    const attemptId =
                      result.id;


                    const studentName =
                      result.student?.name ||
                      "Unknown";


                    const studentEmail =
                      result.student?.email ||
                      "";


                    const testName =
                      result.test?.name ||
                      "Unknown";


                    const testType =
                      result.test?.testType ||
                      "Unknown";


                    const score =
                      Number(result.score ?? 0);


                    const totalMarks =
                      Number(
                        result.totalMarks ??
                        result.test?.totalMarks ??
                        0
                      );


                    // =================================================
                    // CALCULATE PERCENTAGE
                    // =================================================

                    const percentage =
                      totalMarks > 0
                        ? (score / totalMarks) * 100
                        : 0;


                    const status =
                      result.status ||
                      "UNKNOWN";


                    return (

                      <tr key={attemptId}>

                        {/* ATTEMPT ID */}

                        <td>
                          {attemptId}
                        </td>


                        {/* STUDENT */}

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


                        {/* TEST */}

                        <td>

                          <strong>
                            {testName}
                          </strong>

                        </td>


                        {/* TEST TYPE */}

                        <td>

                          <span className="badge bg-info text-dark">

                            {getTestTypeName(
                              testType
                            )}

                          </span>

                        </td>


                        {/* SCORE */}

                        <td>

                          <strong>
                            {score}
                          </strong>

                          {" / "}

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
                                width: "80px",
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

                          {getStatusBadge(
                            status
                          )}

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

  );

}

export default AdminResults;