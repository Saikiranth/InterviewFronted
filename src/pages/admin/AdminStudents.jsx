
import { useEffect, useState } from "react";
import api from "../../services/api";

console.log("AdminStudents page loaded");

function AdminStudents() {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Fetching students...");
    fetchStudents();
  }, []);

  const fetchStudents = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      console.log("Token exists:", !!token);

      if (!token) {
        setError("No login token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await api.get(
        "/api/admin/students",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Students API response:", response.data);

      if (Array.isArray(response.data)) {

        setStudents(response.data);

      } else {

        console.error(
          "Unexpected API response:",
          response.data
        );

        setError("Unexpected response from server.");
      }

    } catch (error) {

      console.error("Students API error:", error);

      if (error.response?.status === 401) {

        setError(
          "Unauthorized. Please login again."
        );

      } else if (error.response?.status === 403) {

        setError(
          "You don't have permission to view students."
        );

      } else if (error.response?.status === 404) {

        setError(
          "Students API endpoint was not found."
        );

      } else {

        setError(
          "Failed to load students."
        );
      }

    } finally {

      setLoading(false);

    }
  };


  /* Loading */

  if (loading) {

    return (
      <div className="container-fluid p-4">

        <div className="card shadow-sm border-0">

          <div className="card-body text-center py-5">

            <div
              className="spinner-border text-primary"
              role="status"
            >
            </div>

            <h5 className="mt-3">
              Loading Students...
            </h5>

          </div>

        </div>

      </div>
    );
  }


  /* Error */

  if (error) {

    return (
      <div className="container-fluid p-4">

        <div className="card shadow-sm border-0">

          <div className="card-body">

            <div className="alert alert-danger">
              {error}
            </div>

            <button
              className="btn btn-primary"
              onClick={fetchStudents}
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* Students Page */

  return (

    <div className="container-fluid p-4">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Students
          </h2>

          <p className="text-muted mb-0">
            Manage registered students
          </p>

        </div>

        <span className="badge bg-primary fs-6 px-3 py-2">

          Total Students: {students.length}

        </span>

      </div>


      {/* Students Card */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          {/* Card Header */}

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">
              Registered Students
            </h5>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={fetchStudents}
            >
              ↻ Refresh
            </button>

          </div>


          {/* Table */}

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>

                  <th>#</th>

                  <th>Student Name</th>

                  <th>Email</th>

                  <th>Role</th>

                </tr>

              </thead>

              <tbody>

                {students.length === 0 ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="text-center text-muted py-5"
                    >
                      No students found.
                    </td>

                  </tr>

                ) : (

                  students.map((student, index) => (

                    <tr key={student.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>

                        <strong>
                          {student.name || "N/A"}
                        </strong>

                      </td>

                      <td>
                        {student.email || "N/A"}
                      </td>

                      <td>

                        <span className="badge bg-success">

                          {student.role || "STUDENT"}

                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );
}

export default AdminStudents;

