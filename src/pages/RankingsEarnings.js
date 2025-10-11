import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Toast from '../components/Toast';
import apiService from '../services/api';

export default function RankingsEarnings() {
  const [showToast, setShowToast] = useState(false);
  const [userProfile, setUserProfile] = useState({ mlmLevel: 'no_stage' });
  const [earnings, setEarnings] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [hasFeederRequirements, setHasFeederRequirements] = useState(false);
  const [loading, setLoading] = useState(false);

  const [stageProgress, setStageProgress] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, earningsData, team, progress] = await Promise.all([
          apiService.getProfile(),
          apiService.getEarnings(),
          apiService.getTeam(),
          apiService.getStageProgress()
        ]);
        
        setUserProfile(profile);
        setTeamMembers(team.team || []);
        setStageProgress(progress);
        
        const totalEarnings = earningsData.earnings?.reduce((sum, e) => sum + parseFloat(e.total_earned || 0), 0) || 0;
        setEarnings(totalEarnings);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const referralLink = userProfile ? `${process.env.REACT_APP_FRONTEND_URL || 'https://baobab-frontend.vercel.app'}/register?ref=${userProfile.referralCode}` : '';


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setShowToast(true);
  };

  const mlmStages = {
    feeder: { name: 'Feeder Stage', level: 1, bonus: 1.5, matrix: '2x2', teamRequired: 6 },
    bronze: { name: 'Bronze Stage', level: 2, bonus: 4.8, matrix: '2x3', teamRequired: 14, incentives: ['Lentoc water flask', 'Food voucher worth ₦100,000'] },
    silver: { name: 'Silver Stage', level: 3, bonus: 30, matrix: '2x3', teamRequired: 14, incentives: ['Food voucher worth $150', 'Android Phone'] },
    gold: { name: 'Gold Stage', level: 4, bonus: 150, matrix: '2x3', teamRequired: 14, incentives: ['Food voucher worth $750', 'International Trip worth ₦5m', 'Smartphone + Appliances'] },
    diamond: { name: 'Diamond Stage', level: 5, bonus: 750, matrix: '2x3', teamRequired: 14, incentives: ['Food voucher worth $1,500', 'International trip worth $7,000', 'Brand new car worth $20,000', 'Chairman Award worth $10,000'] },
    infinity: { name: 'Infinity Stage', level: 6, bonus: 15000, matrix: 'Infinity', teamRequired: 0, incentives: ['Generational wealth through MLM'] }
  };
  
  const currentStageKey = stageProgress?.currentStage || userProfile?.mlmLevel || 'feeder';
  const currentStage = mlmStages[currentStageKey] || mlmStages.feeder;
  currentStage.current = true;
  const totalMLMEarnings = earnings;

  const earningsHistory = teamMembers.length > 0 ? teamMembers.slice(0, 3).map((member, index) => ({
    date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
    type: 'Referral Bonus',
    amount: `+$${member.earning_from_user || '1.5'}`,
    from: member.email
  })) : [
    { date: new Date().toLocaleDateString('en-GB'), type: 'No earnings yet', amount: '$0.00', from: 'Start referring to earn!' }
  ];

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
        <Link to="/user/team" className="bg-green-600 text-white px-3 py-1 rounded flex items-center">
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
              <span className="text-white font-bold text-xs">{currentStage.level}</span>
            </div>
            <span className="font-semibold">{currentStage.name}</span>
          </div>
          <button className="text-gray-400">→</button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-2">${totalMLMEarnings.toFixed(2)}</h3>
          <p className="text-gray-600">Total MLM Earnings</p>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-2xl font-bold text-blue-600 mb-2">${stageProgress?.bonusPerPerson || currentStage.bonus}</h3>
          <p className="text-gray-600">Per Person</p>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-2xl font-bold text-orange-600 mb-2">{stageProgress?.slotsFilled || 0}/{stageProgress?.slotsRequired || currentStage.teamRequired}</h3>
          <p className="text-gray-600">Matrix Progress</p>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-2xl font-bold text-purple-600 mb-2">{currentStage.name}</h3>
          <p className="text-gray-600">Current Stage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MLM Ranking System */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">MLM Ranking System</h2>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(mlmStages).map(([key, stage]) => (
              <div key={key} className={`p-4 rounded-lg border-2 ${stage.current ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stage.current ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      {stage.level}
                    </div>
                    <div>
                      <h3 className="font-semibold">{stage.name}</h3>
                      <p className="text-xs text-gray-500">{stage.matrix} Matrix</p>
                    </div>
                    {stage.current && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Current</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Referral Bonus:</p>
                    <p className="text-lg font-bold text-green-600">${stage.bonus}</p>
                  </div>
                  {stage.teamRequired > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Team Required:</p>
                      <p className="text-lg font-bold text-blue-600">{stage.teamRequired}</p>
                    </div>
                  )}
                </div>
                {stage.incentives && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Additional Incentives:</p>
                    <ul className="space-y-1">
                      {stage.incentives.map((incentive, index) => (
                        <li key={index} className="text-xs text-gray-700 flex items-center">
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
        </div>

        {/* Earnings History */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Recent Earnings</h2>
          </div>
          <div className="divide-y">
            {earningsHistory.map((earning, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium">{earning.type}</p>
                  <p className="text-sm text-gray-500">{earning.date}</p>
                  <p className="text-sm text-gray-500">From: {earning.from}</p>
                </div>
                <p className="text-lg font-bold text-green-600">{earning.amount}</p>
              </div>
            ))}
          </div>
        </div>
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