import React, { useEffect, useState } from "react";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

import api from "../../services/api";


const AdminDashboard = () => {

    // =========================================================
    // STATES
    // =========================================================

    const [dashboard, setDashboard] = useState({});

    const [testPerformance, setTestPerformance] = useState([]);

    const [studentPerformance, setStudentPerformance] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    const loadDashboard = async (isRefresh = false) => {

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        let hasError = false;


        // =====================================================
        // 1. DASHBOARD SUMMARY
        // =====================================================

        try {

            const response =
                await api.get(
                    "/api/admin/dashboard"
                );

            console.log(
                "Dashboard API:",
                response.data
            );

            // Only update when API succeeds
            if (response.data) {

                setDashboard(
                    response.data
                );
            }

        } catch (err) {

            hasError = true;

            console.error(
                "Dashboard API Error:",
                err.response?.status,
                err.response?.data ||
                err.message
            );

            // IMPORTANT:
            // Do NOT clear existing dashboard data
        }


        // =====================================================
        // 2. TEST PERFORMANCE
        // =====================================================

        try {

            const response =
                await api.get(
                    "/api/admin/dashboard/test-performance"
                );

            console.log(
                "Test Performance API:",
                response.data
            );

            if (Array.isArray(response.data)) {

                // Only update when API succeeds
                setTestPerformance(
                    response.data
                );
            }

        } catch (err) {

            hasError = true;

            console.error(
                "Test Performance API Error:",
                err.response?.status,
                err.response?.data ||
                err.message
            );

            // IMPORTANT:
            // Do NOT clear existing test performance
        }


        // =====================================================
        // 3. STUDENT PERFORMANCE
        // =====================================================

        try {

            const response =
                await api.get(
                    "/api/admin/dashboard/student-performance"
                );

            console.log(
                "Student Performance API:",
                response.data
            );

            if (Array.isArray(response.data)) {

                // Only update when API succeeds
                setStudentPerformance(
                    response.data
                );
            }

        } catch (err) {

            hasError = true;

            console.error(
                "Student Performance API Error:",
                err.response?.status,
                err.response?.data ||
                err.message
            );

            // IMPORTANT:
            // Do NOT clear existing student performance
        }


        // =====================================================
        // ERROR MESSAGE
        // =====================================================

        if (hasError) {

            setError(
                "Some dashboard data could not be refreshed. Existing data is still displayed."
            );

        } else {

            setError("");
        }


        // =====================================================
        // FINISH LOADING
        // =====================================================

        setLoading(false);

        setRefreshing(false);
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadDashboard(false);

    }, []);


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("role");

        localStorage.removeItem("user");

        window.location.href = "/login";
    };


    // =========================================================
    // INITIAL LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="container mt-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                </div>

                <p className="mt-3">
                    Loading dashboard...
                </p>

            </div>
        );
    }


    // =========================================================
    // DASHBOARD VALUES
    // =========================================================

    const totalStudents =
        Number(
            dashboard?.totalStudents ?? 0
        );

    const totalTests =
        Number(
            dashboard?.totalTests ?? 0
        );

    const totalAssignments =
        Number(
            dashboard?.totalAssignments ?? 0
        );

    const completedTests =
        Number(
            dashboard?.completedTests ?? 0
        );

    const passedTests =
        Number(
            dashboard?.passedTests ?? 0
        );

    const failedTests =
        Number(
            dashboard?.failedTests ?? 0
        );


    // =========================================================
    // TEST PERFORMANCE CALCULATIONS
    // =========================================================

    const totalCompletedStudents =
        testPerformance.reduce(
            (sum, test) =>
                sum +
                Number(
                    test.completedStudents ?? 0
                ),
            0
        );


    const totalPassed =
        testPerformance.reduce(
            (sum, test) =>
                sum +
                Number(
                    test.passedStudents ?? 0
                ),
            0
        );


    const totalFailed =
        testPerformance.reduce(
            (sum, test) =>
                sum +
                Number(
                    test.failedStudents ?? 0
                ),
            0
        );


    // =========================================================
    // OVERALL TEST AVERAGE
    // =========================================================

    let overallAverage = 0;

    const testsWithScores =
        testPerformance.filter(
            test =>
                Number(test.totalMarks ?? 0) > 0 &&
                Number(test.completedStudents ?? 0) > 0
        );


    if (testsWithScores.length > 0) {

        let totalPercentage = 0;

        testsWithScores.forEach(test => {

            const averageScore =
                Number(
                    test.averageScore ?? 0
                );

            const totalMarks =
                Number(
                    test.totalMarks ?? 0
                );

            if (totalMarks > 0) {

                const percentage =
                    (
                        averageScore * 100
                    ) / totalMarks;

                totalPercentage += percentage;
            }
        });


        overallAverage =
            totalPercentage /
            testsWithScores.length;
    }


    // =========================================================
    // PASS RATE
    // =========================================================

    const resultCount =
        totalPassed +
        totalFailed;


    const passRate =
        resultCount > 0
            ? (
                totalPassed * 100
            ) / resultCount
            : 0;


    // =========================================================
    // STUDENT PERFORMANCE CALCULATIONS
    // =========================================================

    const studentsWithAttempts =
        studentPerformance.filter(
            student =>
                Number(
                    student.testsCompleted ?? 0
                ) > 0
        ).length;


    const studentTotalCompleted =
        studentPerformance.reduce(
            (sum, student) =>
                sum +
                Number(
                    student.testsCompleted ?? 0
                ),
            0
        );


    const studentPassed =
        studentPerformance.reduce(
            (sum, student) =>
                sum +
                Number(
                    student.testsPassed ?? 0
                ),
            0
        );


    const studentFailed =
        studentPerformance.reduce(
            (sum, student) =>
                sum +
                Number(
                    student.testsFailed ?? 0
                ),
            0
        );


    const studentAverageScore =
        studentPerformance.length > 0
            ? studentPerformance.reduce(
                (sum, student) =>
                    sum +
                    Number(
                        student.averageScore ?? 0
                    ),
                0
            ) / studentPerformance.length
            : 0;


    // =========================================================
    // PIE CHART DATA
    // =========================================================

    const pieData = [

        {
            name: "Passed",
            value: totalPassed
        },

        {
            name: "Failed",
            value: totalFailed
        }

    ];


    // =========================================================
    // BAR CHART DATA
    // =========================================================

    const barData =
        testPerformance.map(
            test => ({

                name:
                    test.testName?.length > 15
                        ? test.testName.substring(
                            0,
                            15
                        ) + "..."
                        : test.testName,

                Passed:
                    Number(
                        test.passedStudents ?? 0
                    ),

                Failed:
                    Number(
                        test.failedStudents ?? 0
                    )

            })
        );


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="container-fluid py-4">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold">
                        Admin Dashboard
                    </h2>

                    <p className="text-muted mb-0">
                        Interview Readiness Performance Overview
                    </p>

                </div>


                <div className="d-flex gap-2">

                    <button
                        className="btn btn-outline-primary"
                        onClick={() => loadDashboard(true)}
                        disabled={refreshing}
                    >

                        {refreshing ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                />
                                Refreshing...
                            </>
                        ) : (
                            <>
                                🔄 Refresh
                            </>
                        )}

                    </button>


                    <button
                        className="btn btn-danger"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="alert alert-warning">

                    {error}

                    <button
                        className="btn btn-sm btn-outline-primary ms-3"
                        onClick={() => loadDashboard(true)}
                        disabled={refreshing}
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="row g-4 mb-4">


                {/* TOTAL STUDENTS */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Total Students
                            </h6>

                            <h2 className="fw-bold">
                                {totalStudents}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* TOTAL TESTS */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Total Tests
                            </h6>

                            <h2 className="fw-bold">
                                {totalTests}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* ASSIGNMENTS */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Assignments
                            </h6>

                            <h2 className="fw-bold">
                                {totalAssignments}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* COMPLETED */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Completed
                            </h6>

                            <h2 className="fw-bold">
                                {completedTests}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* PASSED */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Passed
                            </h6>

                            <h2 className="fw-bold text-success">
                                {passedTests}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* FAILED */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Failed
                            </h6>

                            <h2 className="fw-bold text-danger">
                                {failedTests}
                            </h2>

                        </div>

                    </div>

                </div>


                {/* PASS RATE */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Pass Rate
                            </h6>

                            <h2 className="fw-bold text-success">
                                {passRate.toFixed(1)}%
                            </h2>

                        </div>

                    </div>

                </div>


                {/* OVERALL AVERAGE */}

                <div className="col-md-6 col-lg-3">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Overall Average
                            </h6>

                            <h2 className="fw-bold">
                                {overallAverage.toFixed(1)}%
                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                CHARTS
            ================================================= */}

            <div className="row g-4 mb-4">


                {/* PIE */}

                <div className="col-lg-5">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h5 className="fw-bold mb-3">
                                Test Result Overview
                            </h5>


                            {totalPassed === 0 &&
                            totalFailed === 0 ? (

                                <div className="text-center text-muted py-5">

                                    No test result data available.

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                >

                                    <PieChart>

                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >

                                            {pieData.map(
                                                (entry, index) => (

                                                    <Cell
                                                        key={
                                                            `cell-${index}`
                                                        }
                                                    />

                                                )
                                            )}

                                        </Pie>

                                        <Tooltip />

                                        <Legend />

                                    </PieChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>

                </div>


                {/* BAR */}

                <div className="col-lg-7">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <h5 className="fw-bold mb-3">
                                Test Performance
                            </h5>


                            {barData.length === 0 ? (

                                <div className="text-center text-muted py-5">

                                    No test performance data available.

                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                >

                                    <BarChart
                                        data={barData}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="name"
                                        />

                                        <YAxis />

                                        <Tooltip />

                                        <Legend />

                                        <Bar
                                            dataKey="Passed"
                                        />

                                        <Bar
                                            dataKey="Failed"
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                TEST PERFORMANCE TABLE
            ================================================= */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <h5 className="fw-bold mb-3">
                        Test-wise Performance
                    </h5>


                    <div className="table-responsive">

                        <table className="table table-bordered table-hover align-middle">

                            <thead className="table-light">

                                <tr>

                                    <th>Test</th>

                                    <th>Students</th>

                                    <th>Completed</th>

                                    <th>Passed</th>

                                    <th>Failed</th>

                                    <th>Average</th>

                                    <th>Performance</th>

                                </tr>

                            </thead>


                            <tbody>

                                {testPerformance.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="text-center text-muted py-4"
                                        >
                                            No test performance data found.
                                        </td>

                                    </tr>

                                ) : (

                                    testPerformance.map(
                                        test => {

                                            const totalMarks =
                                                Number(
                                                    test.totalMarks ?? 0
                                                );

                                            const averageScore =
                                                Number(
                                                    test.averageScore ?? 0
                                                );

                                            const percentage =
                                                totalMarks > 0
                                                    ? (
                                                        averageScore *
                                                        100
                                                    ) /
                                                    totalMarks
                                                    : 0;


                                            return (

                                                <tr
                                                    key={
                                                        test.testId
                                                    }
                                                >

                                                    <td className="fw-semibold">
                                                        {
                                                            test.testName
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            test.totalStudents ??
                                                            0
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            test.completedStudents ??
                                                            0
                                                        }
                                                    </td>

                                                    <td className="text-success">
                                                        {
                                                            test.passedStudents ??
                                                            0
                                                        }
                                                    </td>

                                                    <td className="text-danger">
                                                        {
                                                            test.failedStudents ??
                                                            0
                                                        }
                                                    </td>

                                                    <td>

                                                        {
                                                            averageScore.toFixed(
                                                                2
                                                            )
                                                        }

                                                        {" / "}

                                                        {
                                                            totalMarks
                                                        }

                                                    </td>

                                                    <td
                                                        style={{
                                                            minWidth:
                                                                "180px"
                                                        }}
                                                    >

                                                        <div className="progress">

                                                            <div
                                                                className="progress-bar"
                                                                role="progressbar"
                                                                style={{
                                                                    width:
                                                                        `${Math.min(
                                                                            Math.max(
                                                                                percentage,
                                                                                0
                                                                            ),
                                                                            100
                                                                        )}%`
                                                                }}
                                                            >

                                                                {
                                                                    percentage.toFixed(
                                                                        1
                                                                    )
                                                                }%

                                                            </div>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            {/* =================================================
                STUDENT PERFORMANCE SUMMARY
            ================================================= */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <h5 className="fw-bold mb-4">
                        Student Performance Summary
                    </h5>


                    <div className="row g-4">


                        {/* STUDENTS WITH ATTEMPTS */}

                        <div className="col-md-6 col-lg-3">

                            <div className="border rounded p-3">

                                <small className="text-muted">
                                    Students with Attempts
                                </small>

                                <h3 className="fw-bold mt-2">
                                    {studentsWithAttempts}
                                </h3>

                            </div>

                        </div>


                        {/* COMPLETED TESTS */}

                        <div className="col-md-6 col-lg-3">

                            <div className="border rounded p-3">

                                <small className="text-muted">
                                    Completed Tests
                                </small>

                                <h3 className="fw-bold mt-2">
                                    {studentTotalCompleted}
                                </h3>

                            </div>

                        </div>


                        {/* PASSED */}

                        <div className="col-md-6 col-lg-3">

                            <div className="border rounded p-3">

                                <small className="text-muted">
                                    Passed Tests
                                </small>

                                <h3 className="fw-bold text-success mt-2">
                                    {studentPassed}
                                </h3>

                            </div>

                        </div>


                        {/* FAILED */}

                        <div className="col-md-6 col-lg-3">

                            <div className="border rounded p-3">

                                <small className="text-muted">
                                    Failed Tests
                                </small>

                                <h3 className="fw-bold text-danger mt-2">
                                    {studentFailed}
                                </h3>

                            </div>

                        </div>


                        {/* AVERAGE SCORE */}

                        <div className="col-md-6 col-lg-3">

                            <div className="border rounded p-3">

                                <small className="text-muted">
                                    Average Score
                                </small>

                                <h3 className="fw-bold mt-2">
                                    {studentAverageScore.toFixed(2)}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                STUDENT PERFORMANCE TABLE
            ================================================= */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <h5 className="fw-bold mb-3">
                        Student-wise Performance
                    </h5>


                    <div className="table-responsive">

                        <table className="table table-bordered table-hover align-middle">

                            <thead className="table-light">

                                <tr>

                                    <th>#</th>

                                    <th>Student</th>

                                    <th>Email</th>

                                    <th>Assigned</th>

                                    <th>Completed</th>

                                    <th>Passed</th>

                                    <th>Failed</th>

                                    <th>Average Score</th>

                                </tr>

                            </thead>


                            <tbody>

                                {studentPerformance.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="text-center text-muted py-4"
                                        >
                                            No student performance data found.
                                        </td>

                                    </tr>

                                ) : (

                                    studentPerformance.map(
                                        (student, index) => (

                                            <tr
                                                key={
                                                    student.studentId
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td className="fw-semibold">
                                                    {
                                                        student.studentName
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.studentEmail
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.testsAssigned ??
                                                        0
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        student.testsCompleted ??
                                                        0
                                                    }
                                                </td>

                                                <td className="text-success fw-semibold">
                                                    {
                                                        student.testsPassed ??
                                                        0
                                                    }
                                                </td>

                                                <td className="text-danger fw-semibold">
                                                    {
                                                        student.testsFailed ??
                                                        0
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        Number(
                                                            student.averageScore ??
                                                            0
                                                        ).toFixed(2)
                                                    }

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

        </div>
    );
};


export default AdminDashboard;
