import React, { useState, useEffect, useRef } from 'react';

const MarketUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const prevUpdatesRef = useRef([]);

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  useEffect(() => {
    const loadUpdates = () => {
      const marketUpdates = JSON.parse(localStorage.getItem('marketUpdates') || '[]');
      const now = new Date();
      
      // Filter out updates older than 1 minute
      const recentUpdates = marketUpdates.filter(update => {
        const updateTime = new Date(update.date);
        return (now - updateTime) < 60000; // 60 seconds
      });
      
      // Update localStorage with filtered updates
      localStorage.setItem('marketUpdates', JSON.stringify(recentUpdates));
      
      const updateMessages = recentUpdates.slice(0, 3).map(update => update.message);
      const newUpdates = updateMessages.length === 0 ? [
        'Welcome to Baobab Community! Start your wellness journey today'
      ] : updateMessages;
      
      setUpdates(newUpdates);
      prevUpdatesRef.current = newUpdates;
    };
    
    loadUpdates();
    const interval = setInterval(loadUpdates, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      const withdrawals = JSON.parse(localStorage.getItem('userWithdrawals') || '[]');
      const pendingOrders = orders.filter(order => order.status === 'pending');
      const approvedOrders = orders.filter(order => order.status === 'approved');
      const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved');
      
      const updateMessages = [];
      
      if (approvedWithdrawals.length > 0) {
        approvedWithdrawals.slice(-1).forEach(withdrawal => {
          updateMessages.push(`Withdrawal of $${withdrawal.amount} approved - Check your bank account`);
        });
      }
      
      if (approvedOrders.length > 0) {
        approvedOrders.slice(-2).forEach(order => {
          updateMessages.push(`Order ${order.orderNumber.slice(-6)} approved - ₦${order.amount.toLocaleString()} ${order.product}`);
        });
      }
      
      if (pendingOrders.length > 0) {
        const totalValue = pendingOrders.reduce((sum, order) => sum + order.amount, 0);
        updateMessages.push(`${pendingOrders.length} pending orders worth ₦${totalValue.toLocaleString()}`);
      }
      
      const newUpdates = updateMessages.length === 0 ? [
        'Welcome to Baobab Community! Start your wellness journey today',
        'New products available - Check out our latest superfood blends',
        'Join our growing community of health enthusiasts'
      ] : updateMessages;
      
      if (JSON.stringify(newUpdates) !== JSON.stringify(prevUpdatesRef.current)) {
        playNotificationSound();
        setUpdates(newUpdates);
        prevUpdatesRef.current = newUpdates;
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl mb-6">
      <div className="flex items-center">
        <div className="w-6 h-6 bg-gray-700 rounded mr-3 flex items-center justify-center">
          <span className="text-xs">🔊</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="font-semibold">Updates:</span> {updates.join(' • ')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketUpdates;