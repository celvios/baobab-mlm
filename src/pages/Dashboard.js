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
import { useCurrency } from '../hooks/useCurrency';

export default function Dashboard() {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showReferralToast, setShowReferralToast] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [levelProgress, setLevelProgress] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [marketUpdates, setMarketUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currency, loading: currencyLoading, convertPrice, formatPrice, getCurrencySymbol } = useCurrency();
  
  const [convertedBalances, setConvertedBalances] = useState({
    balance: 0,
    mlmEarnings: 0
  });

  const formatCurrency = (value) => {
    try {
      const num = Number(value) || 0;
      return num.toLocaleString();
    } catch (error) {
      return '0';
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshWalletData = async () => {
    try {
      const [profile, wallet] = await Promise.all([
        apiService.getProfile(),
        apiService.getWallet()
      ]);
      
      const updatedProfile = {
        ...profile,
        wallet: {
          balance: wallet?.balance || profile?.wallet?.balance || 0,
          mlmEarnings: profile?.wallet?.mlmEarnings || 0,
          totalEarned: wallet?.totalEarned || profile?.wallet?.totalEarned || 0,
          totalWithdrawn: wallet?.totalWithdrawn || profile?.wallet?.totalWithdrawn || 0
        }
      };
      
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    }
  };

  useEffect(() => {
    if (userProfile?.wallet) {
      // The wallet balance is already in local currency (Naira)
      setConvertedBalances({
        balance: userProfile.wallet.balance || 0,
        mlmEarnings: userProfile.wallet.mlmEarnings || 0
      });
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    try {
      // Always use stored user data first
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Stored user data:', storedUser);
      
      const [profile, wallet, team, progress, earningsData, transactionHistory, updates] = await Promise.all([
        apiService.getProfile().catch(() => null),
        apiService.getWallet().catch(() => null),
        apiService.getTeam().catch(() => ({ team: [] })),
        apiService.getLevelProgress().catch(() => null),
        apiService.getEarnings().catch(() => ({ earnings: [] })),
        apiService.getTransactionHistory(1, 5).catch(() => ({ transactions: [] })),
        apiService.getMarketUpdates(1, 10).catch(() => ({ updates: [] }))
      ]);
      
      // Force use stored user data for display
      const actualProfile = {
        fullName: storedUser.fullName || profile?.fullName || 'User',
        email: storedUser.email || profile?.email || 'user@example.com',
        referralCode: storedUser.referralCode || profile?.referralCode || 'LOADING',
        mlmLevel: profile?.mlmLevel || storedUser.mlmLevel || 'no_stage',
        joiningFeePaid: profile?.joiningFeePaid || storedUser.joiningFeePaid || false,
        ...profile
      };
      
      const updatedProfile = {
        ...actualProfile,
        wallet: {
          balance: wallet?.balance || actualProfile?.wallet?.balance || 0,
          mlmEarnings: actualProfile?.wallet?.mlmEarnings || 0,
          totalEarned: wallet?.totalEarned || actualProfile?.wallet?.totalEarned || 0,
          totalWithdrawn: wallet?.totalWithdrawn || actualProfile?.wallet?.totalWithdrawn || 0
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
        mlmLevel: storedUser.mlmLevel || (qualifiesForFeeder ? 'feeder' : 'no_stage'),
        wallet: { balance: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = userProfile?.referralCode ? `${process.env.REACT_APP_FRONTEND_URL || 'https://baobab-mlm.vercel.app'}/register?ref=${userProfile.referralCode}` : 'Loading...';
  
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setShowReferralToast(true);
  };

  const handleAddToCart = (product) => {
    try {
      if (!product || !product.name) {
        console.error('Invalid product');
        return;
      }
      
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('userCart') || '[]');
      
      // Check if product already exists in cart
      const existingItem = existingCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity
        existingItem.quantity += 1;
      } else {
        // Add new item
        existingCart.push({
          ...product,
          quantity: 1
        });
      }
      
      // Save to localStorage
      localStorage.setItem('userCart', JSON.stringify(existingCart));
      
      // Show success toast
      setShowToast(true);
      
      console.log('Product added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Show payment upload modal if user hasn't paid joining fee
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const needsPayment = !userProfile?.joiningFeePaid;
  


  const getColorForIndex = (index) => {
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-600', 'bg-cyan-400', 'bg-purple-400'];
    return colors[index % colors.length];
  };

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      const featuredProducts = await getFeaturedProducts();
      setProducts(featuredProducts);
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
      amount: `${formatPrice(order.amount)}`,
      status: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'
    })),
    ...withdrawals.map((withdrawal, index) => ({
      id: userOrders.length + index + 1,
      account: userProfile?.email || 'user@example.com',
      stage: userProfile?.mlmLevel === 'feeder' ? 'Feeder' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'No Level',
      transaction: 'Withdrawal',
      type: 'Outgoing',
      amount: `${formatPrice(withdrawal.amount)}`,
      status: withdrawal.status?.charAt(0).toUpperCase() + withdrawal.status?.slice(1) || 'Pending'
    })),
    ...transactions.map((tx, index) => ({
      id: userOrders.length + withdrawals.length + index + 1,
      account: userProfile?.email || 'user@example.com',
      stage: userProfile?.mlmLevel === 'feeder' ? 'Feeder' : userProfile?.mlmLevel?.charAt(0).toUpperCase() + userProfile?.mlmLevel?.slice(1) || 'No Level',
      transaction: tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1) || 'Transaction',
      type: tx.amount > 0 ? 'Incoming' : 'Outgoing',
      amount: `${formatPrice(Math.abs(tx.amount))}`,
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
                      <p className="text-3xl font-bold mb-1">{formatPrice(convertedBalances.balance)}</p>
                      <p className="text-white/70 text-sm">≈ ${Number((convertedBalances.balance || 0) / 1500).toFixed(2)} USD</p>
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
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={refreshWalletData}
                            className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Refresh
                          </button>
                          <button 
                            onClick={() => setShowDepositModal(true)}
                            className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold hover:bg-green-700 transition-colors"
                          >
                            Deposit
                          </button>
                        </div>
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
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatPrice(convertedBalances.mlmEarnings)}</p>
                  <p className="text-gray-500 text-sm">≈ ${Number((convertedBalances.mlmEarnings || 0) / 1500).toFixed(2)} USD</p>
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
                  <p className="text-green-600 font-semibold text-sm">+{formatPrice(member.earning_from_user * 1500 || 2250)}</p>
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
      
      {showToast && (
        <Toast 
          message="Product added to cart successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      
      {showReferralToast && (
        <Toast 
          message="Referral link copied to clipboard!"
          type="success"
          onClose={() => setShowReferralToast(false)}
        />
      )}
    </div>
  );
}