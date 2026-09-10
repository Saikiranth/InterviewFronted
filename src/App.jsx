import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// =========================================
// AUTH
// =========================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// =========================================
// ADMIN PAGES
// =========================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTests from "./pages/admin/AdminTests";
import AdminQuestions from "./pages/admin/AdminQuestions";
import ManageTestQuestions from "./pages/admin/ManageTestQuestions";
import AdminAssignTests from "./pages/admin/AdminAssignTests";
import AdminResults from "./pages/admin/AdminResults";
import AdminPerformance from "./pages/admin/AdminPerformance";
import AdminStudentPerformance from "./pages/admin/AdminStudentPerformance";
import Topics from "./pages/admin/Topics";

// =========================================
// STUDENT PAGES
// =========================================

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentTest from "./pages/student/StudentTest";
import StudentResult from "./pages/student/StudentResult";
import StudentResults from "./pages/student/StudentResults";
import StudentPerformance from "./pages/student/StudentPerformance";
import StudentTakeTest from "./pages/student/StudentTakeTest";

// =========================================
// LAYOUT
// =========================================

import AdminLayout from "./components/AdminLayout";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =========================================
            ROOT
        ========================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =========================================
            LOGIN
        ========================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =========================================
            REGISTER
        ========================================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================================
            ADMIN ROUTES
        ========================================= */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* =========================================
              ADMIN DASHBOARD
          ========================================= */}

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />


          {/* =========================================
              ADMIN STUDENTS
          ========================================= */}

          <Route
            path="students"
            element={<AdminStudents />}
          />


          {/* =========================================
              ADMIN TESTS
          ========================================= */}

          <Route
            path="tests"
            element={<AdminTests />}
          />


          {/* =========================================
              ADMIN TOPICS
          ========================================= */}

          <Route
            path="topics"
            element={<Topics />}
          />


          {/* =========================================
              MANAGE TEST QUESTIONS
          ========================================= */}

          <Route
            path="tests/:testId/questions"
            element={<ManageTestQuestions />}
          />


          {/* =========================================
              ADMIN QUESTIONS
          ========================================= */}

          <Route
            path="questions"
            element={<AdminQuestions />}
          />


          {/* =========================================
              ASSIGN TESTS
          ========================================= */}

          <Route
            path="assign-tests"
            element={<AdminAssignTests />}
          />


          {/* =========================================
              ADMIN RESULTS
          ========================================= */}

          <Route
            path="results"
            element={<AdminResults />}
          />

        </Route>


        {/* =========================================
            ADMIN PERFORMANCE
        ========================================= */}

        <Route
          path="/admin/performance"
          element={<AdminPerformance />}
        />


        {/* =========================================
            ADMIN STUDENT PERFORMANCE
        ========================================= */}

        <Route
          path="/admin/student-performance"
          element={<AdminStudentPerformance />}
        />


        {/* =========================================
            STUDENT ROUTES
        ========================================= */}


        {/* =========================================
            STUDENT DASHBOARD
        ========================================= */}

        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />


        {/* =========================================
            STUDENT PERFORMANCE
        ========================================= */}

        <Route
          path="/student/performance"
          element={<StudentPerformance />}
        />


        {/* =========================================
            STUDENT TEST
        ========================================= */}

        <Route
          path="/student/tests/:testId"
          element={<StudentTest />}
        />


        {/* =========================================
            STUDENT TAKE TEST
        ========================================= */}

        <Route
          path="/student/take-test/:testId"
          element={<StudentTakeTest />}
        />


        {/* =========================================
            STUDENT RESULTS
        ========================================= */}

        <Route
          path="/student/results"
          element={<StudentResults />}
        />


        {/* =========================================
            SINGLE STUDENT RESULT
        ========================================= */}

        <Route
          path="/student/result/:attemptId"
          element={<StudentResult />}
        />


        {/* =========================================
            INVALID URL
        ========================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;