# Neat Git - Advanced Git Interface for VS Code

A VS Code extension that provides an advanced Git interface inspired by JetBrains IDEs.

## Features

- **Commit Log Viewer** - Browse commit history with an intuitive interface
- **Branch Visualization** - See git graph with branch lines and merge points
- **Advanced Filtering** - Filter commits by text, author, branch, and date
- **File Changes Panel** - View changed files for each commit
- **Performance Optimized** - Handles large repositories efficiently

## Installation

### From Source

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Open VS Code and go to Extensions view
5. Click "Install from VSIX" and select the file from `builds/neat-git-v{version}.vsix`

### Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Open the project in VS Code
4. Press `F5` to start debugging

### Building

To build and package the extension:

```bash
npm run build
```

This creates:
- `/dist/` - Compiled JavaScript files
- `/builds/neat-git-v{version}.vsix` - Installable VS Code extension

The generated VSIX file includes the version number in the filename and is saved to the `builds/` folder for easy management.

## Usage

### Commit Log

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run "Neat Git: Open Commit Log"
3. The commit log will appear in the SCM sidebar

### Features

- **Graph Visualization**: See branch lines and merge points
- **Filtering**: Use the filter bar to search commits
- **File Changes**: Select a commit to see changed files
- **Quick Actions**: Copy commit hash, open files, etc.

## Architecture

The extension is built with:

- **TypeScript** - Full type safety
- **React** - Modern UI components
- **Webpack** - Optimized bundling
- **VS Code API** - Native integration

### Project Structure

```
src/
├── extension/          # VS Code extension code
│   ├── extension.ts    # Main extension entry point
│   └── commit-log-view-provider.ts
├── webview/            # React UI components
│   ├── components/     # React components
│   └── index.tsx       # Webview entry point
├── services/           # Business logic
│   └── git.service.ts  # Git operations
├── types/              # TypeScript definitions
│   ├── git.types.ts    # Git data types
│   └── ui.types.ts     # UI state types
├── utils/              # Utility functions
│   └── git.utils.ts    # Git parsing utilities
├── constants/          # Configuration constants
│   └── config.constants.ts
└── styles/             # CSS styles

builds/                 # Built extension packages
└── neat-git-v{version}.vsix

dist/                   # Compiled JavaScript
├── extension.js
├── webview.js
└── webview.js.LICENSE.txt
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 