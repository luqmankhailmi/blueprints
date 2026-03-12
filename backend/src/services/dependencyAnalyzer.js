const fs = require('fs-extra');
const path = require('path');

/**
 * Analyze project dependencies from package.json
 */
class DependencyAnalyzer {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * Analyze all dependencies
   */
  async analyze() {
    const packageJson = await this.readPackageJson();
    
    if (!packageJson) {
      return {
        error: 'No package.json found',
        hasDependencies: false
      };
    }

    const dependencies = this.extractDependencies(packageJson);
    const devDependencies = this.extractDevDependencies(packageJson);
    const allDeps = [...dependencies, ...devDependencies];

    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      scripts: packageJson.scripts || {},
      dependencies,
      devDependencies,
      totalCount: allDeps.length,
      dependencyCount: dependencies.length,
      devDependencyCount: devDependencies.length,
      framework: this.detectFramework(allDeps),
      categories: this.categorizeDependencies(allDeps)
    };
  }

  /**
   * Read package.json file
   */
  async readPackageJson() {
    try {
      const packagePath = path.join(this.projectPath, 'package.json');
      const exists = await fs.pathExists(packagePath);
      
      if (!exists) {
        return null;
      }

      const content = await fs.readFile(packagePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading package.json:', error);
      return null;
    }
  }

  /**
   * Extract dependencies with versions
   */
  extractDependencies(packageJson) {
    if (!packageJson.dependencies) return [];

    return Object.entries(packageJson.dependencies).map(([name, version]) => ({
      name,
      version,
      type: 'dependency',
      category: this.categorizePackage(name)
    }));
  }

  /**
   * Extract dev dependencies with versions
   */
  extractDevDependencies(packageJson) {
    if (!packageJson.devDependencies) return [];

    return Object.entries(packageJson.devDependencies).map(([name, version]) => ({
      name,
      version,
      type: 'devDependency',
      category: this.categorizePackage(name)
    }));
  }

  /**
   * Detect primary framework
   */
  detectFramework(dependencies) {
    const frameworks = [];

    const frameworkMap = {
      'react': 'React',
      'next': 'Next.js',
      'vue': 'Vue.js',
      'nuxt': 'Nuxt.js',
      'angular': 'Angular',
      'svelte': 'Svelte',
      'express': 'Express.js',
      'fastify': 'Fastify',
      'koa': 'Koa',
      'nestjs': 'NestJS',
      '@nestjs/core': 'NestJS',
      'gatsby': 'Gatsby',
      'remix': 'Remix'
    };

    dependencies.forEach(dep => {
      for (const [key, framework] of Object.entries(frameworkMap)) {
        if (dep.name.includes(key)) {
          if (!frameworks.includes(framework)) {
            frameworks.push(framework);
          }
        }
      }
    });

    return frameworks;
  }

  /**
   * Categorize a package by its purpose
   */
  categorizePackage(packageName) {
    const categories = {
      'UI/Components': ['react', 'vue', 'angular', 'svelte', 'preact', '@mui/', 'antd', 'bootstrap', 'tailwind'],
      'Framework': ['next', 'nuxt', 'gatsby', 'remix', 'express', 'fastify', 'koa', '@nestjs/'],
      'Database': ['mongoose', 'sequelize', 'typeorm', 'prisma', 'pg', 'mysql', 'mongodb', 'redis'],
      'Testing': ['jest', 'mocha', 'chai', 'vitest', 'cypress', '@testing-library/', 'playwright'],
      'Build Tools': ['webpack', 'vite', 'rollup', 'parcel', 'esbuild', 'babel', '@babel/'],
      'Linting/Formatting': ['eslint', 'prettier', 'stylelint', '@typescript-eslint/'],
      'State Management': ['redux', 'zustand', 'mobx', 'recoil', 'jotai', 'pinia', 'vuex'],
      'Routing': ['react-router', 'vue-router', '@angular/router'],
      'HTTP/API': ['axios', 'fetch', 'got', 'node-fetch', 'superagent'],
      'Authentication': ['passport', 'jsonwebtoken', 'bcrypt', 'auth0', 'next-auth'],
      'Utilities': ['lodash', 'moment', 'dayjs', 'uuid', 'dotenv'],
      'CSS/Styling': ['styled-components', 'emotion', 'sass', 'less', 'postcss']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => packageName.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }

  /**
   * Categorize all dependencies
   */
  categorizeDependencies(dependencies) {
    const categories = {};

    dependencies.forEach(dep => {
      const category = dep.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(dep);
    });

    // Sort categories by count
    return Object.entries(categories)
      .map(([name, deps]) => ({
        name,
        count: deps.length,
        packages: deps
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Build dependency graph (simple version)
   */
  async buildDependencyGraph() {
    const packageJson = await this.readPackageJson();
    
    if (!packageJson) {
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];

    // Add main package as root node
    nodes.push({
      id: packageJson.name || 'root',
      label: packageJson.name || 'Project Root',
      type: 'root'
    });

    // Add dependencies as nodes
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach(dep => {
        nodes.push({
          id: dep,
          label: dep,
          type: 'dependency'
        });
        edges.push({
          from: packageJson.name || 'root',
          to: dep
        });
      });
    }

    // Add dev dependencies
    if (packageJson.devDependencies) {
      Object.keys(packageJson.devDependencies).forEach(dep => {
        nodes.push({
          id: dep,
          label: dep,
          type: 'devDependency'
        });
        edges.push({
          from: packageJson.name || 'root',
          to: dep,
          style: 'dashed'
        });
      });
    }

    return { nodes, edges };
  }
}

module.exports = DependencyAnalyzer;
