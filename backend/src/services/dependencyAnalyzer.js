const fs = require('fs').promises;
const path = require('path');

class DependencyAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  async analyze() {
    try {
      // Find all package.json files in the project
      const packageFiles = await this.findAllPackageJson(this.projectPath);

      if (packageFiles.length === 0) {
        return {
          packageFiles: [],
          totalCount: 0,
          error: 'No package.json files found',
        };
      }

      // Analyze each package.json
      const analyzedPackages = [];
      for (const filePath of packageFiles) {
        const analysis = await this.analyzePackageJson(filePath);
        if (analysis) {
          analyzedPackages.push({
            filePath: filePath.replace(this.projectPath, ''),
            ...analysis
          });
        }
      }

      return {
        packageFiles: analyzedPackages,
        totalCount: analyzedPackages.reduce((sum, pkg) => sum + pkg.totalCount, 0),
      };
    } catch (error) {
      console.error('Dependency analysis error:', error);
      throw error;
    }
  }

  async findAllPackageJson(dir, depth = 0, maxDepth = 5) {
    if (depth > maxDepth) return [];
    
    const packageFiles = [];
    
    try {
      const entries = await fs.readdir(dir);
      
      for (const entry of entries) {
        if (this.shouldSkip(entry)) continue;
        
        const fullPath = path.join(dir, entry);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          const subFiles = await this.findAllPackageJson(fullPath, depth + 1, maxDepth);
          packageFiles.push(...subFiles);
        } else if (entry === 'package.json') {
          packageFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    
    return packageFiles;
  }

  async analyzePackageJson(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      const peerDependencies = packageJson.peerDependencies || {};
      
      return {
        dependencies: this.categorizeDependencies(dependencies),
        devDependencies: this.categorizeDependencies(devDependencies),
        peerDependencies: this.categorizeDependencies(peerDependencies),
        totalCount: Object.keys(dependencies).length + Object.keys(devDependencies).length + Object.keys(peerDependencies).length,
        dependencyCount: Object.keys(dependencies).length,
        devDependencyCount: Object.keys(devDependencies).length,
        peerDependencyCount: Object.keys(peerDependencies).length,
        categories: this.getCategoryCounts(dependencies, devDependencies),
        scripts: packageJson.scripts || {},
        packageInfo: {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          license: packageJson.license,
        },
      };
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error);
      return null;
    }
  }

  categorizeDependencies(deps) {
    const categorized = {};
    
    for (const [name, version] of Object.entries(deps)) {
      const category = this.categorize(name);
      
      if (!categorized[category]) {
        categorized[category] = [];
      }
      
      categorized[category].push({ name, version });
    }
    
    return categorized;
  }

  categorize(packageName) {
    const categories = {
      'UI Framework': ['react', 'vue', 'angular', 'svelte', 'preact'],
      'Backend': ['express', 'fastify', 'koa', 'hapi', 'nest'],
      'Database': ['mongodb', 'mongoose', 'pg', 'mysql', 'sqlite', 'redis', 'sequelize', 'typeorm', 'prisma'],
      'State Management': ['redux', 'mobx', 'zustand', 'jotai', 'recoil', 'valtio'],
      'Testing': ['jest', 'mocha', 'chai', 'cypress', 'playwright', 'vitest', 'testing-library'],
      'Build Tools': ['webpack', 'vite', 'rollup', 'esbuild', 'parcel', 'turbopack'],
      'Styling': ['styled-components', 'emotion', 'tailwind', 'sass', 'less', 'postcss'],
      'TypeScript': ['typescript', '@types/'],
      'Linting': ['eslint', 'prettier', 'stylelint'],
      'Authentication': ['passport', 'next-auth', 'auth0', 'firebase', 'supabase'],
      'API': ['axios', 'fetch', 'graphql', 'apollo', 'trpc', 'react-query', 'swr'],
      'Utilities': ['lodash', 'ramda', 'date-fns', 'moment', 'dayjs'],
    };
    
    for (const [category, packages] of Object.entries(categories)) {
      if (packages.some(pkg => packageName.toLowerCase().includes(pkg))) {
        return category;
      }
    }
    
    return 'Other';
  }

  getCategoryCounts(dependencies, devDependencies) {
    const allDeps = { ...dependencies, ...devDependencies };
    const counts = {};
    
    for (const name of Object.keys(allDeps)) {
      const category = this.categorize(name);
      counts[category] = (counts[category] || 0) + 1;
    }
    
    return counts;
  }

  shouldSkip(name) {
    return ['node_modules', '.git', 'dist', 'build', '.next'].includes(name) || name.startsWith('.');
  }
}

module.exports = DependencyAnalyzer;
