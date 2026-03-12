const fs = require('fs').promises;
const path = require('path');

class TechStackDetector {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  async detect() {
    try {
      const detections = await Promise.all([
        this.detectFromPackageJson(),
        this.detectFromFiles(),
        this.detectFromConfig(),
      ]);

      const [packageJsonTech, fileTech, configTech] = detections;
      
      return {
        framework: this.detectFramework(packageJsonTech),
        language: this.detectLanguage(fileTech),
        buildTool: this.detectBuildTool(packageJsonTech, configTech),
        database: this.detectDatabase(packageJsonTech),
        testing: this.detectTesting(packageJsonTech),
        styling: this.detectStyling(packageJsonTech, fileTech),
        stateManagement: this.detectStateManagement(packageJsonTech),
        deployment: this.detectDeployment(configTech),
        other: this.detectOther(packageJsonTech, configTech),
      };
    } catch (error) {
      console.error('Tech stack detection error:', error);
      return {};
    }
  }

  async detectFromPackageJson() {
    try {
      const content = await fs.readFile(path.join(this.projectPath, 'package.json'), 'utf-8');
      const packageJson = JSON.parse(content);
      return {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
    } catch {
      return {};
    }
  }

  async detectFromFiles() {
    const extensions = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.php': 'PHP',
      '.rb': 'Ruby',
    };

    const counts = {};

    try {
      await this.countFileExtensions(this.projectPath, extensions, counts);
    } catch {
      // Ignore errors
    }

    return counts;
  }

  async countFileExtensions(dir, extensions, counts, depth = 0) {
    if (depth > 3) return;

    try {
      const entries = await fs.readdir(dir);
      
      for (const entry of entries) {
        if (this.shouldSkip(entry)) continue;
        
        const fullPath = path.join(dir, entry);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          await this.countFileExtensions(fullPath, extensions, counts, depth + 1);
        } else {
          const ext = path.extname(entry);
          if (extensions[ext]) {
            counts[ext] = (counts[ext] || 0) + 1;
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  async detectFromConfig() {
    const configFiles = [
      'next.config.js',
      'vite.config.js',
      'webpack.config.js',
      'tsconfig.json',
      'Dockerfile',
      '.gitlab-ci.yml',
      '.github/workflows',
      'vercel.json',
      'railway.json',
    ];

    const found = {};

    for (const file of configFiles) {
      try {
        await fs.access(path.join(this.projectPath, file));
        found[file] = true;
      } catch {
        // File doesn't exist
      }
    }

    return found;
  }

  detectFramework(deps) {
    if (deps.react) return { name: 'React', version: deps.react };
    if (deps.next) return { name: 'Next.js', version: deps.next };
    if (deps.vue) return { name: 'Vue', version: deps.vue };
    if (deps.nuxt) return { name: 'Nuxt', version: deps.nuxt };
    if (deps['@angular/core']) return { name: 'Angular', version: deps['@angular/core'] };
    if (deps.svelte) return { name: 'Svelte', version: deps.svelte };
    if (deps.express) return { name: 'Express', version: deps.express };
    if (deps['@nestjs/core']) return { name: 'NestJS', version: deps['@nestjs/core'] };
    if (deps.fastify) return { name: 'Fastify', version: deps.fastify };
    return null;
  }

  detectLanguage(fileCounts) {
    const tsCount = (fileCounts['.ts'] || 0) + (fileCounts['.tsx'] || 0);
    const jsCount = (fileCounts['.js'] || 0) + (fileCounts['.jsx'] || 0);
    
    if (tsCount > jsCount) return 'TypeScript';
    if (jsCount > 0) return 'JavaScript';
    if (fileCounts['.py']) return 'Python';
    if (fileCounts['.java']) return 'Java';
    if (fileCounts['.go']) return 'Go';
    return 'Unknown';
  }

  detectBuildTool(deps, config) {
    if (config['vite.config.js']) return 'Vite';
    if (config['next.config.js']) return 'Next.js';
    if (config['webpack.config.js']) return 'Webpack';
    if (deps.vite) return 'Vite';
    if (deps.webpack) return 'Webpack';
    if (deps.rollup) return 'Rollup';
    if (deps.esbuild) return 'esbuild';
    if (deps.parcel) return 'Parcel';
    return null;
  }

  detectDatabase(deps) {
    const databases = [];
    if (deps.mongodb || deps.mongoose) databases.push('MongoDB');
    if (deps.pg) databases.push('PostgreSQL');
    if (deps.mysql || deps.mysql2) databases.push('MySQL');
    if (deps.sqlite3) databases.push('SQLite');
    if (deps.redis) databases.push('Redis');
    if (deps.prisma) databases.push('Prisma');
    if (deps.typeorm) databases.push('TypeORM');
    if (deps.sequelize) databases.push('Sequelize');
    return databases.length > 0 ? databases : null;
  }

  detectTesting(deps) {
    const testing = [];
    if (deps.jest) testing.push('Jest');
    if (deps.vitest) testing.push('Vitest');
    if (deps.mocha) testing.push('Mocha');
    if (deps.cypress) testing.push('Cypress');
    if (deps.playwright) testing.push('Playwright');
    if (deps['@testing-library/react']) testing.push('React Testing Library');
    return testing.length > 0 ? testing : null;
  }

  detectStyling(deps, fileCounts) {
    const styling = [];
    if (deps['styled-components']) styling.push('Styled Components');
    if (deps['@emotion/react']) styling.push('Emotion');
    if (deps.tailwindcss) styling.push('Tailwind CSS');
    if (deps.sass || deps['node-sass']) styling.push('Sass');
    if (deps.less) styling.push('Less');
    if (fileCounts['.css']) styling.push('CSS');
    return styling.length > 0 ? styling : null;
  }

  detectStateManagement(deps) {
    if (deps.redux) return 'Redux';
    if (deps.mobx) return 'MobX';
    if (deps.zustand) return 'Zustand';
    if (deps.jotai) return 'Jotai';
    if (deps.recoil) return 'Recoil';
    return null;
  }

  detectDeployment(config) {
    if (config['vercel.json']) return 'Vercel';
    if (config['railway.json']) return 'Railway';
    if (config['Dockerfile']) return 'Docker';
    if (config['.github/workflows']) return 'GitHub Actions';
    if (config['.gitlab-ci.yml']) return 'GitLab CI';
    return null;
  }

  detectOther(deps, config) {
    const other = [];
    if (deps.axios) other.push('Axios');
    if (deps.graphql) other.push('GraphQL');
    if (deps['@apollo/client']) other.push('Apollo Client');
    if (deps['react-query']) other.push('React Query');
    if (deps.passport) other.push('Passport.js');
    if (config['tsconfig.json']) other.push('TypeScript Config');
    return other.length > 0 ? other : null;
  }

  shouldSkip(name) {
    return ['node_modules', '.git', 'dist', 'build', '.next'].includes(name) || name.startsWith('.');
  }
}

module.exports = TechStackDetector;
