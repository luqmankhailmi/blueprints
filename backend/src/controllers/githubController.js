const pool = require('../config/database');
const GitHubService = require('../services/githubService');
const axios = require('axios');

const connectGitHub = async (req, res) => {
  const { code } = req.body;
  const userId = req.userId;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ error: 'Failed to get access token from GitHub' });
    }

    // Get GitHub user info
    const githubService = new GitHubService(accessToken);
    const githubUser = await githubService.getUserInfo();

    // Update user with GitHub credentials
    await pool.query(
      'UPDATE users SET github_id = $1, github_token = $2, github_username = $3 WHERE id = $4',
      [githubUser.id, accessToken, githubUser.login, userId]
    );

    res.json({
      message: 'GitHub connected successfully',
      github_username: githubUser.login,
      github_id: githubUser.id,
    });
  } catch (error) {
    console.error('GitHub connect error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to connect GitHub account' });
  }
};

const disconnectGitHub = async (req, res) => {
  const userId = req.userId;

  try {
    await pool.query(
      'UPDATE users SET github_id = NULL, github_token = NULL, github_username = NULL WHERE id = $1',
      [userId]
    );

    res.json({ message: 'GitHub disconnected successfully' });
  } catch (error) {
    console.error('GitHub disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect GitHub account' });
  }
};

const getGitHubStatus = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT github_id, github_username FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];
    res.json({
      connected: !!user.github_id,
      github_username: user.github_username,
    });
  } catch (error) {
    console.error('Get GitHub status error:', error);
    res.status(500).json({ error: 'Failed to get GitHub status' });
  }
};

const getUserRepositories = async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT github_token FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (!user.github_token) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    const githubService = new GitHubService(user.github_token);
    const repos = await githubService.getUserRepositories();

    // Filter and format repositories
    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at,
      private: repo.private,
      language: repo.language,
    }));

    res.json({ repositories: formattedRepos });
  } catch (error) {
    console.error('Get repositories error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

const getRepositoryBranches = async (req, res) => {
  const userId = req.userId;
  const { owner, repo } = req.params;

  try {
    const result = await pool.query(
      'SELECT github_token FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (!user.github_token) {
      return res.status(400).json({ error: 'GitHub not connected' });
    }

    const githubService = new GitHubService(user.github_token);
    const branches = await githubService.getBranches(owner, repo);

    res.json({ branches });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

module.exports = {
  connectGitHub,
  disconnectGitHub,
  getGitHubStatus,
  getUserRepositories,
  getRepositoryBranches,
};
