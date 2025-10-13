import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import MarketUpdates from '../components/MarketUpdates';

export default function Team() {
  const [userProfile, setUserProfile] = useState({ fullName: 'User', mlmLevel: 'no_stage' });
  const [teamMembers, setTeamMembers] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [stageProgress, setStageProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, teamData, earningsData, progress] = await Promise.all([
          apiService.getProfile(),
          apiService.getTeam(),
          apiService.getEarnings(),
          apiService.getStageProgress()
        ]);
        
        setUserProfile(profile);
        setTeamMembers(teamData.team || []);
        setStageProgress(progress);
        
        const totalEarnings = (earningsData.earnings || []).reduce((sum, earning) => sum + parseFloat(earning.total_earned || 0), 0);
        setEarnings(totalEarnings);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setTeamMembers([]);
        setEarnings(0);
      }
    };
    
    fetchData();
  }, []);

  const getColorForIndex = (index) => {
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-orange-400', 'bg-purple-400'];
    return colors[index % colors.length];
  };

  const incentivesCount = Math.floor(earnings / 1000); // 1 incentive per $1000 earned

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-16 bg-gray-200 animate-pulse"></div>
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MarketUpdates />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Earnings */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-gray-600 text-sm mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">${earnings.toFixed(2)}</p>
          <p className="text-gray-500 text-sm mb-6">From {teamMembers.length} referrals</p>
          <Link to="/user/history" className="flex items-center text-white">
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-2">
              <span className="text-xs">→</span>
            </div>
            <span className="text-sm text-black font-medium">See History</span>
          </Link>
        </div>
        
        {/* Total Referrals */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-gray-600 text-sm mb-2">Total Referrals</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{teamMembers.length.toString().padStart(2, '0')}</p>
          <p className="text-gray-500 text-sm mb-6">{teamMembers.length} People invited</p>
          <Link to="/user/team-tree" className="flex items-center text-white">
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-2">
              <span className="text-xs">→</span>
            </div>
            <span className="text-sm text-black font-medium">Team Tree</span>
          </Link>
        </div>
        
        {/* Current Stage */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-gray-600 text-sm mb-2">Current Stage</h3>
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-bold text-xs">{(userProfile?.mlmLevel || 'feeder').charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <p className="text-gray-900 font-semibold mb-2">{userProfile?.mlmLevel === 'no_stage' ? 'No Stage' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1)} Stage</p>
          {stageProgress && (
            <>
              <p className="text-gray-500 text-xs mb-1">{stageProgress.slotsFilled}/{stageProgress.slotsRequired} slots filled</p>
              <div className="w-full bg-gray-300 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(stageProgress.slotsFilled / stageProgress.slotsRequired) * 100}%` }}
                ></div>
              </div>
            </>
          )}
          <Link to="/user/rankings-earnings" className="flex items-center text-white">
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-2">
              <span className="text-xs">→</span>
            </div>
            <span className="text-sm text-black font-medium">Ranking & Earnings</span>
          </Link>
        </div>
        
        {/* Total Incentives */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-gray-600 text-sm mb-2">Total Incentives</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{incentivesCount.toString().padStart(2, '0')}</p>
          <p className="text-gray-500 text-sm mb-6">{incentivesCount} Incentives Available</p>
          <Link to="/user/incentives" className="flex items-center text-white">
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center mr-2">
              <span className="text-xs">→</span>
            </div>
            <span className="text-sm text-black font-medium">My Incentives</span>
          </Link>
        </div>
      </div>

      {/* My Team Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">My Team</h2>
          <Link to="/user/team-tree" className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Team Tree
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">#</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">User</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Registered Stage</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Current Stage</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Reward</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length > 0 ? teamMembers.map((member, index) => (
                <tr key={member.id} className="border-b border-gray-100">
                  <td className="py-4 px-6 text-sm">{index + 1}</td>
                  <td className="py-4 px-6 text-sm">{new Date(member.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 ${getColorForIndex(index)} rounded-full flex items-center justify-center text-white font-bold text-xs mr-3`}>
                        {member.full_name?.charAt(0) || member.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{member.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm">{member.mlm_level === 'no_stage' ? 'No Stage' : (member.mlm_level?.charAt(0).toUpperCase() + member.mlm_level?.slice(1) || 'No Stage')}</td>
                  <td className="py-4 px-6 text-sm">{member.mlm_level === 'no_stage' ? 'No Stage' : (member.mlm_level?.charAt(0).toUpperCase() + member.mlm_level?.slice(1) || 'No Stage')}</td>
                  <td className="py-4 px-6 text-sm">
                    {member.has_deposited ? (
                      <span className="font-semibold text-green-600">+ ${member.earning_from_user || '1.5'}</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-gray-500">
                    No team members yet. Start referring people to build your team!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}