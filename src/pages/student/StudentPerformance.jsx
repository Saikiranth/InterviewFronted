
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StudentPerformance() {

  const navigate = useNavigate();

  const [performance, setPerformance] = useState(null);
  const [testPerformance, setTestPerformance] = useState([]);

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {

    try {

      setLoading(true);

      const [performanceResponse, testsResponse] =
        await Promise.all([
          api.get(
            "/api/student/performance",
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          ),

          api.get(
            "/api/student/performance/tests",
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        ]);

      setPerformance(performanceResponse.data);
      setTestPerformance(testsResponse.data);

    } catch (error) {

      console.error(
        "Failed to load performance:",
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

        navigate("/login");

      } else {

        alert(
          "Failed to load performance data."
        );
      }

    } finally {

      setLoading(false);
    }
  };

  // RETURN TO DASHBOARD
  const handleDashboard = () => {
    navigate("/student/dashboard");
  };

  // RESULTS
  const handleResults = () => {
    navigate("/student/results");
  };

  // LOGOUT
  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/login");
  };

  // LOADING
  if (loading) {

    return (
      <div className="container mt-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading performance...
        </p>

      </div>
    );
  }

  // ERROR / NO DATA
  if (!performance) {

    return (
      <div className="container mt-5">

        <div className="alert alert-danger">
          Performance data is not available.
        </div>

       

      </div>
    );
  }

  // CHART DATA
  const chartData = {

    labels: testPerformance.map(
      (test) => test.testName
    ),

    datasets: [
      {
        label: "Percentage",

        data: testPerformance.map(
          (test) => test.percentage
        ),

        borderWidth: 1
      }
    ]
  };

  const chartOptions = {

    responsive: true,

    plugins: {

      legend: {
        display: true
      },

      title: {
        display: true,
        text: "Test Performance"
      }

    },

    scales: {

      y: {
        beginAtZero: true,
        max: 100,

        title: {
          display: true,
          text: "Percentage"
        }
      }

    }

  };

  return (
    <div className="min-vh-100 bg-light">

      {/* NAVBAR */}

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
              onClick={handleResults}
            >
              Results
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


      {/* MAIN CONTENT */}

      <div className="container py-4">

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h2 className="fw-bold mb-1">
              My Performance
            </h2>

            <p className="text-muted mb-0">
              Track your overall test performance
              and individual test results.
            </p>

          </div>

          <div className="d-flex gap-2">

           

            <button
              className="btn btn-outline-primary"
              onClick={fetchPerformance}
            >
              Refresh
            </button>

          </div>

        </div>


        {/* STUDENT INFORMATION */}

        <div className="card shadow-sm border-0 mb-4">

          <div className="card-body">

            <h4 className="fw-bold mb-3">
              Student Information
            </h4>

            <div className="row">

              <div className="col-md-6">

                <p className="mb-2">
                  <strong>Name:</strong>{" "}
                  {performance.studentName}
                </p>

              </div>

              <div className="col-md-6">

                <p className="mb-2">
                  <strong>Email:</strong>{" "}
                  {performance.studentEmail}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* SUMMARY CARDS */}

        <div className="row g-4 mb-5">

          {/* ASSIGNED */}

          <div className="col-md-6 col-lg-3">

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h6 className="text-muted">
                  Tests Assigned
                </h6>

                <h2 className="fw-bold text-primary">
                  {performance.testsAssigned}
                </h2>

              </div>

            </div>

          </div>


          {/* COMPLETED */}

          <div className="col-md-6 col-lg-3">

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h6 className="text-muted">
                  Tests Completed
                </h6>

                <h2 className="fw-bold text-success">
                  {performance.testsCompleted}
                </h2>

              </div>

            </div>

          </div>


          {/* PASSED */}

          <div className="col-md-6 col-lg-3">

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h6 className="text-muted">
                  Tests Passed
                </h6>

                <h2 className="fw-bold text-success">
                  {performance.testsPassed}
                </h2>

              </div>

            </div>

          </div>


          {/* FAILED */}

          <div className="col-md-6 col-lg-3">

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h6 className="text-muted">
                  Tests Failed
                </h6>

                <h2 className="fw-bold text-danger">
                  {performance.testsFailed}
                </h2>

              </div>

            </div>

          </div>

        </div>


        {/* AVERAGE SCORE */}

        <div className="card shadow-sm border-0 mb-5">

          <div className="card-body">

            <div className="d-flex justify-content-between">

              <h5 className="fw-bold">
                Overall Average Score
              </h5>

              <span className="fw-bold text-primary">
                {performance.averageScore}%
              </span>

            </div>

            <div
              className="progress mt-3"
              style={{ height: "20px" }}
            >

              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{
                  width: `${Math.min(
                    performance.averageScore,
                    100
                  )}%`
                }}
              >
                {performance.averageScore}%
              </div>

            </div>

          </div>

        </div>


        {/* CHART */}

        <div className="card shadow-sm border-0 mb-5">

          <div className="card-body">

            <h4 className="fw-bold mb-4">
              Test Performance
            </h4>

            {testPerformance.length === 0 ? (

              <div className="alert alert-info">
                No completed tests available for the chart.
              </div>

            ) : (

              <Bar
                data={chartData}
                options={chartOptions}
              />

            )}

          </div>

        </div>


        {/* TEST-WISE PERFORMANCE */}

        <div className="card shadow-sm border-0 mb-5">

          <div className="card-body">

            <h4 className="fw-bold mb-4">
              Test-wise Performance
            </h4>

            {testPerformance.length === 0 ? (

              <div className="alert alert-info">
                No test performance available.
              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead className="table-dark">

                    <tr>

                      <th>#</th>

                      <th>Test Name</th>

                      <th>Score</th>

                      <th>Total Marks</th>

                      <th>Percentage</th>

                      <th>Progress</th>

                      <th>Status</th>

                    </tr>

                  </thead>

                  <tbody>

                    {testPerformance.map(
                      (test, index) => (

                        <tr key={test.testId}>

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {test.testName}
                            </strong>
                          </td>

                          <td>
                            {test.score}
                          </td>

                          <td>
                            {test.totalMarks}
                          </td>

                          <td>
                            {test.percentage}%
                          </td>

                          <td>

                            <div
                              className="progress"
                              style={{
                                height: "10px",
                                minWidth: "100px"
                              }}
                            >

                              <div
                                className={`progress-bar ${
                                  test.percentage >= 40
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                                role="progressbar"
                                style={{
                                  width: `${Math.min(
                                    test.percentage,
                                    100
                                  )}%`
                                }}
                              ></div>

                            </div>

                          </td>

                          <td>

                            {test.status === "PASSED" ? (

                              <span className="badge bg-success">
                                PASSED
                              </span>

                            ) : (

                              <span className="badge bg-danger">
                                FAILED
                              </span>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>


       

      </div>

    </div>
  );
}

export default StudentPerformance;

