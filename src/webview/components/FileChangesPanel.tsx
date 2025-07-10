import React from 'react';
import { GitCommit, GitFileStatus } from '../../types/git.types';
import { LayoutOrientation } from '../../types/ui.types';
import { getFileName, getFileExtension } from '../../utils/git.utils';
import { FILE_STATUS_COLORS } from '../../constants/config.constants';

interface FileChangesPanelProps {
  commit: GitCommit;
  orientation: LayoutOrientation;
}

/**
 * File changes panel component
 */
export const FileChangesPanel: React.FC<FileChangesPanelProps> = ({
  commit,
  orientation
}) => {
  const getStatusIcon = (status: GitFileStatus): string => {
    switch (status) {
      case GitFileStatus.Added:
        return '+';
      case GitFileStatus.Modified:
        return 'M';
      case GitFileStatus.Deleted:
        return '-';
      case GitFileStatus.Renamed:
        return 'R';
      case GitFileStatus.Copied:
        return 'C';
      case GitFileStatus.Unmerged:
        return 'U';
      default:
        return '?';
    }
  };

  const getStatusColor = (status: GitFileStatus): string => {
    return FILE_STATUS_COLORS[status] || FILE_STATUS_COLORS.X;
  };

  const handleFileClick = (filePath: string) => {
    // TODO: Send message to extension to open file
    console.log('Open file:', filePath);
  };

  return (
    <div className={`file-changes-panel ${orientation}`}>
      <div className="file-changes-header">
        <h3>Changed Files ({commit.files.length})</h3>
        <div className="commit-info">
          <div className="commit-hash" title={commit.hash}>
            {commit.shortHash}
          </div>
          <div className="commit-message" title={commit.message}>
            {commit.message}
          </div>
        </div>
      </div>
      
      <div className="file-changes-list">
        {commit.files.length === 0 ? (
          <div className="no-files">
            No file changes available
          </div>
        ) : (
          commit.files.map((file, index) => (
            <div
              key={`${file.path}-${index}`}
              className="file-change-item"
              onClick={() => handleFileClick(file.path)}
            >
              <div className="file-status">
                <span
                  className="status-icon"
                  style={{ color: getStatusColor(file.status) }}
                  title={file.status}
                >
                  {getStatusIcon(file.status)}
                </span>
              </div>
              
              <div className="file-info">
                <div className="file-name">
                  {getFileName(file.path)}
                </div>
                <div className="file-path" title={file.path}>
                  {file.path}
                </div>
                {file.previousPath && (
                  <div className="previous-path" title={file.previousPath}>
                    Renamed from: {file.previousPath}
                  </div>
                )}
              </div>
              
              <div className="file-stats">
                {!file.isBinary && (
                  <>
                    {file.additions > 0 && (
                      <span className="additions">
                        +{file.additions}
                      </span>
                    )}
                    {file.deletions > 0 && (
                      <span className="deletions">
                        -{file.deletions}
                      </span>
                    )}
                  </>
                )}
                {file.isBinary && (
                  <span className="binary-file">Binary</span>
                )}
              </div>
              
              <div className="file-extension">
                {getFileExtension(file.path)}
              </div>
            </div>
          ))
        )}
      </div>
      
      {commit.files.length > 0 && (
        <div className="file-changes-summary">
          <div className="summary-stats">
            {commit.files.filter(f => f.status === GitFileStatus.Added).length > 0 && (
              <span className="stat added">
                {commit.files.filter(f => f.status === GitFileStatus.Added).length} added
              </span>
            )}
            {commit.files.filter(f => f.status === GitFileStatus.Modified).length > 0 && (
              <span className="stat modified">
                {commit.files.filter(f => f.status === GitFileStatus.Modified).length} modified
              </span>
            )}
            {commit.files.filter(f => f.status === GitFileStatus.Deleted).length > 0 && (
              <span className="stat deleted">
                {commit.files.filter(f => f.status === GitFileStatus.Deleted).length} deleted
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 