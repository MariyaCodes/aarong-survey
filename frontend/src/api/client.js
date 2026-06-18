const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  employeeLogin: (body) => request('/auth/employee/login', { method: 'POST', body: JSON.stringify(body) }),
  hostLogin: (body) => request('/auth/host/login', { method: 'POST', body: JSON.stringify(body) }),
  getProducts: () => request('/survey/products'),
  getProductSurvey: (productId) => request(`/survey/products/${productId}/survey`),
  submitSurvey: (body) => request('/survey/submit', { method: 'POST', body: JSON.stringify(body) }),
  getMySurveys: () => request('/survey/my-surveys'),
  hostDashboard: () => request('/host/dashboard'),
  hostProductLines: () => request('/host/product-lines'),
  updateQuestions: (lineId, questions) =>
    request(`/host/product-lines/${lineId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questions }),
    }),
  hostProducts: () => request('/host/products'),
  hostResponses: () => request('/host/responses'),
  exportSheets: () => request('/host/export/sheets', { method: 'POST' }),
  downloadCsv: async () => {
    const res = await fetch(`${API_BASE}/host/export/csv`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'CSV download failed');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey-responses.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};
