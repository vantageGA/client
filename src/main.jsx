import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { Provider } from 'react-redux';
import App from './App';
import './index.scss';
import store from './store/store';

// Use a configurable API base URL so production can hit Render and dev can proxy locally
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
