import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";
import { reportClientError } from "./lib/errorReporting";

window.addEventListener('unhandledrejection', event => {
  reportClientError('unhandled_rejection', event.reason);
});

window.addEventListener('error', event => {
  if (event.error || event.message) reportClientError('unhandled_error', event.error || event.message);
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
