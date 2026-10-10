

import { useRef, useState } from "react";
import { uploadPricingCsv } from "../services/pricingApi";
import "./CsvUpload.css";

function CsvUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setFile(selectedFile || null);
    setMessage("");
    setError("");
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a valid CSV file.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    setUploadResult(null);

    try {
      const result = await uploadPricingCsv(file);

      setUploadResult(result);
      setMessage(result.message || "CSV uploaded successfully.");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || "Unable to upload CSV file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="upload-card">
      <div className="upload-heading">
        <div className="upload-icon">↑</div>
        <div>
          <h2>Upload Pricing Data</h2>
          <p>Import retail pricing records from a CSV file.</p>
        </div>
      </div>

      <div className="upload-dropzone">
        <div className="upload-cloud-icon">⇧</div>

        <h3>Upload your CSV file</h3>

        <p>
          Select a file containing Store ID, SKU, Product Name,
          Price and Date.
        </p>

        <input
          ref={fileInputRef}
          id="pricing-csv"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          hidden
        />

        <label htmlFor="pricing-csv" className="choose-file-button">
          Choose CSV file
        </label>

        {file && (
          <div className="selected-file">
            <span>📄</span>
            <span className="selected-file-name">{file.name}</span>
            <button
              type="button"
              className="remove-file-button"
              onClick={() => {
                setFile(null);
                setError("");
                setMessage("");
                setUploadResult(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              aria-label="Remove selected file"
            >
              ×
            </button>
          </div>
        )}

        <p className="file-hint">CSV format · Maximum size 10 MB</p>
      </div>

      {error && (
        <div className="upload-message upload-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="upload-message upload-success" role="status">
          {message}
        </div>
      )}

      {uploadResult && (
        <div className="upload-result">
          <div>
            <span>Valid rows</span>
            <strong>{uploadResult.total_valid_rows}</strong>
          </div>

          <div>
            <span>Imported</span>
            <strong>{uploadResult.imported_count}</strong>
          </div>

          <div>
            <span>Failed rows</span>
            <strong>{uploadResult.failed_rows}</strong>
          </div>
        </div>
      )}

      {uploadResult?.errors?.length > 0 && (
        <div className="upload-row-errors">
          <h4>Rows requiring attention</h4>
          <ul>
            {uploadResult.errors.map((item, index) => (
              <li key={index}>
                {typeof item === "string"
                  ? item
                  : JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="upload-submit-button"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? "Uploading..." : "Upload pricing data"}
      </button>
    </section>
  );
}

export default CsvUpload;