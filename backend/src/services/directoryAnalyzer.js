const fs = require('fs-extra');
const path = require('path');

/**
 * Analyze project directory structure
 */
class DirectoryAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.ignoreDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '.cache',
      'tmp',
      'temp'
    ];
  }

  /**
   * Build complete directory tree with file metadata
   */
  async analyze() {
    const structure = await this.buildTree(this.projectPath);
    const stats = this.calculateStats(structure);
    
    return {
      tree: structure,
      stats,
      entryPoints: this.findEntryPoints(structure)
    };
  }

  /**
   * Recursively build directory tree
   */
  async buildTree(currentPath, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) return null;

    const relativePath = path.relative(this.projectPath, currentPath);
    const name = path.basename(currentPath);

    // Skip ignored directories
    if (this.ignoreDirs.includes(name)) {
      return null;
    }

    const stats = await fs.stat(currentPath);

    if (stats.isFile()) {
      return {
        type: 'file',
        name,
        path: relativePath || name,
        size: stats.size,
        extension: path.extname(name),
        modified: stats.mtime,
        lines: await this.countLines(currentPath)
      };
    }

    if (stats.isDirectory()) {
      const items = await fs.readdir(currentPath);
      const children = [];

      for (const item of items) {
        const childPath = path.join(currentPath, item);
        const child = await this.buildTree(childPath, depth + 1, maxDepth);
        if (child) {
          children.push(child);
        }
      }

      return {
        type: 'directory',
        name,
        path: relativePath || '.',
        children,
        fileCount: this.countFiles(children),
        size: this.calculateDirSize(children)
      };
    }

    return null;
  }

  /**
   * Count lines in a file
   */
  async countLines(filePath) {
    try {
      const ext = path.extname(filePath);
      // Only count lines for text files
      const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md', '.txt', '.env'];
      
      if (!textExtensions.includes(ext)) {
        return 0;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Count total files in a directory tree
   */
  countFiles(children) {
    return children.reduce((count, child) => {
      if (child.type === 'file') return count + 1;
      if (child.type === 'directory') return count + child.fileCount;
      return count;
    }, 0);
  }

  /**
   * Calculate total size of directory
   */
  calculateDirSize(children) {
    return children.reduce((total, child) => {
      return total + (child.size || 0);
    }, 0);
  }

  /**
   * Calculate overall statistics
   */
  calculateStats(tree) {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      totalLines: 0,
      filesByType: {},
      largestFiles: []
    };

    const traverse = (node) => {
      if (node.type === 'file') {
        stats.totalFiles++;
        stats.totalSize += node.size;
        stats.totalLines += node.lines || 0;

        // Track by extension
        const ext = node.extension || 'no-extension';
        stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1;

        // Track largest files
        stats.largestFiles.push({
          name: node.name,
          path: node.path,
          size: node.size
        });
      } else if (node.type === 'directory' && node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(tree);

    // Sort largest files
    stats.largestFiles.sort((a, b) => b.size - a.size);
    stats.largestFiles = stats.largestFiles.slice(0, 10);

    return stats;
  }

  /**
   * Find likely entry points (main files)
   */
  findEntryPoints(tree) {
    const entryPoints = [];
    
    const entryFileNames = [
      'index.js',
      'index.ts',
      'main.js',
      'app.js',
      'server.js',
      'index.jsx',
      'index.tsx'
    ];

    const traverse = (node, parentPath = '') => {
      if (node.type === 'file' && entryFileNames.includes(node.name.toLowerCase())) {
        entryPoints.push({
          name: node.name,
          path: node.path,
          type: this.guessEntryPointType(node.path)
        });
      } else if (node.type === 'directory' && node.children) {
        node.children.forEach(child => traverse(child, node.path));
      }
    };

    traverse(tree);
    return entryPoints;
  }

  /**
   * Guess the type of entry point based on path
   */
  guessEntryPointType(filePath) {
    if (filePath.includes('server') || filePath.includes('backend')) return 'backend';
    if (filePath.includes('src') || filePath.includes('client')) return 'frontend';
    if (filePath === 'index.js' || filePath === 'index.ts') return 'main';
    return 'unknown';
  }

  /**
   * Get file content (with size limit)
   */
  async getFileContent(relativePath, maxSize = 500000) { // 500KB limit
    try {
      const fullPath = path.join(this.projectPath, relativePath);
      const stats = await fs.stat(fullPath);

      if (stats.size > maxSize) {
        return {
          error: 'File too large',
          size: stats.size
        };
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        content,
        size: stats.size,
        lines: content.split('\n').length,
        extension: path.extname(relativePath)
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }
}

module.exports = DirectoryAnalyzer;
