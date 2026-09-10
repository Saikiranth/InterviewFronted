import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function ManageTestQuestions() {

  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // GET TEST
  // =========================================================

  const fetchTest = async () => {

    try {

      const response = await api.get(
        `/api/tests/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      console.log("Test API response:", response.data);

      setTest(response.data);

      if (
        Array.isArray(response.data.questions)
      ) {

        const existingQuestionIds =
          response.data.questions.map(
            question => question.id
          );

        setSelectedQuestions(
          existingQuestionIds
        );

      } else {

        setSelectedQuestions([]);

      }

    } catch (error) {

      console.error(
        "Get test error:",
        error
      );

      alert("Failed to load test.");

    }

  };

  // =========================================================
  // GET QUESTIONS
  // =========================================================

  const fetchQuestions = async () => {

    try {

      const response = await api.get(
        "/api/admin/questions",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      console.log(
        "Questions API response:",
        response.data
      );

      if (Array.isArray(response.data)) {

        setQuestions(response.data);

      } else {

        setQuestions([]);

      }

    } catch (error) {

      console.error(
        "Get questions error:",
        error
      );

      alert(
        "Failed to load questions."
      );

    }

  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {

    const loadData = async () => {

      setLoading(true);

      await Promise.all([
        fetchTest(),
        fetchQuestions()
      ]);

      setLoading(false);

    };

    loadData();

  }, [testId]);

  // =========================================================
  // SELECT QUESTION
  // =========================================================

  const handleQuestionSelect = (questionId) => {

    setSelectedQuestions(previous => {

      if (
        previous.includes(questionId)
      ) {

        return previous.filter(
          id => id !== questionId
        );

      }

      return [
        ...previous,
        questionId
      ];

    });

  };

  // =========================================================
  // SELECT ALL
  // =========================================================

  const handleSelectAll = () => {

    if (
      questions.length > 0 &&
      selectedQuestions.length ===
      questions.length
    ) {

      setSelectedQuestions([]);

    } else {

      setSelectedQuestions(
        questions.map(
          question => question.id
        )
      );

    }

  };

  // =========================================================
  // SAVE QUESTIONS
  // =========================================================

  const handleSaveQuestions = async () => {

    if (
      selectedQuestions.length === 0
    ) {

      alert(
        "Please select at least one question."
      );

      return;

    }

    try {

      setSaving(true);

      console.log(
        "Sending question IDs:",
        selectedQuestions
      );

      const response = await api.post(
        `/api/tests/${testId}/questions`,
        selectedQuestions,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log(
        "Save questions response:",
        response.data
      );

      alert(
        "Questions added to test successfully."
      );

      await fetchTest();

    } catch (error) {

      console.error(
        "Save questions error:",
        error
      );

      if (
        typeof error.response?.data ===
        "string"
      ) {

        alert(
          error.response.data
        );

      } else {

        alert(
          "Failed to add questions to test."
        );

      }

    } finally {

      setSaving(false);

    }

  };

  // =========================================================
  // SELECTED MARKS
  // =========================================================

  const selectedMarks = questions
    .filter(question =>
      selectedQuestions.includes(
        question.id
      )
    )
    .reduce(
      (total, question) =>
        total + (question.marks || 0),
      0
    );

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
              Loading Test Questions...
            </h5>

          </div>

        </div>

      </div>

    );

  }

  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="container-fluid p-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Manage Test Questions
          </h2>

          <p className="text-muted mb-0">

            Test:{" "}

            <strong>
              {test?.name || "N/A"}
            </strong>

          </p>

        </div>

        <button
          className="btn btn-secondary"
          onClick={() =>
            navigate("/admin/tests")
          }
        >
          ← Back to Tests
        </button>

      </div>

      {/* SUMMARY */}

      <div className="row g-3 mb-4">

        {/* TEST */}

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Test Name
              </small>

              <h5 className="fw-bold mt-2">
                {test?.name || "N/A"}
              </h5>

            </div>

          </div>

        </div>

        {/* QUESTIONS */}

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Selected Questions
              </small>

              <h4 className="fw-bold text-primary mt-2">
                {selectedQuestions.length}
              </h4>

            </div>

          </div>

        </div>

        {/* MARKS */}

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">
                Selected Marks
              </small>

              <h4 className="fw-bold text-success mt-2">
                {selectedMarks}
              </h4>

            </div>

          </div>

        </div>

      </div>

      {/* QUESTIONS */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">
              Select Questions
            </h5>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={handleSelectAll}
              disabled={
                questions.length === 0
              }
            >
              {questions.length > 0 &&
              selectedQuestions.length ===
                questions.length
                ? "Unselect All"
                : "Select All"}
            </button>

          </div>

          {questions.length === 0 ? (

            <div className="alert alert-warning">

              No questions available.

              <br />

              Please create questions from
              the Question Bank.

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>
                      Select
                    </th>

                    <th>
                      #
                    </th>

                    <th>
                      Question
                    </th>

                    <th>
                      Topic
                    </th>

                    <th>
                      Difficulty
                    </th>

                    <th>
                      Marks
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {questions.map(
                    (question, index) => {

                      const isSelected =
                        selectedQuestions.includes(
                          question.id
                        );

                      return (

                        <tr
                          key={question.id}
                          className={
                            isSelected
                              ? "table-primary"
                              : ""
                          }
                        >

                          <td>

                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={
                                isSelected
                              }
                              onChange={() =>
                                handleQuestionSelect(
                                  question.id
                                )
                              }
                            />

                          </td>

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

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

          {/* FOOTER */}

          <div className="d-flex justify-content-between align-items-center mt-4">

            <div>

              <strong>
                {selectedQuestions.length}
              </strong>{" "}
              questions selected

              {" • "}

              <strong>
                {selectedMarks}
              </strong>{" "}
              total marks

            </div>

            <button
              className="btn btn-success"
              onClick={handleSaveQuestions}
              disabled={
                saving ||
                selectedQuestions.length === 0
              }
            >

              {saving
                ? "Saving..."
                : "✓ Add Questions to Test"}

            </button>

          </div>

        </div>

      </div>

    </div>

  );
}

export default ManageTestQuestions;