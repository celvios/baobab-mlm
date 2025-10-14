import React from 'react';

export default function PyramidTree({ userStage, matrixData }) {
  const isFeeder = userStage === 'feeder';
  const totalSlots = isFeeder ? 6 : 14;
  
  const getSlotStatus = (index) => {
    const slot = matrixData?.find(m => m.position === index);
    if (slot?.filled) return 'filled';
    return 'empty';
  };
  
  const SlotNode = ({ index, position }) => {
    const status = getSlotStatus(index);
    const member = matrixData?.find(m => m.position === index);
    
    return (
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
          status === 'filled' ? 'bg-green-500' : 'bg-gray-300 border-2 border-dashed border-gray-400'
        }`}>
          {status === 'filled' ? (member?.name?.charAt(0) || 'U') : '?'}
        </div>
        {status === 'filled' && (
          <div className="mt-1 text-center">
            <p className="text-xs font-medium text-gray-900">{member?.name || 'User'}</p>
            <p className="text-xs text-green-600 font-semibold">+${member?.earning || '1.5'}</p>
          </div>
        )}
      </div>
    );
  };
  
  if (isFeeder) {
    return (
      <div className="flex flex-col items-center space-y-8 py-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Feeder Stage (2x2)</h3>
          <p className="text-sm text-gray-600">{matrixData?.length || 0}/6 slots filled</p>
        </div>
        
        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
          YOU
        </div>
        
        <div className="flex space-x-24">
          <SlotNode index={0} position="L" />
          <SlotNode index={1} position="R" />
        </div>
        
        <div className="flex space-x-12">
          <SlotNode index={2} position="LL" />
          <SlotNode index={3} position="LR" />
          <SlotNode index={4} position="RL" />
          <SlotNode index={5} position="RR" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">{userStage?.toUpperCase()} Stage (2x3)</h3>
        <p className="text-sm text-gray-600">{matrixData?.length || 0}/14 slots filled</p>
      </div>
      
      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
        YOU
      </div>
      
      <div className="flex space-x-24">
        <SlotNode index={0} position="L" />
        <SlotNode index={1} position="R" />
      </div>
      
      <div className="flex space-x-12">
        <SlotNode index={2} position="LL" />
        <SlotNode index={3} position="LR" />
        <SlotNode index={4} position="RL" />
        <SlotNode index={5} position="RR" />
      </div>
      
      <div className="flex space-x-6">
        <SlotNode index={6} position="LLL" />
        <SlotNode index={7} position="LLR" />
        <SlotNode index={8} position="LRL" />
        <SlotNode index={9} position="LRR" />
        <SlotNode index={10} position="RLL" />
        <SlotNode index={11} position="RLR" />
        <SlotNode index={12} position="RRL" />
        <SlotNode index={13} position="RRR" />
      </div>
    </div>
  );
}
