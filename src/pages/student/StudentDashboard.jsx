
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function StudentDashboard() {

  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");


  useEffect(() => {
    fetchAssignments();
  }, []);


  const fetchAssignments = async () => {

    try {

      setLoading(true);

      const response = await api.get(
        "/api/student/test-assignments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssignments(response.data);

    } catch (error) {

      console.error(
        "Failed to load assigned tests:",
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
          "Failed to load assigned tests."
        );
      }

    } finally {

      setLoading(false);
    }
  };


  const handleStartTest = (assignment) => {

    navigate(
      `/student/tests/${assignment.testId}`
    );
  };


  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/login");
  };


  const totalTests = assignments.length;


  const completedTests =
    assignments.filter(
      (assignment) =>
        assignment.status === "COMPLETED"
    ).length;


  const pendingTests =
    assignments.filter(
      (assignment) =>
        assignment.status !== "COMPLETED"
    ).length;


  if (loading) {

    return (
      <div className="container mt-5 text-center">

        <div className="spinner-border text-primary"></div>

        <p className="mt-3">
          Loading dashboard...
        </p>

      </div>
    );
  }


  return (

    <div className="min-vh-100 bg-light">


      {/* ================================
          NAVBAR
      ================================= */}

      <nav className="navbar navbar-dark bg-dark">

        <div className="container">

          <span className="navbar-brand fw-bold">
            Interview Readiness
          </span>


          <div className="d-flex align-items-center gap-2">

            {/* DASHBOARD */}

            <button
              className="btn btn-outline-light"
              onClick={() =>
                navigate("/student/dashboard")
              }
            >
              Dashboard
            </button>


            {/* MY TESTS */}

            <button
              className="btn btn-outline-light"
              onClick={() =>
                navigate("/student/dashboard")
              }
            >
              My Tests
            </button>


            {/* RESULTS */}

            <button
              className="btn btn-outline-light"
              onClick={() =>
                navigate("/student/results")
              }
            >
              Results
            </button>


            {/* PERFORMANCE */}

            <button
              className="btn btn-outline-light"
              onClick={() =>
                navigate("/student/performance")
              }
            >
              Performance
            </button>


            {/* STUDENT */}

            <span className="text-white ms-2">
              Student
            </span>


            {/* LOGOUT */}

            <button
              className="btn btn-outline-light ms-1"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </nav>


      {/* ================================
          MAIN
      ================================= */}

      <div className="container py-4">


        {/* HEADER */}

        <div className="mb-4">

          <h2 className="fw-bold">
            Student Dashboard
          </h2>

          <p className="text-muted">
            View your assigned tests and start your assessments.
          </p>

        </div>


        {/* ================================
            SUMMARY CARDS
        ================================= */}

        <div className="row g-4 mb-5">


          {/* TOTAL */}

          <div className="col-md-4">

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h6 className="text-muted">
                  Total Assigned Tests
                </h6>

                <h2 className="fw-bold text-primary">
                  {totalTests}
                </h2>

              </div>

            </div>

          </div>


          {/* PENDING */}

          <div className="col-md-4">

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h6 className="text-muted">
                  Pending Tests
                </h6>

                <h2 className="fw-bold text-warning">
                  {pendingTests}
                </h2>

              </div>

            </div>

          </div>


          {/* COMPLETED */}

          <div className="col-md-4">

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h6 className="text-muted">
                  Completed Tests
                </h6>

                <h2 className="fw-bold text-success">
                  {completedTests}
                </h2>

              </div>

            </div>

          </div>

        </div>


        {/* ================================
            PERFORMANCE CARD
        ================================= */}

        <div className="card shadow-sm border-0 mb-5">

          <div className="card-body">

            <div className="row align-items-center">

              <div className="col-md-8">

                <h4 className="fw-bold mb-2">
                  My Performance
                </h4>

                <p className="text-muted mb-md-0">
                  View your test scores, pass/fail status,
                  average score and overall performance.
                </p>

              </div>


              <div className="col-md-4 text-md-end mt-3 mt-md-0">

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate("/student/performance")
                  }
                >
                  View Performance
                </button>

              </div>

            </div>

          </div>

        </div>


        {/* ================================
            TESTS
        ================================= */}

        <div className="d-flex justify-content-between align-items-center mb-3">

          <h4 className="fw-bold">
            My Assigned Tests
          </h4>


          <button
            className="btn btn-outline-primary"
            onClick={fetchAssignments}
          >
            Refresh
          </button>

        </div>


        {assignments.length === 0 ? (

          <div className="alert alert-info">
            No tests have been assigned to you yet.
          </div>

        ) : (

          <div className="row g-4">

            {assignments.map(
              (assignment) => (

                <div
                  className="col-md-6 col-lg-4"
                  key={assignment.id}
                >

                  <div className="card shadow-sm border-0 h-100">

                    <div className="card-body d-flex flex-column">


                      {/* TEST NAME */}

                      <h5 className="fw-bold mb-3">
                        {assignment.testName}
                      </h5>


                      {/* STATUS */}

                      <div className="mb-3">

                        {assignment.status ===
                        "COMPLETED" ? (

                          <span className="badge bg-success">
                            COMPLETED
                          </span>

                        ) : (

                          <span className="badge bg-warning text-dark">
                            ASSIGNED
                          </span>

                        )}

                      </div>


                      {/* DETAILS */}

                      <div className="mb-3">

                        <p className="mb-2">

                          <strong>
                            Questions:
                          </strong>{" "}

                          {assignment.totalQuestions}

                        </p>


                        <p className="mb-2">

                          <strong>
                            Total Marks:
                          </strong>{" "}

                          {assignment.totalMarks}

                        </p>


                        <p className="mb-2">

                          <strong>
                            Assigned Date:
                          </strong>{" "}

                          {assignment.assignedDate
                            ? new Date(
                                assignment.assignedDate
                              ).toLocaleDateString()
                            : "N/A"}

                        </p>

                      </div>


                      {/* ACTION */}

                      <div className="mt-auto">

                        {assignment.status ===
                        "COMPLETED" ? (

                          <button
                            className="btn btn-secondary w-100"
                            disabled
                          >
                            Test Completed
                          </button>

                        ) : assignment.totalQuestions ===
                          0 ? (

                          <button
                            className="btn btn-warning w-100"
                            disabled
                          >
                            Questions Not Available
                          </button>

                        ) : (

                          <button
                            className="btn btn-primary w-100"
                            onClick={() =>
                              handleStartTest(
                                assignment
                              )
                            }
                          >
                            Start Test
                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default StudentDashboard;

