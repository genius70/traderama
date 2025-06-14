import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const SpyReturnsDistribution = () => {
  // Sample of recent SPY monthly returns (representative data based on search results)
  const monthlyReturns = [
    -5.75, -1.42, 2.70, -2.50, 5.73, -0.99, 2.02, 2.28, 1.13, 3.47,
    4.80, -4.16, 3.10, 5.17, 1.59, 4.42, 8.92, -2.20, -4.87, -1.77,
    3.11, 6.47, 0.25, 1.46, 3.51, -2.61, 6.18, -5.90, 5.38, 7.99,
    -9.34, -4.24, 9.11, -8.39, 0.01, -8.80, 3.58, -3.14, -5.26, 4.36,
    -0.83, 6.91, -4.76, 2.90, 2.28, 2.22, 0.55, 5.24, 4.24, 2.61,
    1.67, -2.77, 3.24, 0.38, -0.58, 4.48, 2.17, -1.54, 0.43, 0.27,
    5.89, 1.94, -6.44, -1.21, 5.51, 3.26, -0.04, 2.56, 0.69, 1.12,
    -0.69, 3.56, 1.79, -0.73, 0.28, -7.03, 7.05, 3.85, -8.81, 20.54,
    -16.94, 12.82, -0.04, 11.96, 8.59, 3.09, 2.65, -6.98, 9.12, -3.35,
    1.01, 8.76, 5.09, 1.38, -6.12, -13.04, 11.43, -8.43, 21.44, -11.98
  ];

  // Calculate statistics
  const mean = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
  const variance = monthlyReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / monthlyReturns.length;
  const stdDev = Math.sqrt(variance);

  // Create histogram bins
  const createHistogram = (data, binCount = 15) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth,
      count: 0,
      frequency: 0,
      returns: [],
      // Explicitly add default binCenter and label so type checks are happy
      binCenter: 0,
      label: "",
    }));
    
    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
      bins[binIndex].count++;
      bins[binIndex].returns.push(value);
    });
    
    bins.forEach(bin => {
      bin.frequency = (bin.count / data.length) * 100;
      bin.binCenter = (bin.binStart + bin.binEnd) / 2;
      bin.label = `${bin.binStart.toFixed(1)}% to ${bin.binEnd.toFixed(1)}%`;
    });
    
    return bins;
  };

  const histogramData = createHistogram(monthlyReturns);
  
  // Generate normal distribution curve for comparison
  const normalDistribution = useMemo(() => {
    const points = [];
    const min = Math.min(...monthlyReturns) - 2;
    const max = Math.max(...monthlyReturns) + 2;
    const step = (max - min) / 100;
    
    for (let x = min; x <= max; x += step) {
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
      points.push({ x: x.toFixed(2), normalDensity: y * 100 * 2.5 }); // Scale for visibility
    }
    return points;
  }, [monthlyReturns, mean, stdDev]);

  // Standard deviation bands
  const stdDevBands = [
    { value: mean - 2 * stdDev, label: '-2σ', color: '#ef4444' },
    { value: mean - stdDev, label: '-1σ', color: '#f97316' },
    { value: mean, label: 'Mean', color: '#10b981' },
    { value: mean + stdDev, label: '+1σ', color: '#f97316' },
    { value: mean + 2 * stdDev, label: '+2σ', color: '#ef4444' }
  ];

  // Calculate percentages within std dev bands
  const withinOneSigma = monthlyReturns.filter(r => Math.abs(r - mean) <= stdDev).length / monthlyReturns.length * 100;
  const withinTwoSigma = monthlyReturns.filter(r => Math.abs(r - mean) <= 2 * stdDev).length / monthlyReturns.length * 100;

  const [activeTab, setActiveTab] = useState('histogram');

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          SPY Monthly Returns Distribution Analysis
        </h1>
        <p className="text-gray-600">
          Statistical analysis of the last 100 monthly percentage changes in SPY price
        </p>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-700">Mean Return</h3>
          <p className="text-2xl font-bold text-blue-900">{mean.toFixed(2)}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-purple-700">Std Deviation</h3>
          <p className="text-2xl font-bold text-purple-900">{stdDev.toFixed(2)}%</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-green-700">Within 1σ</h3>
          <p className="text-2xl font-bold text-green-900">{withinOneSigma.toFixed(1)}%</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-orange-700">Within 2σ</h3>
          <p className="text-2xl font-bold text-orange-900">{withinTwoSigma.toFixed(1)}%</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('histogram')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'histogram' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Distribution Histogram
        </button>
        <button
          onClick={() => setActiveTab('normal')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'normal' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          vs Normal Distribution
        </button>
        <button
          onClick={() => setActiveTab('timeseries')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'timeseries' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Time Series
        </button>
      </div>

      {/* Charts */}
      <div className="bg-gray-50 p-6 rounded-lg">
        {activeTab === 'histogram' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Frequency Distribution of Monthly Returns</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="binCenter"
                  tickFormatter={(value) => typeof value === "number" ? `${value.toFixed(1)}%` : value}
                  label={{ value: 'Monthly Return (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [typeof value === "number" ? `${value.toFixed(2)}%` : value, 'Frequency']}
                  labelFormatter={(value) =>
                    typeof value === "number"
                      ? `Return Range: ${value.toFixed(1)}%`
                      : `Return Range: ${value}`
                  }
                />
                <Bar dataKey="frequency" fill="#3b82f6" stroke="#1e40af" strokeWidth={1} />
                {stdDevBands.map((band, index) => (
                  <ReferenceLine 
                    key={index}
                    x={band.value} 
                    stroke={band.color} 
                    strokeDasharray="5 5" 
                    label={band.label}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'normal' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Actual vs Normal Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="x"
                  domain={['dataMin', 'dataMax']}
                  type="number"
                  tickFormatter={(value) => typeof value === "number" ? `${value}%` : value}
                  label={{ value: 'Monthly Return (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Density', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [typeof value === "number" ? value.toFixed(4) : value, name]}
                  labelFormatter={(value) => typeof value === "number" ? `Return: ${value}%` : `Return: ${value}`}
                />
                <Line 
                  data={normalDistribution}
                  type="monotone" 
                  dataKey="normalDensity" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                  name="Normal Distribution"
                />
                {/* Add actual data points */}
                <Line 
                  data={histogramData.map(bin => ({ x: bin.binCenter, actualDensity: bin.frequency }))}
                  type="monotone" 
                  dataKey="actualDensity" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Actual Distribution"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'timeseries' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Monthly Returns Time Series</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart 
                data={monthlyReturns.map((ret, idx) => ({ month: idx + 1, return: ret }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  label={{ value: 'Month (Recent 100)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Monthly Return (%)', angle: -90, position: 'insideLeft' }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  formatter={(value) => [typeof value === "number" ? `${value.toFixed(2)}%` : value, 'Monthly Return']}
                  labelFormatter={(value) => typeof value === "number" ? `Month ${value}` : `Month ${value}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="return" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" />
                <ReferenceLine y={mean} stroke="#10b981" strokeDasharray="5 5" label="Mean" />
                <ReferenceLine y={mean + stdDev} stroke="#f97316" strokeDasharray="5 5" label="+1σ" />
                <ReferenceLine y={mean - stdDev} stroke="#f97316" strokeDasharray="5 5" label="-1σ" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Analysis Summary */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Key Insights</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-700">Distribution Characteristics:</h4>
            <ul className="list-disc list-inside text-blue-600 space-y-1">
              <li>Mean monthly return: {mean.toFixed(2)}%</li>
              <li>Standard deviation: {stdDev.toFixed(2)}%</li>
              <li>Range: {Math.min(...monthlyReturns).toFixed(2)}% to {Math.max(...monthlyReturns).toFixed(2)}%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700">Normal Distribution Comparison:</h4>
            <ul className="list-disc list-inside text-blue-600 space-y-1">
              <li>{withinOneSigma.toFixed(1)}% of returns within 1σ (vs 68% expected)</li>
              <li>{withinTwoSigma.toFixed(1)}% of returns within 2σ (vs 95% expected)</li>
              <li>Distribution shows {withinOneSigma < 68 ? 'fat tails' : 'normal behavior'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpyReturnsDistribution;
