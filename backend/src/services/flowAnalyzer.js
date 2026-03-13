const AdmZip = require('adm-zip');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class FlowAnalyzer {
  constructor() {
    this.routes = [];
  }

  async analyzeProject(zipFilePath, isDirectory = false) {
    try {
      let tempDir;

      if (isDirectory) {
        // Already a directory (from GitHub)
        tempDir = zipFilePath;
      } else {
        // Extract ZIP file
        const zip = new AdmZip(zipFilePath);
        tempDir = path.join(path.dirname(zipFilePath), `temp_${Date.now()}`);
        zip.extractAllTo(tempDir, true);
      }

      // Store project root for later use
      this.projectRoot = tempDir;

      // Find and analyze route files
      await this.findAndAnalyzeRoutes(tempDir);

      // Clean up temp directory only if we extracted a ZIP
      if (!isDirectory) {
        await this.cleanupDirectory(tempDir);
      }

      return this.routes;
    } catch (error) {
      console.error('Error analyzing project:', error);
      return [];
    }
  }

  async findAndAnalyzeRoutes(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            await this.findAndAnalyzeRoutes(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          // Check if it might be a route file
          if (this.isLikelyRouteFile(entry.name, fullPath)) {
            await this.analyzeRouteFile(fullPath);
          }
        }
      }
    } catch (error) {
      console.error('Error finding routes:', error);
    }
  }

  isLikelyRouteFile(filename, filepath) {
    // Common patterns for route files
    const routePatterns = [
      'route', 'routes', 'router',
      'controller', 'controllers',
      'api', 'endpoint', 'endpoints'
    ];

    const lowerName = filename.toLowerCase();
    const lowerPath = filepath.toLowerCase();

    return routePatterns.some(pattern =>
      lowerName.includes(pattern) || lowerPath.includes(pattern)
    );
  }

  extractImports(ast) {
    const imports = {};

    traverse(ast, {
      // Handle CommonJS require statements
      VariableDeclarator(path) {
        const { node } = path;
        if (
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee.name === 'require' &&
          node.init.arguments[0] &&
          node.init.arguments[0].type === 'StringLiteral'
        ) {
          const sourcePath = node.init.arguments[0].value;

          // Extract destructured imports
          if (node.id.type === 'ObjectPattern') {
            node.id.properties.forEach(prop => {
              if (prop.key && prop.key.name) {
                imports[prop.key.name] = {
                  source: sourcePath,
                  type: 'function'
                };
              }
            });
          }
          // Extract default imports
          else if (node.id.type === 'Identifier') {
            imports[node.id.name] = {
              source: sourcePath,
              type: 'default'
            };
          }
        }
      }
    });

    return imports;
  }

  async analyzeControllerFile(controllerPath, projectRoot) {
    try {
      // Resolve the actual file path
      let fullPath = controllerPath;

      // If it's a relative path, resolve it
      if (!path.isAbsolute(controllerPath)) {
        // Try to find the file in the project
        const possiblePaths = [
          path.join(projectRoot, controllerPath),
          path.join(projectRoot, controllerPath + '.js'),
          path.join(projectRoot, 'src', controllerPath),
          path.join(projectRoot, 'src', controllerPath + '.js'),
          path.join(projectRoot, 'backend', 'src', controllerPath),
          path.join(projectRoot, 'backend', 'src', controllerPath + '.js'),
        ];

        for (const possiblePath of possiblePaths) {
          try {
            await fs.access(possiblePath);
            fullPath = possiblePath;
            break;
          } catch (err) {
            // File doesn't exist, try next
          }
        }
      }

      // Read and parse the controller file
      const content = await fs.readFile(fullPath, 'utf-8');
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      // Extract imports from controller
      const controllerImports = this.extractImports(ast);

      return controllerImports;
    } catch (error) {
      console.error(`Error analyzing controller file ${controllerPath}:`, error.message);
      return {};
    }
  }

  async analyzeRouteFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      const relativePath = filePath.split('temp_')[1] || filePath;

      // Extract imports to map handlers to their source files
      const imports = this.extractImports(ast);

      const routes = await this.extractRoutes(ast, relativePath, imports);

      this.routes.push(...routes);
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error.message);
    }
  }

  async extractRoutes(ast, filePath, imports = {}) {
    const routes = [];
    const self = this;

    const routePromises = [];

    traverse(ast, {
      CallExpression(path) {
        const { node } = path;

        // Look for router.METHOD() or app.METHOD() calls
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier'
        ) {
          const method = node.callee.property.name.toLowerCase();
          const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];

          if (httpMethods.includes(method) && node.arguments.length >= 1) {
            const endpoint = self.extractEndpoint(node.arguments[0]);

            if (endpoint) {
              const middleware = [];
              const handlers = [];

              // Extract middleware and handlers
              for (let i = 1; i < node.arguments.length; i++) {
                const arg = node.arguments[i];
                const handlerInfo = self.extractHandlerInfo(arg, imports);

                if (handlerInfo) {
                  if (i < node.arguments.length - 1) {
                    middleware.push(handlerInfo);
                  } else {
                    handlers.push(handlerInfo);
                  }
                }
              }

              // Store as promise since buildFlowSteps is now async
              const routePromise = self.buildFlowSteps(filePath, middleware, handlers, imports)
                .then(steps => ({
                  endpoint,
                  method: method.toUpperCase(),
                  flowData: {
                    file: filePath,
                    middleware,
                    handlers,
                    steps
                  }
                }));

              routePromises.push(routePromise);
            }
          }
        }
      }
    });

    // Wait for all routes to be built
    const resolvedRoutes = await Promise.all(routePromises);
    routes.push(...resolvedRoutes);

    return routes;
  }

  extractEndpoint(node) {
    if (node.type === 'StringLiteral') {
      return node.value;
    } else if (node.type === 'TemplateLiteral') {
      // Handle template literals
      let endpoint = '';
      for (let i = 0; i < node.quasis.length; i++) {
        endpoint += node.quasis[i].value.raw;
        if (i < node.expressions.length) {
          endpoint += ':param';
        }
      }
      return endpoint;
    }
    return null;
  }

  extractHandlerInfo(node, imports = {}) {
    if (node.type === 'Identifier') {
      const handlerName = node.name;
      const importInfo = imports[handlerName];

      return {
        type: 'function',
        name: handlerName,
        source: importInfo ? importInfo.source : null
      };
    } else if (node.type === 'MemberExpression') {
      const object = node.object.name || '';
      const property = node.property.name || '';
      const importInfo = imports[object];

      return {
        type: 'method',
        name: `${object}.${property}`,
        source: importInfo ? importInfo.source : null
      };
    } else if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
      return {
        type: 'inline',
        name: 'Inline Handler',
        source: null
      };
    }
    return null;
  }

  async buildFlowSteps(filePath, middleware, handlers, imports = {}) {
    const steps = [];
    let stepNumber = 1;

    // Start node
    steps.push({
      id: 'start',
      type: 'start',
      label: 'Request',
      position: { x: 100, y: 50 }
    });

    // Route File node
    steps.push({
      id: 'route-file',
      type: 'route',
      label: path.basename(filePath),
      data: { filePath },
      position: { x: 100, y: 150 }
    });

    let yPos = 250;

    // Middleware nodes
    for (const mw of middleware) {
      steps.push({
        id: `middleware-${stepNumber}`,
        type: 'middleware',
        label: mw.name,
        data: {
          ...mw,
          filePath: mw.source
        },
        position: { x: 100, y: yPos }
      });
      yPos += 100;
      stepNumber++;
    }

    // Handler nodes with controller source and services
    for (const handler of handlers) {
      // Add handler node
      steps.push({
        id: `handler-${stepNumber}`,
        type: 'handler',
        label: handler.name,
        data: {
          ...handler,
          filePath: handler.source
        },
        position: { x: 100, y: yPos }
      });
      yPos += 100;
      stepNumber++;

      // Add controller node if handler has a source
      if (handler.source) {
        const controllerFileName = path.basename(handler.source, '.js');
        steps.push({
          id: `controller-${stepNumber}`,
          type: 'controller',
          label: controllerFileName,
          data: {
            filePath: handler.source,
            handlerName: handler.name
          },
          position: { x: 100, y: yPos }
        });
        yPos += 100;
        stepNumber++;

        // Analyze controller to find service imports
        if (this.projectRoot && handler.source.includes('controller')) {
          const controllerImports = await this.analyzeControllerFile(handler.source, this.projectRoot);

          // Find service imports
          const serviceImports = Object.entries(controllerImports)
            .filter(([name, info]) => info.source && info.source.includes('service'))
            .slice(0, 3); // Limit to 3 services to avoid clutter

          for (const [serviceName, serviceInfo] of serviceImports) {
            steps.push({
              id: `service-${stepNumber}`,
              type: 'service',
              label: serviceName,
              data: {
                filePath: serviceInfo.source,
                serviceName: serviceName
              },
              position: { x: 100, y: yPos }
            });
            yPos += 100;
            stepNumber++;
          }
        }
      }
    }

    // Database node (if detected)
    const hasDatabase = middleware.some(m => m.source && m.source.includes('database')) ||
      handlers.some(h => h.source && h.source.includes('database'));

    if (hasDatabase || steps.some(s => s.type === 'controller')) {
      steps.push({
        id: 'database',
        type: 'database',
        label: 'Database',
        data: { info: 'Data persistence layer' },
        position: { x: 100, y: yPos }
      });
      yPos += 100;
    }

    // End node
    steps.push({
      id: 'end',
      type: 'end',
      label: 'Response',
      position: { x: 100, y: yPos }
    });

    // Create connections
    const connections = [];
    for (let i = 0; i < steps.length - 1; i++) {
      connections.push({
        id: `e${i}`,
        source: steps[i].id,
        target: steps[i + 1].id
      });
    }

    return { nodes: steps, edges: connections };
  }

  async cleanupDirectory(dir) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up directory:', error);
    }
  }
}

module.exports = FlowAnalyzer;