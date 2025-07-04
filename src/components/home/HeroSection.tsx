import React from 'react';

interface Stat {
  label: string;
  value: string | number;
}

const HeroSection = () => {
  const stats: Record<string, Stat["value"]> = {
    users: '5,000+',
    strategies: 25,
    roi: '30%+'
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Options Trading with
            <span className="text-blue-600"> AI-Powered Strategies</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of traders using our advanced Iron Condor strategies and automated trading systems to generate consistent profits in any market condition.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button className="bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition-colors">
              Start Free Trial
            </button>
            <button className="bg-white text-blue-600 py-3 px-6 rounded-full hover:bg-gray-100 transition-colors">
              Learn More
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
              </div>
              <div className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
