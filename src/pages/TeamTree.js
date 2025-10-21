import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon, ClipboardDocumentIcon, UserIcon, UsersIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Toast from '../components/Toast';
import apiService from '../services/api';
import MarketUpdates from '../components/MarketUpdates';

export default function TeamTree() {
  const [showToast, setShowToast] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profile, teamData] = await Promise.all([
        apiService.getProfile(),
        apiService.getTeam()
      ]);
      
      setUserProfile(profile);
      if (teamData && teamData.team) {
        setTeamMembers(teamData.team);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = userProfile?.referralCode ? `${process.env.REACT_APP_FRONTEND_URL || window.location.origin}/register?ref=${userProfile.referralCode}` : 'Loading...';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setShowToast(true);
  };

  const getColorForIndex = (index) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500'];
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

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const TreeNode = ({ node, level = 0, isRoot = false, index = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id?.toString() || `node-${index}`) || isRoot;
    const nodeId = node.id?.toString() || `node-${index}`;
    
    return (
      <div className="relative">
        {/* Node Container */}
        <div 
          className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-md ${
            isRoot ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400' : 'bg-white hover:bg-gray-50'
          }`}
          style={{ 
            marginLeft: `${level * 2.5}rem`,
            animation: `slideIn 0.3s ease-out ${level * 0.1}s both`
          }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleNode(nodeId)}
              className="mr-3 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-200 hover:scale-110"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          
          {/* Avatar */}
          <div className="relative">
            {isRoot && (
              <div className="absolute inset-0 w-14 h-14 rounded-full bg-yellow-400 opacity-30 animate-ping"></div>
            )}
            
            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-300 hover:scale-110 ${
              isRoot ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : getColorForIndex(index)
            }`}>
              {isRoot ? (
                <UserIcon className="w-7 h-7" />
              ) : (
                <span className="text-lg">
                  {node.full_name?.charAt(0) || node.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Level Badge */}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
              getLevelColor(node.mlm_level || 'no_stage')
            }`}>
              {(node.mlm_level || 'no_stage').charAt(0).toUpperCase()}
            </div>
          </div>
          
          {/* Node Info */}
          <div className="ml-4 flex-1">
            <p className={`font-semibold ${isRoot ? 'text-lg text-gray-900' : 'text-sm text-gray-800'}`}>
              {isRoot ? 'You' : (node.full_name || node.email)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isRoot 
                ? (userProfile?.mlmLevel === 'no_stage' ? 'No Stage' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1))
                : (node.mlm_level === 'no_stage' ? 'No Stage' : node.mlm_level?.charAt(0).toUpperCase() + node.mlm_level?.slice(1))
              }
            </p>
            {hasChildren && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                {node.children.length} direct referral{node.children.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {/* Earning Badge */}
          {!isRoot && (
            <div className="ml-auto">
              {node.has_deposited ? (
                <div className="bg-green-100 px-3 py-1.5 rounded-full">
                  <p className="text-sm text-green-700 font-bold">
                    +${node.earning_from_user || '1.5'}
                  </p>
                </div>
              ) : (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                  Pending
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {node.children.map((child, idx) => (
              <TreeNode 
                key={child.id || idx} 
                node={child} 
                level={level + 1} 
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
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
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Tree</h1>
        <p className="text-gray-600">Visualize your complete MLM network structure</p>
      </div>

      <MarketUpdates />

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/user/team" className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-700 transition-colors">
          ← Back to Team
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Direct Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <div className="w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{countActiveMembers(teamMembers)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold text-xl">∑</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Network</p>
              <p className="text-2xl font-bold text-gray-900">{countAllMembers(teamMembers)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${getLevelColor(userProfile?.mlmLevel || 'no_stage')} bg-opacity-20`}>
              <div className={`w-6 h-6 rounded-full ${getLevelColor(userProfile?.mlmLevel || 'no_stage')}`}></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Level</p>
              <p className="text-lg font-bold text-gray-900">
                {userProfile?.mlmLevel === 'no_stage' ? 'No Stage' : (userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Structure */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Network Structure</h2>
          <button
            onClick={() => setExpandedNodes(new Set(['root', ...teamMembers.map((m, i) => m.id?.toString() || `node-${i}`)]))}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Expand All
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Root Node (You) */}
          <TreeNode 
            node={{ 
              id: 'root',
              full_name: userProfile?.fullName,
              email: userProfile?.email,
              mlm_level: userProfile?.mlmLevel,
              children: teamMembers
            }} 
            isRoot={true}
          />
        </div>
        
        {teamMembers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No team members yet</p>
            <p className="text-gray-400 text-sm mt-2">Share your referral link to start building your network</p>
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

      {/* Referral Link */}
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
              Copy
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast 
          message="Referral link copied!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
