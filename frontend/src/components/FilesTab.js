import React, { useState } from 'react';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown, Search } from 'lucide-react';

const FilesTab = ({ projectId, architecture }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!architecture?.directory) {
    return (
      <div className="empty-state">
        <Folder size={48} />
        <p>Loading file structure...</p>
      </div>
    );
  }

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = async (file) => {
    setSelectedFile(file);
    
    // Fetch file content
    try {
      const response = await fetch(
        `/api/architecture/${projectId}/file?path=${encodeURIComponent(file.path)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setFileContent(data);
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      setFileContent({ error: 'Failed to load file content' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtensionColor = (ext) => {
    const colors = {
      '.js': '#f7df1e',
      '.jsx': '#61dafb',
      '.ts': '#3178c6',
      '.tsx': '#3178c6',
      '.css': '#264de4',
      '.html': '#e34c26',
      '.json': '#000000',
      '.md': '#083fa1',
    };
    return colors[ext] || '#888';
  };

  const renderTree = (node, path = '', depth = 0) => {
    if (!node) return null;

    const isExpanded = expandedFolders.has(path || 'root');
    const matchesSearch = !searchTerm || 
      node.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch && node.type === 'file') return null;

    if (node.type === 'directory') {
      const hasMatchingChildren = node.children?.some(child => 
        !searchTerm || child.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (!matchesSearch && !hasMatchingChildren) return null;

      return (
        <div key={path} className="tree-node">
          <div 
            className="tree-item folder"
            style={{ paddingLeft: `${depth * 20}px` }}
            onClick={() => toggleFolder(path || 'root')}
          >
            <span className="tree-icon">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <span className="tree-icon">
              {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
            </span>
            <span className="tree-label">{node.name}</span>
            <span className="tree-meta">{node.fileCount} files</span>
          </div>
          {isExpanded && node.children && (
            <div className="tree-children">
              {node.children.map((child) => 
                renderTree(child, child.path, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    if (node.type === 'file') {
      const isSelected = selectedFile?.path === node.path;
      return (
        <div 
          key={path}
          className={`tree-item file ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 16}px` }}
          onClick={() => handleFileClick(node)}
        >
          <span className="tree-icon">
            <File size={16} style={{ color: getFileExtensionColor(node.extension) }} />
          </span>
          <span className="tree-label">{node.name}</span>
          <span className="tree-meta">{formatFileSize(node.size)}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="files-tab">
      <div className="files-container">
        {/* File Tree */}
        <div className="file-tree-panel">
          <div className="file-tree-header">
            <h3>Files</h3>
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="file-tree">
            {renderTree(architecture.directory.tree)}
          </div>
        </div>

        {/* File Preview */}
        <div className="file-preview-panel">
          {selectedFile ? (
            <>
              <div className="file-preview-header">
                <div className="file-info">
                  <File size={18} />
                  <div>
                    <h4>{selectedFile.name}</h4>
                    <p>{selectedFile.path}</p>
                  </div>
                </div>
                <div className="file-stats">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{selectedFile.lines} lines</span>
                </div>
              </div>
              <div className="file-preview-content">
                {fileContent ? (
                  fileContent.error ? (
                    <div className="preview-error">
                      <p>{fileContent.error}</p>
                    </div>
                  ) : (
                    <pre className="code-preview">
                      <code>{fileContent.content}</code>
                    </pre>
                  )
                ) : (
                  <div className="preview-loading">Loading...</div>
                )}
              </div>
            </>
          ) : (
            <div className="file-preview-empty">
              <File size={48} />
              <p>Select a file to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesTab;
