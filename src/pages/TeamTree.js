import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon, ClipboardDocumentIcon, UsersIcon } from '@heroicons/react/24/outline';
import Toast from '../components/Toast';
import apiService from '../services/api';
import MarketUpdates from '../components/MarketUpdates';
import PyramidTree from '../components/PyramidTree';

export default function TeamTree() {
  const [showToast, setShowToast] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [matrixTree, setMatrixTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousStage, setPreviousStage] = useState(null);
  const [stageJustChanged, setStageJustChanged] = useState(false);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 seconds to detect stage changes
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [profile, teamData, treeData] = await Promise.all([
        apiService.getProfile(),
        apiService.getTeam(),
        apiService.getMatrixTree().catch(() => null)
      ]);
      
      // Update localStorage with latest profile
      if (profile) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Check if stage changed
        if (previousStage && previousStage !== profile.mlmLevel) {
          setShowToast(true);
          setStageJustChanged(true);
          setTimeout(() => {
            setShowToast(false);
            setStageJustChanged(false);
          }, 5000);
        }
        
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          mlmLevel: profile.mlmLevel
        }));
        
        setPreviousStage(profile.mlmLevel);
      }
      
      setUserProfile(profile);
      if (teamData && teamData.team) {
        setTeamMembers(teamData.team);
      }
      if (treeData && treeData.tree) {
        setMatrixTree(treeData.tree);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Matrix</h1>
        <p className="text-gray-600">Visualize your MLM pyramid structure</p>
      </div>

      <MarketUpdates />

      <div className="flex items-center space-x-2 text-sm">
        <Link to="/user/team" className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-700 transition-colors">
          ← Back to Team
        </Link>
      </div>

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

      <div className="bg-white rounded-2xl shadow-card p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Pyramid Matrix Structure
          {stageJustChanged && (
            <span className="ml-3 text-sm text-green-600 font-normal animate-pulse">
              🎉 New {userProfile?.mlmLevel?.toUpperCase()} Matrix Started!
            </span>
          )}
        </h2>
        <PyramidTree 
          key={userProfile?.mlmLevel}
          userStage={userProfile?.mlmLevel}
          teamMembers={teamMembers}
          matrixData={(() => {
            const currentStage = userProfile?.mlmLevel || 'no_stage';
            const maxSlots = (currentStage === 'no_stage' || currentStage === 'feeder') ? 6 : 14;
            return teamMembers.slice(0, maxSlots).map((m, i) => ({
              position: i,
              filled: m.has_deposited,
              name: m.full_name || m.email,
              earning: m.earning_from_user || '1.5'
            }));
          })()}
        />
      </div>

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
          message={previousStage && userProfile?.mlmLevel !== previousStage ? 
            `🎉 Congratulations! You've been upgraded to ${userProfile?.mlmLevel?.toUpperCase()} stage!` : 
            "Referral link copied!"}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
