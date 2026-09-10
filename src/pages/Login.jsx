import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response =
        await api.post(
          "/api/auth/login",
          {
            email: email,
            password: password
          }
        );

      // Backend response:
      //
      // {
      //   token: "...",
      //   role: "STUDENT"
      // }

      const token =
        response.data.token;

      const role =
        response.data.role;

      // Store JWT
      localStorage.setItem(
        "token",
        token
      );

      // Store role
      localStorage.setItem(
        "role",
        role
      );

      console.log(
        "Login successful"
      );

      console.log(
        "Role:",
        role
      );

      // =================================================
      // ROLE BASED REDIRECT
      // =================================================

      if (role === "ADMIN") {

        navigate(
          "/admin/dashboard"
        );

      } else if (role === "STUDENT") {

        navigate(
          "/student/dashboard"
        );

      } else {

        setError(
          "Invalid user role."
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "role"
        );
      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      if (
        error.response?.status === 401
      ) {

        setError(
          "Invalid email or password"
        );

      } else {

        setError(
          error.response?.data ||
          "Something went wrong. Please try again."
        );
      }

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="container mt-5">

      <div className="row justify-content-center">

        <div className="col-md-5">

          <div className="card shadow">

            <div className="card-body">

              <h2 className="text-center mb-4">
                Interview Readiness
              </h2>

              <h4 className="text-center mb-4">
                Login
              </h4>

              {/* ERROR */}

              {error && (

                <div className="alert alert-danger">
                  {error}
                </div>

              )}

              <form
                onSubmit={handleLogin}
              >

                {/* EMAIL */}

                <div className="mb-3">

                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    required
                  />

                </div>

                {/* PASSWORD */}

                <div className="mb-3">

                  <label className="form-label">
                    Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter your password"
                    required
                  />

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >

                  {loading
                    ? "Logging in..."
                    : "Login"}

                </button>

                {/* REGISTER LINK */}

                <div className="text-center mt-3">

                  <span>
                    Don't have an account?{" "}
                  </span>

                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() =>
                      navigate("/register")
                    }
                  >
                    Register
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;