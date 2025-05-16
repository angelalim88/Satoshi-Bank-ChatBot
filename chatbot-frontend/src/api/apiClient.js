const BASE_URL = 'http://localhost:3000'; 

export const apiClient = {
  post: async (url, data) => {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Client Error:', error);
      throw error;
    }
  },
};