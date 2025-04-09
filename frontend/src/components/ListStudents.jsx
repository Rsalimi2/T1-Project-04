import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import '../styles.css';

const columnOrder = ["StudentID", "Name", "Year", "GPA", "PhoneNumber", "Address"];

const analyzeDataTypes = (fields, students) => {
    const config = {};
    if (!students || students.length === 0) {
        fields.forEach(field => {
            config[field] = { dataType: 'string', maskingRule: 'none' };
        });
        return config;
    }

    fields.forEach(field => {
        let dataType = 'string'; // Default
        const sampleSize = Math.min(students.length, 5); // Check the first 5 records
        for (let i = 0; i < sampleSize; i++) {
            const value = students[i][field];
            if (value !== null && value !== undefined) {
                if (!isNaN(parseFloat(value)) && isFinite(value)) {
                    dataType = 'number';
                    break; // Assume number if any sample is a number
                } else if (typeof value === 'boolean' || value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                    dataType = 'boolean';
                    break; // Assume boolean if any sample is a boolean
                }
            }
        }

        let suggestedRule = 'none';
        if (dataType === 'string') {
            suggestedRule = 'partial';
        } else if (dataType === 'number') {
            suggestedRule = 'generalized';
        } else if (dataType === 'boolean') {
            suggestedRule = 'generalized';
        }

        config[field] = { dataType: dataType, maskingRule: suggestedRule };
    });
    return config;
};

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maskingConfig, setMaskingConfig] = useState({});
    const [isMasking, setIsMasking] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://127.0.0.1:5000/students");
            const studentData = response.data;
            setStudents(studentData);
            setMaskingConfig(analyzeDataTypes(columnOrder, studentData));
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
            console.error("Error fetching students:", err);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleDelete = (id) => {
        axios
            .delete(`http://127.0.0.1:5000/students/${id}`)
            .then(() => {
                setStudents((prevStudents) => prevStudents.filter((student) => student.StudentID !== id));
            })
            .catch((err) => {
                console.error("Error deleting student:", err);
                setError("Failed to delete student.");
            });
    };

    const handleMaskingConfigChange = (field, newRule) => {
        setMaskingConfig(prevConfig => ({
            ...prevConfig,
            [field]: { ...prevConfig[field], maskingRule: newRule }
        }));
    };

    const handleApplyMasking = async () => {
        setIsMasking(true);
        setError(null);
        try {
            const response = await axios.post("http://127.0.0.1:5000/api/mask", {
                data: students,
                originalData: students, // Send original data for "none" rule
                config: maskingConfig,
            });
            setStudents(response.data);
        } catch (err) {
            setError("Failed to apply masking.");
            console.error("Error applying masking:", err);
        } finally {
            setIsMasking(false);
        }
    };

    const handleSaveConfig = () => {
        const configData = JSON.stringify(maskingConfig, null, 2);
        const filename = 'masking_config.json';
        const blob = new Blob([configData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const toggleConfigDisplay = () => {
        setShowConfig(!showConfig);
    };

    const downloadStudentData = () => {
        const studentData = JSON.stringify(students, null, 2);
        const filename = 'student_data.json';
        const blob = new Blob([studentData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="loading">Loading student data...</div>;
    }

    if (error) {
        return <div className="error">Error loading student data: {error}</div>;
    }

    return (
        <div className="student-list-container container">
            <h2>Student List</h2>
            <div className="actions-bar">
                <Link to="/add" className="add-button">
                    Add New Student
                </Link>
                <div className="masking-controls">
                    <button onClick={toggleConfigDisplay} className="button show-config-button">
                        {showConfig ? 'Hide Masking Config' : 'Show Masking Config'}
                    </button>
                    <button onClick={handleApplyMasking} className="button primary-button">
                        Apply Masking
                    </button>
                    <button onClick={handleSaveConfig} className="button save-config-button">
                        Save Masking Config
                    </button>
                    {isMasking && <div className="masking-loading">Applying Masking...</div>}
                </div>
                <button onClick={downloadStudentData} className="button download-button">
                    Download Student Data
                </button>
            </div>

            {showConfig && (
                <div className="masking-config">
                    <h3>Masking Configuration</h3>
                    <table className="config-table">
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Data Type</th>
                                <th>Masking Rule</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(maskingConfig).map(([field, config]) => (
                                <tr key={field}>
                                    <td>{field}</td>
                                    <td>{config.dataType}</td>
                                    <td>
                                        <select
                                            value={config.maskingRule}
                                            onChange={(e) => handleMaskingConfigChange(field, e.target.value)}
                                        >
                                            <option value="none">None</option>
                                            {config.dataType === 'number' ? (
                                                <>
                                                    <option value="generalized">Generalized</option>
                                                    <option value="hash">Hash</option>
                                                    <option value="faker">Faker</option>
                                                </>
                                            ) : config.dataType === 'boolean' ? (
                                                <>
                                                    <option value="generalized">Generalized</option>
                                                    <option value="faker">Faker</option>
                                                </>
                                            ) : ( // Default to string
                                                <>
                                                    <option value="partial">Partial</option>
                                                    <option value="generalized">Generalized</option>
                                                    <option value="hash">Hash</option>
                                                    <option value="faker">Faker</option>
                                                </>
                                            )}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <table className="student-table">
                <thead>
                    <tr>
                        {columnOrder.map(key => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.StudentID}>
                            {columnOrder.map(key => (
                                <td key={key}>{student[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <Link to="/audit-log" className="button secondary-button">
                View Audit Log
            </Link>
        </div>
    );
};

export { StudentList };