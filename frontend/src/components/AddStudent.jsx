import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddStudent = () => {
    const [name, setName] = useState("");
    const [year, setYear] = useState("");
    const [gpa, setGpa] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const newStudent = {
                Name: name,
                Year: parseInt(year),
                GPA: parseFloat(gpa),
                PhoneNumber: phoneNumber,
                Address: address,
            };
            await axios.post("http://127.0.0.1:5000/students", newStudent);
            navigate("/home"); // Redirect to the list after adding
        } catch (err) {
            setError("Failed to add student.");
            console.error("Error adding student:", err);
        }
    };

    return (
        <div className="container">
            <h3>Add New Student</h3>
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
                    Add Student
                </button>
            </form>
        </div>
    );
};

export { AddStudent };