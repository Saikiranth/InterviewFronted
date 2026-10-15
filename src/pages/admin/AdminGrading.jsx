import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminGrading() {

  const [pending, setPending] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // =========================================================
  // FETCH PENDING ANSWERS
  // =========================================================

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/admin/grading/pending"
      );

      const list = Array.isArray(response.data)
        ? response.data
        : [];

      setPending(list);

      // Start every draft with the provisional auto-score
      const initialDrafts = {};

      list.forEach((item) => {
        initialDrafts[item.answerId] = {
          marks: item.autoMarks ?? 0,
          feedback: ""
        };
      });

      setDrafts(initialDrafts);

    } catch (err) {

      console.error("Failed to load pending answers:", err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        setError("Session expired or access denied. Please login again.");
      } else {
        setError("Failed to load pending answers.");
      }

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // UPDATE DRAFT
  // =========================================================

  const updateDraft = (answerId, field, value) => {

    setDrafts((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]: value
      }
    }));
  };


  // =========================================================
  // SAVE GRADE
  // =========================================================

  const handleSave = async (item) => {

    const draft = drafts[item.answerId];

    const marks = Number(draft?.marks);

    if (
      draft?.marks === "" ||
      Number.isNaN(marks) ||
      marks < 0 ||
      marks > item.maxMarks
    ) {
      setError(
        `Marks must be a number between 0 and ${item.maxMarks}.`
      );
      setMessage("");
      return;
    }

    try {

      setSavingId(item.answerId);
      setError("");
      setMessage("");

      await api.put(
        `/api/admin/grading/answers/${item.answerId}`,
        {
          marks,
          feedback: draft.feedback?.trim() || null
        }
      );

      // Remove the graded answer from the list
      setPending((prev) =>
        prev.filter((p) => p.answerId !== item.answerId)
      );

      setMessage("Answer graded successfully.");

    } catch (err) {

      console.error("Failed to grade answer:", err);

      const serverMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : "";

      setError(
        serverMessage || "Failed to save grade."
      );

    } finally {

      setSavingId(null);

    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="container py-5 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading pending answers...
        </p>

      </div>
    );
  }


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Grading
          </h2>

          <p className="text-muted mb-0">
            Review theory and coding answers. The suggested marks
            come from the automatic check.
          </p>

        </div>

        <button
          className="btn btn-outline-primary"
          onClick={fetchPending}
        >
          🔄 Refresh
        </button>

      </div>


      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      {pending.length === 0 ? (

        <div className="card shadow-sm border-0">

          <div className="card-body text-center py-5">

            <h5 className="fw-bold">
              Nothing to review
            </h5>

            <p className="text-muted mb-0">
              All submitted answers have been graded.
            </p>

          </div>

        </div>

      ) : (

        <>

          <p className="text-muted">
            {pending.length} answer{pending.length === 1 ? "" : "s"} waiting for review
          </p>

          {pending.map((item) => {

            const draft = drafts[item.answerId] || {
              marks: item.autoMarks ?? 0,
              feedback: ""
            };

            const saving = savingId === item.answerId;

            return (

              <div
                key={item.answerId}
                className="card shadow-sm border-0 mb-4"
              >

                <div className="card-body">

                  {/* HEADER */}

                  <div className="d-flex justify-content-between align-items-start mb-3">

                    <div>

                      <h5 className="fw-bold mb-1">
                        {item.question}
                      </h5>

                      <small className="text-muted">
                        {item.studentEmail || "Student"}
                        {" · "}
                        {item.testName || "Test"}
                        {" · Attempt #"}
                        {item.attemptId}
                      </small>

                    </div>

                    <span className="badge bg-warning text-dark">
                      Pending review
                    </span>

                  </div>


                  {/* STUDENT ANSWER */}

                  <h6 className="fw-bold">
                    Student Answer
                  </h6>

                  <div
                    className="border rounded p-3 mb-3 bg-light"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word"
                    }}
                  >
                    {item.studentAnswer || "No answer submitted"}
                  </div>


                  {/* EXPECTED ANSWER */}

                  <h6 className="fw-bold">
                    Expected Answer
                  </h6>

                  <div
                    className="border border-success rounded p-3 mb-3 bg-success-subtle"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word"
                    }}
                  >
                    {item.correctAnswer || "Not available"}
                  </div>


                  {/* GRADING FORM */}

                  <div className="row g-3 align-items-end">

                    <div className="col-md-3">

                      <label className="form-label fw-semibold">
                        Marks (max {item.maxMarks})
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max={item.maxMarks}
                        value={draft.marks}
                        onChange={(e) =>
                          updateDraft(
                            item.answerId,
                            "marks",
                            e.target.value
                          )
                        }
                      />

                      <small className="text-muted">
                        Auto-score: {item.autoMarks}
                      </small>

                    </div>

                    <div className="col-md-7">

                      <label className="form-label fw-semibold">
                        Feedback (optional)
                      </label>

                      <textarea
                        className="form-control"
                        rows="2"
                        value={draft.feedback}
                        onChange={(e) =>
                          updateDraft(
                            item.answerId,
                            "feedback",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <div className="col-md-2">

                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleSave(item)}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Grade"}
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            );

          })}

        </>

      )}

    </div>
  );
}

export default AdminGrading;
