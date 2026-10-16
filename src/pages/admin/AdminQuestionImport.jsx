import { useRef, useState } from "react";
import api from "../../services/api";

function AdminQuestionImport() {

  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // =========================================================
  // HELPERS
  // =========================================================

  const getErrorMessage = (err, fallback) => {

    if (err.response?.status === 413) {
      return "The file is too large. Keep it under about 1 MB.";
    }

    return typeof err.response?.data === "string" &&
      err.response.data
      ? err.response.data
      : fallback;
  };

  const handleFileChange = (event) => {

    const chosen = event.target.files?.[0] || null;

    setFile(chosen);
    setResult(null);
    setMessage("");
    setError("");
  };


  // =========================================================
  // DOWNLOAD TEMPLATE
  // =========================================================

  const handleDownloadTemplate = async () => {

    try {

      const response = await api.get(
        "/api/admin/questions/import/template",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/csv" })
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = "question-import-template.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.error("Template download failed:", err);

      setError("Failed to download the template.");
    }
  };


  // =========================================================
  // PREVIEW OR IMPORT
  // =========================================================

  const sendFile = async (commit) => {

    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setWorking(true);
    setMessage("");
    setError("");

    try {

      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post(
        `/api/admin/questions/import?commit=${commit}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResult(response.data);

      if (commit) {

        setMessage(
          `${response.data.importedRows} question(s) imported. ` +
          `${response.data.invalidRows} row(s) skipped.`
        );
      }

    } catch (err) {

      console.error("Import request failed:", err);

      setResult(null);

      setError(
        getErrorMessage(
          err,
          commit
            ? "Import failed. Nothing was saved."
            : "Could not read the file."
        )
      );

    } finally {

      setWorking(false);
    }
  };

  const handleImport = () => {

    const confirmed = window.confirm(
      `Import ${result.validRows} valid question(s)? ` +
      `${result.invalidRows} invalid row(s) will be skipped.`
    );

    if (confirmed) {
      sendFile(true);
    }
  };

  const handleReset = () => {

    setFile(null);
    setResult(null);
    setMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // =========================================================
  // UI
  // =========================================================

  const canImport =
    result &&
    !result.committed &&
    result.validRows > 0 &&
    !working;

  return (

    <div className="container-fluid p-4">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Import Questions
          </h2>

          <p className="text-muted mb-0">
            Upload a CSV or Excel file to add many questions at once
          </p>

        </div>

        <button
          className="btn btn-outline-primary"
          onClick={handleDownloadTemplate}
        >
          ⬇ Download CSV Template
        </button>

      </div>


      {/* FILE FORMAT HELP */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">
            File format
          </h5>

          <p className="mb-2">
            The first row must contain column headers:
          </p>

          <ul className="mb-3">

            <li>
              <strong>Required:</strong>{" "}
              <code>topic</code>,{" "}
              <code>question</code>,{" "}
              <code>difficulty</code> (EASY, MEDIUM or HARD),{" "}
              <code>marks</code>
            </li>

            <li>
              <strong>Theory or coding questions:</strong>{" "}
              also fill <code>answer</code>
            </li>

            <li>
              <strong>MCQ / MSQ questions:</strong>{" "}
              fill at least two of <code>optionA</code> to{" "}
              <code>optionF</code> and set{" "}
              <code>correctOptions</code> (for example{" "}
              <code>A</code> or <code>A,C</code>)
            </li>

            <li>
              <strong>Optional:</strong>{" "}
              <code>languageId</code> for coding questions
            </li>

          </ul>

          <p className="text-muted mb-0">
            The topic must already exist in the Topics page. Duplicate
            questions are skipped. Maximum 500 rows per file.
          </p>

        </div>

      </div>


      {/* UPLOAD */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-end">

            <div className="col-md-6">

              <label className="form-label fw-semibold">
                Choose file (.csv, .xlsx)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={working}
              />

            </div>

            <div className="col-md-6 d-flex gap-2">

              <button
                className="btn btn-primary"
                onClick={() => sendFile(false)}
                disabled={!file || working}
              >
                {working && !result
                  ? "Checking..."
                  : "Preview"}
              </button>

              <button
                className="btn btn-success"
                onClick={handleImport}
                disabled={!canImport}
              >
                {result && !result.committed
                  ? `Import ${result.validRows} valid row(s)`
                  : "Import"}
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={handleReset}
                disabled={working}
              >
                Reset
              </button>

            </div>

          </div>

        </div>

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


      {/* RESULT */}

      {result && (

        <>

          {/* SUMMARY */}

          <div className="row g-3 mb-4">

            <div className="col-md-3">

              <div className="card border-0 shadow-sm">

                <div className="card-body">

                  <small className="text-muted">
                    Rows in file
                  </small>

                  <h3 className="fw-bold mt-2">
                    {result.totalRows}
                  </h3>

                </div>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card border-0 shadow-sm">

                <div className="card-body">

                  <small className="text-muted">
                    Valid
                  </small>

                  <h3 className="fw-bold text-success mt-2">
                    {result.validRows}
                  </h3>

                </div>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card border-0 shadow-sm">

                <div className="card-body">

                  <small className="text-muted">
                    Invalid
                  </small>

                  <h3 className="fw-bold text-danger mt-2">
                    {result.invalidRows}
                  </h3>

                </div>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card border-0 shadow-sm">

                <div className="card-body">

                  <small className="text-muted">
                    {result.committed ? "Imported" : "Not imported yet"}
                  </small>

                  <h3 className="fw-bold text-primary mt-2">
                    {result.committed ? result.importedRows : "-"}
                  </h3>

                </div>

              </div>

            </div>

          </div>


          {/* ROW TABLE */}

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <h5 className="fw-bold mb-3">
                {result.committed ? "Import result" : "Preview"}
              </h5>

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead className="table-light">

                    <tr>
                      <th>Row</th>
                      <th>Status</th>
                      <th>Topic</th>
                      <th>Question</th>
                      <th>Type</th>
                      <th>Marks</th>
                      <th>Problem</th>
                    </tr>

                  </thead>

                  <tbody>

                    {result.rows.map((row) => (

                      <tr
                        key={row.rowNumber}
                        className={row.valid ? "" : "table-danger"}
                      >

                        <td>{row.rowNumber}</td>

                        <td>
                          <span
                            className={`badge ${
                              row.valid
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {row.valid ? "Valid" : "Invalid"}
                          </span>
                        </td>

                        <td>{row.topic || "-"}</td>

                        <td>{row.question || "-"}</td>

                        <td>
                          {row.type ? (
                            <span className="badge bg-info text-dark">
                              {row.type}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td>{row.marks ?? "-"}</td>

                        <td>{row.error || ""}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </>

      )}

    </div>
  );
}

export default AdminQuestionImport;
