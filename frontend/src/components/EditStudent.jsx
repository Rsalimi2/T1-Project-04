import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [year, setYear] = useState("");
    const [gpa, setGpa] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axios.get(`http://127.0.0.1:5000/students/${id}`);
                const studentData = response.data;
                setName(studentData.Name);
                setYear(studentData.Year);
                setGpa(studentData.GPA);
                setPhoneNumber(studentData.PhoneNumber);
                setAddress(studentData.Address);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch student data.");
                console.error("Error fetching student:", err);
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const updatedStudent = {
                Name: name,
                Year: parseInt(year),
                GPA: parseFloat(gpa),
                PhoneNumber: phoneNumber,
                Address: address,
            };
            await axios.put(`http://127.0.0.1:5000/students/${id}`, updatedStudent);
            navigate("/home"); // Redirect back to the student list after successful update
        } catch (err) {
            setError("Failed to update student.");
            console.error("Error updating student:", err);
        }
    };

    if (loading) {
        return <div className="loading">Loading student data for edit...</div>;
    }

    if (error) {
        return <div className="error">Error loading student data for edit: {error}</div>;
    }

    return (
        <div className="container">
            <h3>Edit Student</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="student-form">
                <div className="input-group">
                    <label htmlFor="name" className="label">
                        Name:
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="year" className="label">
                        Year:
                    </label>
                    <input
                        type="number"
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        min="1"
                        max="4"
                        required
                        className="input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="gpa" className="label">
                        GPA:
                    </label>
                    <input
                        type="number"
                        id="gpa"
                        value={gpa}
                        onChange={(e) => setGpa(e.target.value)}
                        min="0.0"
                        max="4.0"
                        step="0.01"
                        required
                        className="input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="phoneNumber" className="label">
                        Phone:
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="address" className="label">
                        Address:
                    </label>
                    <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <button type="submit" className="submit-button">
                    Update Student
                </button>
            </form>
        </div>
    );
};

export { EditStudent };