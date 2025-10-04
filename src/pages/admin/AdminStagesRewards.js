import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiAward, FiUsers } from 'react-icons/fi';

const AdminStagesRewards = () => {
  const [stages, setStages] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await fetch('/api/admin/stages', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      setStages(data.stages);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const deleteStage = async (stageId) => {
    if (window.confirm('Are you sure you want to delete this stage?')) {
      try {
        await fetch(`/api/admin/stages/${stageId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        fetchStages();
      } catch (error) {
        console.error('Error deleting stage:', error);
      }
    }
  };

  const CreateStageModal = () => {
    const [formData, setFormData] = useState({
      stage_number: '',
      stage_name: '',
      required_referrals: '',
      required_purchases: '',
      bonus_amount: '',
      commission_rate: '',
      description: ''
    });

    useEffect(() => {
      if (editingStage) {
        setFormData(editingStage);
      }
    }, [editingStage]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const method = editingStage ? 'PUT' : 'POST';
        const url = editingStage ? `/api/admin/stages/${editingStage.id}` : '/api/admin/stages';
        
        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(formData)
        });
        
        setShowCreateModal(false);
        setEditingStage(null);
        fetchStages();
      } catch (error) {
        console.error('Error saving stage:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">
            {editingStage ? 'Edit Stage' : 'Create New Stage'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              placeholder="Stage Number"
              value={formData.stage_number}
              onChange={(e) => setFormData({...formData, stage_number: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Stage Name"
              value={formData.stage_name}
              onChange={(e) => setFormData({...formData, stage_name: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Required Referrals"
              value={formData.required_referrals}
              onChange={(e) => setFormData({...formData, required_referrals: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Required Purchases"
              value={formData.required_purchases}
              onChange={(e) => setFormData({...formData, required_purchases: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Bonus Amount (₦)"
              value={formData.bonus_amount}
              onChange={(e) => setFormData({...formData, bonus_amount: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Commission Rate (%)"
              value={formData.commission_rate}
              onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <textarea
              placeholder="Stage Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded-lg h-20"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                {editingStage ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingStage(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stages & Rewards</h1>
          <p className="text-gray-600">Manage MLM stages and reward structure</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Stage</span>
        </button>
      </div>

      <div className="grid gap-6">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiAward className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Stage {stage.stage_number}: {stage.stage_name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">{stage.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiUsers className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Required Referrals</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">{stage.required_referrals}</p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiAward className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">Required Purchases</span>
                      </div>
                      <p className="text-lg font-bold text-purple-900">{stage.required_purchases}</p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-green-600">Bonus Amount</span>
                      </div>
                      <p className="text-lg font-bold text-green-900">₦{stage.bonus_amount.toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-orange-600">Commission Rate</span>
                      </div>
                      <p className="text-lg font-bold text-orange-900">{stage.commission_rate}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingStage(stage);
                    setShowCreateModal(true);
                  }}
                  className="text-green-600 hover:text-green-900"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteStage(stage.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && <CreateStageModal />}
    </div>
  );
};

export default AdminStagesRewards;