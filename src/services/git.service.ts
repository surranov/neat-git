import { exec } from 'child_process';
import { promisify } from 'util';
import { GitCommit, GitBranch, GitRepository, GitFileChange } from '../types/git.types';
import { CommitLogFilters, CommitLogSorting } from '../types/ui.types';
import { GIT_COMMANDS, DEFAULT_CONFIG, ERROR_MESSAGES } from '../constants/config.constants';
import { parseGitLog, parseFileChanges, generateCommitGraph } from '../utils/git.utils';

const execAsync = promisify(exec);

/**
 * Service for git operations
 */
export class GitService {
  private repositoryPath: string;
  private commitCache = new Map<string, GitCommit[]>();
  private branchCache: GitBranch[] = [];
  private repositoryInfo: GitRepository | null = null;

  constructor(repositoryPath: string) {
    this.repositoryPath = repositoryPath;
  }

  /**
   * Initializes the git service and validates repository
   */
  async initialize(): Promise<void> {
    try {
      // Check if git is available
      await this.executeGitCommand('git --version');
      
      // Check if directory is a git repository
      const repoRoot = await this.getRepositoryRoot();
      this.repositoryPath = repoRoot;
      
      // Load repository information
      await this.loadRepositoryInfo();
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.NOT_GIT_REPO}: ${error}`);
    }
  }

  /**
   * Gets the repository root path
   */
  private async getRepositoryRoot(): Promise<string> {
    try {
      const { stdout } = await this.executeGitCommand(GIT_COMMANDS.REPO_ROOT);
      return stdout.trim();
    } catch (error) {
      throw new Error(ERROR_MESSAGES.NOT_GIT_REPO);
    }
  }

  /**
   * Loads repository information
   */
  private async loadRepositoryInfo(): Promise<void> {
    try {
      const currentBranch = await this.getCurrentBranch();
      const remotes = await this.getRemotes();
      
      this.repositoryInfo = {
        rootPath: this.repositoryPath,
        currentBranch,
        hasChanges: await this.hasUncommittedChanges(),
        remotes
      };
    } catch (error) {
      console.error('Failed to load repository info:', error);
    }
  }

  /**
   * Gets the current branch name
   */
  private async getCurrentBranch(): Promise<string> {
    try {
      const { stdout } = await this.executeGitCommand(GIT_COMMANDS.CURRENT_BRANCH);
      return stdout.trim();
    } catch (error) {
      return 'HEAD';
    }
  }

  /**
   * Gets remote repositories
   */
  private async getRemotes(): Promise<any[]> {
    try {
      const { stdout } = await this.executeGitCommand(GIT_COMMANDS.REMOTE_LIST);
      const lines = stdout.split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        const parts = line.split('\t');
        return {
          name: parts[0] || '',
          url: parts[1] || '',
          isDefault: parts[0] === 'origin'
        };
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Checks if repository has uncommitted changes
   */
  private async hasUncommittedChanges(): Promise<boolean> {
    try {
      const { stdout } = await this.executeGitCommand('git status --porcelain');
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets commit log with filtering and pagination
   */
  async getCommits(
    filters: CommitLogFilters = {},
    sorting: CommitLogSorting,
    page: number = 0,
    itemsPerPage: number = DEFAULT_CONFIG.COMMITS_PER_PAGE
  ): Promise<{ commits: GitCommit[]; totalCount: number }> {
    try {
      const cacheKey = this.getCacheKey(filters, sorting, page, itemsPerPage);
      
      if (this.commitCache.has(cacheKey)) {
        const cachedCommits = this.commitCache.get(cacheKey)!;
        return {
          commits: cachedCommits,
          totalCount: cachedCommits.length
        };
      }

      const gitCommand = this.buildGitLogCommand(filters, sorting, page, itemsPerPage);
      const { stdout } = await this.executeGitCommand(gitCommand);
      
      const commits = parseGitLog(stdout);
      const commitsWithGraph = generateCommitGraph(commits);
      
      // Load file changes for each commit
      await this.loadFileChangesForCommits(commitsWithGraph);
      
      this.commitCache.set(cacheKey, commitsWithGraph);
      
      return {
        commits: commitsWithGraph,
        totalCount: commitsWithGraph.length
      };
    } catch (error) {
      console.error('Failed to get commits:', error);
      throw new Error(ERROR_MESSAGES.FAILED_TO_LOAD_COMMITS);
    }
  }

  /**
   * Loads file changes for commits
   */
  private async loadFileChangesForCommits(commits: GitCommit[]): Promise<void> {
    const promises = commits.map(async (commit) => {
      try {
        const fileChanges = await this.getCommitFileChanges(commit.hash);
        commit.files = fileChanges;
      } catch (error) {
        console.error(`Failed to load file changes for commit ${commit.hash}:`, error);
        commit.files = [];
      }
    });
    
    await Promise.all(promises);
  }

  /**
   * Gets file changes for a specific commit
   */
  async getCommitFileChanges(commitHash: string): Promise<GitFileChange[]> {
    try {
      const command = `${GIT_COMMANDS.SHOW_FILES} ${commitHash}`;
      const { stdout } = await this.executeGitCommand(command);
      return parseFileChanges(stdout);
    } catch (error) {
      console.error(`Failed to get file changes for commit ${commitHash}:`, error);
      return [];
    }
  }

  /**
   * Gets all branches
   */
  async getBranches(): Promise<GitBranch[]> {
    try {
      if (this.branchCache.length > 0) {
        return this.branchCache;
      }

      const { stdout } = await this.executeGitCommand(GIT_COMMANDS.BRANCH_LIST);
      const lines = stdout.split('\n').filter(line => line.trim());
      
             this.branchCache = lines.map(line => {
         const trimmed = line.trim();
         const isCurrent = trimmed.startsWith('*');
         const isRemote = trimmed.includes('remotes/');
         
         let name = trimmed.replace(/^\*\s*/, '').trim();
         let remote: string | undefined;
         
         if (isRemote) {
           const parts = name.split('/');
           remote = parts[1];
           name = parts.slice(2).join('/');
         }
         
         const branch: GitBranch = {
           name,
           isCurrent,
           isRemote,
           lastCommitHash: '' // TODO: Get last commit hash
         };
         
         if (remote) {
           branch.remote = remote;
         }
         
         return branch;
       });
      
      return this.branchCache;
    } catch (error) {
      console.error('Failed to get branches:', error);
      throw new Error(ERROR_MESSAGES.FAILED_TO_LOAD_BRANCHES);
    }
  }

  /**
   * Gets repository information
   */
  getRepositoryInfo(): GitRepository | null {
    return this.repositoryInfo;
  }

  /**
   * Builds git log command with filters
   */
  private buildGitLogCommand(
    filters: CommitLogFilters,
    _sorting: CommitLogSorting,
    page: number,
    itemsPerPage: number
  ): string {
    let command = GIT_COMMANDS.LOG_GRAPH;
    
    // Add filters
    if (filters.text) {
      command += ` --grep="${filters.text}"`;
    }
    
    if (filters.author) {
      command += ` --author="${filters.author}"`;
    }
    
    if (filters.branch) {
      command += ` ${filters.branch}`;
    }
    
    if (filters.dateRange) {
      const since = filters.dateRange.from.toISOString().split('T')[0];
      const until = filters.dateRange.to.toISOString().split('T')[0];
      command += ` --since="${since}" --until="${until}"`;
    }
    
    // Add pagination
    const skip = page * itemsPerPage;
    if (skip > 0) {
      command += ` --skip=${skip}`;
    }
    command += ` --max-count=${itemsPerPage}`;
    
    return command;
  }

  /**
   * Generates cache key for commits
   */
  private getCacheKey(
    filters: CommitLogFilters,
    _sorting: CommitLogSorting,
    page: number,
    itemsPerPage: number
  ): string {
    return JSON.stringify({ filters, _sorting, page, itemsPerPage });
  }

  /**
   * Executes a git command
   */
  private async executeGitCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    try {
      const result = await execAsync(command, {
        cwd: this.repositoryPath,
        timeout: 30000, // 30 second timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      return result;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(ERROR_MESSAGES.GIT_NOT_FOUND);
      }
      throw error;
    }
  }

  /**
   * Clears the commit cache
   */
  clearCache(): void {
    this.commitCache.clear();
    this.branchCache = [];
  }

  /**
   * Refreshes repository information
   */
  async refresh(): Promise<void> {
    this.clearCache();
    await this.loadRepositoryInfo();
  }
} 