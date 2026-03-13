import React from 'react';
import { Shield, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import './SecurityTab.css';

const SecurityTab = ({ project }) => {
 if (!project) {
  return (
   <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
    <Shield size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
    <h3 style={{ marginBottom: '8px' }}>No Project Selected</h3>
    <p>Select a project to view its security analysis.</p>
   </div>
  );
 }

 const securityScore = project.security_score ?? 100;
 const securityIssues = project.security_issues ?
  (typeof project.security_issues === 'string' ? JSON.parse(project.security_issues) : project.security_issues) :
  [];

 // Determine score grade
 const getScoreGrade = (score) => {
  if (score >= 90) return { grade: 'Excellent', color: '#00b894', class: 'excellent' };
  if (score >= 70) return { grade: 'Good', color: '#00d9ff', class: 'good' };
  if (score >= 50) return { grade: 'Fair', color: '#ff9f43', class: 'fair' };
  return { grade: 'Poor', color: '#ff556c', class: 'poor' };
 };

 const scoreInfo = getScoreGrade(securityScore);

 // Count issues by severity
 const severityCounts = {
  critical: securityIssues.filter(i => i.severity === 'critical').length,
  high: securityIssues.filter(i => i.severity === 'high').length,
  medium: securityIssues.filter(i => i.severity === 'medium').length,
  low: securityIssues.filter(i => i.severity === 'low').length
 };

 const getSeverityIcon = (severity) => {
  switch (severity) {
   case 'critical': return '🚨';
   case 'high': return '⚠️';
   case 'medium': return '⚡';
   case 'low': return 'ℹ️';
   default: return '●';
  }
 };

 const getSeverityColor = (severity) => {
  switch (severity) {
   case 'critical': return '#ff556c';
   case 'high': return '#ff9f43';
   case 'medium': return '#f093fb';
   case 'low': return '#00d9ff';
   default: return '#667eea';
  }
 };

 // Sort issues by severity
 const sortedIssues = [...securityIssues].sort((a, b) => {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return severityOrder[a.severity] - severityOrder[b.severity];
 });

 return (
  <div className="security-tab">
   <div className="security-header">
    <h2>Security Analysis</h2>
    {project.security_analyzed_at && (
     <p className="analyzed-time">
      Last analyzed: {new Date(project.security_analyzed_at).toLocaleString()}
     </p>
    )}
   </div>

   {/* Security Score Card */}
   <div className="security-score-card">
    <div className="score-label">Security Score</div>
    <div className={`score-value ${scoreInfo.class}`}>
     {securityScore}/100
    </div>
    <div className="score-grade">{scoreInfo.grade}</div>

    <div className="security-progress">
     <div
      className="security-progress-bar"
      style={{ width: `${securityScore}%`, backgroundColor: scoreInfo.color }}
     />
    </div>

    <div className="severity-stats">
     <div className="severity-stat">
      <div className="severity-stat-icon">🚨</div>
      <div className="severity-stat-count" style={{ color: '#ff556c' }}>
       {severityCounts.critical}
      </div>
      <div className="severity-stat-label">Critical</div>
     </div>

     <div className="severity-stat">
      <div className="severity-stat-icon">⚠️</div>
      <div className="severity-stat-count" style={{ color: '#ff9f43' }}>
       {severityCounts.high}
      </div>
      <div className="severity-stat-label">High</div>
     </div>

     <div className="severity-stat">
      <div className="severity-stat-icon">⚡</div>
      <div className="severity-stat-count" style={{ color: '#f093fb' }}>
       {severityCounts.medium}
      </div>
      <div className="severity-stat-label">Medium</div>
     </div>

     <div className="severity-stat">
      <div className="severity-stat-icon">ℹ️</div>
      <div className="severity-stat-count" style={{ color: '#00d9ff' }}>
       {severityCounts.low}
      </div>
      <div className="severity-stat-label">Low</div>
     </div>
    </div>
   </div>

   {/* Issues List */}
   {securityIssues.length === 0 ? (
    <div className="no-issues">
     <div className="no-issues-icon">
      <CheckCircle size={64} color="#00b894" />
     </div>
     <h3>No Security Issues Found!</h3>
     <p>Great job! Your codebase follows security best practices.</p>
    </div>
   ) : (
    <div className="issues-section">
     <h3 className="issues-title">
      Found {securityIssues.length} security issue{securityIssues.length !== 1 ? 's' : ''}
     </h3>

     <div className="issues-list">
      {sortedIssues.map((issue, index) => (
       <div key={index} className={`issue-card ${issue.severity}`}>
        <div className="issue-header">
         <div className="issue-icon">{getSeverityIcon(issue.severity)}</div>
         <div className="issue-title">{issue.title}</div>
         <div className={`issue-severity severity-${issue.severity}`}>
          {issue.severity}
         </div>
        </div>

        <div className="issue-location">
         <span className="issue-location-icon">📄</span>
         {issue.location}{issue.line ? `:${issue.line}` : ''}
        </div>

        <div className="issue-description">
         {issue.description}
        </div>

        {issue.code && (
         <div className="issue-code">
          {issue.code}
         </div>
        )}

        <div className="issue-recommendation">
         <div className="issue-recommendation-title">💡 Recommendation</div>
         <div className="issue-recommendation-text">
          {issue.recommendation}
          {issue.fix && (
           <>
            <br /><br />
            <strong>Fix:</strong> <code>{issue.fix}</code>
           </>
          )}
         </div>
        </div>
       </div>
      ))}
     </div>
    </div>
   )}
  </div>
 );
};

export default SecurityTab;