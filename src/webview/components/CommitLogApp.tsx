import React, { useState, useEffect } from 'react';
import { CommitLogViewState, WebviewMessageType, WebviewMessages } from '../../types/ui.types';
import { GitCommit } from '../../types/git.types';
import { CommitTable } from './CommitTable';
import { CommitFilters } from './CommitFilters';
import { FileChangesPanel } from './FileChangesPanel';
import '../../types/vscode.types';

/**
 * Main commit log application component
 */
export const CommitLogApp: React.FC = () => {
  const [viewState, setViewState] = useState<CommitLogViewState | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(null);

  useEffect(() => {
    // Setup message listener
    const messageListener = (event: MessageEvent) => {
      const message = event.data as WebviewMessages;
      handleMessage(message);
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, []);

  /**
   * Handles messages from extension
   */
  const handleMessage = (message: WebviewMessages): void => {
    switch (message.type) {
      case WebviewMessageType.InitializeState:
        if (message.payload) {
          setViewState(message.payload.viewState);
        }
        break;
      case WebviewMessageType.UpdateCommits:
        if (message.payload && viewState) {
          setViewState({
            ...viewState,
            commits: message.payload.commits,
            totalCommits: message.payload.totalCommits,
            isLoading: false
          });
        }
        break;
      case WebviewMessageType.ShowError:
        if (message.payload) {
          console.error('Error:', message.payload.message);
        }
        break;
    }
  };

  /**
   * Sends message to extension
   */
  const sendMessage = (message: WebviewMessages): void => {
    if (typeof acquireVsCodeApi !== 'undefined') {
      const vscode = acquireVsCodeApi();
      vscode.postMessage(message);
    }
  };

  /**
   * Handles commit selection
   */
  const handleCommitSelect = (commit: GitCommit): void => {
    setSelectedCommit(commit);
    
    sendMessage({
      type: WebviewMessageType.SelectCommit,
      payload: {
        commitHash: commit.hash,
        multiSelect: false
      }
    });
  };

  /**
   * Handles filter changes
   */
  const handleFiltersChange = (filters: any): void => {
    sendMessage({
      type: WebviewMessageType.ApplyFilters,
      payload: { filters }
    });
  };

  /**
   * Handles refresh request
   */
  const handleRefresh = (): void => {
    sendMessage({
      type: WebviewMessageType.RefreshData,
      payload: {}
    });
  };

  if (!viewState) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading commit log...</div>
      </div>
    );
  }

  return (
    <div className="commit-log-app">
      <div className="commit-log-header">
        <CommitFilters
          filters={viewState.filters}
          onFiltersChange={handleFiltersChange}
        />
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh
        </button>
      </div>
      
      <div className="commit-log-content">
        <div className="commit-table-container">
          <CommitTable
            commits={viewState.commits}
            selectedCommit={selectedCommit}
            onCommitSelect={handleCommitSelect}
            columnWidths={viewState.layout.columnWidths}
          />
        </div>
        
        {viewState.layout.showFileChanges && selectedCommit && (
          <div className="file-changes-container">
            <FileChangesPanel
              commit={selectedCommit}
              orientation={viewState.layout.orientation}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 