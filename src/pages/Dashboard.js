import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import Toast from '../components/Toast';
import RequestWithdrawalModal from '../components/RequestWithdrawalModal';
import PurchaseProductModal from '../components/PurchaseProductModal';
import DeleteOrderModal from '../components/DeleteOrderModal';
import PaymentUploadModal from '../components/PaymentUploadModal';
import DepositModal from '../components/DepositModal';
import BalanceChart from '../components/BalanceChart';
import MarketUpdates from '../components/MarketUpdates';
import { getFeaturedProducts } from '../data/products';

export default function Dashboard() {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [levelProgress, setLevelProgress] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [marketUpdates, setMarketUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profile, team, progress, earningsData, transactionHistory, updates] = await Promise.all([
        apiService.getProfile().catch(() => null),
        apiService.getTeam().catch(() => ({ team: [] })),
        apiService.getLevelProgress().catch(() => null),
        apiService.getEarnings().catch(() => ({ earnings: [] })),
        apiService.getTransactionHistory(1, 5).catch(() => ({ transactions: [] })),
        apiService.getMarketUpdates(1, 10).catch(() => ({ updates: [] }))
      ]);
      
      // Use stored user data if API fails
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const fallbackProfile = {
        fullName: storedUser.fullName || 'User',
        email: storedUser.email || 'user@example.com',
        referralCode: storedUser.referralCode || 'LOADING',
        mlmLevel: 'no_stage',
        joiningFeePaid: false,
        wallet: { balance: 0, mlmEarnings: 0 }
      };
      
      const actualProfile = profile || fallbackProfile;
      
      const updatedProfile = {
        ...actualProfile,
        wallet: {
          balance: actualProfile?.wallet?.balance || 0,
          mlmEarnings: actualProfile?.wallet?.mlmEarnings || 0,
          totalEarned: actualProfile?.wallet?.totalEarned || 0,
          totalWithdrawn: actualProfile?.wallet?.totalWithdrawn || 0
        }
      };
      
      setUserProfile(updatedProfile);
      setTeamMembers(team?.team || []);
      setLevelProgress(progress);
      setEarnings(earningsData?.earnings || []);
      setTransactions(transactionHistory?.transactions || []);
      setMarketUpdates(updates?.updates || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to stored user data
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const qualifiesForFeeder = false; // Default to no qualification if API fails
      
      setUserProfile({
        fullName: storedUser.fullName || 'User',
        email: storedUser.email || 'user@example.com',
        referralCode: storedUser.referralCode || 'LOADING',
        mlmLevel: qualifiesForFeeder ? 'feeder' : 'no_stage',
        wallet: { balance: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = userProfile?.referralCode ? `${process.env.REACT_APP_FRONTEND_URL || 'https://baobab-mlm.vercel.app'}/register?ref=${userProfile.referralCode}` : 'Loading...';
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setShowToast(true);
  };

  const handleQuickPurchase = async (product) => {
    const walletBalance = userProfile?.wallet?.balance || 0;
    
    if (walletBalance < product.price) {
      setShowToast(true);
      return;
    }
    
    try {
      const orderData = {
        productName: product.name,
        productPrice: product.price,
        quantity: 1,
        deliveryType: 'pickup',
        pickupStation: 'Ikeja High Tower, Lagos'
      };
      
      await apiService.purchaseWithWallet(orderData);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          balance: prev.wallet.balance - product.price
        }
      }));
      
      // Refresh dashboard data
      fetchDashboardData();
      
    } catch (error) {
      console.error('Quick purchase failed:', error);
    }
  };

  // Show payment upload modal if user hasn't paid joining fee
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const needsPayment = !userProfile?.joiningFeePaid;
  
  // Check if today is Friday (5 = Friday in JavaScript)
  const isFriday = new Date().getDay() === 5 || new Date().getDay() === 1; // Friday or Monday

  const getColorForIndex = (index) => {
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-600', 'bg-cyan-400', 'bg-purple-400'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const products = getFeaturedProducts();

  // Use real order and transaction data
  const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  const withdrawals = JSON.parse(localStorage.getItem('userWithdrawals') || '[]');
  
  const historyData = [
    ...userOrders.map((order, index) => ({
      id: index + 1,
      account: userProfile?.email || 'user@example.com',
      stage: userProfile?.mlmLevel === 'feeder' ? 'Feeder' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'No Level',
      transaction: 'Product Order',
      type: 'Outgoing',
      amount: `$${order.amount.toLocaleString()}`,
      status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'
    })),
    ...withdrawals.map((withdrawal, index) => ({
      id: userOrders.length + index + 1,
      account: userProfile?.email || 'user@example.com',
      stage: userProfile?.mlmLevel === 'feeder' ? 'Feeder' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'No Level',
      transaction: 'Withdrawal',
      type: 'Outgoing',
      amount: `$${withdrawal.amount.toLocaleString()}`,
      status: withdrawal.status?.charAt(0).toUpperCase() + withdrawal.status?.slice(1) || 'Pending'
    })),
    ...transactions.map((tx, index) => ({
      id: userOrders.length + withdrawals.length + index + 1,
      account: userProfile?.email || 'user@example.com',
      stage: userProfile?.mlmLevel === 'feeder' ? 'Feeder' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'No Level',
      transaction: tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1) || 'Transaction',
      type: tx.amount > 0 ? 'Incoming' : 'Outgoing',
      amount: `$${Math.abs(tx.amount).toLocaleString()}`,
      status: tx.status?.charAt(0).toUpperCase() + tx.status?.slice(1) || 'Pending'
    }))
  ].slice(0, 5); // Show only latest 5 entries

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, {userProfile?.fullName?.split(' ')[0] || 'User'}</h1>
        <Link 
          to="/admin/orders" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Admin Orders
        </Link>
      </div>

      <MarketUpdates />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Section - Wallet Overview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Wallet Overview - Takes more space */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Wallet Overview</h2>
              <div className="bg-[#4a5d23] text-white p-6 rounded-2xl relative overflow-hidden h-48">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Wallet Balance</p>
                      <p className="text-3xl font-bold mb-1">₦{(userProfile?.wallet?.balance || 0).toLocaleString()}</p>
                      <p className="text-white/70 text-sm">${((userProfile?.wallet?.balance || 0) / 1500).toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                          <img src="/images/leaf-1.png" alt="Feeder" className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-white/70 text-xs">Current Level</p>
                          <p className="font-medium text-sm">{userProfile?.mlmLevel === 'feeder' ? 'No Level' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'No Level'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-xs">Wallet Actions</p>
                        <p className="text-xs">Deposit or Withdraw</p>
                        {isFriday ? (
                          <button 
                            onClick={() => setShowWithdrawalModal(true)}
                            className="mt-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-700 transition-colors"
                          >
                            Withdraw
                          </button>
                        ) : (
                          <button 
                            onClick={() => setShowDepositModal(true)}
                            className="mt-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors"
                          >
                            Deposit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
              </div>
            </div>

            {/* MLM Earnings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">MLM Earnings</h2>
              <div className="bg-gray-100 p-6 rounded-2xl shadow-card h-48 flex flex-col justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">₦{(userProfile?.wallet?.mlmEarnings || 0).toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">${((userProfile?.wallet?.mlmEarnings || 0) / 1500).toFixed(2)}</p>
                  <p className="text-gray-500 text-xs mt-1">From {teamMembers.length} referrals</p>
                </div>
                <Link to="/history" className="text-gray-700 px-4 py-2 rounded-full text-sm font-bold flex items-center w-fit hover:text-gray-900 transition-colors">
                  <span className="mr-2">→</span> See History
                </Link>
              </div>
            </div>

            {/* Total Referrals */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Total Referrals</h2>
              <div className="bg-gray-100 p-6 rounded-2xl shadow-card h-48 flex flex-col justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{teamMembers.length.toString().padStart(2, '0')}</p>
                  <p className="text-gray-500 text-sm">{teamMembers.length} People invited</p>
                </div>
                <Link to="/team" className="text-gray-700 px-4 py-2 rounded-full text-sm font-bold flex items-center w-fit hover:text-gray-900 transition-colors">
                  <span className="mr-2">→</span> My Team
                </Link>
              </div>
            </div>
          </div>

          {/* All Products */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">All Products</h2>
              <Link to="/products" className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold flex items-center hover:bg-gray-800 transition-colors">
                <span className="mr-2">→</span> View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className={`bg-gradient-to-br ${product.bgColor} rounded-xl p-3 sm:p-4 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0`}>
                    <img src={product.image} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{product.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3">{product.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                      <p className="text-base sm:text-lg font-semibold text-gray-900">₦{product.price.toLocaleString()}</p>
                      {(userProfile?.wallet?.balance || 0) >= product.price ? (
                        <button 
                          onClick={() => handleQuickPurchase(product)}
                          className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto"
                        >
                          Buy Now
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="bg-gray-400 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-not-allowed w-full sm:w-auto"
                        >
                          Insufficient Balance
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - My Team */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-2xl shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">My Team</h2>
                <div className="flex items-center mt-1">
                  <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                    <img src="/images/leaf-1.png" alt={userProfile?.mlmLevel} className="w-2 h-2" />
                  </div>
                  <p className="text-gray-600 text-sm">{userProfile?.mlmLevel === 'feeder' ? 'No Level' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'No Level'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {teamMembers.length > 0 ? teamMembers.map((member, index) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className={`w-7 h-7 ${getColorForIndex(index)} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                    {member.full_name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{member.email}</p>
                  </div>
                  <p className="text-green-600 font-semibold text-sm">+${member.earning_from_user || '1.5'}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-4">No team members yet</p>
              )}
            </div>
            
            {/* Referral Link Section */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex items-center mb-3">
                <LinkIcon className="h-4 w-4 text-gray-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-900">Referral Link</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <code className="text-xs text-gray-700 break-all">{referralLink}</code>
              </div>
              <button
                onClick={copyReferralLink}
                className="w-full bg-black text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                <ClipboardDocumentIcon className="h-3 w-3 mr-2" />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white p-6 rounded-2xl shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">History</h2>
          <Link to="/history" className="text-gray-700 px-4 py-2 rounded-full text-sm font-bold flex items-center hover:text-gray-900 transition-colors">
            <span className="mr-2">→</span> View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Account</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Stage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Transaction</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {historyData.length > 0 ? historyData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm">{item.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">
                        {userProfile?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm">{item.account}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-2">
                        <img src="/images/leaf-1.png" alt="Level" className="w-3 h-3" />
                      </div>
                      <span className="text-sm">{item.stage}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm">{item.transaction}</td>
                  <td className="py-4 px-4 text-sm">{item.type}</td>
                  <td className="py-4 px-4 text-sm font-semibold">{item.amount}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Successful' ? 'bg-green-100 text-green-800' :
                      item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No transaction history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestWithdrawalModal 
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
      />
      
      <PurchaseProductModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        userProfile={userProfile}
      />
      
      <PaymentUploadModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => fetchDashboardData()}
      />
      
      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={() => fetchDashboardData()}
      />
      
      <DeleteOrderModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          // Handle delete confirmation
          console.log('Order deleted');
          setShowDeleteModal(false);
        }}
      />
      
      <Toast 
        message="Referral link copied to clipboard!"
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}