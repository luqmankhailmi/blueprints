const fs = require('fs').promises;
const path = require('path');

class SecurityAnalyzer {
 constructor(projectPath) {
  this.projectPath = projectPath;
  this.issues = [];

  // Vulnerability database for known package vulnerabilities
  this.vulnerablePackages = {
   'express': {
    '<4.17.1': 'XSS vulnerability in Express',
    '<4.17.3': 'Open redirect vulnerability'
   },
   'mongoose': {
    '<5.13.0': 'Prototype pollution vulnerability',
    '<6.0.0': 'Query injection vulnerability'
   },
   'jsonwebtoken': {
    '<8.5.1': 'Algorithm confusion vulnerability',
    '<9.0.0': 'Signature verification bypass'
   },
   'lodash': {
    '<4.17.21': 'Prototype pollution vulnerability'
   },
   'axios': {
    '<0.21.1': 'Server-side request forgery (SSRF)'
   },
   'node-fetch': {
    '<2.6.7': 'Information exposure vulnerability'
   },
   'bcrypt': {
    '<5.0.0': 'Regular expression denial of service'
   },
   'validator': {
    '<13.6.0': 'ReDoS vulnerability'
   },
   'request': {
    '*': 'Package deprecated - contains multiple vulnerabilities'
   }
  };

  // Security patterns to detect in code
  this.patterns = {
   secrets: [
    { regex: /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/, name: 'API Key' },
    { regex: /secret[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/, name: 'Secret Key' },
    { regex: /password\s*[:=]\s*['"][^'"]{3,}['"]/, name: 'Hardcoded Password' },
    { regex: /mongodb:\/\/[\w:]+@[\w\.]+/, name: 'MongoDB Connection String' },
    { regex: /postgres:\/\/[\w:]+@[\w\.]+/, name: 'PostgreSQL Connection String' },
    { regex: /mysql:\/\/[\w:]+@[\w\.]+/, name: 'MySQL Connection String' },
    { regex: /AWS_SECRET_ACCESS_KEY/, name: 'AWS Secret Key' },
    { regex: /-----BEGIN PRIVATE KEY-----/, name: 'Private Key' },
    { regex: /Bearer [a-zA-Z0-9_\-\.]{20,}/, name: 'Bearer Token' }
   ],
   sqlInjection: [
    { regex: /query\s*\(\s*['"`][^'"]*\+/, name: 'SQL Query with String Concatenation' },
    { regex: /execute\s*\(\s*['"`][^'"]*\$\{/, name: 'SQL Query with Template Literal' },
    { regex: /\.query\s*\(\s*`[^`]*\$\{[^}]+\}/, name: 'SQL Injection via Template Literal' }
   ],
   xss: [
    { regex: /dangerouslySetInnerHTML/, name: 'Dangerous HTML Injection' },
    { regex: /innerHTML\s*=\s*[^;]*req\.|innerHTML\s*=\s*[^;]*params/, name: 'Direct HTML Injection' },
    { regex: /document\.write\s*\([^)]*req\.|document\.write\s*\([^)]*params/, name: 'Document Write with User Input' },
    { regex: /eval\s*\([^)]*req\.|eval\s*\([^)]*params/, name: 'Eval with User Input' },
    { regex: /new Function\s*\([^)]*req\.|new Function\s*\([^)]*params/, name: 'Function Constructor with User Input' }
   ],
   weakAuth: [
    { regex: /jwt\.sign\s*\([^)]*['"][^'"]{0,8}['"]/, name: 'Weak JWT Secret (< 8 chars)' },
    { regex: /expiresIn\s*:\s*['"]\d{2,}[dy]['"]/, name: 'Long JWT Expiration (> 9 days)' },
    { regex: /algorithm\s*:\s*['"]none['"]/, name: 'JWT with No Algorithm' }
   ],
   cors: [
    { regex: /cors\s*\(\s*\{\s*origin\s*:\s*['*]/, name: 'CORS Allow All Origins' },
    { regex: /Access-Control-Allow-Origin.*\*/, name: 'CORS Wildcard Origin' }
   ],
   fileUpload: [
    { regex: /multer\s*\([^)]*\)(?!.*fileFilter)/, name: 'File Upload Without Validation' },
    { regex: /\.single\s*\(|\.array\s*\((?!.*limits)/, name: 'File Upload Without Size Limit' }
   ],
   sensitiveData: [
    { regex: /console\.log\s*\([^)]*password[^)]*\)/, name: 'Password Logging' },
    { regex: /console\.log\s*\([^)]*token[^)]*\)/, name: 'Token Logging' },
    { regex: /res\.json\s*\([^)]*password[^)]*\)/, name: 'Password in Response' }
   ]
  };
 }

 async analyze() {
  try {
   console.log('Starting security analysis...');

   // Find and analyze package.json for vulnerable dependencies
   await this.analyzeDependencies();

   // Scan all JavaScript files for security issues
   await this.scanDirectory(this.projectPath);

   // Calculate security score
   const score = this.calculateScore();

   console.log(`Security analysis complete. Found ${this.issues.length} issues. Score: ${score}/100`);

   return {
    score,
    issues: this.issues,
    summary: this.getSummary()
   };
  } catch (error) {
   console.error('Error during security analysis:', error);
   return {
    score: 0,
    issues: [],
    summary: { critical: 0, high: 0, medium: 0, low: 0 }
   };
  }
 }

 async analyzeDependencies() {
  try {
   // Find package.json
   const packageJsonPath = await this.findPackageJson(this.projectPath);

   if (!packageJsonPath) {
    console.log('No package.json found');
    return;
   }

   const content = await fs.readFile(packageJsonPath, 'utf-8');
   const pkg = JSON.parse(content);
   const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };

   for (const [pkgName, version] of Object.entries(dependencies)) {
    if (this.vulnerablePackages[pkgName]) {
     const vulnerabilities = this.vulnerablePackages[pkgName];

     for (const [vulnVersion, description] of Object.entries(vulnerabilities)) {
      if (this.isVulnerableVersion(version, vulnVersion)) {
       this.issues.push({
        severity: 'high',
        type: 'Vulnerable Dependency',
        title: `${pkgName}@${version} has known vulnerability`,
        description: description,
        location: 'package.json',
        line: null,
        code: `"${pkgName}": "${version}"`,
        recommendation: `Update ${pkgName} to the latest version to fix this vulnerability.`,
        fix: `npm install ${pkgName}@latest`
       });
      }
     }
    }
   }
  } catch (error) {
   console.error('Error analyzing dependencies:', error.message);
  }
 }

 async findPackageJson(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
   const fullPath = path.join(dir, entry.name);

   if (entry.isFile() && entry.name === 'package.json') {
    return fullPath;
   } else if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
    const found = await this.findPackageJson(fullPath);
    if (found) return found;
   }
  }

  return null;
 }

 async scanDirectory(dir) {
  try {
   const entries = await fs.readdir(dir, { withFileTypes: true });

   for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules and hidden directories
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
     continue;
    }

    if (entry.isDirectory()) {
     await this.scanDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
     await this.scanFile(fullPath);
    }
   }
  } catch (error) {
   console.error(`Error scanning directory ${dir}:`, error.message);
  }
 }

 async scanFile(filePath) {
  try {
   const content = await fs.readFile(filePath, 'utf-8');
   const lines = content.split('\n');
   const relativePath = path.relative(this.projectPath, filePath);

   // Skip minified files, build files, and bundles
   if (filePath.includes('.min.js') ||
    filePath.includes('/build/') ||
    filePath.includes('/dist/') ||
    filePath.includes('.bundle.') ||
    filePath.includes('vendor')) {
    return;
   }

   // Helper to truncate long code snippets
   const truncateCode = (code, maxLength = 150) => {
    if (!code || code.length <= maxLength) return code;
    return code.substring(0, maxLength) + '...';
   };

   // Check for hardcoded secrets
   this.patterns.secrets.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex, 'g');

    while ((match = regex.exec(content)) !== null) {
     const lineNum = content.substring(0, match.index).split('\n').length;
     const line = lines[lineNum - 1];

     // Skip comments
     if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      continue;
     }

     // Skip if it's referencing process.env
     if (line.includes('process.env')) {
      continue;
     }

     this.issues.push({
      severity: 'critical',
      type: 'Hardcoded Secret',
      title: `${pattern.name} detected in code`,
      description: 'Hardcoded secrets should never be committed to source code. Use environment variables instead.',
      location: relativePath,
      line: lineNum,
      code: truncateCode(line.trim()),
      recommendation: 'Move this secret to a .env file and use process.env to access it.',
      fix: `process.env.${pattern.name.toUpperCase().replace(/\s+/g, '_')}`
     });
    }
   });

   // Check for SQL injection vulnerabilities
   this.patterns.sqlInjection.forEach(pattern => {
    if (pattern.regex.test(content)) {
     const match = content.match(pattern.regex);
     const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;

     this.issues.push({
      severity: 'critical',
      type: 'SQL Injection',
      title: pattern.name,
      description: 'SQL queries using string concatenation or template literals with user input are vulnerable to SQL injection attacks.',
      location: relativePath,
      line: lineNum,
      code: truncateCode(lines[lineNum - 1]?.trim()),
      recommendation: 'Use parameterized queries or prepared statements instead.',
      fix: 'Use: pool.query("SELECT * FROM users WHERE id = $1", [userId])'
     });
    }
   });

   // Check for XSS vulnerabilities
   this.patterns.xss.forEach(pattern => {
    if (pattern.regex.test(content)) {
     const match = content.match(pattern.regex);
     const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;

     this.issues.push({
      severity: 'high',
      type: 'XSS Vulnerability',
      title: pattern.name,
      description: 'Directly rendering user input in HTML can lead to cross-site scripting (XSS) attacks.',
      location: relativePath,
      line: lineNum,
      code: truncateCode(lines[lineNum - 1]?.trim()),
      recommendation: 'Sanitize user input and use safe rendering methods.',
      fix: 'Use DOMPurify or escape user input before rendering'
     });
    }
   });

   // Check for weak authentication
   this.patterns.weakAuth.forEach(pattern => {
    if (pattern.regex.test(content)) {
     const match = content.match(pattern.regex);
     const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;

     this.issues.push({
      severity: 'high',
      type: 'Weak Authentication',
      title: pattern.name,
      description: 'Weak JWT configuration can compromise authentication security.',
      location: relativePath,
      line: lineNum,
      code: truncateCode(lines[lineNum - 1]?.trim()),
      recommendation: 'Use strong secrets (32+ chars) and reasonable expiration times.',
      fix: 'Use process.env.JWT_SECRET with a strong random string'
     });
    }
   });

   // Check for CORS issues
   this.patterns.cors.forEach(pattern => {
    if (pattern.regex.test(content)) {
     const match = content.match(pattern.regex);
     const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;

     this.issues.push({
      severity: 'medium',
      type: 'CORS Misconfiguration',
      title: pattern.name,
      description: 'Allowing all origins with CORS can expose your API to unauthorized access.',
      location: relativePath,
      line: lineNum,
      code: truncateCode(lines[lineNum - 1]?.trim()),
      recommendation: 'Specify allowed origins explicitly instead of using wildcard.',
      fix: 'cors({ origin: ["https://yourdomain.com"] })'
     });
    }
   });

   // Check for file upload issues
   this.patterns.fileUpload.forEach(pattern => {
    if (pattern.regex.test(content)) {
     const match = content.match(pattern.regex);
     const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;

     this.issues.push({
      severity: 'medium',
      type: 'File Upload Vulnerability',
      title: pattern.name,
      description: 'File uploads without proper validation can allow malicious files to be uploaded.',
      location: relativePath,
      line: lineNum,
      code: truncateCode(lines[lineNum - 1]?.trim()),
      recommendation: 'Add file type validation and size limits to prevent abuse.',
      fix: 'Add fileFilter and limits options to multer configuration'
     });
    }
   });

   // Check for sensitive data exposure
   this.patterns.sensitiveData.forEach(pattern => {
    if (pattern.regex.test(content)) {
     const match = content.match(pattern.regex);
     const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;

     this.issues.push({
      severity: 'medium',
      type: 'Sensitive Data Exposure',
      title: pattern.name,
      description: 'Logging or exposing sensitive data can lead to information disclosure.',
      location: relativePath,
      line: lineNum,
      code: truncateCode(lines[lineNum - 1]?.trim()),
      recommendation: 'Never log or expose passwords, tokens, or other sensitive data.',
      fix: 'Remove sensitive data from logs and API responses'
     });
    }
   });

  } catch (error) {
   console.error(`Error scanning file ${filePath}:`, error.message);
  }
 }

 isVulnerableVersion(version, vulnPattern) {
  // Handle wildcard (package is always vulnerable)
  if (vulnPattern === '*') {
   return true;
  }

  // Clean version (remove ^ and ~)
  const cleanVersion = version.replace(/^[\^~]/, '');
  const operator = vulnPattern.charAt(0);
  const targetVersion = vulnPattern.substring(1);

  if (operator === '<') {
   return this.compareVersions(cleanVersion, targetVersion) < 0;
  }

  return false;
 }

 compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
   const num1 = parts1[i] || 0;
   const num2 = parts2[i] || 0;

   if (num1 < num2) return -1;
   if (num1 > num2) return 1;
  }

  return 0;
 }

 calculateScore() {
  let score = 100;
  const severityPenalties = {
   critical: 15,
   high: 10,
   medium: 5,
   low: 2
  };

  this.issues.forEach(issue => {
   score -= severityPenalties[issue.severity] || 0;
  });

  return Math.max(0, score);
 }

 getSummary() {
  return {
   critical: this.issues.filter(i => i.severity === 'critical').length,
   high: this.issues.filter(i => i.severity === 'high').length,
   medium: this.issues.filter(i => i.severity === 'medium').length,
   low: this.issues.filter(i => i.severity === 'low').length
  };
 }
}

module.exports = SecurityAnalyzer;