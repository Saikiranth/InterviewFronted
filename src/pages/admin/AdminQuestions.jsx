
import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminQuestions() {

  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Options
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [optionText, setOptionText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  // Bootstrap message
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    difficulty: "",
    marks: "",
    topicId: ""
  });

  useEffect(() => {
    fetchQuestions();
    fetchTopics();
  }, []);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // SHOW MESSAGE
  // =========================================================

  const showMessage = (text, type = "success") => {

    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // =========================================================
  // GET QUESTIONS
  // =========================================================

  const fetchQuestions = async () => {

    try {

      setLoading(true);

      const response = await api.get(
        "/api/admin/questions",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setQuestions(response.data);

    } catch (error) {

      console.error(
        "Questions API error:",
        error
      );

      if (error.response?.status === 401) {

        showMessage(
          "Unauthorized. Please login again.",
          "danger"
        );

      } else if (error.response?.status === 403) {

        showMessage(
          "You don't have permission to view questions.",
          "danger"
        );

      } else {

        showMessage(
          "Failed to load questions.",
          "danger"
        );
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

      const response = await api.get(
        "/api/topics",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setTopics(response.data);

    } catch (error) {

      console.error(
        "Topics API error:",
        error
      );

      showMessage(
        "Failed to load topics.",
        "danger"
      );
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
  // CREATE QUESTION
  // =========================================================

  const handleCreateQuestion = async (event) => {

    event.preventDefault();

    // Clear previous message
    setMessage("");

    if (!formData.question.trim()) {

      showMessage(
        "Please enter question.",
        "warning"
      );

      return;
    }

    if (!formData.answer.trim()) {

      showMessage(
        "Please enter answer.",
        "warning"
      );

      return;
    }

    if (!formData.difficulty) {

      showMessage(
        "Please select difficulty.",
        "warning"
      );

      return;
    }

    if (
      !formData.marks ||
      Number(formData.marks) <= 0
    ) {

      showMessage(
        "Marks must be greater than 0.",
        "warning"
      );

      return;
    }

    if (!formData.topicId) {

      showMessage(
        "Please select topic.",
        "warning"
      );

      return;
    }

    try {

      const questionData = {

        question: formData.question.trim(),

        answer: formData.answer.trim(),

        difficulty: formData.difficulty,

        marks: Number(formData.marks),

        topic: {
          id: Number(formData.topicId)
        }

      };

      await api.post(
        "/api/admin/questions",
        questionData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        }
      );

      // SUCCESS MESSAGE
      showMessage(
        "Question created successfully.",
        "success"
      );

      setFormData({
        question: "",
        answer: "",
        difficulty: "",
        marks: "",
        topicId: ""
      });

      setShowForm(false);

      fetchQuestions();

    } catch (error) {

      console.error(
        "Create question error:",
        error
      );

      if (
        typeof error.response?.data === "string"
      ) {

        showMessage(
          error.response.data,
          "danger"
        );

      } else {

        showMessage(
          "Failed to create question.",
          "danger"
        );
      }
    }
  };

  // =========================================================
  // DELETE QUESTION
  // =========================================================

  const handleDelete = async (questionId) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this question?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await api.delete(
        `/api/admin/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      showMessage(
        "Question deleted successfully.",
        "success"
      );

      fetchQuestions();

    } catch (error) {

      console.error(
        "Delete question error:",
        error
      );

      if (
        typeof error.response?.data === "string"
      ) {

        showMessage(
          error.response.data,
          "danger"
        );

      } else {

        showMessage(
          "Failed to delete question.",
          "danger"
        );
      }
    }
  };

  // =========================================================
  // OPEN OPTIONS
  // =========================================================

  const handleManageOptions = async (question) => {

    setSelectedQuestion(question);

    setOptions([]);

    setOptionText("");

    setIsCorrect(false);

    setMessage("");

    try {

      setLoadingOptions(true);

      const response = await api.get(
        `/api/admin/questions/${question.id}/options`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setOptions(response.data);

    } catch (error) {

      console.error(
        "Options API error:",
        error
      );

      showMessage(
        "Failed to load options.",
        "danger"
      );

    } finally {

      setLoadingOptions(false);

    }
  };

  // =========================================================
  // ADD OPTION
  // =========================================================

  const handleAddOption = async (event) => {

    event.preventDefault();

    setMessage("");

    if (!optionText.trim()) {

      showMessage(
        "Please enter option text.",
        "warning"
      );

      return;
    }

    try {

      const optionData = {

        optionText: optionText.trim(),

        correct: isCorrect

      };

      const response = await api.post(
        `/api/admin/questions/${selectedQuestion.id}/options`,
        optionData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        }
      );

      setOptions([
        ...options,
        response.data
      ]);

      setOptionText("");

      setIsCorrect(false);

      showMessage(
        "Option added successfully.",
        "success"
      );

    } catch (error) {

      console.error(
        "Add option error:",
        error
      );

      if (
        typeof error.response?.data === "string"
      ) {

        showMessage(
          error.response.data,
          "danger"
        );

      } else {

        showMessage(
          "Failed to add option.",
          "danger"
        );
      }
    }
  };

  // =========================================================
  // DELETE OPTION
  // =========================================================

  const handleDeleteOption = async (optionId) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this option?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      await api.delete(
        `/api/admin/questions/options/${optionId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      setOptions(
        options.filter(
          option => option.id !== optionId
        )
      );

      showMessage(
        "Option deleted successfully.",
        "success"
      );

    } catch (error) {

      console.error(
        "Delete option error:",
        error
      );

      showMessage(
        "Failed to delete option.",
        "danger"
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
              Loading Questions...
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
            Question Bank
          </h2>

          <p className="text-muted mb-0">
            Manage interview questions
          </p>

        </div>

        <div className="d-flex gap-2">

          <span className="badge bg-primary fs-6 px-3 py-2">
            Total Questions: {questions.length}
          </span>

          <button
            className="btn btn-primary"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm
              ? "✕ Close"
              : "＋ Add Question"}
          </button>

          <button
            className="btn btn-outline-primary"
            onClick={fetchQuestions}
          >
            ↻ Refresh
          </button>

        </div>

      </div>


      {/* BOOTSTRAP MESSAGE */}

      {message && (

        <div
          className={`alert alert-${messageType} alert-dismissible fade show`}
          role="alert"
        >

          {message}

          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          ></button>

        </div>

      )}


      {/* CREATE QUESTION */}

      {showForm && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-4">
              Add New Question
            </h5>

            <form onSubmit={handleCreateQuestion}>

              <div className="row g-3">

                <div className="col-md-8">

                  <label className="form-label fw-semibold">
                    Question
                  </label>

                  <textarea
                    name="question"
                    className="form-control"
                    rows="3"
                    placeholder="Enter question"
                    value={formData.question}
                    onChange={handleChange}
                  />

                </div>

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Answer
                  </label>

                  <textarea
                    name="answer"
                    className="form-control"
                    rows="3"
                    placeholder="Enter correct answer"
                    value={formData.answer}
                    onChange={handleChange}
                  />

                </div>

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Topic
                  </label>

                  <select
                    name="topicId"
                    className="form-select"
                    value={formData.topicId}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Topic
                    </option>

                    {topics.map(topic => (

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

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Difficulty
                  </label>

                  <select
                    name="difficulty"
                    className="form-select"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Difficulty
                    </option>

                    <option value="EASY">
                      EASY
                    </option>

                    <option value="MEDIUM">
                      MEDIUM
                    </option>

                    <option value="HARD">
                      HARD
                    </option>

                  </select>

                </div>

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Marks
                  </label>

                  <input
                    type="number"
                    name="marks"
                    className="form-control"
                    min="1"
                    placeholder="Enter marks"
                    value={formData.marks}
                    onChange={handleChange}
                  />

                </div>

              </div>

              <div className="mt-4">

                <button
                  type="submit"
                  className="btn btn-success"
                >
                  ✓ Create Question
                </button>

                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* QUESTION TABLE */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            Available Questions
          </h5>

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>

                  <th>#</th>
                  <th>Question</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Marks</th>
                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {questions.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center text-muted py-5"
                    >
                      No questions found.
                    </td>

                  </tr>

                ) : (

                  questions.map(
                    (question, index) => (

                      <tr key={question.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td
                          style={{
                            minWidth: "350px"
                          }}
                        >
                          {question.question}
                        </td>

                        <td>
                          {question.topic?.name ||
                            "N/A"}
                        </td>

                        <td>

                          <span className="badge bg-warning text-dark">
                            {question.difficulty}
                          </span>

                        </td>

                        <td>
                          <strong>
                            {question.marks}
                          </strong>
                        </td>

                        <td>

                          <div className="d-flex gap-2">

                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleManageOptions(
                                  question
                                )
                              }
                            >
                              ⚙ Options
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  question.id
                                )
                              }
                            >
                              🗑 Delete
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


      {/* OPTIONS SECTION */}

      {selectedQuestion && (

        <div className="card border-0 shadow mt-4">

          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>

                <h5 className="fw-bold">
                  Manage Options
                </h5>

                <p className="text-muted mb-0">
                  {selectedQuestion.question}
                </p>

              </div>

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setSelectedQuestion(null)
                }
              >
                ✕ Close
              </button>

            </div>


            {/* ADD OPTION */}

            <form onSubmit={handleAddOption}>

              <div className="row g-3 align-items-end">

                <div className="col-md-7">

                  <label className="form-label fw-semibold">
                    Option Text
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter option"
                    value={optionText}
                    onChange={(e) =>
                      setOptionText(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="col-md-3">

                  <div className="form-check mb-2">

                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="correctOption"
                      checked={isCorrect}
                      onChange={(e) =>
                        setIsCorrect(
                          e.target.checked
                        )
                      }
                    />

                    <label
                      className="form-check-label"
                      htmlFor="correctOption"
                    >
                      Correct Answer
                    </label>

                  </div>

                </div>

                <div className="col-md-2">

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                  >
                    + Add Option
                  </button>

                </div>

              </div>

            </form>


            {/* OPTIONS LIST */}

            <div className="mt-4">

              <h6 className="fw-bold">
                Existing Options
              </h6>

              {loadingOptions ? (

                <div className="text-center py-4">

                  <div className="spinner-border text-primary" />

                </div>

              ) : options.length === 0 ? (

                <div className="alert alert-info">
                  No options added yet.
                </div>

              ) : (

                <div className="list-group">

                  {options.map(
                    (option, index) => (

                      <div
                        key={option.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >

                        <div>

                          <strong>
                            {String.fromCharCode(
                              65 + index
                            )}.
                          </strong>{" "}

                          {option.optionText}

                          {option.correct && (

                            <span className="badge bg-success ms-2">
                              ✓ Correct
                            </span>

                          )}

                        </div>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            handleDeleteOption(
                              option.id
                            )
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminQuestions;

