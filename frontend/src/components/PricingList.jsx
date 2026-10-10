import { useState, useEffect } from "react";
import { getPricingRecords, updatePricingRecord } from "../services/pricingApi";
import "../App.css";
import CsvUpload from "./CsvUpload";

function PricingList() {
  const [pricingRecords, setPricingRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [filters, setFilters] = useState({
    store_id: "",
    sku: "",
    product_name: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    fetchPricingRecords(1);
  }, []);

  const fetchPricingRecords = async (
    page = 1,
    searchFilters = filters
  ) => {
    try {
      setLoading(true);
      setError("");

      const data = await getPricingRecords({
        ...searchFilters,
        page,
        page_size: pageSize,
      });

      const records = Array.isArray(data)
        ? data
        : data.items ?? data.records ?? data.results ?? [];

      setPricingRecords(records);

      setTotalRecords(
        Array.isArray(data)
          ? records.length
          : data.total ?? records.length
      );

      setCurrentPage(page);
    } catch (err) {
      setError(err.message || "Unable to load pricing records.");
    } finally {
      setLoading(false);
    }
  };


  const totalPages = Math.ceil(totalRecords / pageSize);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchPricingRecords(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchPricingRecords(currentPage + 1);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleEdit = (record) => {
    setEditingId(record.id);

    setEditForm({
      store_id: String(record.store_id ?? ""),
      sku: String(record.sku ?? ""),
      product_name: record.product_name ?? "",
      price: String(record.price ?? ""),
      price_date: record.price_date ?? "",
    });

    setHasChanges(false);
    setEditError("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setHasChanges(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditError("");
  };

  const handleClearFilters = () => {
  const emptyFilters = {
    store_id: "",
    sku: "",
    product_name: "",
    date_from: "",
    date_to: "",
  };

  setFilters(emptyFilters);
  setCurrentPage(1);
  fetchPricingRecords(1, emptyFilters);
};
  
const handleSave = async (recordId) => {
  // 1. Validate required fields
  if (
    !editForm.store_id.trim() ||
    !editForm.sku.trim() ||
    !editForm.product_name.trim() ||
    editForm.price === "" ||
    !editForm.price_date
  ) {
    setEditError("Please fill in all fields.");
    return;
  }

  // 2. Validate price
  const price = Number(editForm.price);

  if (!Number.isFinite(price) || price < 0) {
    setEditError("Please enter a valid, non-negative price.");
    return;
  }

  // 3. Call PUT API
  try {
    setSaving(true);
    setEditError("");

    const updatedRecord = {
      store_id: editForm.store_id.trim(),
      sku: editForm.sku.trim(),
      product_name: editForm.product_name.trim(),
      price: price,
      price_date: editForm.price_date,
    };

    await updatePricingRecord(recordId, updatedRecord);

    // 4. Exit edit mode after successful update
    setEditingId(null);
    setEditForm({});
    setHasChanges(false);

    // 5. Reload the listing with the latest data
    await fetchPricingRecords(currentPage, filters);

  } catch (err) {
    setEditError(err.message || "Failed to update pricing record.");
  } finally {
    setSaving(false);
  }
};
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div>
            <h1>Retail Pricing Management</h1>
            <p>Manage pricing records across stores</p>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="page-heading">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("csv-upload")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            + Upload CSV
          </button>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div className="section-icon">⌕</div>
            <div>
              <h2>Search Records</h2>
              <p>Use one or more filters to find pricing records.</p>
            </div>
          </div>

          <div className="search-grid">
            <label>
              Store ID
              <input
                id="store_id"
                name="store_id"
                value={filters.store_id}
                onChange={handleFilterChange}
                placeholder="Enter store ID"
              />
            </label>

            <label>
              SKU
              <input
                id="sku"
                name="sku"
                value={filters.sku}
                onChange={handleFilterChange}
                placeholder="Enter SKU"
              />
            </label>

            <label>
              Product Name
              <input
                id="product_name"
                name="product_name"
                value={filters.product_name}
                onChange={handleFilterChange}
                placeholder="Enter product name"
              />
            </label>

            <label>
              Date From
              <input
                id="date_from"
                name="date_from"
                type="date"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
            </label>

            <label>
              Date To
              <input
                id="date_to"
                name="date_to"
                type="date"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
            </label>
          </div>

          <div className="search-actions">
            <button
              type="button"
              onClick={() => fetchPricingRecords(1, filters)}
              disabled={loading}
            >
              Search
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </section>

        <section className="panel records-panel">
          <div className="records-heading">
            <div>
              <h2>Pricing Records</h2>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Store ID</th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Pricing Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {/* {pricingRecords.length > 0 ? (
                  pricingRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.store_id}</td>
                      <td>{record.sku}</td>
                      <td>{record.product_name}</td>
                      <td>{Number(record.price).toFixed(2)}</td>
                      <td>{record.price_date}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleEdit(record)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-icon">⌕</div>
                      <strong>No pricing records loaded</strong>
                      <p>
                        Search using the filters above to find records.
                      </p>
                    </td>
                  </tr>
                )} */}

                {pricingRecords.length > 0 ? (
                  pricingRecords.map((record) => (
                    <tr key={record.id}>
                      {editingId === record.id ? (
                        <>
                          <td>
                            <input
                              name="store_id"
                              value={editForm.store_id}
                              onChange={handleEditChange}
                              aria-label="Store ID"
                            />
                          </td>

                          <td>
                            <input
                              name="sku"
                              value={editForm.sku}
                              onChange={handleEditChange}
                              aria-label="SKU"
                            />
                          </td>

                          <td>
                            <input
                              name="product_name"
                              value={editForm.product_name}
                              onChange={handleEditChange}
                              aria-label="Product name"
                            />
                          </td>

                          <td>
                            <input
                              name="price"
                              type="number"
                              min="0"
                              step="0.01"
                              value={editForm.price}
                              onChange={handleEditChange}
                              aria-label="Price"
                            />
                          </td>

                          <td>
                            <input
                              name="price_date"
                              type="date"
                              value={editForm.price_date}
                              onChange={handleEditChange}
                              aria-label="Price date"
                            />
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() => handleSave(record.id)}
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{record.store_id}</td>
                          <td>{record.sku}</td>
                          <td>{record.product_name}</td>
                          <td>{Number(record.price).toFixed(2)}</td>
                          <td>{record.price_date}</td>

                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                if (hasChanges) {
                                  handleSave(record.id);
                                } else {
                                  handleEdit(record);
                                }
                              }}
                              disabled={saving || (editingId !== null && editingId !== record.id)}
                            >
                              {editingId === record.id && hasChanges
                                ? saving
                                  ? "Saving..."
                                  : "Save"
                                : "Edit"}
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-icon">⌕</div>
                      <strong>No pricing records loaded</strong>
                      <p>Search using the filters above to find records.</p>
                    </td>
                  </tr>
                )}
                <div className="pagination">
                  <span className="pagination-info">
                    Showing{" "}
                    {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    {" - "}
                    {Math.min(currentPage * pageSize, totalRecords)}
                    {" of "}
                    {totalRecords} records
                  </span>

                  <div className="pagination-controls">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={loading || currentPage === 1}
                    >
                      Previous
                    </button>

                    <span className="page-number">
                      Page {currentPage} of {Math.max(totalPages, 1)}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={loading || currentPage >= totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </tbody>
            </table>
          </div>
        </section>

        <section id="csv-upload">
          <CsvUpload />
        </section>
      </main>
    </div>
  );
}

export default PricingList;