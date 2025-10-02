import React from 'react';

export default function BalanceChart() {
  const data = [
    { month: 'Jan', balance: 8500 },
    { month: 'Feb', balance: 9200 },
    { month: 'Mar', balance: 10800 },
    { month: 'Apr', balance: 11200 },
    { month: 'May', balance: 12100 },
    { month: 'Jun', balance: 12345 }
  ];

  const maxBalance = Math.max(...data.map(d => d.balance));
  const minBalance = Math.min(...data.map(d => d.balance)) - 1000;
  const chartHeight = 200;
  const chartWidth = 400;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((item.balance - minBalance) / (maxBalance - minBalance)) * chartHeight;
    return { x, y, ...item };
  });

  const linePath = points.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');

  const areaPath = linePath + ` L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="h-64 p-4">
      <div className="relative h-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="overflow-visible">
          <defs>
            <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          <path d={areaPath} fill="url(#balanceGradient)" />
          
          <path
            d={linePath}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="white"
                stroke="#14b8a6"
                strokeWidth="3"
                className="hover:r-8 transition-all duration-200 cursor-pointer"
              />
              <circle cx={point.x} cy={point.y} r="2" fill="#14b8a6" />
              
              <g className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                <rect
                  x={point.x - 35}
                  y={point.y - 35}
                  width="70"
                  height="25"
                  fill="#1f2937"
                  rx="6"
                />
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                >
                  ${point.balance.toLocaleString()}
                </text>
              </g>
              
              <text
                x={point.x}
                y={chartHeight + 20}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="12"
                fontWeight="500"
              >
                {point.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}