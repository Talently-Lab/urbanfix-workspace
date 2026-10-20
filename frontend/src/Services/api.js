import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api', //Base de la URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; //Token que figura en Headers
    }

    return config;
});

api.interceptors.response.use(
    (res) => {
        return res; //Si del back recibimos 200 'ok'
    },
    (err) => {
        if (err.response?.status === 401) { //si tuvimos un error entonces limpiamos token y que logee
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(err);
    }
);

export default api;