import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminTests() {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    topicId: "",
    testType: ""
  });

  useEffect(() => {
    fetchTests();
    fetchTopics();
  }, []);

  // =========================================================
  // TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // GET TESTS
  // =========================================================

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("No login token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await api.get("/api/tests", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Tests API response:", response.data);

      if (Array.isArray(response.data)) {
        setTests(response.data);
      } else {
        setError("Unexpected response from server.");
      }

    } catch (error) {
      console.error("Tests API error:", error);

      if (error.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view tests.");
      } else if (error.response?.status === 404) {
        setError("Tests API endpoint was not found.");
      } else {
        setError("Failed to load tests.");
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET TOPICS
  // =========================================================

  const fetchTopics = async () => {
    try {
      setLoadingTopics(true);

      const token = getToken();

      const response = await api.get("/api/topics", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Topics API response:", response.data);

      if (Array.isArray(response.data)) {
        setTopics(response.data);
      }

    } catch (error) {
      console.error("Topics API error:", error);
      alert("Failed to load topics.");

    } finally {
      setLoadingTopics(false);
    }
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // =========================================================
  // CREATE TEST
  // =========================================================

  const handleCreateTest = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter test name.");
      return;
    }

    if (!formData.topicId) {
      alert("Please select a topic.");
      return;
    }

    if (!formData.testType) {
      alert("Please select test type.");
      return;
    }

    try {
      const token = getToken();

      const testData = {
        name: formData.name.trim(),

        topic: {
          id: Number(formData.topicId)
        },

        testType: formData.testType,

        totalQuestions: 0,

        totalMarks: 0,

        questions: []
      };

      console.log("Creating test:", testData);

      const response = await api.post(
        "/api/tests",
        testData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Create test response:", response.data);

      alert("Test created successfully.");

      setFormData({
        name: "",
        topicId: "",
        testType: ""
      });

      setShowCreateForm(false);

      fetchTests();

    } catch (error) {
      console.error("Create test error:", error);

      if (typeof error.response?.data === "string") {
        alert(error.response.data);
      } else {
        alert("Failed to create test.");
      }
    }
  };

  // =========================================================
  // DELETE TEST
  // =========================================================

  const handleDelete = async (testId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this test?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = getToken();

      await api.delete(
        `/api/tests/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Test deleted successfully.");

      fetchTests();

    } catch (error) {
      console.error("Delete test error:", error);

      if (typeof error.response?.data === "string") {
        alert(error.response.data);
      } else {
        alert("Failed to delete test.");
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
              Loading Tests...
            </h5>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="container-fluid p-4">

        <div className="card border-0 shadow-sm">

          <div className="card-body">

            <div className="alert alert-danger">
              {error}
            </div>

            <button
              className="btn btn-primary"
              onClick={fetchTests}
            >
              Try Again
            </button>

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
            Tests
          </h2>

          <p className="text-muted mb-0">
            Manage interview readiness tests
          </p>

        </div>

        <div className="d-flex gap-2">

          <span className="badge bg-primary fs-6 px-3 py-2">
            Total Tests: {tests.length}
          </span>

          <button
            className="btn btn-primary"
            onClick={() =>
              setShowCreateForm(!showCreateForm)
            }
          >
            {showCreateForm
              ? "✕ Close"
              : "＋ Create Test"}
          </button>

          <button
            className="btn btn-outline-primary"
            onClick={fetchTests}
          >
            ↻ Refresh
          </button>

        </div>

      </div>

      {/* CREATE TEST FORM */}

      {showCreateForm && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-4">
              Create New Test
            </h5>

            <form onSubmit={handleCreateTest}>

              <div className="row g-3">

                {/* TEST NAME */}

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Test Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter test name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                </div>

                {/* TOPIC */}

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Topic
                  </label>

                  <select
                    name="topicId"
                    className="form-select"
                    value={formData.topicId}
                    onChange={handleChange}
                    disabled={loadingTopics}
                  >

                    <option value="">
                      {loadingTopics
                        ? "Loading topics..."
                        : "Select Topic"}
                    </option>

                    {topics.map((topic) => (

                      <option
                        key={topic.id}
                        value={topic.id}
                      >

                        {topic.name}

                        {topic.category
                          ? ` (${topic.category})`
                          : ""}

                      </option>

                    ))}

                  </select>

                </div>

                {/* TEST TYPE */}

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Test Type
                  </label>

                  <select
                    name="testType"
                    className="form-select"
                    value={formData.testType}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Test Type
                    </option>

                    <option value="THEORETICAL">
                      THEORETICAL
                    </option>

                    <option value="LOGICAL_CODING">
                      LOGICAL CODING
                    </option>

                    <option value="MCQ">
                      MCQ
                    </option>

                    <option value="MSQ">
                      MSQ
                    </option>

                  </select>

                </div>

              </div>

              <div className="mt-4">

                <button
                  type="submit"
                  className="btn btn-success"
                >
                  ✓ Create Test
                </button>

                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* TEST TABLE */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Available Tests
          </h5>

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>

                  <th>#</th>
                  <th>Test Name</th>
                  <th>Topic</th>
                  <th>Test Type</th>
                  <th>Questions</th>
                  <th>Total Marks</th>
                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {tests.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center text-muted py-5"
                    >
                      No tests found.
                    </td>

                  </tr>

                ) : (

                  tests.map((test, index) => (

                    <tr key={test.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>

                        <strong>
                          {test.name || "N/A"}
                        </strong>

                      </td>

                      <td>
                        {test.topic?.name || "N/A"}
                      </td>

                      <td>

                        <span className="badge bg-info text-dark">
                          {test.testType || "N/A"}
                        </span>

                      </td>

                      <td>

                        <span className="badge bg-secondary">
                          {test.totalQuestions ?? 0}
                        </span>

                      </td>

                      <td>

                        <strong>
                          {test.totalMarks ?? 0}
                        </strong>

                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              navigate(
                                `/admin/tests/${test.id}/questions`
                              )
                            }
                          >
                            ⚙ Manage Questions
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(test.id)
                            }
                          >
                            🗑 Delete
                          </button>

                        </div>

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

export default AdminTests;