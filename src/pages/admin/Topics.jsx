import React, { useEffect, useState } from "react";
import api from "../../services/api";

const Topics = () => {

    const [topics, setTopics] = useState([]);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    // =========================================================
    // LOAD TOPICS
    // =========================================================

    const loadTopics = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get("/api/topics");

            setTopics(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Load Topics Error:",
                err
            );

            setError(
                err.response?.data ||
                "Failed to load topics."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadTopics();

    }, []);


    // =========================================================
    // ADD TOPIC
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");


        if (!name.trim()) {

            setError(
                "Please enter topic name."
            );

            return;
        }


        if (!category.trim()) {

            setError(
                "Please enter category."
            );

            return;
        }


        try {

            setSaving(true);


            const response =
                await api.post(
                    "/api/topics",
                    {
                        name: name.trim(),
                        category: category.trim()
                    }
                );


            setTopics(
                previous => [
                    ...previous,
                    response.data
                ]
            );


            setName("");
            setCategory("");


            setMessage(
                "Topic added successfully."
            );


        } catch (err) {

            console.error(
                "Add Topic Error:",
                err
            );

            setError(
                err.response?.data ||
                "Failed to add topic."
            );

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // DELETE TOPIC
    // =========================================================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this topic?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

            await api.delete(
                `/api/topics/${id}`
            );


            setTopics(
                previous =>
                    previous.filter(
                        topic =>
                            topic.id !== id
                    )
            );


            setMessage(
                "Topic deleted successfully."
            );


        } catch (err) {

            console.error(
                "Delete Topic Error:",
                err
            );

            setError(
                err.response?.data ||
                "Failed to delete topic."
            );
        }
    };


    return (

        <div className="container-fluid py-4">

            {/* HEADER */}

            <div className="mb-4">

                <h2 className="fw-bold">
                    📚 Topics
                </h2>

                <p className="text-muted">
                    Manage interview preparation topics.
                </p>

            </div>


            {/* SUCCESS */}

            {message && (

                <div className="alert alert-success">
                    {message}
                </div>

            )}


            {/* ERROR */}

            {error && (

                <div className="alert alert-danger">
                    {error}
                </div>

            )}


            <div className="row g-4">


                {/* =================================================
                    ADD TOPIC
                ================================================= */}

                <div className="col-lg-5">

                    <div className="card shadow-sm border-0">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                Add Topic
                            </h5>


                            <form
                                onSubmit={handleSubmit}
                            >

                                {/* TOPIC NAME */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Topic Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Example: Inheritance"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* CATEGORY */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">
                                        Category
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Example: Core Java"
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* BUTTON */}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "➕ Add Topic"
                                    }

                                </button>

                            </form>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    TOPIC LIST
                ================================================= */}

                <div className="col-lg-7">

                    <div className="card shadow-sm border-0">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-3">

                                <h5 className="fw-bold mb-0">
                                    Topic List
                                </h5>

                                <span className="badge bg-primary">
                                    {topics.length} Topics
                                </span>

                            </div>


                            {loading ? (

                                <div className="text-center py-5">

                                    <div
                                        className="spinner-border text-primary"
                                    />

                                    <p className="mt-3 text-muted">
                                        Loading topics...
                                    </p>

                                </div>

                            ) : topics.length === 0 ? (

                                <div className="text-center text-muted py-5">

                                    <h5>
                                        No topics found
                                    </h5>

                                    <p>
                                        Add your first topic.
                                    </p>

                                </div>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table table-bordered table-hover align-middle">

                                        <thead className="table-light">

                                            <tr>

                                                <th>
                                                    #
                                                </th>

                                                <th>
                                                    Topic
                                                </th>

                                                <th>
                                                    Category
                                                </th>

                                                <th>
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {topics.map(
                                                (topic, index) => (

                                                    <tr
                                                        key={
                                                            topic.id
                                                        }
                                                    >

                                                        <td>
                                                            {index + 1}
                                                        </td>

                                                        <td className="fw-semibold">
                                                            {
                                                                topic.name
                                                            }
                                                        </td>

                                                        <td>

                                                            <span className="badge bg-secondary">
                                                                {
                                                                    topic.category
                                                                }
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        topic.id
                                                                    )
                                                                }
                                                            >
                                                                🗑 Delete
                                                            </button>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Topics;