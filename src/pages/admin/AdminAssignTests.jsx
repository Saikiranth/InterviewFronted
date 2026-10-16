import { useEffect, useState } from "react";
import api from "../../services/api";

// "2026-10-20T18:00:00" -> "2026-10-20 18:00 IST"
const formatSchedule = (value) => {
  if (!value) {
    return null;
  }

  return `${String(value).slice(0, 16).replace("T", " ")} IST`;
};

// Current time in IST as "YYYY-MM-DDTHH:mm", same shape as the stored dates
const nowInIst = () => {
  return new Date()
    .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
    .replace(" ", "T")
    .slice(0, 16);
};

// COMPLETED, UPCOMING, EXPIRED or OPEN
const getAvailability = (assignment) => {
  if (assignment.status === "COMPLETED") {
    return "COMPLETED";
  }

  const now = nowInIst();

  if (
    assignment.startDate &&
    now < String(assignment.startDate).slice(0, 16)
  ) {
    return "UPCOMING";
  }

  if (
    assignment.deadline &&
    now > String(assignment.deadline).slice(0, 16)
  ) {
    return "EXPIRED";
  }

  return "OPEN";
};

const availabilityBadge = (availability) => {
  switch (availability) {
    case "COMPLETED":
      return <span className="badge bg-success">COMPLETED</span>;

    case "UPCOMING":
      return <span className="badge bg-info text-dark">UPCOMING</span>;

    case "EXPIRED":
      return <span className="badge bg-danger">EXPIRED</span>;

    default:
      return <span className="badge bg-warning text-dark">OPEN</span>;
  }
};

function AdminAssignTests() {
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [selectedTestId, setSelectedTestId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");

  // { id, testName, studentName, startDate, deadline } while editing
  const [editing, setEditing] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getErrorMessage = (error, fallback) => {
    return typeof error.response?.data === "string" &&
      error.response.data
      ? error.response.data
      : fallback;
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
  // GET STUDENTS (active students only)
  // =========================================================

  const fetchStudents = async () => {
    try {
      const response = await api.get(
        "/api/admin/students?activeOnly=true",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

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

    if (startDate && deadline && deadline <= startDate) {
      alert("The deadline must be after the start date.");
      return;
    }

    try {
      setAssigning(true);

      // Only send the dates that were filled in
      const params = new URLSearchParams({
        testId: selectedTestId,
        studentId: selectedStudentId
      });

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (deadline) {
        params.append("deadline", deadline);
      }

      await api.post(
        `/api/admin/test-assignments/assign?${params.toString()}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        }
      );

      alert("Test assigned successfully.");

      setSelectedTestId("");
      setSelectedStudentId("");
      setStartDate("");
      setDeadline("");

      await fetchAssignments();

    } catch (error) {
      console.error(
        "Assign test error:",
        error
      );

      alert(
        getErrorMessage(
          error,
          "Failed to assign test. It may already be assigned to this student."
        )
      );

    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // EDIT DATES
  // =========================================================

  const openScheduleEditor = (assignment) => {
    setEditing({
      id: assignment.id,
      testName: assignment.testName,
      studentName: assignment.studentName,
      startDate: assignment.startDate
        ? String(assignment.startDate).slice(0, 16)
        : "",
      deadline: assignment.deadline
        ? String(assignment.deadline).slice(0, 16)
        : ""
    });
  };

  const saveSchedule = async (clearBoth) => {
    if (!editing) {
      return;
    }

    const newStart = clearBoth ? "" : editing.startDate;
    const newDeadline = clearBoth ? "" : editing.deadline;

    if (newStart && newDeadline && newDeadline <= newStart) {
      alert("The deadline must be after the start date.");
      return;
    }

    try {
      setSavingSchedule(true);

      await api.put(
        `/api/admin/test-assignments/${editing.id}/schedule`,
        {
          startDate: newStart || null,
          deadline: newDeadline || null
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        }
      );

      setEditing(null);

      await fetchAssignments();

    } catch (error) {
      console.error("Update schedule error:", error);

      alert(
        getErrorMessage(error, "Failed to update the dates.")
      );

    } finally {
      setSavingSchedule(false);
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

      alert(
        getErrorMessage(
          error,
          "Failed to remove assignment."
        )
      );
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
            Assign tests to students, with an optional start date and deadline
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

              <div className="col-md-6">

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

              <div className="col-md-6">

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

              {/* START DATE */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  Start date (optional, IST)
                </label>

                <input
                  type="datetime-local"
                  className="form-control"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />

                <small className="text-muted">
                  Empty = available immediately
                </small>

              </div>

              {/* DEADLINE */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  Deadline (optional, IST)
                </label>

                <input
                  type="datetime-local"
                  className="form-control"
                  value={deadline}
                  onChange={(event) =>
                    setDeadline(event.target.value)
                  }
                />

                <small className="text-muted">
                  Empty = no deadline
                </small>

              </div>

              {/* BUTTON */}

              <div className="col-md-4 d-flex align-items-end">

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

      {/* EDIT DATES */}

      {editing && (

        <div className="card border-0 shadow-sm mb-4 border-start border-4 border-warning">

          <div className="card-body">

            <h5 className="fw-bold mb-1">
              Edit dates
            </h5>

            <p className="text-muted">
              {editing.testName} for {editing.studentName}
            </p>

            <div className="row g-3 align-items-end">

              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  Start date (IST)
                </label>

                <input
                  type="datetime-local"
                  className="form-control"
                  value={editing.startDate}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      startDate: event.target.value
                    })
                  }
                />

              </div>

              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  Deadline (IST)
                </label>

                <input
                  type="datetime-local"
                  className="form-control"
                  value={editing.deadline}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      deadline: event.target.value
                    })
                  }
                />

              </div>

              <div className="col-md-4 d-flex gap-2">

                <button
                  className="btn btn-success"
                  onClick={() => saveSchedule(false)}
                  disabled={savingSchedule}
                >
                  {savingSchedule ? "Saving..." : "Save"}
                </button>

                <button
                  className="btn btn-outline-danger"
                  onClick={() => saveSchedule(true)}
                  disabled={savingSchedule}
                >
                  Remove both dates
                </button>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setEditing(null)}
                  disabled={savingSchedule}
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

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
                Active Students
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
                  <th>Assigned Date</th>
                  <th>Schedule</th>
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

                          <small className="d-block text-muted">
                            {assignment.studentEmail ||
                              "N/A"}
                          </small>

                        </td>

                        <td>
                          {assignment.assignedDate
                            ? new Date(
                                assignment.assignedDate
                              ).toLocaleString()
                            : "N/A"}
                        </td>

                        <td>

                          {assignment.startDate ||
                          assignment.deadline ? (

                            <>
                              {assignment.startDate && (
                                <small className="d-block">
                                  Opens:{" "}
                                  {formatSchedule(
                                    assignment.startDate
                                  )}
                                </small>
                              )}

                              {assignment.deadline && (
                                <small className="d-block">
                                  Due:{" "}
                                  {formatSchedule(
                                    assignment.deadline
                                  )}
                                </small>
                              )}
                            </>

                          ) : (

                            <small className="text-muted">
                              No limits
                            </small>

                          )}

                        </td>

                        <td>

                          {availabilityBadge(
                            getAvailability(assignment)
                          )}

                        </td>

                        <td>

                          <div className="d-flex gap-2 flex-wrap">

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                openScheduleEditor(
                                  assignment
                                )
                              }
                            >
                              📅 Edit dates
                            </button>

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

                          </div>

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
