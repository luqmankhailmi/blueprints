const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class AITechStackAnalyzer {
  constructor(projectPath, groqApiKey) {
    this.projectPath = projectPath;
    this.groqApiKey = groqApiKey;
    this.maxFilesToAnalyze = 50; // Limit to avoid token overflow
    this.maxFileSize = 50000; // 50KB per file max
  }

  /**
   * Main AI analysis entry point
   */
  async analyzeWithAI(basicAnalysis) {
    try {
      console.log('Starting AI-powered tech stack analysis...');

      // Gather project context
      const projectContext = await this.gatherProjectContext();
      
      // Call Groq API for deep analysis
      const aiInsights = await this.callGroqAPI(projectContext, basicAnalysis);
      
      // Merge AI insights with basic analysis
      const enhancedAnalysis = this.mergeAnalysis(basicAnalysis, aiInsights);
      
      return {
        success: true,
        analysis: enhancedAnalysis,
        aiModel: 'llama-3.3-70b-versatile',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        success: false,
        error: error.message,
        analysis: basicAnalysis, // Fallback to basic analysis
      };
    }
  }

  /**
   * Gather relevant project files and structure for AI analysis
   */
  async gatherProjectContext() {
    const context = {
      packageJson: null,
      configFiles: [],
      sampleCode: [],
      directoryStructure: null,
    };

    try {
      // Read package.json
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
        context.packageJson = JSON.parse(packageContent);
      } catch (e) {
        console.log('No package.json found');
      }

      // Find and read important config files
      const configFilePatterns = [
        'tsconfig.json',
        'vite.config.js',
        'vite.config.ts',
        'webpack.config.js',
        'next.config.js',
        'tailwind.config.js',
        'tailwind.config.ts',
        '.eslintrc',
        '.prettierrc',
        'Dockerfile',
        'docker-compose.yml',
        '.env.example',
        'railway.json',
        'vercel.json',
        'netlify.toml',
      ];

      for (const configFile of configFilePatterns) {
        try {
          const configPath = path.join(this.projectPath, configFile);
          const content = await fs.readFile(configPath, 'utf-8');
          if (content.length < this.maxFileSize) {
            context.configFiles.push({
              name: configFile,
              content: content,
            });
          }
        } catch (e) {
          // File doesn't exist, skip
        }
      }

      // Sample some code files for pattern detection
      const codeFiles = await this.findRelevantCodeFiles();
      for (const file of codeFiles.slice(0, 10)) { // Max 10 files
        try {
          const content = await fs.readFile(file, 'utf-8');
          if (content.length < this.maxFileSize) {
            context.sampleCode.push({
              path: path.relative(this.projectPath, file),
              content: content.substring(0, 5000), // First 5000 chars
            });
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }

      // Get directory structure
      context.directoryStructure = await this.getDirectoryStructure(this.projectPath, 0, 3);

    } catch (error) {
      console.error('Error gathering project context:', error);
    }

    return context;
  }

  /**
   * Find relevant code files for analysis
   */
  async findRelevantCodeFiles() {
    const files = [];
    const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
    const priorityPatterns = ['app', 'index', 'main', 'config', 'setup', 'server', 'routes'];

    try {
      await this.scanDirectory(this.projectPath, files, relevantExtensions, 0, 3);
      
      // Prioritize files with important names
      files.sort((a, b) => {
        const aName = path.basename(a).toLowerCase();
        const bName = path.basename(b).toLowerCase();
        const aPriority = priorityPatterns.some(p => aName.includes(p)) ? 1 : 0;
        const bPriority = priorityPatterns.some(p => bName.includes(p)) ? 1 : 0;
        return bPriority - aPriority;
      });

    } catch (error) {
      console.error('Error finding code files:', error);
    }

    return files;
  }

  async scanDirectory(dir, files, extensions, depth, maxDepth) {
    if (depth > maxDepth) return;

    try {
      const entries = await fs.readdir(dir);
      
      for (const entry of entries) {
        if (this.shouldSkip(entry)) continue;
        
        const fullPath = path.join(dir, entry);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          await this.scanDirectory(fullPath, files, extensions, depth + 1, maxDepth);
        } else if (extensions.includes(path.extname(entry))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  async getDirectoryStructure(dir, depth, maxDepth) {
    if (depth > maxDepth) return null;

    const structure = {
      name: path.basename(dir),
      type: 'directory',
      children: [],
    };

    try {
      const entries = await fs.readdir(dir);
      
      for (const entry of entries) {
        if (this.shouldSkip(entry)) continue;
        
        const fullPath = path.join(dir, entry);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          const subStructure = await this.getDirectoryStructure(fullPath, depth + 1, maxDepth);
          if (subStructure) {
            structure.children.push(subStructure);
          }
        } else {
          structure.children.push({
            name: entry,
            type: 'file',
          });
        }
      }
    } catch (error) {
      // Skip
    }

    return structure;
  }

  /**
   * Call Groq API with project context
   */
  async callGroqAPI(projectContext, basicAnalysis) {
    const prompt = this.buildAnalysisPrompt(projectContext, basicAnalysis);

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile', // Fast and accurate
          messages: [
            {
              role: 'system',
              content: `You are an expert software architect and tech stack analyst. Your job is to analyze codebases and provide comprehensive, accurate technology stack detection. You should:

1. Identify ALL technologies, frameworks, libraries, and tools used
2. Detect patterns and architectures even if not explicitly in package.json
3. Understand implicit dependencies and configurations
4. Categorize technologies into: frontend, backend, database, devOps, testing
5. Provide confidence scores for each detection
6. Be thorough but avoid false positives

Return ONLY a valid JSON object with this exact structure:
{
  "frontend": {
    "frameworks": [{"name": "React", "version": "18.2.0", "confidence": "high"}],
    "libraries": [{"name": "Axios", "category": "HTTP Client", "confidence": "high"}],
    "uiComponents": [{"name": "Material-UI", "confidence": "medium"}],
    "styling": [{"name": "Tailwind CSS", "confidence": "high"}],
    "stateManagement": [{"name": "Redux", "confidence": "high"}],
    "routing": [{"name": "React Router", "confidence": "high"}],
    "bundlers": [{"name": "Vite", "type": "bundler", "confidence": "high"}],
    "language": "TypeScript"
  },
  "backend": {
    "frameworks": [{"name": "Express.js", "version": "4.18.2", "confidence": "high"}],
    "runtime": "Node.js",
    "language": "JavaScript",
    "apiTools": [{"name": "GraphQL", "confidence": "medium"}],
    "authentication": [{"name": "Passport.js", "confidence": "high"}],
    "validation": [{"name": "Joi", "confidence": "high"}],
    "orm": [{"name": "Prisma", "confidence": "high"}],
    "utilities": [{"name": "CORS", "category": "Security", "confidence": "high"}]
  },
  "database": {
    "relational": [{"name": "PostgreSQL", "driver": "node-postgres", "confidence": "high"}],
    "nosql": [{"name": "MongoDB", "confidence": "medium"}],
    "cache": [{"name": "Redis", "confidence": "high"}],
    "search": [],
    "tools": [{"name": "Prisma ORM", "type": "ORM", "confidence": "high"}]
  },
  "devOps": {
    "containerization": [{"name": "Docker", "type": "config", "confidence": "high"}],
    "ci_cd": [{"name": "GitHub Actions", "confidence": "medium"}],
    "hosting": [{"name": "Vercel", "confidence": "high"}],
    "monitoring": [],
    "cloudServices": []
  },
  "testing": {
    "frameworks": [{"name": "Jest", "confidence": "high"}],
    "libraries": [{"name": "React Testing Library", "confidence": "high"}],
    "e2e": [{"name": "Cypress", "confidence": "medium"}],
    "coverage": []
  },
  "insights": {
    "architecture": "Describe the overall architecture pattern (e.g., MVC, microservices, serverless)",
    "patterns": ["List of detected design patterns"],
    "recommendations": ["Suggestions for improvements or missing tools"]
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown, no explanations, no code blocks.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent results
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Parse AI response
      let parsedResponse;
      try {
        // Try to extract JSON if wrapped in markdown
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                         aiResponse.match(/```\s*([\s\S]*?)\s*```/);
        const jsonContent = jsonMatch ? jsonMatch[1] : aiResponse;
        parsedResponse = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Try direct parse
        parsedResponse = JSON.parse(aiResponse);
      }

      return parsedResponse;

    } catch (error) {
      console.error('Groq API error:', error.response?.data || error.message);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Build analysis prompt for Groq
   */
  buildAnalysisPrompt(context, basicAnalysis) {
    let prompt = `Analyze this codebase and provide a comprehensive tech stack analysis.\n\n`;

    // Add package.json if available
    if (context.packageJson) {
      prompt += `## Package.json\n\`\`\`json\n${JSON.stringify(context.packageJson, null, 2).substring(0, 3000)}\n\`\`\`\n\n`;
    }

    // Add config files
    if (context.configFiles.length > 0) {
      prompt += `## Configuration Files\n`;
      context.configFiles.forEach(file => {
        prompt += `### ${file.name}\n\`\`\`\n${file.content.substring(0, 1000)}\n\`\`\`\n\n`;
      });
    }

    // Add directory structure
    if (context.directoryStructure) {
      prompt += `## Directory Structure\n\`\`\`\n${JSON.stringify(context.directoryStructure, null, 2).substring(0, 1000)}\n\`\`\`\n\n`;
    }

    // Add sample code
    if (context.sampleCode.length > 0) {
      prompt += `## Sample Code Files (for pattern detection)\n`;
      context.sampleCode.forEach(file => {
        prompt += `### ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
      });
    }

    // Add basic analysis as reference
    prompt += `## Basic Rule-Based Analysis (for reference)\n\`\`\`json\n${JSON.stringify(basicAnalysis, null, 2)}\n\`\`\`\n\n`;

    prompt += `Based on all the above information, provide a comprehensive tech stack analysis. Be thorough and detect technologies that may not be in package.json but are evident from configs, code patterns, or directory structure.`;

    return prompt;
  }

  /**
   * Merge AI insights with basic analysis
   */
  mergeAnalysis(basicAnalysis, aiInsights) {
    const merged = {
      frontend: this.mergeCategoryWithConfidence(basicAnalysis.frontend, aiInsights.frontend),
      backend: this.mergeCategoryWithConfidence(basicAnalysis.backend, aiInsights.backend),
      database: this.mergeCategoryWithConfidence(basicAnalysis.database, aiInsights.database),
      devOps: this.mergeCategoryWithConfidence(basicAnalysis.devOps, aiInsights.devOps),
      testing: this.mergeCategoryWithConfidence(basicAnalysis.testing, aiInsights.testing),
      insights: aiInsights.insights || null,
      aiEnhanced: true,
    };

    return merged;
  }

  mergeCategoryWithConfidence(basicCategory, aiCategory) {
    if (!basicCategory && !aiCategory) return null;
    if (!aiCategory) return basicCategory;
    if (!basicCategory) return aiCategory;

    const merged = {};

    // Get all unique keys from both analyses
    const allKeys = new Set([
      ...Object.keys(basicCategory || {}),
      ...Object.keys(aiCategory || {})
    ]);

    for (const key of allKeys) {
      const basicItems = basicCategory[key] || [];
      const aiItems = aiCategory[key] || [];

      // Handle string values (like 'language' or 'runtime')
      if (typeof basicItems === 'string' || typeof aiItems === 'string') {
        merged[key] = aiItems || basicItems;
        continue;
      }

      // Merge arrays of items
      if (Array.isArray(basicItems) || Array.isArray(aiItems)) {
        const itemMap = new Map();

        // Add basic items
        (Array.isArray(basicItems) ? basicItems : []).forEach(item => {
          const name = typeof item === 'string' ? item : item.name;
          itemMap.set(name, {
            ...item,
            source: 'basic',
          });
        });

        // Add or enhance with AI items
        (Array.isArray(aiItems) ? aiItems : []).forEach(item => {
          const name = typeof item === 'string' ? item : item.name;
          const existing = itemMap.get(name);
          
          if (existing) {
            // Enhance existing item with AI confidence
            itemMap.set(name, {
              ...existing,
              ...item,
              source: 'both',
            });
          } else {
            // Add new AI-detected item
            itemMap.set(name, {
              ...item,
              source: 'ai',
            });
          }
        });

        merged[key] = Array.from(itemMap.values());
      }
    }

    return merged;
  }

  shouldSkip(name) {
    return ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache'].includes(name) || 
           name.startsWith('.');
  }
}

module.exports = AITechStackAnalyzer;
