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

  async analyzeRouteFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      const relativePath = filePath.split('temp_')[1] || filePath;
      const routes = this.extractRoutes(ast, relativePath);
      
      this.routes.push(...routes);
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error.message);
    }
  }

  extractRoutes(ast, filePath) {
    const routes = [];
    const self = this;

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
                const handlerInfo = self.extractHandlerInfo(arg);
                
                if (handlerInfo) {
                  if (i < node.arguments.length - 1) {
                    middleware.push(handlerInfo);
                  } else {
                    handlers.push(handlerInfo);
                  }
                }
              }

              routes.push({
                endpoint,
                method: method.toUpperCase(),
                flowData: {
                  file: filePath,
                  middleware,
                  handlers,
                  steps: self.buildFlowSteps(filePath, middleware, handlers)
                }
              });
            }
          }
        }
      }
    });

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

  extractHandlerInfo(node) {
    if (node.type === 'Identifier') {
      return {
        type: 'function',
        name: node.name
      };
    } else if (node.type === 'MemberExpression') {
      const object = node.object.name || '';
      const property = node.property.name || '';
      return {
        type: 'method',
        name: `${object}.${property}`
      };
    } else if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
      return {
        type: 'inline',
        name: 'Inline Handler'
      };
    }
    return null;
  }

  buildFlowSteps(filePath, middleware, handlers) {
    const steps = [];
    let stepNumber = 1;

    // Start node
    steps.push({
      id: 'start',
      type: 'start',
      label: 'Request',
      position: { x: 100, y: 50 }
    });

    // File node
    steps.push({
      id: 'file',
      type: 'file',
      label: path.basename(filePath),
      data: { filePath },
      position: { x: 100, y: 150 }
    });

    let yPos = 250;

    // Middleware nodes
    middleware.forEach((mw, index) => {
      steps.push({
        id: `middleware-${index}`,
        type: 'middleware',
        label: mw.name,
        data: mw,
        position: { x: 100, y: yPos }
      });
      yPos += 100;
    });

    // Handler nodes
    handlers.forEach((handler, index) => {
      steps.push({
        id: `handler-${index}`,
        type: 'handler',
        label: handler.name,
        data: handler,
        position: { x: 100, y: yPos }
      });
      yPos += 100;
    });

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
