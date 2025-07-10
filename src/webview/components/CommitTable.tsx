import React from 'react';
import { GitCommit } from '../../types/git.types';
import { formatCommitDate, formatCommitMessage } from '../../utils/git.utils';

interface CommitTableProps {
  commits: GitCommit[];
  selectedCommit: GitCommit | null;
  onCommitSelect: (commit: GitCommit) => void;
  columnWidths: Record<string, number>;
}

/**
 * Commit table component
 */
export const CommitTable: React.FC<CommitTableProps> = ({
  commits,
  selectedCommit,
  onCommitSelect,
  columnWidths
}) => {
  const handleRowClick = (commit: GitCommit) => {
    onCommitSelect(commit);
  };

  const handleRowDoubleClick = (commit: GitCommit) => {
    // Copy commit hash on double click
    navigator.clipboard.writeText(commit.hash);
  };

  return (
    <div className="commit-table">
      <div className="commit-table-header">
        <div className="commit-table-row">
          <div 
            className="commit-table-cell header-cell" 
            style={{ width: columnWidths.graph }}
          >
            Graph
          </div>
          <div 
            className="commit-table-cell header-cell" 
            style={{ width: columnWidths.message }}
          >
            Message
          </div>
          <div 
            className="commit-table-cell header-cell" 
            style={{ width: columnWidths.author }}
          >
            Author
          </div>
          <div 
            className="commit-table-cell header-cell" 
            style={{ width: columnWidths.date }}
          >
            Date
          </div>
          <div 
            className="commit-table-cell header-cell" 
            style={{ width: columnWidths.hash }}
          >
            Hash
          </div>
        </div>
      </div>
      
      <div className="commit-table-body">
        {commits.map((commit) => (
          <div
            key={commit.hash}
            className={`commit-table-row ${
              selectedCommit?.hash === commit.hash ? 'selected' : ''
            }`}
            onClick={() => handleRowClick(commit)}
            onDoubleClick={() => handleRowDoubleClick(commit)}
          >
            <div 
              className="commit-table-cell graph-cell" 
              style={{ width: columnWidths.graph }}
            >
              <div className="commit-graph">
                <div 
                  className="commit-node" 
                  style={{ 
                    backgroundColor: commit.graph.color,
                    left: `${commit.graph.column * 16}px`
                  }}
                />
                {commit.branches.length > 0 && (
                  <div className="branch-names">
                    {commit.branches.map(branch => (
                      <span key={branch} className="branch-name">
                        {branch}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div 
              className="commit-table-cell message-cell" 
              style={{ width: columnWidths.message }}
              title={commit.message}
            >
              {formatCommitMessage(commit.message)}
            </div>
            <div 
              className="commit-table-cell author-cell" 
              style={{ width: columnWidths.author }}
              title={`${commit.author.name} <${commit.author.email}>`}
            >
              {commit.author.name}
            </div>
            <div 
              className="commit-table-cell date-cell" 
              style={{ width: columnWidths.date }}
              title={commit.date.toLocaleString()}
            >
              {formatCommitDate(commit.date)}
            </div>
            <div 
              className="commit-table-cell hash-cell" 
              style={{ width: columnWidths.hash }}
              title={commit.hash}
            >
              {commit.shortHash}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 