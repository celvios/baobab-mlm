import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Toast from '../components/Toast';
import apiService from '../services/api';

export default function TeamTree() {
  const [showToast, setShowToast] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profile, team] = await Promise.all([
        apiService.getProfile(),
        apiService.getTeam()
      ]);
      setUserProfile(profile);
      setTeamMembers(team.team || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = userProfile ? `https://baobab.com/register?ref=${userProfile.referralCode}` : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setShowToast(true);
  };

  const getColorForIndex = (index) => {
    const colors = ['bg-blue-400', 'bg-green-400', 'bg-orange-400', 'bg-purple-400', 'bg-pink-400', 'bg-cyan-400'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Updates */}
      <div className="bg-black text-white p-3 rounded-lg flex items-center">
        <div className="w-6 h-6 bg-gray-700 rounded mr-3 flex items-center justify-center">
          <span className="text-xs">🔊</span>
        </div>
        <div className="overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="font-semibold">Market Updates:</span> User edhi...@gmail.com #13,500 withdrawal successful   User edhi...@gmail.com #13,500 withdrawal successful   User edhi...@gmail.com #13,500 withdrawal successful
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/team" className="bg-green-600 text-white px-3 py-1 rounded flex items-center">
          ← Back
        </Link>
        <span className="text-gray-500">My Team → Team Tree</span>
      </div>

      {/* Current Stage */}
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <div className="flex items-center justify-center space-x-4">
          <button className="text-gray-400">←</button>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Current Stage:</span>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-semibold">{userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'Feeder'} Stage</span>
          </div>
          <button className="text-gray-400">→</button>
        </div>
      </div>

      {/* Team Tree */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold text-center mb-6">Team Tree</h2>
        
        {/* You */}
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">
              {userProfile?.fullName?.charAt(0) || 'U'}
            </div>
            <p className="text-sm font-semibold">You</p>
            <p className="text-xs text-gray-500">{userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'Feeder'} Stage</p>
          </div>
        </div>

        {teamMembers.length > 0 && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-px h-8 bg-gray-300"></div>
            </div>

            <div className="flex justify-center flex-wrap gap-8">
              {teamMembers.slice(0, 6).map((member, index) => (
                <div key={member.id} className="text-center">
                  <div className={`w-10 h-10 ${getColorForIndex(index)} rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto`}>
                    {member.full_name?.charAt(0) || member.email?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-semibold">{member.email}</p>
                  <p className="text-xs text-gray-500">{member.mlm_level?.charAt(0).toUpperCase() + member.mlm_level?.slice(1) || 'Feeder'}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {teamMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No team members yet. Share your referral link to build your team!</p>
          </div>
        )}
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <LinkIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Your Referral Link</h3>
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