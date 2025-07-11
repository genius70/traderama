import { useState } from 'react';
import { Play, X, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

interface TrainingPlan {
  strategy: string;
  name?: string;
  sentiment?: string;
  videoSrc?: string;
  embedId?: string;
  description?: string;
  sponsor?: string;
  sponsorUrl?: string;
  summary?: string;
  hasCustomContent?: boolean;
}

interface TrainingRoomProps {
  trainingPlans?: TrainingPlan[];
}

const TrainingRoom = ({ trainingPlans = [] }: TrainingRoomProps) => {
  const [selectedVideo, setSelectedVideo] = useState<TrainingPlan | null>(null);

  const defaultStrategies = [
    { name: "Long Call", sentiment: "Bullish", color: "bg-green-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Call", sentiment: "Bearish", color: "bg-red-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Put", sentiment: "Bearish", color: "bg-red-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Put", sentiment: "Bullish", color: "bg-green-500", embedId: "dQw4w9WgXcQ" },
    { name: "Bull Call Spread", sentiment: "Bullish", color: "bg-green-500", embedId: "dQw4w9WgXcQ" },
    { name: "Bear Call Spread", sentiment: "Bearish", color: "bg-red-500", embedId: "dQw4w9WgXcQ" },
    { name: "Bear Put Spread", sentiment: "Bearish", color: "bg-red-500", embedId: "dQw4w9WgXcQ" },
    { name: "Bull Put Spread", sentiment: "Bullish", color: "bg-green-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Straddle", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Straddle", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Strangle", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Strangle", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Iron Butterfly", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Iron Butterfly", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Calls Butterfly", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Calls Butterfly", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Puts Butterfly", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Puts Butterfly", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Iron Condor", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Iron Condor", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Jade Lizard", sentiment: "Bullish", color: "bg-green-500", embedId: "dQw4w9WgXcQ" },
    { name: "Reverse Jade Lizard", sentiment: "Bearish", color: "bg-red-500", embedId: "dQw4w9WgXcQ" },
    { name: "Strip", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Strap", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Calls Condor", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Calls Condor", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Long Puts Condor", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Short Puts Condor", sentiment: "Neutral", color: "bg-blue-500", embedId: "dQw4w9WgXcQ" },
    { name: "Synthetic Long Underlying", sentiment: "Bullish", color: "bg-green-500", embedId: "dQw4w9WgXcQ" },
    { name: "Synthetic Short Underlying", sentiment: "Bearish", color: "bg-red-500", embedId: "dQw4w9WgXcQ" }
  ];

  // Merge custom training plans with default strategies
  const allStrategies = defaultStrategies.map(defaultStrategy => {
    const customPlan = trainingPlans.find(plan => plan.strategy === defaultStrategy.name);
    if (customPlan) {
      return {
        ...defaultStrategy,
        ...customPlan,
        color: defaultStrategy.color, // Keep default color for consistency
        hasCustomContent: true
      };
    }
    return { ...defaultStrategy, hasCustomContent: false };
  });

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Bullish':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'Bearish':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'Neutral':
        return <Minus className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1].split('?')[0];
    }
    return url;
  };

  const openVideoModal = (strategy) => {
    setSelectedVideo(strategy);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Options Trading Training Room</h1>
              <p className="text-gray-300 mt-1">Master advanced options strategies with our comprehensive video library</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allStrategies.map((strategy, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
            >
              {/* Custom Content Badge */}
              {strategy.hasCustomContent && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-1 rounded-full text-white text-xs font-medium shadow-lg">
                    Custom
                  </div>
                </div>
              )}

              {/* Card Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
              
              {/* Sentiment Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`${strategy.color} px-3 py-1 rounded-full flex items-center space-x-1 text-white text-xs font-medium shadow-lg`}>
                  {getSentimentIcon(strategy.sentiment)}
                  <span>{strategy.sentiment}</span>
                </div>
              </div>

              {/* Video Thumbnail Area */}
              <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10"></div>
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <div className="text-gray-300 text-sm font-medium opacity-80">
                    Strategy Tutorial
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 relative z-10">
                <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                  How to Set Up a {strategy.name}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {strategy.summary || `Learn the step-by-step process for implementing this ${strategy.sentiment.toLowerCase()} options strategy effectively.`}
                </p>

                {/* Sponsor Information */}
                {strategy.sponsor && (
                  <div className="mb-4 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Sponsored by:</span>
                      <a 
                        href={strategy.sponsorUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-xs hover:text-blue-300 flex items-center space-x-1"
                      >
                        <span>{strategy.sponsor}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => openVideoModal(strategy)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group-hover:shadow-blue-500/25"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Video</span>
                </button>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 rounded-2xl"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl overflow-hidden max-w-4xl w-full border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  How to Set Up a {selectedVideo.name}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  {getSentimentIcon(selectedVideo.sentiment)}
                  <span className="text-gray-300 text-sm">{selectedVideo.sentiment} Strategy</span>
                  {selectedVideo.hasCustomContent && (
                    <span className="bg-emerald-500 px-2 py-1 rounded-full text-white text-xs">Custom Content</span>
                  )}
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-black">
              <iframe
                src={selectedVideo.videoSrc ? 
                  `https://www.youtube.com/embed/${extractVideoId(selectedVideo.videoSrc)}?autoplay=1&rel=0` :
                  `https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1&rel=0`
                }
                title={`How to Set Up a ${selectedVideo.name}`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-800/50">
              <p className="text-gray-300 text-sm">
                {selectedVideo.description || 
                 `Master the ${selectedVideo.name} strategy with this comprehensive tutorial covering setup, risk management, and profit optimization.`}
              </p>
              {selectedVideo.sponsor && (
                <div className="flex items-center justify-between mt-4 p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-400 text-sm">This video is sponsored by:</span>
                  <a 
                    href={selectedVideo.sponsorUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                  >
                    <span>{selectedVideo.sponsor}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingRoom;
