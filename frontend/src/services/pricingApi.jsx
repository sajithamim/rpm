
const API_BASE_URL = "http://127.0.0.1:8000";

export async function uploadPricingCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/pricing/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to upload CSV file.");
  }

  return data;
}


export async function updatePricingRecord(recordId, updatedRecord) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/pricing/${recordId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRecord),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update pricing record."
    );
  }


  return data;
}
export async function getPricingRecords(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();

  const url = `${API_BASE_URL}/api/v1/pricing${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch pricing records.");
  }

  return data;
}