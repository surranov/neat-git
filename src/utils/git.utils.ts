import { GitCommit, GitAuthor, GitFileChange, GitFileStatus } from '../types/git.types';
import { GRAPH_COLORS } from '../constants/config.constants';

/**
 * Parses git log output into commit objects
 */
export function parseGitLog(logOutput: string): GitCommit[] {
  const lines = logOutput.split('\n').filter(line => line.trim());
  const commits: GitCommit[] = [];
  
  for (const line of lines) {
    if (line.includes('|')) {
      const commit = parseCommitLine(line);
      if (commit) {
        commits.push(commit);
      }
    }
  }
  
  return commits;
}

/**
 * Parses a single git log line into a commit object
 */
export function parseCommitLine(line: string): GitCommit | null {
  try {
    // Remove git graph characters
    const cleanLine = line.replace(/^[\s\*\|\\\/\-_]+/, '').trim();
    
    // Parse format: "hash|shortHash|parents|subject|authorName|authorEmail|date|refs"
    const parts = cleanLine.split('|');
    
    if (parts.length < 7) {
      return null;
    }
    
    const hash = parts[0];
    const shortHash = parts[1];
    const parents = parts[2];
    const message = parts[3];
    const authorName = parts[4];
    const authorEmail = parts[5];
    const date = parts[6];
    const refs = parts[7];
    
    if (!hash || !shortHash || !message || !authorName || !authorEmail || !date) {
      return null;
    }
    
    const author: GitAuthor = {
      name: authorName.trim(),
      email: authorEmail.trim()
    };
    
    const commit: GitCommit = {
      hash: hash.trim(),
      shortHash: shortHash.trim(),
      message: message.trim(),
      author,
      date: new Date(date.trim()),
      parents: parents ? parents.trim().split(' ').filter(p => p) : [],
      branches: parseBranches(refs || ''),
      files: [], // Will be populated separately
      graph: {
        column: 0,
        connections: [],
        color: GRAPH_COLORS[0]!
      }
    };
    
    return commit;
  } catch (error) {
    console.error('Error parsing commit line:', line, error);
    return null;
  }
}

/**
 * Parses branch references from git log refs
 */
export function parseBranches(refs: string): string[] {
  if (!refs.trim()) {
    return [];
  }
  
  const branches: string[] = [];
  const parts = refs.split(',').map(part => part.trim());
  
  for (const part of parts) {
    // Extract branch names from refs like "origin/main", "main", "tag: v1.0"
    if (part.startsWith('origin/')) {
      branches.push(part.substring(7));
    } else if (part.startsWith('refs/heads/')) {
      branches.push(part.substring(11));
    } else if (!part.startsWith('tag:') && !part.startsWith('refs/')) {
      branches.push(part);
    }
  }
  
  return branches;
}

/**
 * Parses git show output for file changes
 */
export function parseFileChanges(showOutput: string): GitFileChange[] {
  const lines = showOutput.split('\n').filter(line => line.trim());
  const changes: GitFileChange[] = [];
  
  for (const line of lines) {
    const change = parseFileChangeLine(line);
    if (change) {
      changes.push(change);
    }
  }
  
  return changes;
}

/**
 * Parses a single file change line
 */
export function parseFileChangeLine(line: string): GitFileChange | null {
  try {
    // Format: "M\tfile.txt" or "R100\told.txt\tnew.txt"
    const parts = line.split('\t');
    
    if (parts.length < 2) {
      return null;
    }
    
    const statusPart = parts[0]!.trim();
    const filePath = parts[1]!.trim();
    
    // Parse status
    const status = statusPart.charAt(0) as GitFileStatus;
    
    // Handle renames
    if (status === GitFileStatus.Renamed && parts.length > 2) {
      const newPath = parts[2]!.trim();
      
      return {
        path: newPath,
        previousPath: filePath,
        status,
        additions: 0,
        deletions: 0,
        isBinary: false
      };
    }
    
    return {
      path: filePath,
      status,
      additions: 0,
      deletions: 0,
      isBinary: false
    };
  } catch (error) {
    console.error('Error parsing file change line:', line, error);
    return null;
  }
}

/**
 * Generates graph visualization data for commits
 */
export function generateCommitGraph(commits: GitCommit[]): GitCommit[] {
  const colorMap = new Map<string, string>();
  let nextColumn = 0;
  let colorIndex = 0;
  
  for (const commit of commits) {
    // Determine which column this commit should be in
    let column = 0;
    
    // Find the best column for this commit
    if (commit.parents.length === 0) {
      // Root commit
      column = nextColumn++;
    } else if (commit.parents.length === 1) {
      // Normal commit
      const parentHash = commit.parents[0]!;
      const parentColumn = findCommitColumn(commits, parentHash);
      column = parentColumn !== -1 ? parentColumn : nextColumn++;
    } else {
      // Merge commit
      const firstParentHash = commit.parents[0]!;
      const firstParentColumn = findCommitColumn(commits, firstParentHash);
      column = firstParentColumn !== -1 ? firstParentColumn : nextColumn++;
    }
    
    // Assign color
    if (!colorMap.has(commit.hash)) {
      colorMap.set(commit.hash, GRAPH_COLORS[colorIndex % GRAPH_COLORS.length]!);
      colorIndex++;
    }
    
    // Update graph data
    commit.graph = {
      column,
      connections: generateConnections(commit, commits),
      color: colorMap.get(commit.hash)!
    };
  }
  
  return commits;
}

/**
 * Finds the column of a commit by hash
 */
function findCommitColumn(commits: GitCommit[], hash: string): number {
  const commit = commits.find(c => c.hash === hash);
  return commit ? commit.graph.column : -1;
}

/**
 * Generates graph connections for a commit
 */
function generateConnections(_commit: GitCommit, _commits: GitCommit[]) {
  // This is a simplified implementation
  // In a full implementation, you would calculate the actual graph connections
  return [];
}

/**
 * Formats commit date for display
 */
export function formatCommitDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Formats commit message for display
 */
export function formatCommitMessage(message: string, maxLength: number = 80): string {
  if (message.length <= maxLength) {
    return message;
  }
  
  return message.substring(0, maxLength - 3) + '...';
}

/**
 * Validates if a string is a valid git hash
 */
export function isValidGitHash(hash: string): boolean {
  return /^[0-9a-f]{4,40}$/i.test(hash);
}

/**
 * Extracts the file extension from a file path
 */
export function getFileExtension(filePath: string): string {
  const lastDotIndex = filePath.lastIndexOf('.');
  return lastDotIndex !== -1 ? filePath.substring(lastDotIndex + 1) : '';
}

/**
 * Gets the file name from a file path
 */
export function getFileName(filePath: string): string {
  const lastSlashIndex = filePath.lastIndexOf('/');
  return lastSlashIndex !== -1 ? filePath.substring(lastSlashIndex + 1) : filePath;
} 