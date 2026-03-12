const fs = require('fs-extra');
const path = require('path');

/**
 * Detect technology stack from project files
 */
class TechStackDetector {
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * Detect complete tech stack
   */
  async detect() {
    const packageJson = await this.readPackageJson();
    const configFiles = await this.detectConfigFiles();
    const fileExtensions = await this.analyzeFileExtensions();

    return {
      frontend: this.detectFrontend(packageJson, configFiles),
      backend: this.detectBackend(packageJson, configFiles),
      database: this.detectDatabase(packageJson),
      languages: this.detectLanguages(fileExtensions, configFiles),
      buildTools: this.detectBuildTools(packageJson, configFiles),
      testing: this.detectTesting(packageJson),
      styling: this.detectStyling(packageJson, configFiles, fileExtensions),
      deployment: this.detectDeployment(configFiles)
    };
  }

  /**
   * Read package.json
   */
  async readPackageJson() {
    try {
      const packagePath = path.join(this.projectPath, 'package.json');
      if (await fs.pathExists(packagePath)) {
        return JSON.parse(await fs.readFile(packagePath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error reading package.json:', error);
    }
    return null;
  }

  /**
   * Detect configuration files
   */
  async detectConfigFiles() {
    const configFiles = [
      // Build tools
      'webpack.config.js', 'vite.config.js', 'rollup.config.js',
      // Frameworks
      'next.config.js', 'nuxt.config.js', 'svelte.config.js', 'gatsby-config.js',
      // TypeScript
      'tsconfig.json',
      // Testing
      'jest.config.js', 'vitest.config.js', 'cypress.json',
      // Linting
      '.eslintrc', '.eslintrc.js', '.eslintrc.json', '.prettierrc',
      // Styling
      'tailwind.config.js', 'postcss.config.js',
      // Deployment
      'Dockerfile', 'docker-compose.yml', 'vercel.json', 'netlify.toml',
      // Database
      'prisma/schema.prisma', 'knexfile.js'
    ];

    const found = [];

    for (const file of configFiles) {
      const filePath = path.join(this.projectPath, file);
      if (await fs.pathExists(filePath)) {
        found.push(file);
      }
    }

    return found;
  }

  /**
   * Analyze file extensions in project
   */
  async analyzeFileExtensions() {
    const extensions = {};

    const traverse = async (dir) => {
      try {
        const items = await fs.readdir(dir);

        for (const item of items) {
          if (item === 'node_modules' || item === '.git') continue;

          const fullPath = path.join(dir, item);
          const stat = await fs.stat(fullPath);

          if (stat.isDirectory()) {
            await traverse(fullPath);
          } else {
            const ext = path.extname(item);
            if (ext) {
              extensions[ext] = (extensions[ext] || 0) + 1;
            }
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };

    await traverse(this.projectPath);
    return extensions;
  }

  /**
   * Detect frontend framework
   */
  detectFrontend(packageJson, configFiles) {
    const frontend = [];

    if (!packageJson) return frontend;

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.react) frontend.push({ name: 'React', version: deps.react });
    if (deps.next) frontend.push({ name: 'Next.js', version: deps.next });
    if (deps.vue) frontend.push({ name: 'Vue', version: deps.vue });
    if (deps.nuxt) frontend.push({ name: 'Nuxt', version: deps.nuxt });
    if (deps['@angular/core']) frontend.push({ name: 'Angular', version: deps['@angular/core'] });
    if (deps.svelte) frontend.push({ name: 'Svelte', version: deps.svelte });
    if (deps.gatsby) frontend.push({ name: 'Gatsby', version: deps.gatsby });

    return frontend;
  }

  /**
   * Detect backend framework
   */
  detectBackend(packageJson, configFiles) {
    const backend = [];

    if (!packageJson) return backend;

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.express) backend.push({ name: 'Express', version: deps.express });
    if (deps.fastify) backend.push({ name: 'Fastify', version: deps.fastify });
    if (deps.koa) backend.push({ name: 'Koa', version: deps.koa });
    if (deps['@nestjs/core']) backend.push({ name: 'NestJS', version: deps['@nestjs/core'] });

    return backend;
  }

  /**
   * Detect database
   */
  detectDatabase(packageJson) {
    const databases = [];

    if (!packageJson) return databases;

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.mongoose) databases.push({ name: 'MongoDB (Mongoose)', version: deps.mongoose });
    if (deps.mongodb) databases.push({ name: 'MongoDB', version: deps.mongodb });
    if (deps.pg) databases.push({ name: 'PostgreSQL', version: deps.pg });
    if (deps.mysql || deps.mysql2) databases.push({ name: 'MySQL', version: deps.mysql || deps.mysql2 });
    if (deps.sequelize) databases.push({ name: 'Sequelize ORM', version: deps.sequelize });
    if (deps.typeorm) databases.push({ name: 'TypeORM', version: deps.typeorm });
    if (deps.prisma) databases.push({ name: 'Prisma', version: deps.prisma });
    if (deps.redis) databases.push({ name: 'Redis', version: deps.redis });

    return databases;
  }

  /**
   * Detect programming languages
   */
  detectLanguages(extensions, configFiles) {
    const languages = [];

    if (extensions['.js'] || extensions['.jsx']) {
      languages.push({ name: 'JavaScript', files: (extensions['.js'] || 0) + (extensions['.jsx'] || 0) });
    }
    if (extensions['.ts'] || extensions['.tsx'] || configFiles.includes('tsconfig.json')) {
      languages.push({ name: 'TypeScript', files: (extensions['.ts'] || 0) + (extensions['.tsx'] || 0) });
    }
    if (extensions['.py']) languages.push({ name: 'Python', files: extensions['.py'] });
    if (extensions['.java']) languages.push({ name: 'Java', files: extensions['.java'] });
    if (extensions['.go']) languages.push({ name: 'Go', files: extensions['.go'] });
    if (extensions['.css']) languages.push({ name: 'CSS', files: extensions['.css'] });
    if (extensions['.scss'] || extensions['.sass']) {
      languages.push({ name: 'SASS/SCSS', files: (extensions['.scss'] || 0) + (extensions['.sass'] || 0) });
    }
    if (extensions['.html']) languages.push({ name: 'HTML', files: extensions['.html'] });

    return languages;
  }

  /**
   * Detect build tools
   */
  detectBuildTools(packageJson, configFiles) {
    const tools = [];

    if (configFiles.includes('webpack.config.js')) tools.push('Webpack');
    if (configFiles.includes('vite.config.js')) tools.push('Vite');
    if (configFiles.includes('rollup.config.js')) tools.push('Rollup');

    if (packageJson) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (deps.parcel) tools.push('Parcel');
      if (deps.esbuild) tools.push('ESBuild');
      if (deps['@babel/core']) tools.push('Babel');
    }

    return tools;
  }

  /**
   * Detect testing frameworks
   */
  detectTesting(packageJson) {
    const testing = [];

    if (!packageJson) return testing;

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.jest) testing.push('Jest');
    if (deps.vitest) testing.push('Vitest');
    if (deps.mocha) testing.push('Mocha');
    if (deps.cypress) testing.push('Cypress');
    if (deps.playwright) testing.push('Playwright');
    if (deps['@testing-library/react']) testing.push('React Testing Library');

    return testing;
  }

  /**
   * Detect styling approach
   */
  detectStyling(packageJson, configFiles, extensions) {
    const styling = [];

    if (configFiles.includes('tailwind.config.js')) styling.push('Tailwind CSS');
    
    if (packageJson) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps['styled-components']) styling.push('Styled Components');
      if (deps['@emotion/react']) styling.push('Emotion');
      if (deps.sass) styling.push('SASS');
      if (deps.less) styling.push('LESS');
      if (deps['@mui/material']) styling.push('Material-UI');
      if (deps.antd) styling.push('Ant Design');
      if (deps.bootstrap) styling.push('Bootstrap');
    }

    if (extensions['.css'] && styling.length === 0) styling.push('Plain CSS');

    return styling;
  }

  /**
   * Detect deployment platform
   */
  detectDeployment(configFiles) {
    const deployment = [];

    if (configFiles.includes('vercel.json')) deployment.push('Vercel');
    if (configFiles.includes('netlify.toml')) deployment.push('Netlify');
    if (configFiles.includes('Dockerfile')) deployment.push('Docker');
    if (configFiles.includes('docker-compose.yml')) deployment.push('Docker Compose');

    return deployment;
  }
}

module.exports = TechStackDetector;
