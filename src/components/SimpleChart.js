import React from 'react';

export const LineChart = ({ data, width = 600, height = 200, color = '#10b981' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => parseFloat(item.amount || item.value || 0)));
  const minValue = Math.min(...data.map(item => parseFloat(item.amount || item.value || 0)));
  const range = maxValue - minValue || 1;

  const points = data.slice(0, 6).map((item, index) => {
    const x = 50 + (index * ((width - 100) / 5));
    const y = height - 50 - (((parseFloat(item.amount || item.value || 0) - minValue) / range) * (height - 100));
    return `${x},${y}`;
  });

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
      {/* Grid lines */}
      <defs>
        <pattern id="grid" width="50" height="25" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {/* Line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={points.join(' ')}
      />
      
      {/* Data points */}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.split(',')[0]}
          cy={point.split(',')[1]}
          r="4"
          fill={color}
        />
      ))}
      
      {/* X-axis labels */}
      {data.slice(0, 6).map((item, index) => (
        <text
          key={index}
          x={50 + (index * ((width - 100) / 5))}
          y={height - 20}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short' }) : `Day ${index + 1}`}
        </text>
      ))}
      
      {/* Y-axis labels */}
      <text x="20" y={height - 50} className="text-xs fill-gray-500">
        {minValue.toLocaleString()}
      </text>
      <text x="20" y={height / 2} className="text-xs fill-gray-500">
        {((maxValue + minValue) / 2).toLocaleString()}
      </text>
      <text x="20" y="60" className="text-xs fill-gray-500">
        {maxValue.toLocaleString()}
      </text>
    </svg>
  );
};

export const BarChart = ({ data, width = 300, height = 150, color = '#10b981' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => parseFloat(item.amount || item.value || 0)));
  const barWidth = (width - 60) / Math.min(data.length, 7);

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
      {/* Bars */}
      {data.slice(0, 7).map((item, index) => {
        const value = parseFloat(item.amount || item.value || 0);
        const barHeight = Math.max(5, (value / maxValue) * (height - 60));
        const x = 30 + (index * barWidth);
        const y = height - 40 - barHeight;
        
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth - 5}
            height={barHeight}
            fill={color}
            rx="2"
          />
        );
      })}
      
      {/* X-axis labels */}
      {data.slice(0, 7).map((item, index) => (
        <text
          key={index}
          x={30 + (index * barWidth) + (barWidth / 2)}
          y={height - 15}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          {item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0) : index + 1}
        </text>
      ))}
      
      {/* Y-axis labels */}
      <text x="10" y={height - 40} className="text-xs fill-gray-500">0</text>
      <text x="10" y={height - 40 - ((height - 60) / 2)} className="text-xs fill-gray-500">
        {(maxValue / 2).toLocaleString()}
      </text>
      <text x="10" y="25" className="text-xs fill-gray-500">
        {maxValue.toLocaleString()}
      </text>
    </svg>
  );
};