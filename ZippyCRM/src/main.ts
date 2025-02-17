import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
// Helper function to clear localStorage
function clearLocalStorage() {
  localStorage.clear();
}

// Variables to track timeout
let timeoutId: ReturnType<typeof setTimeout> | null = null;
const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hour in milliseconds

// Function to reset the timeout
function resetInactivityTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(clearLocalStorage, INACTIVITY_LIMIT);
}

// Attach event listeners to track user activity
['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach((event) => {
  window.addEventListener(event, resetInactivityTimeout);
});

// Initialize the inactivity timeout when the page loads
resetInactivityTimeout();
