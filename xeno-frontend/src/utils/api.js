// crm-frontend/src/utils/api.js or xeno-frontend/src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return { data: await response.json() }; // Wraps data in an object to match your existing Axios .data syntax!
  },

  post: async (url, body) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return { data: await response.json() }; // Wraps data in an object to match your existing Axios .data syntax!
  },
  // ⚡ ADD THIS DELETE BLOCK PROTOCOL:
  delete: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return { data: await response.json() };
  }
};

export default api;