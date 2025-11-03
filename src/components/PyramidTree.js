import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function PyramidTree({ userStage, matrixData, teamMembers = [] }) {
  const [expandedNodes, setExpandedNodes] = useState({});
  const isFeeder = !userStage || userStage === 'feeder' || userStage === 'no_stage' || userStage === 'NaN';
  const totalSlots = isFeeder ? 6 : 14;
  
  const stageBonus = {
    'no_stage': 1.5,
    'feeder': 1.5,
    'bronze': 4.8,
    'silver': 30,
    'gold': 150,
    'diamond': 750,
    'infinity': 15000
  };
  
  const bonusAmount = stageBonus[userStage] || 1.5;
  const filledSlotsCount = matrixData?.filter(m => m.filled && m.position < totalSlots).length || 0;
  
  const toggleNode = (memberId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };
  
  const SlotNode = ({ index, member, level = 0 }) => {
    const slot = matrixData?.find(m => m.position === index);
    const isFilled = member ? true : (slot?.filled || false);
    
    const hasChildren = member?.children && member.children.length > 0;
    const isExpanded = expandedNodes[member?.id];
    
    return (
      <div className="flex flex-col items-center relative">
        <div className="relative">
          <div 
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer ${
              isFilled ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gray-300 border-2 border-dashed border-gray-400'
            }`}
            style={{ animation: isFilled ? `popIn 0.4s ease-out ${level * 0.1}s both` : 'none' }}
            onClick={() => hasChildren && toggleNode(member?.id)}
          >
            {isFilled ? (member?.full_name?.charAt(0)?.toUpperCase() || member?.email?.charAt(0)?.toUpperCase() || member?.name?.charAt(0)?.toUpperCase() || slot?.name?.charAt(0)?.toUpperCase() || 'U') : '?'}
          </div>
          
          {hasChildren && isFilled && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleNode(member?.id); }}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
        </div>
        
        {isFilled && (
          <div className="mt-2 text-center">
            <p className="text-xs font-semibold text-gray-900 max-w-[80px] truncate">
              {member?.full_name || member?.email?.split('@')[0] || member?.name || slot?.name || 'User'}
            </p>
            <p className="text-xs text-green-600 font-bold">+${member?.earning_from_user || slot?.earning || bonusAmount}</p>
            {member?.mlm_level && (
              <p className="text-xs text-blue-600 font-medium">
                {member.mlm_level === 'no_stage' ? 'No Stage' : member.mlm_level.charAt(0).toUpperCase() + member.mlm_level.slice(1)}
              </p>
            )}
            {hasChildren && (
              <p className="text-xs text-gray-500">({member.children.length} downline{member.children.length !== 1 ? 's' : ''})</p>
            )}
          </div>
        )}
        
        {isExpanded && hasChildren && (
          <div className="mt-4 flex flex-col items-center space-y-4">
            <div className="flex space-x-8">
              {member.children.map((child, idx) => (
                <SlotNode key={child.id || idx} index={idx} member={child} level={level + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if (isFeeder) {
    return (
      <div className="flex flex-col items-center space-y-4 sm:space-y-8 py-4 sm:py-8 overflow-x-auto w-full">
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
        
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {!userStage || userStage === 'NaN' || userStage === 'no_stage' ? 'No Stage' : 'Feeder'} Matrix (2x2)
          </h3>
          <p className="text-sm text-gray-600">{filledSlotsCount}/6 slots filled</p>
        </div>
        
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl">
          YOU
        </div>
        
        <div className="flex space-x-8 sm:space-x-16 md:space-x-32">
          <SlotNode index={0} member={teamMembers[0]} level={1} />
          <SlotNode index={1} member={teamMembers[1]} level={1} />
        </div>
        
        <div className="flex space-x-4 sm:space-x-8 md:space-x-16">
          <SlotNode index={2} member={teamMembers[2]} level={2} />
          <SlotNode index={3} member={teamMembers[3]} level={2} />
          <SlotNode index={4} member={teamMembers[4]} level={2} />
          <SlotNode index={5} member={teamMembers[5]} level={2} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 py-4 sm:py-8 overflow-x-auto w-full">
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">{userStage?.toUpperCase()} Matrix (2x3)</h3>
        <p className="text-sm text-gray-600">{filledSlotsCount}/14 slots filled</p>
      </div>
      
      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl">
        YOU
      </div>
      
      <div className="flex space-x-8 sm:space-x-16 md:space-x-32">
        <SlotNode index={0} member={teamMembers[0]} level={1} />
        <SlotNode index={1} member={teamMembers[1]} level={1} />
      </div>
      
      <div className="flex space-x-4 sm:space-x-8 md:space-x-16">
        <SlotNode index={2} member={teamMembers[2]} level={2} />
        <SlotNode index={3} member={teamMembers[3]} level={2} />
        <SlotNode index={4} member={teamMembers[4]} level={2} />
        <SlotNode index={5} member={teamMembers[5]} level={2} />
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-8">
        <SlotNode index={6} member={teamMembers[6]} level={3} />
        <SlotNode index={7} member={teamMembers[7]} level={3} />
        <SlotNode index={8} member={teamMembers[8]} level={3} />
        <SlotNode index={9} member={teamMembers[9]} level={3} />
        <SlotNode index={10} member={teamMembers[10]} level={3} />
        <SlotNode index={11} member={teamMembers[11]} level={3} />
        <SlotNode index={12} member={teamMembers[12]} level={3} />
        <SlotNode index={13} member={teamMembers[13]} level={3} />
      </div>
    </div>
  );
}
