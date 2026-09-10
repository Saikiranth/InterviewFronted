import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const StudentTakeTest = () => {

    const { testId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [answers, setAnswers] = useState({});

    // =====================================================
    // LOAD TEST
    // =====================================================

    useEffect(() => {

        const loadTest = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    `/api/tests/${testId}`
                );

                console.log("Test response:", response.data);

                setTest(response.data);

            } catch (err) {

                console.error("Test loading error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load test."
                );

            } finally {

                setLoading(false);
            }
        };

        if (testId) {
            loadTest();
        } else {
            setError("Test ID is missing.");
            setLoading(false);
        }

    }, [testId]);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="container mt-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                </div>

                <p className="mt-3">
                    Loading test...
                </p>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (
            <div className="container mt-5">

                <div className="alert alert-danger">
                    {error}
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/student/tests")}
                >
                    Back to Tests
                </button>

            </div>
        );
    }


    // =====================================================
    // NO TEST
    // =====================================================

    if (!test) {

        return (
            <div className="container mt-5">

                <div className="alert alert-warning">
                    Test not found.
                </div>

            </div>
        );
    }


    const questions = test.questions || [];


    if (questions.length === 0) {

        return (
            <div className="container mt-5">

                <div className="alert alert-warning">
                    No questions are available for this test.
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/student/tests")}
                >
                    Back to Tests
                </button>

            </div>
        );
    }


    const question = questions[currentQuestion];


    // =====================================================
    // QUESTION TYPE
    // =====================================================

    const testType = test.testType
        ? test.testType.toUpperCase()
        : "MCQ";


    // =====================================================
    // MCQ ANSWER
    // =====================================================

    const handleMcqAnswer = (optionId) => {

        setAnswers({
            ...answers,
            [question.id]: optionId
        });

    };


    // =====================================================
    // MSQ ANSWER
    // =====================================================

    const handleMsqAnswer = (optionId) => {

        const existingAnswers =
            answers[question.id] || [];

        let updatedAnswers;

        if (existingAnswers.includes(optionId)) {

            updatedAnswers =
                existingAnswers.filter(
                    id => id !== optionId
                );

        } else {

            updatedAnswers = [
                ...existingAnswers,
                optionId
            ];
        }

        setAnswers({
            ...answers,
            [question.id]: updatedAnswers
        });

    };


    // =====================================================
    // TEXT ANSWER
    // =====================================================

    const handleTextAnswer = (value) => {

        setAnswers({
            ...answers,
            [question.id]: value
        });

    };


    // =====================================================
    // NEXT
    // =====================================================

    const handleNext = () => {

        if (currentQuestion < questions.length - 1) {

            setCurrentQuestion(
                currentQuestion + 1
            );

        }

    };


    // =====================================================
    // PREVIOUS
    // =====================================================

    const handlePrevious = () => {

        if (currentQuestion > 0) {

            setCurrentQuestion(
                currentQuestion - 1
            );

        }

    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to submit the test?"
            );

        if (!confirmed) {
            return;
        }

        console.log("Answers:", answers);

        /*
         * For now we are displaying the answers.
         *
         * Once we confirm your existing submission
         * endpoint/request format, we will connect
         * this button to the backend evaluator.
         */

        alert("Test submitted successfully!");

        navigate("/student/tests");
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="container py-4">

            {/* HEADER */}

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center">

                        <div>

                            <h3 className="mb-1">
                                {test.name}
                            </h3>

                            <p className="text-muted mb-0">

                                {test.topic?.name || "Test"}

                                {" | "}

                                {testType}

                            </p>

                        </div>

                        <div className="text-end">

                            <div className="fw-bold">

                                Question{" "}
                                {currentQuestion + 1}
                                {" / "}
                                {questions.length}

                            </div>

                            <small className="text-muted">

                                Total Marks:{" "}
                                {test.totalMarks}

                            </small>

                        </div>

                    </div>

                </div>

            </div>


            {/* PROGRESS */}

            <div className="progress mb-4"
                style={{ height: "8px" }}>

                <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                        width:
                            `${
                                (
                                    (currentQuestion + 1)
                                    / questions.length
                                ) * 100
                            }%`
                    }}
                >
                </div>

            </div>


            {/* QUESTION */}

            <div className="card shadow-sm">

                <div className="card-body p-4">

                    <div className="d-flex justify-content-between">

                        <h5 className="fw-bold">

                            Q{currentQuestion + 1}.{" "}

                            {question.question}

                        </h5>

                        <span className="badge bg-primary">

                            {question.marks} Mark
                            {question.marks > 1 ? "s" : ""}

                        </span>

                    </div>


                    <hr />


                    {/* =====================================
                        MCQ
                    ===================================== */}

                    {testType === "MCQ" && (

                        <div className="mt-3">

                            {question.options?.map(
                                (option) => (

                                    <div
                                        className="form-check border rounded p-3 mb-2"
                                        key={option.id}
                                    >

                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name={`question-${question.id}`}
                                            id={`option-${option.id}`}
                                            checked={
                                                answers[question.id]
                                                === option.id
                                            }
                                            onChange={() =>
                                                handleMcqAnswer(
                                                    option.id
                                                )
                                            }
                                        />

                                        <label
                                            className="form-check-label ms-2"
                                            htmlFor={`option-${option.id}`}
                                        >
                                            {option.optionText}
                                        </label>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    {/* =====================================
                        MSQ
                    ===================================== */}

                    {testType === "MSQ" && (

                        <div className="mt-3">

                            <p className="text-muted">
                                Select all correct answers.
                            </p>

                            {question.options?.map(
                                (option) => {

                                    const selected =
                                        answers[question.id]
                                        || [];

                                    return (

                                        <div
                                            className="form-check border rounded p-3 mb-2"
                                            key={option.id}
                                        >

                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`option-${option.id}`}
                                                checked={
                                                    selected.includes(
                                                        option.id
                                                    )
                                                }
                                                onChange={() =>
                                                    handleMsqAnswer(
                                                        option.id
                                                    )
                                                }
                                            />

                                            <label
                                                className="form-check-label ms-2"
                                                htmlFor={`option-${option.id}`}
                                            >
                                                {option.optionText}
                                            </label>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}


                    {/* =====================================
                        THEORETICAL / LOGICAL
                    ===================================== */}

                    {(testType === "THEORETICAL" ||
                        testType === "LOGICAL") && (

                        <div className="mt-3">

                            <textarea
                                className="form-control"
                                rows="8"
                                placeholder={
                                    testType === "LOGICAL"
                                        ? "Write your answer/code here..."
                                        : "Write your answer here..."
                                }
                                value={
                                    answers[question.id]
                                    || ""
                                }
                                onChange={(e) =>
                                    handleTextAnswer(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    )}


                    {/* =====================================
                        NAVIGATION
                    ===================================== */}

                    <div className="d-flex justify-content-between mt-4">

                        <button
                            className="btn btn-outline-secondary"
                            onClick={handlePrevious}
                            disabled={
                                currentQuestion === 0
                            }
                        >
                            ← Previous
                        </button>


                        {currentQuestion <
                        questions.length - 1 ? (

                            <button
                                className="btn btn-primary"
                                onClick={handleNext}
                            >
                                Next →
                            </button>

                        ) : (

                            <button
                                className="btn btn-success"
                                onClick={handleSubmit}
                            >
                                Submit Test
                            </button>

                        )}

                    </div>

                </div>

            </div>


            {/* QUESTION NAVIGATION */}

            <div className="card shadow-sm mt-4">

                <div className="card-body">

                    <h6 className="fw-bold mb-3">
                        Questions
                    </h6>

                    <div className="d-flex flex-wrap gap-2">

                        {questions.map(
                            (q, index) => {

                                const answered =
                                    answers[q.id] !== undefined &&
                                    answers[q.id] !== "" &&
                                    (
                                        !Array.isArray(
                                            answers[q.id]
                                        )
                                        ||
                                        answers[q.id].length > 0
                                    );

                                return (

                                    <button
                                        key={q.id}
                                        className={
                                            `btn btn-sm ${
                                                index === currentQuestion
                                                    ? "btn-primary"
                                                    : answered
                                                        ? "btn-success"
                                                        : "btn-outline-secondary"
                                            }`
                                        }
                                        onClick={() =>
                                            setCurrentQuestion(
                                                index
                                            )
                                        }
                                    >
                                        {index + 1}
                                    </button>

                                );

                            }
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default StudentTakeTest;