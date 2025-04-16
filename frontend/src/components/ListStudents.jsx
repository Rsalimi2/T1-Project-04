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
    const [originalStudents, setOriginalStudents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maskingConfig, setMaskingConfig] = useState({});
    const [isMasking, setIsMasking] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // You can adjust this value
    const [totalPages, setTotalPages] = useState(0);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://127.0.0.1:5000/students");
            const studentData = response.data;
            setOriginalStudents(studentData); // Store the original data
            setStudents(studentData);
            setMaskingConfig(analyzeDataTypes(columnOrder, studentData));
            setTotalPages(Math.ceil(studentData.length / itemsPerPage)); // Calculate total pages
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
            console.error("Error fetching students:", err);
        }
    }, [itemsPerPage]); // Added itemsPerPage as a dependency

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    useEffect(() => {
        // Recalculate total pages whenever the students data or itemsPerPage changes
        setTotalPages(Math.ceil(students.length / itemsPerPage));
        // Reset to the first page if the current page is out of bounds
        if (currentPage > Math.ceil(students.length / itemsPerPage) && Math.ceil(students.length / itemsPerPage) > 0) {
            setCurrentPage(1);
        }
    }, [students, itemsPerPage, currentPage]);

    const handleDelete = (id) => {
        axios
            .delete(`http://127.0.0.1:5000/students/${id}`)
            .then(() => {
                setStudents((prevStudents) => prevStudents.filter((student) => student.StudentID !== id));
                setOriginalStudents((prevOriginalStudents) => prevOriginalStudents.filter((student) => student.StudentID !== id));
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
                data: originalStudents, // Use original data for masking
                originalData: originalStudents, // Send original data for "none" rule
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

    const saveMaskingConfigCsv = () => {
        const csvRows = [];
        const headers = ["Field", "Masking Rule"];
        csvRows.push(headers.join(','));

        for (const field in maskingConfig) {
            if (maskingConfig.hasOwnProperty(field)) {
                const rule = maskingConfig[field].maskingRule;
                csvRows.push([field, rule].join(','));
            }
        }

        const csvData = csvRows.join('\n');
        const filename = 'masking_config.csv';
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSaveConfig = () => {
        saveMaskingConfigCsv();
    };

    const toggleConfigDisplay = () => {
        setShowConfig(!showConfig);
    };

    const downloadStudentData = () => {
        const csvRows = [];
        if (students.length > 0) {
            const headers = columnOrder.join(',');
            csvRows.push(headers);

            students.forEach(student => {
                const values = columnOrder.map(key => student[key]);
                csvRows.push(values.join(','));
            });

            const csvData = csvRows.join('\n');
            const filename = 'student_data.csv';
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert("No student data to download.");
        }
    };

    // Function to get the students for the current page
    const getCurrentPageStudents = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return students.slice(startIndex, endIndex);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (event) => {
        const newItemsPerPage = parseInt(event.target.value, 10);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to the first page when items per page changes
    };

    const renderPaginationControls = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination-controls">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="button pagination-button"
                >
                    Previous
                </button>
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`button pagination-button ${currentPage === number ? 'active' : ''}`}
                    >
                        {number}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="button pagination-button"
                >
                    Next
                </button>
                <div className="items-per-page">
                    Items per page:
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Loading student data...</div>;
    }

    if (error) {
        return <div className="error">Error loading student data: {error}</div>;
    }

    const currentPageStudents = getCurrentPageStudents();

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
                    Download Student Data (CSV)
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
                    {currentPageStudents.map((student) => (
                        <tr key={student.StudentID}>
                            {columnOrder.map(key => (
                                <td key={key}>{student[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {students.length > 0 && renderPaginationControls()}
        </div>
    );
};

export { StudentList };