import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon, ClipboardDocumentIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import Toast from '../components/Toast';
import apiService from '../services/api';
import MarketUpdates from '../components/MarketUpdates';
import PyramidTree from '../components/PyramidTree';

export default function TeamTree() {
  console.log('TeamTree component mounted');
  const [showToast, setShowToast] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [referrer, setReferrer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profile, teamData, matrixTree] = await Promise.all([
        apiService.getProfile(),
        apiService.getTeam(),
        apiService.getMatrixTree().catch(() => ({ tree: null }))
      ]);
      
      setUserProfile(profile);
      
      // Use direct team members from getTeam API
      if (teamData && teamData.team) {
        setTeamMembers(teamData.team);
      } else if (matrixTree.tree && matrixTree.tree.children) {
        // Fallback to matrix tree if team API fails
        const members = extractTeamMembers(matrixTree.tree);
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const extractTeamMembers = (node) => {
    if (!node) return [];
    const members = [];
    if (node.left) {
      members.push(node.left);
      members.push(...extractTeamMembers(node.left));
    }
    if (node.right) {
      members.push(node.right);
      members.push(...extractTeamMembers(node.right));
    }
    return members;
  };

  const referralLink = userProfile?.referralCode ? `${process.env.REACT_APP_FRONTEND_URL || 'https://baobab-frontend.vercel.app'}/register?ref=${userProfile.referralCode}` : 'Loading...';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setShowToast(true);
  };

  const getColorForIndex = (index) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-orange-500', 'bg-red-500'];
    return colors[index % colors.length];
  };

  const getLevelColor = (level) => {
    const levelColors = {
      'no_stage': 'bg-red-500',
      'feeder': 'bg-gray-500',
      'bronze': 'bg-orange-600',
      'silver': 'bg-gray-400',
      'gold': 'bg-yellow-500',
      'diamond': 'bg-blue-600'
    };
    return levelColors[level] || 'bg-red-500';
  };

  const buildTreeStructure = (members) => {
    // Members already come with nested children from backend
    return { children: members };
  };

  const countAllMembers = (members) => {
    let count = 0;
    const countRecursive = (nodes) => {
      nodes.forEach(node => {
        count++;
        if (node.children && node.children.length > 0) {
          countRecursive(node.children);
        }
      });
    };
    countRecursive(members);
    return count;
  };

  const countActiveMembers = (members) => {
    let count = 0;
    const countRecursive = (nodes) => {
      nodes.forEach(node => {
        if (node.has_deposited) count++;
        if (node.children && node.children.length > 0) {
          countRecursive(node.children);
        }
      });
    };
    countRecursive(members);
    return count;
  };

  const countDirectReferrals = (members) => {
    return members.length;
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const TreeNode = ({ node, level = 0, isRoot = false }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id) || isRoot;
    const isCurrentUser = node.id === 'current-user';
    
    return (
      <div className="flex flex-col items-start w-full">
        {/* Node */}
        <div className="flex items-center w-full py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors" style={{ paddingLeft: `${level * 2}rem` }}>
          <div className="relative">
            {isRoot && (
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-yellow-400 opacity-20 pulse-ring"></div>
            )}
            
            <div className={`tree-node w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
              isRoot ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : getColorForIndex(node.id || 0)
            }`}>
              {isRoot ? (
                <UserIcon className="w-6 h-6" />
              ) : (
                <span className="text-sm">
                  {node.full_name?.charAt(0) || node.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Level badge */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              getLevelColor(node.mlm_level || 'feeder')
            }`}>
              {(node.mlm_level || 'feeder').charAt(0).toUpperCase()}
            </div>
          </div>
          
          {/* Node info */}
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {isRoot || isCurrentUser ? 'You' : (node.full_name || node.email)}
            </p>
            <p className="text-xs text-gray-500">
              {isRoot ? (userProfile?.mlmLevel === 'feeder' ? 'Feeder' : (userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'Feeder')) : (!node.mlm_level || node.mlm_level === 'no_stage' ? 'No Level' : node.mlm_level === 'feeder' ? 'Feeder' : node.mlm_level.charAt(0).toUpperCase() + node.mlm_level.slice(1))}
            </p>
          </div>
          
          {/* Earning badge */}
          {!isRoot && (
            <div className="ml-auto">
              {node.has_deposited ? (
                <p className="text-sm text-green-600 font-semibold">
                  +${node.earning_from_user || '1.5'}
                </p>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
              )}
            </div>
          )}
          
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="ml-4 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-300 transition-colors"
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="w-full">
            {node.children.map((child, index) => (
              <TreeNode key={child.id || index} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTreeStructure(teamMembers);

  console.log('TeamTree render - loading:', loading, 'teamMembers:', teamMembers.length);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Tree</h1>
        <p className="text-gray-600">Visualize your MLM network structure</p>
      </div>

      <MarketUpdates />

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/user/team" className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-700 transition-colors">
          ← Back to Team
        </Link>
        <span className="text-gray-500">→ Team Tree</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Team</p>
              <p className="text-xl font-bold text-gray-900">{countDirectReferrals(teamMembers)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <div className="w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-xl font-bold text-gray-900">{countActiveMembers(teamMembers)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <div className={`w-6 h-6 rounded-full ${getLevelColor(userProfile?.mlmLevel || 'feeder')}`}></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Level</p>
              <p className="text-lg font-bold text-gray-900">
                {userProfile?.mlmLevel === 'no_stage' ? 'No Stage' : ((userProfile?.mlmLevel || 'no_stage').charAt(0).toUpperCase() + (userProfile?.mlmLevel || 'no_stage').slice(1))}
              </p>
              {userProfile?.mlmLevel === 'no_stage' && (
                <p className="text-xs text-gray-500">(Next: Feeder)</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">$</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Matrix Members</p>
              <p className="text-xl font-bold text-gray-900">{countAllMembers(teamMembers)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pyramid Matrix View */}
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Matrix Structure</h2>
        <PyramidTree 
          userStage={userProfile?.mlmLevel === 'no_stage' ? 'feeder' : (userProfile?.mlmLevel || 'feeder')}
          matrixData={teamMembers.map((m, i) => ({
            position: i,
            filled: m.has_deposited,
            name: m.full_name || m.email,
            earning: m.earning_from_user || '1.5'
          }))}
        />
      </div>



      {/* Legend */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { level: 'no_stage', name: 'No Stage', color: 'bg-red-500' },
            { level: 'feeder', name: 'Feeder', color: 'bg-gray-500' },
            { level: 'bronze', name: 'Bronze', color: 'bg-orange-600' },
            { level: 'silver', name: 'Silver', color: 'bg-gray-400' },
            { level: 'gold', name: 'Gold', color: 'bg-yellow-500' },
            { level: 'diamond', name: 'Diamond', color: 'bg-blue-600' }
          ].map((item) => (
            <div key={item.level} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center mb-4">
          <LinkIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Grow Your Team</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <code className="text-sm text-gray-700 flex-1 mr-4 break-all">{referralLink}</code>
            <button
              onClick={copyReferralLink}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center"
            >
              <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
              Copy Link
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Share this link with others to invite them to join your team and start earning commissions.
        </p>
      </div>

      {showToast && (
        <Toast 
          message="Referral link copied to clipboard!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}