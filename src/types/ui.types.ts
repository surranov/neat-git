import { GitCommit } from './git.types';

/**
 * Commit log filters
 */
export interface CommitLogFilters {
  /** Text search filter */
  text?: string;
  /** Branch filter */
  branch?: string;
  /** Author filter */
  author?: string;
  /** Date range filter */
  dateRange?: DateRangeFilter;
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  /** Start date */
  from: Date;
  /** End date */
  to: Date;
}

/**
 * Commit log sorting options
 */
export interface CommitLogSorting {
  /** Sort field */
  field: CommitSortField;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Available sort fields
 */
export enum CommitSortField {
  Date = 'date',
  Author = 'author',
  Message = 'message',
  Hash = 'hash'
}

/**
 * Sort direction
 */
export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc'
}

/**
 * Commit selection state
 */
export interface CommitSelection {
  /** Selected commit hashes */
  selectedCommits: string[];
  /** Currently focused commit */
  focusedCommit?: string;
  /** Selection mode */
  mode: SelectionMode;
}

/**
 * Selection mode
 */
export enum SelectionMode {
  Single = 'single',
  Multiple = 'multiple'
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  /** Layout orientation */
  orientation: LayoutOrientation;
  /** Commit table column widths */
  columnWidths: Record<string, number>;
  /** Whether to show file changes panel */
  showFileChanges: boolean;
  /** File changes panel size */
  fileChangesPanelSize: number;
}

/**
 * Layout orientation
 */
export enum LayoutOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

/**
 * Commit log view state
 */
export interface CommitLogViewState {
  /** Current filters */
  filters: CommitLogFilters;
  /** Current sorting */
  sorting: CommitLogSorting;
  /** Current selection */
  selection: CommitSelection;
  /** Layout configuration */
  layout: LayoutConfig;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: string;
  /** Loaded commits */
  commits: GitCommit[];
  /** Total commit count */
  totalCommits: number;
  /** Current page (for pagination) */
  currentPage: number;
  /** Items per page */
  itemsPerPage: number;
}

/**
 * Webview message types
 */
export enum WebviewMessageType {
  // From extension to webview
  InitializeState = 'initializeState',
  UpdateCommits = 'updateCommits',
  UpdateSelection = 'updateSelection',
  UpdateFilters = 'updateFilters',
  ShowError = 'showError',
  
  // From webview to extension
  RequestCommits = 'requestCommits',
  SelectCommit = 'selectCommit',
  ApplyFilters = 'applyFilters',
  RefreshData = 'refreshData',
  OpenFile = 'openFile',
  CopyCommitHash = 'copyCommitHash'
}

/**
 * Base webview message
 */
export interface WebviewMessage {
  /** Message type */
  type: WebviewMessageType;
  /** Message payload */
  payload?: unknown;
}

/**
 * Message to initialize webview state
 */
export interface InitializeStateMessage extends WebviewMessage {
  type: WebviewMessageType.InitializeState;
  payload: {
    viewState: CommitLogViewState;
    repositoryPath: string;
  };
}

/**
 * Message to update commits
 */
export interface UpdateCommitsMessage extends WebviewMessage {
  type: WebviewMessageType.UpdateCommits;
  payload: {
    commits: GitCommit[];
    totalCommits: number;
  };
}

/**
 * Message to request commits
 */
export interface RequestCommitsMessage extends WebviewMessage {
  type: WebviewMessageType.RequestCommits;
  payload: {
    filters: CommitLogFilters;
    sorting: CommitLogSorting;
    page: number;
    itemsPerPage: number;
  };
}

/**
 * Message to select commit
 */
export interface SelectCommitMessage extends WebviewMessage {
  type: WebviewMessageType.SelectCommit;
  payload: {
    commitHash: string;
    multiSelect: boolean;
  };
}

/**
 * Message to apply filters
 */
export interface ApplyFiltersMessage extends WebviewMessage {
  type: WebviewMessageType.ApplyFilters;
  payload: {
    filters: CommitLogFilters;
  };
}

/**
 * Message to refresh data
 */
export interface RefreshDataMessage extends WebviewMessage {
  type: WebviewMessageType.RefreshData;
  payload: {};
}

/**
 * Message to open file
 */
export interface OpenFileMessage extends WebviewMessage {
  type: WebviewMessageType.OpenFile;
  payload: {
    filePath: string;
    commitHash: string;
  };
}

/**
 * Message to copy commit hash
 */
export interface CopyCommitHashMessage extends WebviewMessage {
  type: WebviewMessageType.CopyCommitHash;
  payload: {
    commitHash: string;
  };
}

/**
 * Message to show error
 */
export interface ShowErrorMessage extends WebviewMessage {
  type: WebviewMessageType.ShowError;
  payload: {
    message: string;
  };
}

/**
 * Union type for all webview messages
 */
export type WebviewMessages = 
  | InitializeStateMessage
  | UpdateCommitsMessage
  | RequestCommitsMessage
  | SelectCommitMessage
  | ApplyFiltersMessage
  | RefreshDataMessage
  | OpenFileMessage
  | CopyCommitHashMessage
  | ShowErrorMessage; 