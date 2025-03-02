import React, { useState, useRef } from "react";
import { getExpiryDatesForTags } from "./dellService";
import { readExcelFile, writeExcelFile } from "./excelService";

const DellExpiryChecker = () => {
  const [file, setFile] = useState(null);
  const [serviceTags, setServiceTags] = useState([]);
  const [expiryDates, setExpiryDates] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cancelProcessingRef = useRef(false);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const tags = await readExcelFile(selectedFile);
    setServiceTags(tags);
  };

  const fetchExpiryDates = async () => {
    setIsProcessing(true);
    cancelProcessingRef.current = false;

    const results = [];

    for (let i = 0; i < serviceTags.length; i++) {
      if (cancelProcessingRef.current) {
        break;
      }
      const result = await getExpiryDatesForTags([serviceTags[i]]);
      results.push(result[0]);
      setExpiryDates([...results]);
    }

    setExpiryDates(results);
    setIsProcessing(false);

    if (!cancelProcessingRef.current) {
      const dataWithExpiryDates = results.map(({ serviceTag, expiryDate }) => ({
        ServiceTag: serviceTag,
        ExpiryDate: expiryDate,
      }));

      const blob = writeExcelFile(dataWithExpiryDates);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expiry_dates.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleStop = () => {
    cancelProcessingRef.current = true;
    setIsProcessing(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>Service tag expiry checker</h1>
        <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" style={styles.fileInput} />
        {serviceTags.length > 0 && !isProcessing && (
          <button onClick={fetchExpiryDates} style={styles.button}>
            Check Expiry Dates
          </button>
        )}
        {isProcessing && (
          <button onClick={handleStop} style={styles.stopButton}>
            Stop
          </button>
        )}
        {expiryDates.length > 0 && (
          <div style={styles.tableContainer}>
            <h2 style={styles.tableHeader}>Expiry Dates:</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeaderCell}>Service Tag</th>
                  <th style={styles.tableHeaderCell}>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {expiryDates.map(({ serviceTag, expiryDate }) => (
                  <tr
                    key={serviceTag}
                    style={expiryDate === "Not found" ? { ...styles.tableCell, ...styles.errorRow } : styles.tableCell}
                  >
                    <td style={styles.tableCell}>{serviceTag}</td>
                    <td style={styles.tableCell}>{expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, #38ef7d, #11998e)",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "500px",
    width: "100%",
  },
  header: {
    fontSize: "2em",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  fileInput: {
    display: "block",
    marginBottom: "20px",
    width: "95%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#38ef7d",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  stopButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#e74c3c",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  tableContainer: {
    marginTop: "20px",
  },
  tableHeader: {
    fontSize: "1.5em",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderCell: {
    padding: "10px",
    backgroundColor: "#38ef7d",
    color: "white",
    textAlign: "left",
  },
  tableCell: {
    padding: "10px",
    borderBottom: "1px solid #ccc",
  },
  errorRow: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
};

export default DellExpiryChecker;
