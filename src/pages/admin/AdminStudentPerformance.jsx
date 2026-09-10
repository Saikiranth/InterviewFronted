import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminStudentPerformance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  const fetchStudentPerformance = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/admin/performance/students",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      console.log("Student Performance:", response.data);

      setStudents(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error(
        "Student performance API error:",
        error
      );

      alert("Failed to load student performance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentPerformance();
  }, []);

  // Summary calculations

  const totalStudents = students.length;

  const totalAttempts = students.reduce(
    (total, student) =>
      total + student.totalAttempts,
    0
  );

  const totalPassed = students.reduce(
    (total, student) =>
      total + student.passedTests,
    0
  );

  const totalFailed = students.reduce(
    (total, student) =>
      total + student.failedTests,
    0
  );

  const overallPassRate =
    totalAttempts > 0
      ? (totalPassed / totalAttempts) * 100
      : 0;

  const overallAverage =
    totalAttempts > 0
      ? students.reduce(
          (total, student) =>
            total +
            student.averagePercentage *
              student.totalAttempts,
          0
        ) / totalAttempts
      : 0;

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
              Loading Student Performance...
            </h5>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Student Performance
          </h2>

          <p className="text-muted mb-0">
            Monitor individual student test performance
          </p>

        </div>

        <button
          className="btn btn-outline-primary"
          onClick={fetchStudentPerformance}
        >
          ↻ Refresh
        </button>

      </div>


      {/* Summary Cards */}

      <div className="row g-3 mb-4">

        {/* Total Students */}

        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Total Students
              </small>

              <h2 className="fw-bold text-primary mt-2">
                {totalStudents}
              </h2>

            </div>

          </div>

        </div>


        {/* Total Attempts */}

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


        {/* Passed */}

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
                Pass Rate: {overallPassRate.toFixed(1)}%
              </small>

            </div>

          </div>

        </div>


        {/* Average */}

        <div className="col-md-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Overall Average
              </small>

              <h2 className="fw-bold text-warning mt-2">
                {overallAverage.toFixed(1)}%
              </h2>

              <small className="text-muted">
                Failed: {totalFailed}
              </small>

            </div>

          </div>

        </div>

      </div>


      {/* Student Table */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="fw-bold mb-1">
                Student-wise Performance
              </h5>

              <p className="text-muted mb-0">
                Performance summary of all students
              </p>

            </div>

            <span className="badge bg-primary fs-6">
              {students.length} Students
            </span>

          </div>


          {students.length === 0 ? (

            <div className="alert alert-info">
              No student performance data available.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>#</th>

                    <th>Student</th>

                    <th>Email</th>

                    <th>Attempts</th>

                    <th>Passed</th>

                    <th>Failed</th>

                    <th>Average Score</th>

                    <th>Average %</th>

                    <th>Performance</th>

                  </tr>

                </thead>


                <tbody>

                  {students.map(
                    (student, index) => {

                      const percentage =
                        Number(
                          student.averagePercentage
                        ) || 0;

                      let progressClass =
                        "bg-danger";

                      if (percentage >= 75) {
                        progressClass =
                          "bg-success";
                      } else if (
                        percentage >= 40
                      ) {
                        progressClass =
                          "bg-warning";
                      }

                      return (

                        <tr
                          key={student.studentId}
                        >

                          <td>
                            {index + 1}
                          </td>


                          <td>

                            <strong>
                              {student.studentName}
                            </strong>

                          </td>


                          <td>
                            {student.studentEmail}
                          </td>


                          <td>

                            <span className="badge bg-info">
                              {student.totalAttempts}
                            </span>

                          </td>


                          <td>

                            <span className="badge bg-success">
                              {student.passedTests}
                            </span>

                          </td>


                          <td>

                            <span className="badge bg-danger">
                              {student.failedTests}
                            </span>

                          </td>


                          <td>

                            <strong>
                              {Number(
                                student.averageScore
                              ).toFixed(2)}
                            </strong>

                          </td>


                          <td>

                            <strong>
                              {percentage.toFixed(1)}%
                            </strong>

                          </td>


                          <td style={{ minWidth: "150px" }}>

                            <div className="progress">

                              <div
                                className={`progress-bar ${progressClass}`}
                                role="progressbar"
                                style={{
                                  width: `${Math.min(
                                    percentage,
                                    100
                                  )}%`
                                }}
                              >
                                {percentage.toFixed(0)}%
                              </div>

                            </div>

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

export default AdminStudentPerformance;