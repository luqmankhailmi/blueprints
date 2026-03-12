const fs = require('fs').promises;
const path = require('path');

class DirectoryAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.stats = {
      totalFiles: 0,
      totalDirectories: 0,
      totalSize: 0,
      filesByExtension: {},
      largestFiles: [],
    };
  }

  async analyze() {
    try {
      const structure = await this.buildStructure(this.projectPath);
      
      return {
        structure,
        stats: this.stats,
        analyzedAt: new Date(),
      };
    } catch (error) {
      console.error('Directory analysis error:', error);
      throw error;
    }
  }

  async buildStructure(dirPath, relativePath = '', depth = 0, maxDepth = 5) {
    if (depth > maxDepth) return null;

    try {
      const stats = await fs.stat(dirPath);
      const name = path.basename(dirPath);

      // Skip certain directories
      if (this.shouldSkip(name)) {
        return null;
      }

      if (stats.isDirectory()) {
        this.stats.totalDirectories++;
        
        const entries = await fs.readdir(dirPath);
        const children = [];

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry);
          const childRelativePath = path.join(relativePath, entry);
          const child = await this.buildStructure(fullPath, childRelativePath, depth + 1, maxDepth);
          
          if (child) {
            children.push(child);
          }
        }

        return {
          name,
          type: 'directory',
          path: relativePath || '/',
          children: children.sort((a, b) => {
            // Directories first, then files
            if (a.type !== b.type) {
              return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
          }),
          size: await this.getDirectorySize(dirPath),
        };
      } else {
        this.stats.totalFiles++;
        this.stats.totalSize += stats.size;

        const ext = path.extname(name).toLowerCase();
        this.stats.filesByExtension[ext] = (this.stats.filesByExtension[ext] || 0) + 1;

        // Track largest files
        this.stats.largestFiles.push({
          name,
          path: relativePath,
          size: stats.size,
        });
        this.stats.largestFiles.sort((a, b) => b.size - a.size);
        this.stats.largestFiles = this.stats.largestFiles.slice(0, 10);

        return {
          name,
          type: 'file',
          path: relativePath,
          size: stats.size,
          extension: ext,
          modified: stats.mtime,
        };
      }
    } catch (error) {
      console.error(`Error analyzing ${dirPath}:`, error.message);
      return null;
    }
  }

  async getDirectorySize(dirPath) {
    let size = 0;
    try {
      const entries = await fs.readdir(dirPath);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          if (!this.shouldSkip(entry)) {
            size += await this.getDirectorySize(fullPath);
          }
        } else {
          size += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    
    return size;
  }

  shouldSkip(name) {
    const skipPatterns = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      'coverage',
      '.cache',
      '.vscode',
      '.idea',
      '__pycache__',
      'venv',
      '.env',
    ];
    
    return skipPatterns.includes(name) || name.startsWith('.');
  }

  async getFileContent(filePath) {
    try {
      const fullPath = path.join(this.projectPath, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);
      
      return {
        content,
        size: stats.size,
        modified: stats.mtime,
        extension: path.extname(filePath),
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
}

module.exports = DirectoryAnalyzer;
