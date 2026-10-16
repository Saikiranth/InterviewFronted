import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "STUDENT"
};

function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // null = form closed, "new" = creating, number = editing that user id
  const [formMode, setFormMode] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // =========================================================
  // LOAD USERS
  // =========================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const response = await api.get("/api/admin/users");

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error("Failed to load users:", err);

      setError(getErrorMessage(err, "Failed to load users."));

    } finally {

      setLoading(false);

    }
  };

  const getErrorMessage = (err, fallback) => {

    return typeof err.response?.data === "string" &&
      err.response.data
      ? err.response.data
      : fallback;
  };


  // =========================================================
  // FORM HELPERS
  // =========================================================

  const updateForm = (field, value) => {

    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const openCreateForm = () => {

    setForm(emptyForm);
    setFormMode("new");
    setMessage("");
    setError("");
  };

  const openEditForm = (user) => {

    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "STUDENT"
    });

    setFormMode(user.id);
    setMessage("");
    setError("");
  };

  const closeForm = () => {

    setFormMode(null);
    setForm(emptyForm);
  };


  // =========================================================
  // SAVE (CREATE OR EDIT)
  // =========================================================

  const handleSave = async (event) => {

    event.preventDefault();

    setMessage("");
    setError("");

    try {

      setSaving(true);

      if (formMode === "new") {

        await api.post("/api/admin/users", form);

        setMessage("User created successfully.");

      } else {

        const payload = {
          name: form.name,
          email: form.email,
          role: form.role
        };

        // Only send a password when the admin typed a new one
        if (form.password.trim() !== "") {
          payload.password = form.password;
        }

        await api.put(
          `/api/admin/users/${formMode}`,
          payload
        );

        setMessage("User updated successfully.");
      }

      closeForm();

      await fetchUsers();

    } catch (err) {

      console.error("Failed to save user:", err);

      setError(getErrorMessage(err, "Failed to save user."));

    } finally {

      setSaving(false);

    }
  };


  // =========================================================
  // ACTIVATE / DEACTIVATE
  // =========================================================

  const handleToggleActive = async (user) => {

    const makeActive = !user.active;

    if (!makeActive) {

      const confirmed = window.confirm(
        `Deactivate ${user.name}? They will be signed out and ` +
        "unable to log in until reactivated. Their results are kept."
      );

      if (!confirmed) {
        return;
      }
    }

    setMessage("");
    setError("");

    try {

      await api.put(
        `/api/admin/users/${user.id}/active`,
        { active: makeActive }
      );

      setMessage(
        makeActive
          ? `${user.name} has been activated.`
          : `${user.name} has been deactivated.`
      );

      await fetchUsers();

    } catch (err) {

      console.error("Failed to change status:", err);

      setError(
        getErrorMessage(err, "Failed to change user status.")
      );
    }
  };


  // =========================================================
  // FILTERED LIST
  // =========================================================

  const visibleUsers = users.filter((user) => {

    if (roleFilter !== "ALL" && user.role !== roleFilter) {
      return false;
    }

    const text = search.trim().toLowerCase();

    if (!text) {
      return true;
    }

    return (
      (user.name || "").toLowerCase().includes(text) ||
      (user.email || "").toLowerCase().includes(text)
    );
  });


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="p-4 text-center">

        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading users...
        </p>

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
            Users
          </h2>

          <p className="text-muted mb-0">
            Create, edit and deactivate admin and student accounts
          </p>

        </div>

        <div className="d-flex gap-2">

          <button
            className="btn btn-outline-primary"
            onClick={fetchUsers}
          >
            ↻ Refresh
          </button>

          <button
            className="btn btn-primary"
            onClick={openCreateForm}
          >
            + New User
          </button>

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


      {/* CREATE / EDIT FORM */}

      {formMode !== null && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-3">
              {formMode === "new" ? "Create User" : "Edit User"}
            </h5>

            <form onSubmit={handleSave}>

              <div className="row g-3">

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) =>
                      updateForm("name", e.target.value)
                    }
                    required
                  />

                </div>

                <div className="col-md-3">

                  <label className="form-label fw-semibold">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) =>
                      updateForm("email", e.target.value)
                    }
                    required
                  />

                </div>

                <div className="col-md-2">

                  <label className="form-label fw-semibold">
                    Role
                  </label>

                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) =>
                      updateForm("role", e.target.value)
                    }
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                </div>

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    {formMode === "new"
                      ? "Password (min 8 characters)"
                      : "New Password (leave empty to keep)"}
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) =>
                      updateForm("password", e.target.value)
                    }
                    minLength={formMode === "new" ? 8 : undefined}
                    required={formMode === "new"}
                    autoComplete="new-password"
                  />

                </div>

              </div>

              <div className="d-flex gap-2 mt-3">

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* FILTERS */}

      <div className="row g-2 mb-3">

        <div className="col-md-5">

          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="col-md-3">

          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All roles</option>
            <option value="STUDENT">Students</option>
            <option value="ADMIN">Admins</option>
          </select>

        </div>

        <div className="col-md-4 d-flex align-items-center">

          <span className="text-muted">
            Showing {visibleUsers.length} of {users.length} users
          </span>

        </div>

      </div>


      {/* USERS TABLE */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {visibleUsers.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center text-muted py-5"
                    >
                      No users found.
                    </td>

                  </tr>

                ) : (

                  visibleUsers.map((user, index) => (

                    <tr key={user.id}>

                      <td>{index + 1}</td>

                      <td>
                        <strong>{user.name}</strong>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span
                          className={`badge ${
                            user.role === "ADMIN"
                              ? "bg-dark"
                              : "bg-info text-dark"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            user.active
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {user.active ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditForm(user)}
                          >
                            ✏ Edit
                          </button>

                          <button
                            className={`btn btn-sm ${
                              user.active
                                ? "btn-outline-danger"
                                : "btn-outline-success"
                            }`}
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.active ? "Deactivate" : "Activate"}
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

export default AdminUsers;
