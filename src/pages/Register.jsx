
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    // =========================
    // FRONTEND VALIDATION
    // =========================

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters"
      );
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }


    setLoading(true);


    try {

      // =========================
      // CLEAR OLD LOGIN DATA
      // =========================

      localStorage.removeItem("token");
      localStorage.removeItem("role");


      // =========================
      // REGISTRATION DATA
      // =========================

      const registerData = {
        name: name.trim(),
        email: email.trim(),
        password: password
      };


      // Debug information
      console.log(
        "========== REGISTER DEBUG =========="
      );

      console.log(
        "Name:",
        registerData.name
      );

      console.log(
        "Email:",
        registerData.email
      );

      console.log(
        "Password:",
        registerData.password
      );

      console.log(
        "DATA SENT TO BACKEND:",
        registerData
      );


      // =========================
      // API CALL
      // =========================

      const response = await api.post(
        "/api/auth/register",
        registerData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": ""
          }
        }
      );


      // =========================
      // SUCCESS
      // =========================

      console.log(
        "REGISTER RESPONSE:",
        response.data
      );


      setSuccess(
        "Registration successful! Redirecting to login..."
      );


      // Clear form

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");


      // Redirect to login

      setTimeout(() => {

        navigate("/login");

      }, 1500);


    } catch (error) {

      // =========================
      // ERROR
      // =========================

      console.error(
        "========== REGISTER ERROR =========="
      );

      console.error(
        "Error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );


      if (error.response?.status === 400) {

        setError(
          error.response?.data ||
          "Registration failed"
        );

      } else if (error.response?.status === 401) {

        setError(
          "Unauthorized request"
        );

      } else if (error.response?.status === 403) {

        setError(
          "Registration access denied. Please check Spring Security configuration."
        );

      } else if (!error.response) {

        setError(
          "Cannot connect to server. Please make sure Spring Boot is running."
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

            <div className="card-body p-4">


              {/* =========================
                  TITLE
                  ========================= */}

              <h2 className="text-center mb-2">
                Interview Readiness
              </h2>

              <h4 className="text-center mb-4">
                Student Registration
              </h4>


              {/* =========================
                  ERROR MESSAGE
                  ========================= */}

              {error && (

                <div className="alert alert-danger">

                  {error}

                </div>

              )}


              {/* =========================
                  SUCCESS MESSAGE
                  ========================= */}

              {success && (

                <div className="alert alert-success">

                  {success}

                </div>

              )}


              {/* =========================
                  FORM
                  ========================= */}

              <form onSubmit={handleRegister}>


                {/* NAME */}

                <div className="mb-3">

                  <label className="form-label">
                    Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="mb-3">

                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
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
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="mb-3">

                  <label className="form-label">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                  />

                </div>


                {/* REGISTER BUTTON */}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >

                  {loading
                    ? "Registering..."
                    : "Register"
                  }

                </button>


              </form>


              {/* =========================
                  LOGIN LINK
                  ========================= */}

              <div className="text-center mt-3">

                <span>
                  Already have an account?{" "}
                </span>

                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Login
                </button>

              </div>


            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Register;

