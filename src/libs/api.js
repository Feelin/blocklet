import { createAxios } from '@blocklet/js-sdk';
import { toast } from 'react-toastify';

const api = createAxios({
  baseURL: window?.blocklet?.prefix || '/',
});

api.interceptors.response.use(function (response) {
  if (response.data.success) {
    return response.data.data;
  }
  toast.error(`request error: ${response.data.message}`, {
    position: "top-center",
    autoClose: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
  return Promise.reject();
}, function (error) {
  return Promise.reject(error);
});

export default api;
