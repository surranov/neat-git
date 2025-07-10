import * as vscode from 'vscode';
import { WebviewMessageType, WebviewMessages } from '../types/ui.types';

/**
 * Webview provider for commit log
 */
export class CommitLogViewProvider {
  public static readonly viewType = 'neat-git.commitLog';

  private _panel: vscode.WebviewPanel | undefined;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  /**
   * Creates and shows the commit log panel
   */
  public createCommitLogPanel(): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If panel already exists, just show it
    if (this._panel) {
      this._panel.reveal(column);
      return;
    }

    // Create webview panel
    this._panel = vscode.window.createWebviewPanel(
      CommitLogViewProvider.viewType,
      'Neat Git - Commit Log',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [this._extensionUri],
        retainContextWhenHidden: true
      }
    );

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      (message: WebviewMessages) => {
        this._handleMessage(message);
      }
    );

    // Handle panel disposal
    this._panel.onDidDispose(() => {
      this._panel = undefined;
    });

    // Initialize the view
    this._initializeView();
  }

  /**
   * Refreshes the commit log data
   */
  public refresh(): void {
    if (this._panel) {
      this._loadCommitData();
    }
  }

  /**
   * Handles messages from webview
   */
  private _handleMessage(message: WebviewMessages): void {
    switch (message.type) {
      case WebviewMessageType.RequestCommits:
        this._loadCommitData();
        break;
      case WebviewMessageType.SelectCommit:
        this._handleCommitSelection(message);
        break;
      case WebviewMessageType.ApplyFilters:
        this._applyFilters(message);
        break;
      case WebviewMessageType.RefreshData:
        this._loadCommitData();
        break;
      case WebviewMessageType.OpenFile:
        this._openFile(message);
        break;
      case WebviewMessageType.CopyCommitHash:
        this._copyCommitHash(message);
        break;
    }
  }

  /**
   * Initializes the webview
   */
  private _initializeView(): void {
    if (!this._panel) {
      return;
    }

    // Get current workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this._showError('No workspace folder found');
      return;
    }

    // Send initial state
    this._panel.webview.postMessage({
      type: WebviewMessageType.InitializeState,
      payload: {
        repositoryPath: workspaceFolder.uri.fsPath,
        viewState: this._getInitialViewState()
      }
    });

    // Load commit data
    this._loadCommitData();
  }

  /**
   * Loads commit data (mock implementation for now)
   */
  private _loadCommitData(): void {
    if (!this._panel) {
      return;
    }

    // Mock data for testing
    const mockCommits = [
      {
        hash: 'abc123',
        shortHash: 'abc123',
        message: 'Initial commit',
        author: { name: 'John Doe', email: 'john@example.com' },
        date: new Date(),
        parents: [],
        branches: ['main'],
        files: [],
        graph: { column: 0, connections: [], color: '#3498db' }
      },
      {
        hash: 'def456',
        shortHash: 'def456',
        message: 'Add feature X',
        author: { name: 'Jane Smith', email: 'jane@example.com' },
        date: new Date(Date.now() - 86400000),
        parents: ['abc123'],
        branches: ['main'],
        files: [],
        graph: { column: 0, connections: [], color: '#3498db' }
      }
    ];

    this._panel.webview.postMessage({
      type: WebviewMessageType.UpdateCommits,
      payload: {
        commits: mockCommits,
        totalCommits: mockCommits.length
      }
    });
  }

  /**
   * Handles commit selection
   */
  private _handleCommitSelection(message: any): void {
    // TODO: Implement commit selection logic
    console.log('Commit selected:', message.payload);
  }

  /**
   * Applies filters to commit log
   */
  private _applyFilters(message: any): void {
    // TODO: Implement filter logic
    console.log('Filters applied:', message.payload);
    this._loadCommitData();
  }

  /**
   * Opens a file in the editor
   */
  private _openFile(message: any): void {
    // TODO: Implement file opening logic
    console.log('Open file:', message.payload);
  }

  /**
   * Copies commit hash to clipboard
   */
  private _copyCommitHash(message: any): void {
    if (message.payload?.commitHash) {
      vscode.env.clipboard.writeText(message.payload.commitHash);
      vscode.window.showInformationMessage('Commit hash copied to clipboard');
    }
  }

  /**
   * Shows an error message
   */
  private _showError(message: string): void {
    if (this._panel) {
      this._panel.webview.postMessage({
        type: WebviewMessageType.ShowError,
        payload: { message }
      });
    }
  }

  /**
   * Gets initial view state
   */
  private _getInitialViewState(): any {
    return {
      filters: {},
      selectedCommit: null,
      showGraph: true,
      layout: 'vertical'
    };
  }

  /**
   * Gets the HTML for the webview
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get the local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js');
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Use a nonce to only allow specific scripts to be run
    const nonce = this._getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
          <title>Neat Git - Commit Log</title>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100vh;
              font-family: var(--vscode-font-family);
              font-size: var(--vscode-font-size);
              background-color: var(--vscode-editor-background);
              color: var(--vscode-editor-foreground);
            }
            #root {
              height: 100vh;
              width: 100vw;
            }
          </style>
      </head>
      <body>
          <div id="root"></div>
          <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  /**
   * Gets a random nonce for security
   */
  private _getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
} 