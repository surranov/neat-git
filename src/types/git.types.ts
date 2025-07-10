/**
 * Represents a git commit
 */
export interface GitCommit {
  /** Full commit hash */
  hash: string;
  /** Short commit hash (7 characters) */
  shortHash: string;
  /** Commit message */
  message: string;
  /** Author information */
  author: GitAuthor;
  /** Commit date */
  date: Date;
  /** Parent commit hashes */
  parents: string[];
  /** Branch names containing this commit */
  branches: string[];
  /** Changed files in this commit */
  files: GitFileChange[];
  /** Graph visualization data */
  graph: GitGraphNode;
}

/**
 * Represents a git author
 */
export interface GitAuthor {
  /** Author name */
  name: string;
  /** Author email */
  email: string;
}

/**
 * Represents a file change in a commit
 */
export interface GitFileChange {
  /** File path */
  path: string;
  /** Previous file path (for renames) */
  previousPath?: string;
  /** Type of change */
  status: GitFileStatus;
  /** Number of additions */
  additions: number;
  /** Number of deletions */
  deletions: number;
  /** Whether file is binary */
  isBinary: boolean;
}

/**
 * File change status
 */
export enum GitFileStatus {
  Added = 'A',
  Modified = 'M',
  Deleted = 'D',
  Renamed = 'R',
  Copied = 'C',
  Unmerged = 'U',
  Unknown = 'X'
}

/**
 * Represents a git branch
 */
export interface GitBranch {
  /** Branch name */
  name: string;
  /** Whether this is the current branch */
  isCurrent: boolean;
  /** Whether this is a remote branch */
  isRemote: boolean;
  /** Remote name (if remote branch) */
  remote?: string;
  /** Last commit hash on this branch */
  lastCommitHash: string;
}

/**
 * Graph node for commit visualization
 */
export interface GitGraphNode {
  /** Column index in the graph */
  column: number;
  /** Visual connections to parent commits */
  connections: GitGraphConnection[];
  /** Color for this branch line */
  color: string;
}

/**
 * Connection between graph nodes
 */
export interface GitGraphConnection {
  /** Source column */
  fromColumn: number;
  /** Target column */
  toColumn: number;
  /** Connection type */
  type: GitGraphConnectionType;
}

/**
 * Type of graph connection
 */
export enum GitGraphConnectionType {
  /** Direct line down */
  Direct = 'direct',
  /** Branch merge */
  Merge = 'merge',
  /** Branch split */
  Split = 'split'
}

/**
 * Repository information
 */
export interface GitRepository {
  /** Repository root path */
  rootPath: string;
  /** Current branch */
  currentBranch: string;
  /** Whether repository has uncommitted changes */
  hasChanges: boolean;
  /** Remote repositories */
  remotes: GitRemote[];
}

/**
 * Remote repository information
 */
export interface GitRemote {
  /** Remote name */
  name: string;
  /** Remote URL */
  url: string;
  /** Whether this is the default remote */
  isDefault: boolean;
} 