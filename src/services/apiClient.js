const defaultBaseUrl = 'http://localhost:8000/api/v1';
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl;
export const apiClient = {
    baseUrl: apiBaseUrl,
    get(url) {
        return fetch(`${this.baseUrl}${url}`).then(async (response) => {
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            return response.json();
        });
    },
};
