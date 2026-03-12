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
      
      // Categorized tech stack structure
      return {
        frontend: this.detectFrontend(packageJsonTech, fileTech, configTech),
        backend: this.detectBackend(packageJsonTech, fileTech, configTech),
        database: this.detectDatabase(packageJsonTech),
        devOps: this.detectDevOps(packageJsonTech, configTech),
        testing: this.detectTesting(packageJsonTech),
      };
    } catch (error) {
      console.error('Tech stack detection error:', error);
      return {
        frontend: {},
        backend: {},
        database: {},
        devOps: {},
        testing: {}
      };
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

  // FRONTEND DETECTION
  detectFrontend(deps, fileCounts, config) {
    const frontend = {
      frameworks: [],
      libraries: [],
      uiComponents: [],
      styling: [],
      stateManagement: [],
      routing: [],
      buildTools: [],
      bundlers: [],
      language: this.detectFrontendLanguage(fileCounts)
    };

    // Frameworks
    if (deps.react) frontend.frameworks.push({ name: 'React', version: deps.react });
    if (deps.next) frontend.frameworks.push({ name: 'Next.js', version: deps.next });
    if (deps.vue) frontend.frameworks.push({ name: 'Vue', version: deps.vue });
    if (deps.nuxt) frontend.frameworks.push({ name: 'Nuxt', version: deps.nuxt });
    if (deps['@angular/core']) frontend.frameworks.push({ name: 'Angular', version: deps['@angular/core'] });
    if (deps.svelte) frontend.frameworks.push({ name: 'Svelte', version: deps.svelte });
    if (deps['solid-js']) frontend.frameworks.push({ name: 'Solid.js', version: deps['solid-js'] });
    if (deps.preact) frontend.frameworks.push({ name: 'Preact', version: deps.preact });

    // UI Component Libraries
    if (deps['@mui/material']) frontend.uiComponents.push({ name: 'Material-UI', version: deps['@mui/material'] });
    if (deps['@chakra-ui/react']) frontend.uiComponents.push({ name: 'Chakra UI', version: deps['@chakra-ui/react'] });
    if (deps['antd']) frontend.uiComponents.push({ name: 'Ant Design', version: deps.antd });
    if (deps['@mantine/core']) frontend.uiComponents.push({ name: 'Mantine', version: deps['@mantine/core'] });
    if (deps['react-bootstrap']) frontend.uiComponents.push({ name: 'React Bootstrap', version: deps['react-bootstrap'] });
    if (deps['semantic-ui-react']) frontend.uiComponents.push({ name: 'Semantic UI', version: deps['semantic-ui-react'] });
    if (deps['@headlessui/react']) frontend.uiComponents.push({ name: 'Headless UI', version: deps['@headlessui/react'] });
    if (deps['@radix-ui/react-dialog']) frontend.uiComponents.push({ name: 'Radix UI', version: 'installed' });
    if (deps['lucide-react']) frontend.uiComponents.push({ name: 'Lucide Icons', version: deps['lucide-react'] });
    if (deps['react-icons']) frontend.uiComponents.push({ name: 'React Icons', version: deps['react-icons'] });
    if (deps['@heroicons/react']) frontend.uiComponents.push({ name: 'Heroicons', version: deps['@heroicons/react'] });

    // Styling
    if (deps.tailwindcss) frontend.styling.push({ name: 'Tailwind CSS', version: deps.tailwindcss });
    if (deps['styled-components']) frontend.styling.push({ name: 'Styled Components', version: deps['styled-components'] });
    if (deps['@emotion/react']) frontend.styling.push({ name: 'Emotion', version: deps['@emotion/react'] });
    if (deps.sass || deps['node-sass']) frontend.styling.push({ name: 'Sass/SCSS', version: deps.sass || deps['node-sass'] });
    if (deps.less) frontend.styling.push({ name: 'Less', version: deps.less });
    if (deps['styled-jsx']) frontend.styling.push({ name: 'Styled JSX', version: deps['styled-jsx'] });
    if (deps['@vanilla-extract/css']) frontend.styling.push({ name: 'Vanilla Extract', version: deps['@vanilla-extract/css'] });
    if (fileCounts['.css']) frontend.styling.push({ name: 'CSS', type: 'native' });
    if (fileCounts['.scss'] || fileCounts['.sass']) frontend.styling.push({ name: 'SCSS/Sass', type: 'native' });

    // State Management
    if (deps.redux) frontend.stateManagement.push({ name: 'Redux', version: deps.redux });
    if (deps['@reduxjs/toolkit']) frontend.stateManagement.push({ name: 'Redux Toolkit', version: deps['@reduxjs/toolkit'] });
    if (deps.mobx) frontend.stateManagement.push({ name: 'MobX', version: deps.mobx });
    if (deps.zustand) frontend.stateManagement.push({ name: 'Zustand', version: deps.zustand });
    if (deps.jotai) frontend.stateManagement.push({ name: 'Jotai', version: deps.jotai });
    if (deps.recoil) frontend.stateManagement.push({ name: 'Recoil', version: deps.recoil });
    if (deps.valtio) frontend.stateManagement.push({ name: 'Valtio', version: deps.valtio });
    if (deps['react-query'] || deps['@tanstack/react-query']) {
      frontend.stateManagement.push({ 
        name: 'React Query', 
        version: deps['@tanstack/react-query'] || deps['react-query'] 
      });
    }
    if (deps.swr) frontend.stateManagement.push({ name: 'SWR', version: deps.swr });

    // Routing
    if (deps['react-router-dom']) frontend.routing.push({ name: 'React Router', version: deps['react-router-dom'] });
    if (deps['@tanstack/react-router']) frontend.routing.push({ name: 'TanStack Router', version: deps['@tanstack/react-router'] });
    if (deps['vue-router']) frontend.routing.push({ name: 'Vue Router', version: deps['vue-router'] });
    if (deps['@angular/router']) frontend.routing.push({ name: 'Angular Router', version: deps['@angular/router'] });

    // Build Tools & Bundlers
    if (config['vite.config.js'] || config['vite.config.ts']) frontend.bundlers.push({ name: 'Vite', type: 'bundler' });
    if (config['webpack.config.js']) frontend.bundlers.push({ name: 'Webpack', type: 'bundler' });
    if (config['next.config.js']) frontend.bundlers.push({ name: 'Next.js (built-in)', type: 'bundler' });
    if (deps.vite) frontend.bundlers.push({ name: 'Vite', version: deps.vite, type: 'bundler' });
    if (deps.webpack) frontend.bundlers.push({ name: 'Webpack', version: deps.webpack, type: 'bundler' });
    if (deps.rollup) frontend.bundlers.push({ name: 'Rollup', version: deps.rollup, type: 'bundler' });
    if (deps.esbuild) frontend.bundlers.push({ name: 'esbuild', version: deps.esbuild, type: 'bundler' });
    if (deps.parcel) frontend.bundlers.push({ name: 'Parcel', version: deps.parcel, type: 'bundler' });
    if (deps.turbopack) frontend.bundlers.push({ name: 'Turbopack', version: deps.turbopack, type: 'bundler' });

    // Additional Libraries
    if (deps.axios) frontend.libraries.push({ name: 'Axios', version: deps.axios, category: 'HTTP Client' });
    if (deps['react-hook-form']) frontend.libraries.push({ name: 'React Hook Form', version: deps['react-hook-form'], category: 'Forms' });
    if (deps.formik) frontend.libraries.push({ name: 'Formik', version: deps.formik, category: 'Forms' });
    if (deps.yup) frontend.libraries.push({ name: 'Yup', version: deps.yup, category: 'Validation' });
    if (deps.zod) frontend.libraries.push({ name: 'Zod', version: deps.zod, category: 'Validation' });
    if (deps['date-fns']) frontend.libraries.push({ name: 'date-fns', version: deps['date-fns'], category: 'Date Utils' });
    if (deps.dayjs) frontend.libraries.push({ name: 'Day.js', version: deps.dayjs, category: 'Date Utils' });
    if (deps.moment) frontend.libraries.push({ name: 'Moment.js', version: deps.moment, category: 'Date Utils' });
    if (deps.lodash) frontend.libraries.push({ name: 'Lodash', version: deps.lodash, category: 'Utilities' });
    if (deps['framer-motion']) frontend.libraries.push({ name: 'Framer Motion', version: deps['framer-motion'], category: 'Animation' });
    if (deps['react-spring']) frontend.libraries.push({ name: 'React Spring', version: deps['react-spring'], category: 'Animation' });
    if (deps.recharts) frontend.libraries.push({ name: 'Recharts', version: deps.recharts, category: 'Charts' });
    if (deps['chart.js']) frontend.libraries.push({ name: 'Chart.js', version: deps['chart.js'], category: 'Charts' });
    if (deps['react-flow-renderer'] || deps.reactflow) {
      frontend.libraries.push({ 
        name: 'React Flow', 
        version: deps.reactflow || deps['react-flow-renderer'], 
        category: 'Diagrams' 
      });
    }

    return frontend;
  }

  detectFrontendLanguage(fileCounts) {
    const tsCount = (fileCounts['.ts'] || 0) + (fileCounts['.tsx'] || 0);
    const jsCount = (fileCounts['.js'] || 0) + (fileCounts['.jsx'] || 0);
    
    if (tsCount > 0 && tsCount > jsCount) return 'TypeScript';
    if (jsCount > 0) return 'JavaScript';
    return null;
  }

  // BACKEND DETECTION
  detectBackend(deps, fileCounts, config) {
    const backend = {
      frameworks: [],
      runtime: this.detectRuntime(deps, fileCounts),
      language: this.detectBackendLanguage(fileCounts),
      apiTools: [],
      authentication: [],
      validation: [],
      utilities: [],
      orm: [],
    };

    // Backend Frameworks
    if (deps.express) backend.frameworks.push({ name: 'Express.js', version: deps.express });
    if (deps['@nestjs/core']) backend.frameworks.push({ name: 'NestJS', version: deps['@nestjs/core'] });
    if (deps.fastify) backend.frameworks.push({ name: 'Fastify', version: deps.fastify });
    if (deps.koa) backend.frameworks.push({ name: 'Koa', version: deps.koa });
    if (deps.hapi) backend.frameworks.push({ name: 'Hapi', version: deps.hapi });
    if (deps.restify) backend.frameworks.push({ name: 'Restify', version: deps.restify });
    if (deps.sails) backend.frameworks.push({ name: 'Sails.js', version: deps.sails });
    if (deps['@apollo/server']) backend.frameworks.push({ name: 'Apollo Server', version: deps['@apollo/server'] });
    if (deps.django) backend.frameworks.push({ name: 'Django', version: deps.django });
    if (deps.flask) backend.frameworks.push({ name: 'Flask', version: deps.flask });
    if (deps['spring-boot']) backend.frameworks.push({ name: 'Spring Boot', version: deps['spring-boot'] });
    if (deps.laravel) backend.frameworks.push({ name: 'Laravel', version: deps.laravel });

    // API & GraphQL Tools
    if (deps.graphql) backend.apiTools.push({ name: 'GraphQL', version: deps.graphql });
    if (deps['@apollo/client'] || deps['apollo-server']) {
      backend.apiTools.push({ name: 'Apollo', version: deps['apollo-server'] || deps['@apollo/client'] });
    }
    if (deps['type-graphql']) backend.apiTools.push({ name: 'TypeGraphQL', version: deps['type-graphql'] });
    if (deps.swagger || deps['swagger-ui-express']) {
      backend.apiTools.push({ name: 'Swagger', version: deps['swagger-ui-express'] || deps.swagger });
    }
    if (deps.trpc || deps['@trpc/server']) {
      backend.apiTools.push({ name: 'tRPC', version: deps['@trpc/server'] || deps.trpc });
    }

    // Authentication & Authorization
    if (deps.passport) backend.authentication.push({ name: 'Passport.js', version: deps.passport });
    if (deps['passport-jwt']) backend.authentication.push({ name: 'Passport JWT', version: deps['passport-jwt'] });
    if (deps['passport-google-oauth20']) backend.authentication.push({ name: 'Passport Google OAuth', version: deps['passport-google-oauth20'] });
    if (deps.jsonwebtoken) backend.authentication.push({ name: 'JSON Web Token', version: deps.jsonwebtoken });
    if (deps.bcryptjs || deps.bcrypt) {
      backend.authentication.push({ name: 'bcrypt', version: deps.bcryptjs || deps.bcrypt });
    }
    if (deps['express-session']) backend.authentication.push({ name: 'Express Session', version: deps['express-session'] });
    if (deps['@auth/core']) backend.authentication.push({ name: 'Auth.js', version: deps['@auth/core'] });
    if (deps['next-auth']) backend.authentication.push({ name: 'NextAuth.js', version: deps['next-auth'] });

    // Validation
    if (deps['express-validator']) backend.validation.push({ name: 'Express Validator', version: deps['express-validator'] });
    if (deps.joi) backend.validation.push({ name: 'Joi', version: deps.joi });
    if (deps.yup) backend.validation.push({ name: 'Yup', version: deps.yup });
    if (deps.zod) backend.validation.push({ name: 'Zod', version: deps.zod });
    if (deps['class-validator']) backend.validation.push({ name: 'Class Validator', version: deps['class-validator'] });

    // ORM & Database Tools
    if (deps.prisma) backend.orm.push({ name: 'Prisma', version: deps.prisma });
    if (deps.typeorm) backend.orm.push({ name: 'TypeORM', version: deps.typeorm });
    if (deps.sequelize) backend.orm.push({ name: 'Sequelize', version: deps.sequelize });
    if (deps.mongoose) backend.orm.push({ name: 'Mongoose', version: deps.mongoose });
    if (deps.knex) backend.orm.push({ name: 'Knex.js', version: deps.knex });
    if (deps['drizzle-orm']) backend.orm.push({ name: 'Drizzle ORM', version: deps['drizzle-orm'] });

    // Utilities
    if (deps.cors) backend.utilities.push({ name: 'CORS', version: deps.cors });
    if (deps.dotenv) backend.utilities.push({ name: 'dotenv', version: deps.dotenv });
    if (deps.multer) backend.utilities.push({ name: 'Multer', version: deps.multer, category: 'File Upload' });
    if (deps.axios) backend.utilities.push({ name: 'Axios', version: deps.axios, category: 'HTTP Client' });
    if (deps.nodemailer) backend.utilities.push({ name: 'Nodemailer', version: deps.nodemailer, category: 'Email' });
    if (deps['express-rate-limit']) backend.utilities.push({ name: 'Express Rate Limit', version: deps['express-rate-limit'] });
    if (deps.helmet) backend.utilities.push({ name: 'Helmet', version: deps.helmet, category: 'Security' });
    if (deps.morgan) backend.utilities.push({ name: 'Morgan', version: deps.morgan, category: 'Logging' });
    if (deps.winston) backend.utilities.push({ name: 'Winston', version: deps.winston, category: 'Logging' });
    if (deps.pino) backend.utilities.push({ name: 'Pino', version: deps.pino, category: 'Logging' });

    return backend;
  }

  detectRuntime(deps, fileCounts) {
    if (deps.deno) return 'Deno';
    if (deps.bun) return 'Bun';
    // Check for Node.js indicators
    if (fileCounts['.js'] || fileCounts['.ts'] || deps.express || deps['@nestjs/core']) {
      return 'Node.js';
    }
    return null;
  }

  detectBackendLanguage(fileCounts) {
    if (fileCounts['.ts'] || fileCounts['.tsx']) return 'TypeScript';
    if (fileCounts['.js'] || fileCounts['.jsx']) return 'JavaScript';
    if (fileCounts['.py']) return 'Python';
    if (fileCounts['.java']) return 'Java';
    if (fileCounts['.go']) return 'Go';
    if (fileCounts['.rs']) return 'Rust';
    if (fileCounts['.php']) return 'PHP';
    if (fileCounts['.rb']) return 'Ruby';
    if (fileCounts['.cs']) return 'C#';
    return null;
  }

  // DATABASE DETECTION
  detectDatabase(deps) {
    const databases = {
      relational: [],
      nosql: [],
      cache: [],
      search: [],
      tools: []
    };

    // Relational Databases
    if (deps.pg) databases.relational.push({ name: 'PostgreSQL', version: deps.pg, driver: 'node-postgres' });
    if (deps.mysql || deps.mysql2) {
      databases.relational.push({ 
        name: 'MySQL', 
        version: deps.mysql2 || deps.mysql,
        driver: deps.mysql2 ? 'mysql2' : 'mysql'
      });
    }
    if (deps.sqlite3 || deps['better-sqlite3']) {
      databases.relational.push({ 
        name: 'SQLite', 
        version: deps['better-sqlite3'] || deps.sqlite3,
        driver: deps['better-sqlite3'] ? 'better-sqlite3' : 'sqlite3'
      });
    }
    if (deps.mssql) databases.relational.push({ name: 'Microsoft SQL Server', version: deps.mssql });
    if (deps.oracledb) databases.relational.push({ name: 'Oracle Database', version: deps.oracledb });
    if (deps['pg-native']) databases.relational.push({ name: 'PostgreSQL (Native)', version: deps['pg-native'] });

    // NoSQL Databases
    if (deps.mongodb) databases.nosql.push({ name: 'MongoDB', version: deps.mongodb, driver: 'native' });
    if (deps.mongoose) databases.nosql.push({ name: 'MongoDB', version: deps.mongoose, driver: 'mongoose' });
    if (deps['@aws-sdk/client-dynamodb']) databases.nosql.push({ name: 'AWS DynamoDB', version: deps['@aws-sdk/client-dynamodb'] });
    if (deps.firebase || deps['firebase-admin']) {
      databases.nosql.push({ 
        name: 'Firebase/Firestore', 
        version: deps['firebase-admin'] || deps.firebase 
      });
    }
    if (deps.couchdb) databases.nosql.push({ name: 'CouchDB', version: deps.couchdb });
    if (deps['cassandra-driver']) databases.nosql.push({ name: 'Apache Cassandra', version: deps['cassandra-driver'] });

    // Cache & In-Memory Databases
    if (deps.redis || deps.ioredis) {
      databases.cache.push({ 
        name: 'Redis', 
        version: deps.ioredis || deps.redis,
        driver: deps.ioredis ? 'ioredis' : 'redis'
      });
    }
    if (deps.memcached) databases.cache.push({ name: 'Memcached', version: deps.memcached });

    // Search Engines
    if (deps['@elastic/elasticsearch']) databases.search.push({ name: 'Elasticsearch', version: deps['@elastic/elasticsearch'] });
    if (deps.algolia || deps['@algolia/client-search']) {
      databases.search.push({ 
        name: 'Algolia', 
        version: deps['@algolia/client-search'] || deps.algolia 
      });
    }
    if (deps.meilisearch) databases.search.push({ name: 'Meilisearch', version: deps.meilisearch });
    if (deps.typesense) databases.search.push({ name: 'Typesense', version: deps.typesense });

    // Database Tools & ORMs (already covered in backend, but including here for completeness)
    if (deps.prisma) databases.tools.push({ name: 'Prisma ORM', version: deps.prisma, type: 'ORM' });
    if (deps.typeorm) databases.tools.push({ name: 'TypeORM', version: deps.typeorm, type: 'ORM' });
    if (deps.sequelize) databases.tools.push({ name: 'Sequelize', version: deps.sequelize, type: 'ORM' });
    if (deps.mongoose) databases.tools.push({ name: 'Mongoose ODM', version: deps.mongoose, type: 'ODM' });
    if (deps.knex) databases.tools.push({ name: 'Knex.js', version: deps.knex, type: 'Query Builder' });
    if (deps['drizzle-orm']) databases.tools.push({ name: 'Drizzle ORM', version: deps['drizzle-orm'], type: 'ORM' });

    return databases;
  }

  // DEVOPS & DEPLOYMENT DETECTION
  detectDevOps(deps, config) {
    const devops = {
      containerization: [],
      ci_cd: [],
      hosting: [],
      monitoring: [],
      cloudServices: []
    };

    // Containerization
    if (config['Dockerfile']) devops.containerization.push({ name: 'Docker', type: 'config' });
    if (config['docker-compose.yml']) devops.containerization.push({ name: 'Docker Compose', type: 'config' });
    if (config['.dockerignore']) devops.containerization.push({ name: 'Docker (with .dockerignore)', type: 'config' });
    if (config['kubernetes'] || config['k8s']) devops.containerization.push({ name: 'Kubernetes', type: 'orchestration' });

    // CI/CD
    if (config['.github/workflows']) devops.ci_cd.push({ name: 'GitHub Actions', type: 'CI/CD' });
    if (config['.gitlab-ci.yml']) devops.ci_cd.push({ name: 'GitLab CI', type: 'CI/CD' });
    if (config['.circleci']) devops.ci_cd.push({ name: 'CircleCI', type: 'CI/CD' });
    if (config['Jenkinsfile']) devops.ci_cd.push({ name: 'Jenkins', type: 'CI/CD' });
    if (config['.travis.yml']) devops.ci_cd.push({ name: 'Travis CI', type: 'CI/CD' });
    if (config['azure-pipelines.yml']) devops.ci_cd.push({ name: 'Azure Pipelines', type: 'CI/CD' });

    // Hosting/Deployment Platforms
    if (config['vercel.json']) devops.hosting.push({ name: 'Vercel', type: 'platform' });
    if (config['railway.json']) devops.hosting.push({ name: 'Railway', type: 'platform' });
    if (config['netlify.toml']) devops.hosting.push({ name: 'Netlify', type: 'platform' });
    if (config['render.yaml']) devops.hosting.push({ name: 'Render', type: 'platform' });
    if (config['fly.toml']) devops.hosting.push({ name: 'Fly.io', type: 'platform' });
    if (config['Procfile']) devops.hosting.push({ name: 'Heroku', type: 'platform' });
    if (config['app.yaml']) devops.hosting.push({ name: 'Google App Engine', type: 'platform' });

    // Monitoring & Analytics
    if (deps.sentry || deps['@sentry/node']) {
      devops.monitoring.push({ name: 'Sentry', version: deps['@sentry/node'] || deps.sentry, type: 'error tracking' });
    }
    if (deps.newrelic) devops.monitoring.push({ name: 'New Relic', version: deps.newrelic, type: 'APM' });
    if (deps['@datadog/browser-logs']) devops.monitoring.push({ name: 'Datadog', version: deps['@datadog/browser-logs'], type: 'monitoring' });
    if (deps['applicationinsights']) devops.monitoring.push({ name: 'Azure Application Insights', version: deps.applicationinsights, type: 'monitoring' });

    // Cloud Services SDKs
    if (deps['@aws-sdk/client-s3'] || deps['aws-sdk']) {
      devops.cloudServices.push({ name: 'AWS SDK', version: deps['@aws-sdk/client-s3'] || deps['aws-sdk'] });
    }
    if (deps['@google-cloud/storage']) devops.cloudServices.push({ name: 'Google Cloud SDK', version: deps['@google-cloud/storage'] });
    if (deps['@azure/storage-blob']) devops.cloudServices.push({ name: 'Azure SDK', version: deps['@azure/storage-blob'] });

    return devops;
  }

  // TESTING DETECTION
  detectTesting(deps) {
    const testing = {
      frameworks: [],
      libraries: [],
      e2e: [],
      coverage: []
    };

    // Testing Frameworks
    if (deps.jest) testing.frameworks.push({ name: 'Jest', version: deps.jest });
    if (deps.vitest) testing.frameworks.push({ name: 'Vitest', version: deps.vitest });
    if (deps.mocha) testing.frameworks.push({ name: 'Mocha', version: deps.mocha });
    if (deps.jasmine) testing.frameworks.push({ name: 'Jasmine', version: deps.jasmine });
    if (deps.ava) testing.frameworks.push({ name: 'AVA', version: deps.ava });

    // Testing Libraries
    if (deps['@testing-library/react']) testing.libraries.push({ name: 'React Testing Library', version: deps['@testing-library/react'] });
    if (deps['@testing-library/vue']) testing.libraries.push({ name: 'Vue Testing Library', version: deps['@testing-library/vue'] });
    if (deps['@testing-library/user-event']) testing.libraries.push({ name: 'Testing Library User Event', version: deps['@testing-library/user-event'] });
    if (deps.enzyme) testing.libraries.push({ name: 'Enzyme', version: deps.enzyme });
    if (deps.sinon) testing.libraries.push({ name: 'Sinon', version: deps.sinon });
    if (deps.chai) testing.libraries.push({ name: 'Chai', version: deps.chai });
    if (deps.supertest) testing.libraries.push({ name: 'Supertest', version: deps.supertest });

    // E2E Testing
    if (deps.cypress) testing.e2e.push({ name: 'Cypress', version: deps.cypress });
    if (deps.playwright) testing.e2e.push({ name: 'Playwright', version: deps.playwright });
    if (deps.puppeteer) testing.e2e.push({ name: 'Puppeteer', version: deps.puppeteer });
    if (deps['selenium-webdriver']) testing.e2e.push({ name: 'Selenium', version: deps['selenium-webdriver'] });
    if (deps['@nightwatch/core']) testing.e2e.push({ name: 'Nightwatch', version: deps['@nightwatch/core'] });

    // Coverage
    if (deps.nyc) testing.coverage.push({ name: 'NYC (Istanbul)', version: deps.nyc });
    if (deps['c8']) testing.coverage.push({ name: 'c8', version: deps.c8 });

    return testing;
  }

  shouldSkip(name) {
    return ['node_modules', '.git', 'dist', 'build', '.next'].includes(name) || name.startsWith('.');
  }
}

module.exports = TechStackDetector;
