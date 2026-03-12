const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class GitHubService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Blueprints-App'
      }
    });
  }

  async getUserInfo() {
    try {
      const response = await this.api.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub user:', error.response?.data || error.message);
      throw new Error('Failed to fetch GitHub user info');
    }
  }

  async getUserRepositories() {
    try {
      const response = await this.api.get('/user/repos', {
        params: {
          sort: 'updated',
          per_page: 100,
          affiliation: 'owner,collaborator'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repositories:', error.response?.data || error.message);
      throw new Error('Failed to fetch repositories');
    }
  }

  async getRepositoryContents(owner, repo, path = '') {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/contents/${path}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repo contents:', error.response?.data || error.message);
      throw new Error('Failed to fetch repository contents');
    }
  }

  async getFileContent(owner, repo, filePath, branch = 'main') {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/contents/${filePath}`, {
        params: { ref: branch }
      });
      
      if (response.data.encoding === 'base64') {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }
      return response.data.content;
    } catch (error) {
      console.error(`Error fetching file ${filePath}:`, error.response?.data || error.message);
      return null;
    }
  }

  async downloadRepository(owner, repo, branch = 'main', targetDir) {
    try {
      // Create target directory
      await fs.mkdir(targetDir, { recursive: true });

      // Get repository tree
      const treeResponse = await this.api.get(`/repos/${owner}/${repo}/git/trees/${branch}`, {
        params: { recursive: 1 }
      });

      const tree = treeResponse.data.tree;
      
      // Filter for JavaScript files in common route directories
      const relevantFiles = tree.filter(item => {
        if (item.type !== 'blob') return false;
        if (!item.path.endsWith('.js') && !item.path.endsWith('.ts')) return false;
        
        const lowerPath = item.path.toLowerCase();
        return (
          lowerPath.includes('route') ||
          lowerPath.includes('controller') ||
          lowerPath.includes('api') ||
          lowerPath.includes('endpoint') ||
          lowerPath.includes('server') ||
          lowerPath.includes('app') ||
          lowerPath.includes('index')
        );
      });

      // Download files
      for (const file of relevantFiles) {
        const content = await this.getFileContent(owner, repo, file.path, branch);
        if (content) {
          const filePath = path.join(targetDir, file.path);
          const fileDir = path.dirname(filePath);
          
          await fs.mkdir(fileDir, { recursive: true });
          await fs.writeFile(filePath, content, 'utf-8');
        }
      }

      return targetDir;
    } catch (error) {
      console.error('Error downloading repository:', error.response?.data || error.message);
      throw new Error('Failed to download repository');
    }
  }

  async getBranches(owner, repo) {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/branches`);
      return response.data.map(branch => branch.name);
    } catch (error) {
      console.error('Error fetching branches:', error.response?.data || error.message);
      throw new Error('Failed to fetch branches');
    }
  }

  async getDefaultBranch(owner, repo) {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}`);
      return response.data.default_branch || 'main';
    } catch (error) {
      console.error('Error fetching default branch:', error.response?.data || error.message);
      return 'main';
    }
  }
}

module.exports = GitHubService;
