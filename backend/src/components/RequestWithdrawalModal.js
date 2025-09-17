import React, { useState } from 'react';
import { XMarkIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ProcessLoader from './ProcessLoader';
import { useNotification } from './NotificationSystem';

const nigerianBanks = [
  // Commercial Banks
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'SunTrust Bank', code: '100' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
  
  // Digital Banks & Fintech
  { name: 'Kuda Bank', code: '090267' },
  { name: 'Opay', code: '999992' },
  { name: 'Carbon (Formerly One Finance)', code: '565' },
  { name: 'Flutterwave', code: '103' },
  { name: 'Paystack', code: '999991' },
  { name: 'Chipper Cash', code: '120001' },
  { name: 'Cowrywise', code: '51310' },
  { name: 'PiggyVest', code: '104' },
  
  // Microfinance Banks
  { name: 'LAPO Microfinance Bank', code: '090177' },
  { name: 'AB Microfinance Bank', code: '090270' },
  { name: 'Accion Microfinance Bank', code: '090134' },
  { name: 'Advans La Fayette Microfinance Bank', code: '090155' },
  { name: 'Amju Unique Microfinance Bank', code: '090180' },
  { name: 'Bowen Microfinance Bank', code: '090148' },
  { name: 'CEMCS Microfinance Bank', code: '090154' },
  { name: 'Covenant Microfinance Bank', code: '090147' },
  { name: 'Eyowo Microfinance Bank', code: '090328' },
  { name: 'Fairmoney Microfinance Bank', code: '090400' },
  { name: 'FINCA Microfinance Bank', code: '090153' },
  { name: 'Fortis Microfinance Bank', code: '090365' },
  { name: 'Grooming Microfinance Bank', code: '090195' },
  { name: 'Hackman Microfinance Bank', code: '090175' },
  { name: 'Hasal Microfinance Bank', code: '090121' },
  { name: 'Ibile Microfinance Bank', code: '090118' },
  { name: 'Imowo Microfinance Bank', code: '090157' },
  { name: 'Infinity Microfinance Bank', code: '090157' },
  { name: 'Kredi Money Microfinance Bank', code: '090380' },
  { name: 'Mayfair Microfinance Bank', code: '090190' },
  { name: 'Mint Microfinance Bank', code: '090281' },
  { name: 'Moniepoint Microfinance Bank', code: '090405' },
  { name: 'NPF Microfinance Bank', code: '090119' },
  { name: 'Palmpay Microfinance Bank', code: '090415' },
  { name: 'Parkway Microfinance Bank', code: '090317' },
  { name: 'Petra Microfinance Bank', code: '090165' },
  { name: 'Renmoney Microfinance Bank', code: '090198' },
  { name: 'Rubies Microfinance Bank', code: '090175' },
  { name: 'Sparkle Microfinance Bank', code: '090325' },
  { name: 'VFD Microfinance Bank', code: '090110' },
  { name: 'Xpress Payments', code: '090142' },
  
  // Additional Microfinance & Payment Service Banks
  { name: '9mobile (9Payment Service Bank)', code: '120004' },
  { name: 'Airtel (Smartcash Payment Service Bank)', code: '120003' },
  { name: 'MTN (MoMo Payment Service Bank)', code: '120002' },
  { name: 'Globacom (Glo Mobile Money)', code: '120005' },
  { name: 'Accelerex Network', code: '090202' },
  { name: 'Addosser Microfinance Bank', code: '090160' },
  { name: 'Aella Credit', code: '090394' },
  { name: 'Alat by Wema', code: '035A' },
  { name: 'Aramoko Microfinance Bank', code: '090143' },
  { name: 'ASO Savings and Loans', code: '401' },
  { name: 'Bainescredit Microfinance Bank', code: '090188' },
  { name: 'Bayero University Microfinance Bank', code: '090316' },
  { name: 'Cellulant', code: '317' },
  { name: 'Chikum Microfinance Bank', code: '090141' },
  { name: 'Consumer Microfinance Bank', code: '090130' },
  { name: 'Coronation Merchant Bank', code: '559' },
  { name: 'Dot Microfinance Bank', code: '090470' },
  { name: 'Ecobank Xpress Account', code: '050C' },
  { name: 'Ekimogun Microfinance Bank', code: '090097' },
  { name: 'Emeralds Microfinance Bank', code: '090273' },
  { name: 'Enterprise Bank', code: '084' },
  { name: 'Fets Microfinance Bank', code: '090179' },
  { name: 'Finatrust Microfinance Bank', code: '090111' },
  { name: 'First Royal Microfinance Bank', code: '090164' },
  { name: 'FLOURISH MFB', code: '090297' },
  { name: 'FSDH Merchant Bank Limited', code: '501' },
  { name: 'Gateway Mortgage Bank LTD', code: '812' },
  { name: 'GoMoney', code: '100022' },
  { name: 'Greenwich Merchant Bank', code: '562' },
  { name: 'GTBank Mobile Money', code: '315' },
  { name: 'Jubilee Life Mortgage Bank', code: '402' },
  { name: 'Lagos Building Investment Company Plc.', code: '90052' },
  { name: 'Links Microfinance Bank', code: '090435' },
  { name: 'Living Trust Mortgage Bank', code: '031' },
  { name: 'Lotus Bank', code: '303' },
  { name: 'M36', code: '51211' },
  { name: 'Mainstreet Microfinance Bank', code: '090171' },
  { name: 'Manny Microfinance Bank', code: '090174' },
  { name: 'Mutual Benefits Assurance Plc', code: '090190' },
  { name: 'Page MFBank', code: '560' },
  { name: 'Parallex Bank', code: '104' },
  { name: 'Paycom', code: '305' },
  { name: 'Personal Trust Microfinance Bank', code: '090135' },
  { name: 'Quickfund Microfinance Bank', code: '090261' },
  { name: 'Rand Merchant Bank', code: '502' },
  { name: 'Refuge Mortgage Bank', code: '90067' },
  { name: 'Safe Haven Microfinance Bank', code: '090286' },
  { name: 'Signature Bank Ltd', code: '106' },
  { name: 'Solid Rock Microfinance Bank', code: '090140' },
  { name: 'Stellas Microfinance Bank', code: '090262' },
  { name: 'TAJ Bank', code: '302' },
  { name: 'TCF MFB', code: '090115' },
  { name: 'Teamapt Limited', code: '51269' },
  { name: 'Trustbond Mortgage Bank', code: '523' },
  { name: 'U&C Microfinance Bank Ltd (U AND C MFB)', code: '090315' },
  { name: 'Unical Microfinance Bank', code: '090338' },
  { name: 'Venture Garden Nigeria Limited', code: '90110' },
  { name: 'Visa Microfinance Bank', code: '566' },
  { name: 'Wetland Microfinance Bank', code: '090120' },
  { name: 'Winco Microfinance Bank', code: '090159' }
];

export default function RequestWithdrawalModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Form, 2: Security, 3: Success
  const [formData, setFormData] = useState({
    amount: '',
    bank: '',
    bankCode: '',
    accountNumber: '',
    accountName: ''
  });
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userBalance, setUserBalance] = useState(0);
  const { addNotification } = useNotification();

  React.useEffect(() => {
    if (isOpen) {
      // Get balance from wallet API
      const fetchBalance = async () => {
        try {
          const walletData = await apiService.getWallet();
          setUserBalance(walletData.balance || 0);
        } catch (error) {
          console.error('Error fetching wallet:', error);
          setUserBalance(0);
        }
      };
      fetchBalance();
    }
  }, [isOpen]);

  const verifyBankAccount = async () => {
    if (!formData.bankCode || !formData.accountNumber || formData.accountNumber.length < 10) {
      return;
    }

    setVerifyingAccount(true);
    setAccountVerified(false);
    setResolvedAccountName('');
    setErrors({});

    try {
      // Use real Paystack API for bank verification
      const response = await fetch('/api/bank/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          accountNumber: formData.accountNumber,
          bankCode: formData.bankCode
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResolvedAccountName(result.accountName);
        setAccountVerified(true);
        setFormData({...formData, accountName: result.accountName});
        addNotification('Account verified successfully!', 'success');
      } else {
        setAccountVerified(false);
        setErrors({accountNumber: result.message || 'Account verification failed'});
        addNotification(result.message || 'Account verification failed', 'error');
      }
    } catch (error) {
      setAccountVerified(false);
      setErrors({accountNumber: 'Failed to verify account. Please try again.'});
      addNotification('Failed to verify account. Please check details.', 'error');
    } finally {
      setVerifyingAccount(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) > userBalance) {
      newErrors.amount = 'Insufficient balance';
    }
    
    if (!formData.bank) newErrors.bank = 'Please select a bank';
    if (!formData.accountNumber) newErrors.accountNumber = 'Please enter account number';
    if (!accountVerified) newErrors.accountNumber = 'Please verify your account number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setStep(2);
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Save withdrawal to localStorage
    const withdrawal = {
      id: Date.now(),
      amount: parseFloat(formData.amount),
      bank: formData.bank,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      status: 'pending',
      date: new Date().toISOString(),
      type: 'withdrawal'
    };
    
    const existingWithdrawals = JSON.parse(localStorage.getItem('userWithdrawals') || '[]');
    existingWithdrawals.push(withdrawal);
    localStorage.setItem('userWithdrawals', JSON.stringify(existingWithdrawals));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setStep(3);
  };

  const handleClose = () => {
    setStep(1);
    setFormData({ amount: '', bank: '', bankCode: '', accountNumber: '', accountName: '' });
    setVerificationCode(['', '', '', '', '', '']);
    setErrors({});
    setAccountVerified(false);
    setResolvedAccountName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleClose} />
        
        <div className="relative bg-white rounded-2xl shadow-elevated max-w-lg w-full p-8 animate-bounce-in">
          {step === 1 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Request Withdrawal</h3>
                  <p className="text-gray-600 mt-1">Enter your bank account details</p>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-primary-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-700 font-medium">Available Balance</p>
                    <p className="text-2xl font-bold text-primary-900">${userBalance.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                  {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Your Bank Account Details</label>
                  <div className="space-y-4">
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      value={formData.bank}
                      onChange={(e) => {
                        const selectedBank = nigerianBanks.find(bank => bank.name === e.target.value);
                        setFormData({
                          ...formData, 
                          bank: e.target.value,
                          bankCode: selectedBank?.code || ''
                        });
                        setAccountVerified(false);
                        setResolvedAccountName('');
                      }}
                    >
                      <option value="">Select Bank</option>
                      {nigerianBanks.map(bank => (
                        <option key={bank.code} value={bank.name}>{bank.name}</option>
                      ))}
                    </select>
                    {errors.bank && <p className="text-sm text-red-600">{errors.bank}</p>}

                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength="10"
                        className="w-full px-4 py-3 pr-24 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                        placeholder="Account Number"
                        value={formData.accountNumber}
                        onChange={(e) => {
                          setFormData({...formData, accountNumber: e.target.value});
                          setAccountVerified(false);
                          setResolvedAccountName('');
                        }}
                        onBlur={verifyBankAccount}
                      />
                      {verifyingAccount && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <ProcessLoader size="sm" />
                        </div>
                      )}
                      {accountVerified && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    {errors.accountNumber && <p className="text-sm text-red-600">{errors.accountNumber}</p>}

                    <input
                      type="text"
                      required
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        accountVerified ? 'bg-green-50 text-green-800' : 'bg-gray-50 focus:bg-white'
                      }`}
                      placeholder="Account Name"
                      value={formData.accountName}
                      readOnly={accountVerified}
                    />
                    {errors.accountName && <p className="text-sm text-red-600">{errors.accountName}</p>}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={handleClose} className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 flex items-center justify-center disabled:opacity-50">
                    {loading ? <ProcessLoader size="sm" /> : null}
                    Continue
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Security Verification</h3>
                  <p className="text-gray-600 mt-1">Enter the 6-digit code sent to your email</p>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleVerification} className="space-y-6">
                <div className="flex justify-center space-x-3">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength="1"
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          document.getElementById(`code-${index - 1}`)?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button type="button" className="font-medium text-primary-600 hover:text-primary-500">
                      Resend code
                    </button>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 flex items-center justify-center disabled:opacity-50"
                  disabled={verificationCode.some(digit => !digit) || loading}
                >
                  {loading ? (
                    <>
                      <ProcessLoader size="sm" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Successfully</h3>
                <p className="text-gray-600 mb-6">Your withdrawal request has been submitted successfully</p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">${formData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-semibold">{formData.bank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account:</span>
                      <span className="font-semibold">{formData.accountNumber}</span>
                    </div>
                  </div>
                </div>
                
                <button onClick={handleClose} className="w-full btn-primary py-3">
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}