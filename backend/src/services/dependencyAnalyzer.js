const fs = require('fs').promises;
const path = require('path');

class DependencyAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  async analyze() {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      
      try {
        const content = await fs.readFile(packageJsonPath, 'utf-8');
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
        // No package.json found
        return {
          dependencies: {},
          devDependencies: {},
          peerDependencies: {},
          totalCount: 0,
          dependencyCount: 0,
          devDependencyCount: 0,
          peerDependencyCount: 0,
          categories: {},
          scripts: {},
          packageInfo: null,
          error: 'No package.json found',
        };
      }
    } catch (error) {
      console.error('Dependency analysis error:', error);
      throw error;
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
}

module.exports = DependencyAnalyzer;
