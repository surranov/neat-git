import * as vscode from 'vscode';
import { CommitLogViewProvider } from './commit-log-view-provider';

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('Neat Git extension is now active!');

  // Create commit log view provider
  const commitLogProvider = new CommitLogViewProvider(context.extensionUri);

  // Register commands
  const openCommitLogCommand = vscode.commands.registerCommand(
    'neat-git.openCommitLog',
    () => {
      // Create and show commit log panel
      commitLogProvider.createCommitLogPanel();
    }
  );

  const refreshCommand = vscode.commands.registerCommand(
    'neat-git.refresh',
    () => {
      commitLogProvider.refresh();
    }
  );

  // Add to subscriptions
  context.subscriptions.push(
    openCommitLogCommand,
    refreshCommand
  );
}

/**
 * Extension deactivation function
 */
export function deactivate(): void {
  console.log('Neat Git extension is now deactivated!');
} 