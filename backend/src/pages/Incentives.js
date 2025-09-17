import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import MarketUpdates from '../components/MarketUpdates';
import apiService from '../services/api';

export default function Incentives() {
  const [showToast, setShowToast] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentStage, setCurrentStage] = useState('feeder');
  const [earnings, setEarnings] = useState(0);
  const referralCode = localStorage.getItem('userReferralCode') || 'USER123';
  const referralLink = `${process.env.REACT_APP_FRONTEND_URL || 'https://baobab-frontend.vercel.app'}/register?ref=${referralCode}`;
  
  const mlmStages = {
    feeder: { name: 'Feeder Stage', bonus: 1.5, matrix: '2x2', teamRequired: 6, icon: 'F' },
    bronze: { name: 'Bronze Stage', bonus: 4.8, matrix: '2x3', teamRequired: 14, icon: 'B', incentives: ['Lentoc water flask', 'Food voucher worth ₦100,000'] },
    silver: { name: 'Silver Stage', bonus: 30, matrix: '2x3', teamRequired: 14, icon: 'S', incentives: ['Food voucher worth $150', 'Android Phone'] },
    gold: { name: 'Gold Stage', bonus: 150, matrix: '2x3', teamRequired: 14, icon: 'G', incentives: ['Food voucher worth $750', 'International Trip worth ₦5m', 'Smartphone + Refrigerator/Generator/TV'] },
    diamond: { name: 'Diamond Stage', bonus: 750, matrix: '2x3', teamRequired: 14, icon: 'D', incentives: ['Food voucher worth $1,500', 'International trip worth $7,000', 'Brand new car worth $20,000', 'Chairman Award worth $10,000'] },
    infinity: { name: 'Infinity Stage', bonus: 15000, matrix: 'Infinity', teamRequired: 0, icon: '∞', incentives: ['Generational wealth through MLM'] }
  };
  
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
      
      // Calculate current stage based on team size
      const teamSize = team.team?.length || 0;
      let stage = 'feeder';
      if (teamSize >= 14 && teamSize < 28) stage = 'bronze';
      else if (teamSize >= 28 && teamSize < 42) stage = 'silver';
      else if (teamSize >= 42 && teamSize < 56) stage = 'gold';
      else if (teamSize >= 56 && teamSize < 70) stage = 'diamond';
      else if (teamSize >= 70) stage = 'infinity';
      
      setCurrentStage(stage);
      
      // Calculate earnings based on current stage
      const stageInfo = mlmStages[stage];
      const totalEarnings = teamSize * stageInfo.bonus;
      setEarnings(totalEarnings);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTeamMembers([]);
      setEarnings(0);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setShowToast(true);
  };
  
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MarketUpdates />

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/team" className="bg-green-600 text-white px-3 py-1 rounded flex items-center">
          ← Back
        </Link>
        <span className="text-gray-500">My Team → Ranking & Earnings</span>
      </div>

      {/* Current Stage */}
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <div className="flex items-center justify-center space-x-4">
          <button className="text-gray-400">←</button>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Current Stage:</span>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">{mlmStages[currentStage].icon}</span>
            </div>
            <span className="font-semibold">{mlmStages[currentStage].name}</span>
          </div>
          <button className="text-gray-400">→</button>
        </div>
      </div>

      {/* Stage Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center bg-black text-white px-6 py-2 rounded-full">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="font-medium">{mlmStages[currentStage].name}</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mt-4">{mlmStages[currentStage].name} - Earnings</h2>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-2">${earnings.toFixed(2)}</h3>
          <p className="text-gray-600">Total Earnings</p>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-2xl font-bold text-blue-600 mb-2">{teamMembers.length}</h3>
          <p className="text-gray-600">Team Members</p>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-2xl font-bold text-purple-600 mb-2">${mlmStages[currentStage].bonus}</h3>
          <p className="text-gray-600">Per Referral</p>
        </div>
      </div>

      {/* MLM Stages */}
      <div className="space-y-6">
        {Object.entries(mlmStages).map(([key, stage]) => (
          <div key={key} className={`bg-white rounded-lg border-2 p-6 ${
            key === currentStage ? 'border-green-500 bg-green-50' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  key === currentStage ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  <span className="font-bold text-sm">{stage.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
                  <p className="text-sm text-gray-600">{stage.matrix} Matrix</p>
                </div>
              </div>
              {key === currentStage && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Current</span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Referral Bonus</h4>
                <p className="text-2xl font-bold text-green-600">${stage.bonus}</p>
                <p className="text-sm text-gray-500">per person that joins</p>
              </div>
              
              {stage.teamRequired > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Team Required</h4>
                  <p className="text-2xl font-bold text-blue-600">{stage.teamRequired}</p>
                  <p className="text-sm text-gray-500">active referrals</p>
                </div>
              )}
            </div>
            
            {stage.incentives && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Additional Incentives</h4>
                <ul className="space-y-1">
                  {stage.incentives.map((incentive, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="text-green-600 mr-2">•</span>
                      {incentive}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <code className="text-sm text-gray-700 flex-1 mr-4 break-all">{referralLink}</code>
            <button
              onClick={copyReferralLink}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p><strong>Registration Fee:</strong> ₦18,000 per person</p>
          <p><strong>Your Current Earnings:</strong> ${earnings.toFixed(2)} (₦{(earnings * 1500).toLocaleString()})</p>
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