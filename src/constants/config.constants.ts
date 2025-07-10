/**
 * Default configuration constants
 */
export const DEFAULT_CONFIG = {
  /** Default number of commits to load per page */
  COMMITS_PER_PAGE: 100,
  
  /** Maximum number of commits to load in memory */
  MAX_COMMITS_IN_MEMORY: 1000,
  
  /** Default commit message preview length */
  COMMIT_MESSAGE_PREVIEW_LENGTH: 80,
  
  /** Default debounce delay for search input */
  SEARCH_DEBOUNCE_DELAY: 300,
  
  /** Default column widths for commit table */
  DEFAULT_COLUMN_WIDTHS: {
    graph: 120,
    message: 400,
    author: 150,
    date: 120,
    hash: 80
  },
  
  /** Default file changes panel size */
  DEFAULT_FILE_CHANGES_PANEL_SIZE: 300,
  
  /** Maximum number of files to show in file changes */
  MAX_FILES_TO_SHOW: 100
} as const;

/**
 * Git command constants
 */
export const GIT_COMMANDS = {
  /** Command to get commit log with graph */
  LOG_GRAPH: 'git log --graph --pretty=format:"%H|%h|%P|%s|%an|%ae|%ad|%D" --date=iso --all',
  
  /** Command to get commit files */
  SHOW_FILES: 'git show --name-status --pretty=format:',
  
  /** Command to get file diff */
  SHOW_DIFF: 'git show',
  
  /** Command to get branch list */
  BRANCH_LIST: 'git branch -a',
  
  /** Command to get current branch */
  CURRENT_BRANCH: 'git rev-parse --abbrev-ref HEAD',
  
  /** Command to get repository root */
  REPO_ROOT: 'git rev-parse --show-toplevel',
  
  /** Command to get remote list */
  REMOTE_LIST: 'git remote -v'
} as const;

/**
 * Theme colors for git graph
 */
export const GRAPH_COLORS = [
  '#3498db', // Blue
  '#e74c3c', // Red  
  '#2ecc71', // Green
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Turquoise
  '#34495e', // Dark gray
  '#e67e22', // Dark orange
  '#95a5a6', // Gray
  '#d35400', // Dark red
  '#8e44ad', // Dark purple
  '#27ae60', // Dark green
  '#2980b9', // Dark blue
  '#f1c40f', // Yellow
  '#e74c3c', // Red
  '#16a085'  // Dark turquoise
] as const;

/**
 * File status colors
 */
export const FILE_STATUS_COLORS = {
  A: '#2ecc71', // Added - Green
  M: '#f39c12', // Modified - Orange
  D: '#e74c3c', // Deleted - Red
  R: '#9b59b6', // Renamed - Purple
  C: '#3498db', // Copied - Blue
  U: '#e67e22', // Unmerged - Dark orange
  X: '#95a5a6'  // Unknown - Gray
} as const;

/**
 * UI element sizes
 */
export const UI_SIZES = {
  /** Commit table row height */
  COMMIT_ROW_HEIGHT: 24,
  
  /** Commit table header height */
  COMMIT_HEADER_HEIGHT: 30,
  
  /** Graph column width */
  GRAPH_COLUMN_WIDTH: 16,
  
  /** Graph node radius */
  GRAPH_NODE_RADIUS: 3,
  
  /** Graph line width */
  GRAPH_LINE_WIDTH: 2,
  
  /** Minimum panel size */
  MIN_PANEL_SIZE: 200,
  
  /** Maximum panel size */
  MAX_PANEL_SIZE: 800
} as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  /** Refresh data */
  REFRESH: 'F5',
  
  /** Copy commit hash */
  COPY_HASH: 'Ctrl+C',
  
  /** Select all */
  SELECT_ALL: 'Ctrl+A',
  
  /** Search */
  SEARCH: 'Ctrl+F',
  
  /** Clear search */
  CLEAR_SEARCH: 'Escape'
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  /** Git not found */
  GIT_NOT_FOUND: 'Git executable not found. Please install Git and make sure it is in your PATH.',
  
  /** Not a git repository */
  NOT_GIT_REPO: 'Current workspace is not a Git repository.',
  
  /** Failed to load commits */
  FAILED_TO_LOAD_COMMITS: 'Failed to load commit history. Please check your Git repository.',
  
  /** Failed to load branches */
  FAILED_TO_LOAD_BRANCHES: 'Failed to load branch information.',
  
  /** Failed to load file changes */
  FAILED_TO_LOAD_FILE_CHANGES: 'Failed to load file changes for the selected commit.',
  
  /** Network error */
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  
  /** Unknown error */
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
} as const; 