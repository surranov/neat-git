/**
 * VS Code webview API types
 */
export interface VsCodeApi {
  /**
   * Posts a message to the extension
   */
  postMessage(message: any): void;
  
  /**
   * Gets the current state
   */
  getState(): any;
  
  /**
   * Sets the state
   */
  setState(state: any): void;
}

/**
 * Global function to acquire VS Code API
 */
declare global {
  function acquireVsCodeApi(): VsCodeApi;
} 