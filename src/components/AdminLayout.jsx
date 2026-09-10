import { Link, Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (

    <div className="d-flex min-vh-100">

      {/* SIDEBAR */}

      <div
        className="bg-dark text-white p-3"
        style={{
          width: "250px",
          minHeight: "100vh"
        }}
      >

        <h4 className="mb-4">
          Interview Readiness
        </h4>

        <p className="text-secondary">
          Admin Panel
        </p>

        <div className="nav flex-column">

          {/* DASHBOARD */}

          <Link
            to="/admin/dashboard"
            className="nav-link text-white mb-2"
          >
            📊 Dashboard
          </Link>


          {/* STUDENTS */}

          <Link
            to="/admin/students"
            className="nav-link text-white mb-2"
          >
            👨‍🎓 Students
          </Link>


          {/* TESTS */}

          <Link
            to="/admin/tests"
            className="nav-link text-white mb-2"
          >
            📝 Tests
          </Link>


          {/* TOPICS */}

          <Link
            to="/admin/topics"
            className="nav-link text-white mb-2"
          >
            📚 Topics
          </Link>


          {/* QUESTIONS */}

          <Link
            to="/admin/questions"
            className="nav-link text-white mb-2"
          >
            ❓ Questions
          </Link>


          {/* ASSIGN TESTS */}

          <Link
            to="/admin/assign-tests"
            className="nav-link text-white mb-2"
          >
            📋 Assign Tests
          </Link>


          {/* RESULTS */}

          <Link
            to="/admin/results"
            className="nav-link text-white mb-2"
          >
            📈 Results
          </Link>


          {/* PERFORMANCE */}

          <Link
            to="/admin/performance"
            className="nav-link text-white mb-2"
          >
            📊 Performance
          </Link>

        </div>


        <hr />


        {/* LOGOUT */}

        <button
          className="btn btn-outline-light w-100"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>


      {/* CONTENT */}

      <div className="flex-grow-1 bg-light">

        <Outlet />

      </div>

    </div>
  );
}

export default AdminLayout;