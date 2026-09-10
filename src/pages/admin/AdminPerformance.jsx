import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminPerformance() {

  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchPerformance = async () => {

    try {

      setLoading(true);

      const response = await api.get(
        "/api/admin/performance/tests",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      console.log(
        "Admin Performance:",
        response.data
      );

      setPerformance(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Performance API error:",
        error
      );

      alert(
        "Failed to load performance data."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  // =========================================================
  // SUMMARY CALCULATIONS
  // =========================================================

  const totalTests =
    performance.length;

  const totalAttempts =
    performance.reduce(
      (total, item) =>
        total + item.totalStudents,
      0
    );

  const totalPassed =
    performance.reduce(
      (total, item) =>
        total + item.passedStudents,
      0
    );

  const totalFailed =
    performance.reduce(
      (total, item) =>
        total + item.failedStudents,
      0
    );

  const overallAverage =
    totalAttempts > 0
      ? performance.reduce(
          (total, item) =>
            total +
            item.averageScore *
              item.totalStudents,
          0
        ) / totalAttempts
      : 0;

  const passRate =
    totalAttempts > 0
      ? (totalPassed / totalAttempts) * 100
      : 0;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="container-fluid p-4">

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <div
              className="spinner-border text-primary"
              role="status"
            />

            <h5 className="mt-3">
              Loading Performance...
            </h5>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="container-fluid p-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Admin Performance
          </h2>

          <p className="text-muted mb-0">
            Monitor test performance and student results
          </p>

        </div>

        <button
          className="btn btn-outline-primary"
          onClick={fetchPerformance}
        >
          ↻ Refresh
        </button>

      </div>


      {/* SUMMARY CARDS */}

      <div className="row g-3 mb-4">

        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Total Tests
              </small>

              <h2 className="fw-bold text-primary mt-2">
                {totalTests}
              </h2>

            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Total Attempts
              </small>

              <h2 className="fw-bold text-info mt-2">
                {totalAttempts}
              </h2>

            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Passed
              </small>

              <h2 className="fw-bold text-success mt-2">
                {totalPassed}
              </h2>

              <small className="text-muted">
                Pass Rate: {passRate.toFixed(1)}%
              </small>

            </div>

          </div>

        </div>


        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Failed
              </small>

              <h2 className="fw-bold text-danger mt-2">
                {totalFailed}
              </h2>

              <small className="text-muted">
                Avg Score: {overallAverage.toFixed(2)}
              </small>

            </div>

          </div>

        </div>

      </div>


      {/* PERFORMANCE TABLE */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Test Performance
              </h5>

              <p className="text-muted mb-0">
                Performance summary for all tests
              </p>

            </div>

            <span className="badge bg-primary fs-6">
              {performance.length} Tests
            </span>

          </div>


          {performance.length === 0 ? (

            <div className="alert alert-info">
              No performance data available.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>#</th>

                    <th>Test Name</th>

                    <th>Total Marks</th>

                    <th>Attempts</th>

                    <th>Average Score</th>

                    <th>Passed</th>

                    <th>Failed</th>

                    <th>Pass Rate</th>

                  </tr>

                </thead>


                <tbody>

                  {performance.map(
                    (item, index) => {

                      const itemPassRate =
                        item.totalStudents > 0
                          ? (
                              item.passedStudents /
                              item.totalStudents
                            ) * 100
                          : 0;

                      const percentage =
                        item.totalMarks > 0
                          ? (
                              item.averageScore /
                              item.totalMarks
                            ) * 100
                          : 0;

                      return (

                        <tr key={item.testId}>

                          <td>
                            {index + 1}
                          </td>

                          <td>

                            <strong>
                              {item.testName}
                            </strong>

                          </td>

                          <td>
                            {item.totalMarks}
                          </td>

                          <td>

                            <span className="badge bg-info">
                              {item.totalStudents}
                            </span>

                          </td>

                          <td>

                            <strong>
                              {item.averageScore.toFixed(2)}
                            </strong>

                            <small className="text-muted ms-1">
                              / {item.totalMarks}
                            </small>

                            <div
                              className="progress mt-1"
                              style={{
                                height: "6px",
                                minWidth: "100px"
                              }}
                            >

                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width:
                                    `${Math.min(
                                      percentage,
                                      100
                                    )}%`
                                }}
                              />

                            </div>

                          </td>

                          <td>

                            <span className="badge bg-success">
                              {item.passedStudents}
                            </span>

                          </td>

                          <td>

                            <span className="badge bg-danger">
                              {item.failedStudents}
                            </span>

                          </td>

                          <td>

                            <strong>
                              {itemPassRate.toFixed(1)}%
                            </strong>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminPerformance;