import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function PyramidTree({ userStage, matrixData, teamMembers = [] }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
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
  
  const toggleNode = (id) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };
  
  const SlotNode = ({ index, member, level = 0 }) => {
    const slot = matrixData?.find(m => m.position === index);
    const isFilled = member ? true : (slot?.filled || false);
    const hasChildren = member?.children && member.children.length > 0;
    const isExpanded = expandedNodes.has(member?.id || index);
    
    return (
      <div className="flex flex-col items-center relative">
        <div className="relative">
          <div 
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 hover:scale-110 ${
              isFilled ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gray-300 border-2 border-dashed border-gray-400'
            }`}
            style={{ animation: isFilled ? `popIn 0.4s ease-out ${level * 0.1}s both` : 'none' }}
          >
            {isFilled ? (member?.full_name?.charAt(0)?.toUpperCase() || member?.email?.charAt(0)?.toUpperCase() || member?.name?.charAt(0)?.toUpperCase() || slot?.name?.charAt(0)?.toUpperCase() || 'U') : '?'}
          </div>
          
          {isFilled && hasChildren && (
            <button
              onClick={() => toggleNode(member.id || index)}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md hover:bg-blue-600 transition-all hover:scale-110"
            >
              {isExpanded ? '−' : '+'}
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
          </div>
        )}
        
        {hasChildren && isExpanded && (
          <div className="mt-4 flex flex-wrap justify-center gap-3" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {member.children.map((child, idx) => {
              const childHasChildren = child.children && child.children.length > 0;
              const isChildExpanded = expandedNodes.has(child.id);
              
              return (
                <div key={child.id || idx} className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
                      {child.full_name?.charAt(0) || child.email?.charAt(0).toUpperCase()}
                    </div>
                    {childHasChildren && (
                      <button
                        onClick={() => toggleNode(child.id)}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md hover:bg-purple-600 transition-all hover:scale-110"
                      >
                        {isChildExpanded ? '−' : '+'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs mt-1 text-gray-700 max-w-[70px] truncate">
                    {child.full_name || child.email?.split('@')[0]}
                  </p>
                  {child.has_deposited && (
                    <p className="text-xs text-green-600 font-bold">+${bonusAmount}</p>
                  )}
                  {child.mlm_level && (
                    <p className="text-xs text-purple-600 font-medium">
                      {child.mlm_level === 'no_stage' ? 'No Stage' : child.mlm_level.charAt(0).toUpperCase() + child.mlm_level.slice(1)}
                    </p>
                  )}
                  
                  {childHasChildren && isChildExpanded && (
                    <div className="mt-2 flex flex-wrap justify-center gap-2" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                      {child.children.map((grandchild, gidx) => {
                        const gcHasChildren = grandchild.children && grandchild.children.length > 0;
                        const isGcExpanded = expandedNodes.has(grandchild.id);
                        
                        return (
                          <div key={grandchild.id || gidx} className="flex flex-col items-center">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
                                {grandchild.full_name?.charAt(0) || grandchild.email?.charAt(0).toUpperCase()}
                              </div>
                              {gcHasChildren && (
                                <button
                                  onClick={() => toggleNode(grandchild.id)}
                                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md hover:bg-pink-600 transition-all"
                                >
                                  {isGcExpanded ? '−' : '+'}
                                </button>
                              )}
                            </div>
                            <p className="text-xs mt-1 text-gray-600 max-w-[60px] truncate">
                              {grandchild.full_name || grandchild.email?.split('@')[0]}
                            </p>
                            {grandchild.has_deposited && (
                              <p className="text-xs text-green-600 font-bold">+${bonusAmount}</p>
                            )}
                            
                            {gcHasChildren && isGcExpanded && grandchild.children && (
                              <div className="mt-2 flex flex-wrap justify-center gap-1 max-w-[120px]" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                {grandchild.children.map((ggc, ggidx) => (
                                  <div key={ggc.id || ggidx} className="flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow">
                                      {ggc.full_name?.charAt(0) || ggc.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="text-xs mt-1 text-gray-500 max-w-[50px] truncate">
                                      {ggc.full_name || ggc.email?.split('@')[0]}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
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
