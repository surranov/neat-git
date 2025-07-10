import * as vscode from 'vscode';
import { WebviewMessageType, WebviewMessages } from '../types/ui.types';

/**
 * Webview provider for commit log
 */
export class CommitLogViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'neat-git.commitLog';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  /**
   * Resolves the webview view
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(
      (message: WebviewMessages) => {
        this._handleMessage(message);
      }
    );

    // Initialize the view
    this._initializeView();
  }

  /**
   * Refreshes the commit log data
   */
  public refresh(): void {
    if (this._view) {
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
    if (!this._view) {
      return;
    }

    // Get current workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this._showError('No workspace folder found');
      return;
    }

    // Send initial state
    this._view.webview.postMessage({
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
    if (!this._view) {
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

    this._view.webview.postMessage({
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
    if (this._view) {
      this._view.webview.postMessage({
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
      sorting: { field: 'date', direction: 'desc' },
      selection: { selectedCommits: [], mode: 'single' },
      layout: {
        orientation: 'horizontal',
        columnWidths: {
          graph: 120,
          message: 400,
          author: 150,
          date: 120,
          hash: 80
        },
        showFileChanges: true,
        fileChangesPanelSize: 300
      },
      isLoading: false,
      commits: [],
      totalCommits: 0,
      currentPage: 0,
      itemsPerPage: 100
    };
  }

  /**
   * Gets HTML for webview
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get the local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js');
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Neat Git - Commit Log</title>
        <style>
            body {
                padding: 0;
                margin: 0;
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            #root {
                height: 100vh;
                width: 100%;
            }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }
} 