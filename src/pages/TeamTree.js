import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon, ClipboardDocumentIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import Toast from '../components/Toast';
import apiService from '../services/api';
import MarketUpdates from '../components/MarketUpdates';

export default function TeamTree() {
  const [showToast, setShowToast] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profile, team] = await Promise.all([
        apiService.getProfile().catch(() => null),
        apiService.getTeam().catch(() => ({ team: [] }))
      ]);
      
      // Check if user qualifies for feeder stage from database
      const qualifiesForFeeder = (profile?.registrationFeePaid && profile?.productPurchasePaid) || false;
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const actualProfile = profile || {
        fullName: storedUser.fullName || 'User',
        email: storedUser.email || 'user@example.com',
        referralCode: storedUser.referralCode || 'LOADING',
        mlmLevel: qualifiesForFeeder ? 'feeder' : 'no_stage'
      };
      
      setUserProfile(actualProfile);
      setTeamMembers(team?.team || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = userProfile?.referralCode ? `${process.env.REACT_APP_FRONTEND_URL || 'https://baobab-mlm.vercel.app'}/register?ref=${userProfile.referralCode}` : 'Loading...';

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
    const tree = { children: [] };
    const memberMap = new Map();
    
    // Add root user
    memberMap.set('root', tree);
    
    // Process members and build tree
    members.forEach((member, index) => {
      const node = {
        ...member,
        children: [],
        level: Math.floor(index / 2) + 1,
        position: index % 2
      };
      
      // For demo, assign to levels based on index
      if (index < 2) {
        tree.children.push(node);
      } else {
        const parentIndex = Math.floor((index - 2) / 2);
        const parent = members[parentIndex];
        if (parent && memberMap.has(parent.id)) {
          memberMap.get(parent.id).children.push(node);
        } else {
          tree.children.push(node);
        }
      }
      
      memberMap.set(member.id, node);
    });
    
    return tree;
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
    const isExpanded = expandedNodes.has(node.id) || level < 2;
    
    return (
      <div className="flex flex-col items-center">
        {/* Node */}
        <div className="relative animate-tree-grow">
          {/* Pulse ring for root */}
          {isRoot && (
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-yellow-400 opacity-20 pulse-ring"></div>
          )}
          
          <div className={`tree-node w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer ${
            isRoot ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : getColorForIndex(node.id || 0)
          }`}>
            {isRoot ? (
              <UserIcon className="w-8 h-8" />
            ) : (
              <span className="text-lg">
                {node.full_name?.charAt(0) || node.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Level badge */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
            getLevelColor(node.mlm_level || 'feeder')
          }`}>
            {(node.mlm_level || 'feeder').charAt(0).toUpperCase()}
          </div>
          
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs hover:bg-gray-50"
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
        
        {/* Node info */}
        <div className="mt-2 text-center">
          <p className="text-sm font-semibold text-gray-900">
            {isRoot ? 'You' : (node.full_name || node.email)}
          </p>
          <p className="text-xs text-gray-500">
            {node.mlm_level === 'no_stage' ? 'No Stage' : ((node.mlm_level || 'no_stage').charAt(0).toUpperCase() + (node.mlm_level || 'no_stage').slice(1))}
          </p>
          {!isRoot && (
            <p className="text-xs text-green-600 font-semibold">
              +${node.earning_from_user || '1.5'}
            </p>
          )}
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-6">
            {/* Connection line */}
            <div className="flex justify-center mb-4">
              <div className="tree-connection w-px h-6 bg-gradient-to-b from-gray-300 to-gray-400"></div>
            </div>
            
            {/* Children nodes */}
            <div className="flex justify-center space-x-8">
              {node.children.map((child, index) => (
                <div key={child.id || index} className="relative">
                  {/* Connection lines */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
                    <div className="tree-connection w-px h-6 bg-gradient-to-b from-gray-300 to-gray-400"></div>
                  </div>
                  {index > 0 && (
                    <div className="absolute top-0 left-0 transform -translate-y-6">
                      <div className="tree-connection h-px bg-gradient-to-r from-gray-300 to-gray-400" style={{ width: `${8 * 4}rem` }}></div>
                    </div>
                  )}
                  
                  <TreeNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTreeStructure(teamMembers);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
        <Link to="/team" className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-700 transition-colors">
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
              <p className="text-sm text-gray-600">Total Team</p>
              <p className="text-xl font-bold text-gray-900">{teamMembers.length}</p>
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
              <p className="text-xl font-bold text-gray-900">{teamMembers.filter(m => m.is_active).length}</p>
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
              <p className="text-xl font-bold text-gray-900">
                {userProfile?.mlmLevel === 'no_stage' ? 'No Stage' : ((userProfile?.mlmLevel || 'no_stage').charAt(0).toUpperCase() + (userProfile?.mlmLevel || 'no_stage').slice(1))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">$</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Earnings</p>
              <p className="text-xl font-bold text-gray-900">${(teamMembers.length * 1.5).toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Tree Visualization */}
      <div className="bg-white rounded-2xl shadow-card p-8 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Network Structure</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Collapse All
            </button>
            <button
              onClick={() => setExpandedNodes(new Set(teamMembers.map(m => m.id)))}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Expand All
            </button>
          </div>
        </div>
        
        <div className="min-w-full">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <TreeNode 
              node={{
                ...userProfile,
                children: treeData.children,
                id: 'root'
              }} 
              isRoot={true} 
            />
          )}
        </div>
        
        {teamMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members Yet</h3>
            <p className="text-gray-500 mb-4">Start building your network by sharing your referral link</p>
          </div>
        )}
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

      <Toast 
        message="Referral link copied to clipboard!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}