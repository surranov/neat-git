import { createRoot } from 'react-dom/client';
import { CommitLogApp } from './components/CommitLogApp';
import '../styles/main.css';

/**
 * Entry point for the webview
 */
function main(): void {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(container);
  root.render(<CommitLogApp />);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
} 