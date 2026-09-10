import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminAssignTests() {
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [selectedTestId, setSelectedTestId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // LOAD ALL DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    await Promise.all([
      fetchTests(),
      fetchStudents(),
      fetchAssignments()
    ]);

    setLoading(false);
  };

  // =========================================================
  // GET TESTS
  // =========================================================

  const fetchTests = async () => {
    try {
      const response = await api.get("/api/tests", {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      console.log("Tests:", response.data);

      setTests(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error("Failed to load tests:", error);
      alert("Failed to load tests.");
    }
  };

  // =========================================================
  // GET STUDENTS
  // =========================================================

  const fetchStudents = async () => {
    try {
      const response = await api.get(
        "/api/admin/students",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      console.log("Students:", response.data);

      setStudents(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load students:",
        error
      );

      alert("Failed to load students.");
    }
  };

  // =========================================================
  // GET ASSIGNMENTS
  // =========================================================

  const fetchAssignments = async () => {
    try {
      const response = await api.get(
        "/api/admin/test-assignments",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      console.log(
        "Assignments:",
        response.data
      );

      setAssignments(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load assignments:",
        error
      );

      alert("Failed to load assignments.");
    }
  };

  // =========================================================
  // ASSIGN TEST
  // =========================================================

  const handleAssignTest = async (event) => {
    event.preventDefault();

    if (!selectedTestId) {
      alert("Please select a test.");
      return;
    }

    if (!selectedStudentId) {
      alert("Please select a student.");
      return;
    }

    try {
      setAssigning(true);

      const response = await api.post(
        `/api/admin/test-assignments/assign?testId=${selectedTestId}&studentId=${selectedStudentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log(
        "Assign test response:",
        response.data
      );

      alert("Test assigned successfully.");

      setSelectedTestId("");
      setSelectedStudentId("");

      await fetchAssignments();

    } catch (error) {
      console.error(
        "Assign test error:",
        error
      );

      if (
        typeof error.response?.data === "string"
      ) {
        alert(error.response.data);
      } else {
        alert(
          "Failed to assign test. It may already be assigned to this student."
        );
      }

    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // DELETE ASSIGNMENT
  // =========================================================

  const handleDeleteAssignment = async (
    assignmentId
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this test assignment?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(
        `/api/admin/test-assignments/${assignmentId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      alert(
        "Test assignment removed successfully."
      );

      fetchAssignments();

    } catch (error) {
      console.error(
        "Delete assignment error:",
        error
      );

      if (
        typeof error.response?.data === "string"
      ) {
        alert(error.response.data);
      } else {
        alert(
          "Failed to remove assignment."
        );
      }
    }
  };

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
              Loading Assignments...
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
            Assign Tests
          </h2>

          <p className="text-muted mb-0">
            Assign tests to students
          </p>

        </div>

        <div className="d-flex gap-2">

          <span className="badge bg-primary fs-6 px-3 py-2">
            Assignments: {assignments.length}
          </span>

          <button
            className="btn btn-outline-primary"
            onClick={loadData}
          >
            ↻ Refresh
          </button>

        </div>

      </div>

      {/* ASSIGN FORM */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-4">
            Assign New Test
          </h5>

          <form onSubmit={handleAssignTest}>

            <div className="row g-3">

              {/* TEST */}

              <div className="col-md-5">

                <label className="form-label fw-semibold">
                  Select Test
                </label>

                <select
                  className="form-select"
                  value={selectedTestId}
                  onChange={(event) =>
                    setSelectedTestId(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select Test
                  </option>

                  {tests.map((test) => (

                    <option
                      key={test.id}
                      value={test.id}
                    >
                      {test.name}
                      {" - "}
                      {test.totalQuestions ?? 0}
                      {" Questions / "}
                      {test.totalMarks ?? 0}
                      {" Marks"}
                    </option>

                  ))}

                </select>

              </div>

              {/* STUDENT */}

              <div className="col-md-5">

                <label className="form-label fw-semibold">
                  Select Student
                </label>

                <select
                  className="form-select"
                  value={selectedStudentId}
                  onChange={(event) =>
                    setSelectedStudentId(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select Student
                  </option>

                  {students.map((student) => (

                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.name}
                      {" - "}
                      {student.email}
                    </option>

                  ))}

                </select>

              </div>

              {/* BUTTON */}

              <div className="col-md-2 d-flex align-items-end">

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={assigning}
                >

                  {assigning
                    ? "Assigning..."
                    : "✓ Assign Test"}

                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

      {/* SUMMARY CARDS */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <small className="text-muted">
                Total Tests
              </small>

              <h3 className="fw-bold text-primary mt-2">
                {tests.length}
              </h3>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <small className="text-muted">
                Total Students
              </small>

              <h3 className="fw-bold text-success mt-2">
                {students.length}
              </h3>

            </div>

          </div>

        </div>

        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <small className="text-muted">
                Total Assignments
              </small>

              <h3 className="fw-bold text-info mt-2">
                {assignments.length}
              </h3>

            </div>

          </div>

        </div>

      </div>

      {/* ASSIGNMENT TABLE */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">
              Existing Assignments
            </h5>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={fetchAssignments}
            >
              ↻ Refresh
            </button>

          </div>

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>

                  <th>#</th>
                  <th>Test</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {assignments.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center text-muted py-5"
                    >
                      No test assignments found.
                    </td>

                  </tr>

                ) : (

                  assignments.map(
                    (assignment, index) => (

                      <tr
                        key={assignment.id}
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <strong>
                            {assignment.testName ||
                              "N/A"}
                          </strong>

                        </td>

                        <td>

                          <strong>
                            {assignment.studentName ||
                              "N/A"}
                          </strong>

                        </td>

                        <td>
                          {assignment.studentEmail ||
                            "N/A"}
                        </td>

                        <td>
                          {assignment.assignedDate
                            ? new Date(
                                assignment.assignedDate
                              ).toLocaleString()
                            : "N/A"}
                        </td>

                        <td>

                          <span
                            className={`badge ${
                              assignment.status ===
                              "COMPLETED"
                                ? "bg-success"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {assignment.status ||
                              "ASSIGNED"}
                          </span>

                        </td>

                        <td>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDeleteAssignment(
                                assignment.id
                              )
                            }
                          >
                            🗑 Remove
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminAssignTests;