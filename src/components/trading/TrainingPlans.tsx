import { useState } from 'react';
import { Play, X, TrendingUp, TrendingDown, Minus, Plus, Save, Edit, Trash2, ExternalLink } from 'lucide-react';

// Training Plans Admin Component
const TrainingPlans = ({ onAddTrainingPlan, onUpdateTrainingPlan, onDeleteTrainingPlan, trainingPlans }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    strategy: '',
    videoSrc: '',
    summary: '',
    sponsor: '',
    sponsorUrl: '',
    description: ''
  });

  const tradingStrategies = [
    { name: "Long Call", sentiment: "Bullish" },
    { name: "Short Call", sentiment: "Bearish" },
    { name: "Long Put", sentiment: "Bearish" },
    { name: "Short Put", sentiment: "Bullish" },
    { name: "Bull Call Spread", sentiment: "Bullish" },
    { name: "Bear Call Spread", sentiment: "Bearish" },
    { name: "Bear Put Spread", sentiment: "Bearish" },
    { name: "Bull Put Spread", sentiment: "Bullish" },
    { name: "Long Straddle", sentiment: "Neutral" },
    { name: "Short Straddle", sentiment: "Neutral" },
    { name: "Long Strangle", sentiment: "Neutral" },
    { name: "Short Strangle", sentiment: "Neutral" },
    { name: "Long Iron Butterfly", sentiment: "Neutral" },
    { name: "Short Iron Butterfly", sentiment: "Neutral" },
    { name: "Long Calls Butterfly", sentiment: "Neutral" },
    { name: "Short Calls Butterfly", sentiment: "Neutral" },
    { name: "Long Puts Butterfly", sentiment: "Neutral" },
    { name: "Short Puts Butterfly", sentiment: "Neutral" },
    { name: "Long Iron Condor", sentiment: "Neutral" },
    { name: "Short Iron Condor", sentiment: "Neutral" },
    { name: "Jade Lizard", sentiment: "Bullish" },
    { name: "Reverse Jade Lizard", sentiment: "Bearish" },
    { name: "Strip", sentiment: "Neutral" },
    { name: "Strap", sentiment: "Neutral" },
    { name: "Long Calls Condor", sentiment: "Neutral" },
    { name: "Short Calls Condor", sentiment: "Neutral" },
    { name: "Long Puts Condor", sentiment: "Neutral" },
    { name: "Short Puts Condor", sentiment: "Neutral" },
    { name: "Synthetic Long Underlying", sentiment: "Bullish" },
    { name: "Synthetic Short Underlying", sentiment: "Bearish" }
  ];

  const resetForm = () => {
    setFormData({
      strategy: '',
      videoSrc: '',
      summary: '',
      sponsor: '',
      sponsorUrl: '',
      description: ''
    });
    setEditingPlan(null);
  };

  const openForm = (plan = null) => {
    if (plan) {
      setFormData(plan);
      setEditingPlan(plan);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.strategy || !formData.videoSrc || !formData.summary) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedStrategy = tradingStrategies.find(s => s.name === formData.strategy);
    const planData = {
      ...formData,
      sentiment: selectedStrategy?.sentiment || 'Neutral',
      id: editingPlan?.id || Date.now(),
      createdAt: editingPlan?.createdAt || new Date().toISOString()
    };

    if (editingPlan) {
      onUpdateTrainingPlan(planData);
    } else {
      onAddTrainingPlan(planData);
    }

    closeForm();
  };

  const handleDelete = (planId) => {
    if (window.confirm('Are you sure you want to delete this training plan?')) {
      onDeleteTrainingPlan(planId);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Training Plans Management</h2>
          <p className="text-gray-400 mt-1">Manage video content for the training room</p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Training Plan</span>
        </button>
      </div>

      {/* Training Plans List */}
      <div className="space-y-4 mb-6">
        {trainingPlans.map((plan) => (
          <div key={plan.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold">How to Set Up a {plan.strategy}</h3>
                <p className="text-gray-400 text-sm mt-1">{plan.summary}</p>
                {plan.sponsor && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">Sponsored by:</span>
                    <a 
                      href={plan.sponsorUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 text-xs hover:text-blue-300 flex items-center space-x-1"
                    >
                      <span>{plan.sponsor}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openForm(plan)}
                  className="text-gray-400 hover:text-blue-400 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-gray-400 hover:text-red-400 p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl overflow-hidden max-w-2xl w-full border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {editingPlan ? 'Edit Training Plan' : 'Add New Training Plan'}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Strategy Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trading Strategy *
                </label>
                <select
                  name="strategy"
                  value={formData.strategy}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a strategy...</option>
                  {tradingStrategies.map((strategy) => (
                    <option key={strategy.name} value={strategy.name}>
                      {strategy.name} ({strategy.sentiment})
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Source */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video Source URL *
                </label>
                <input
                  type="url"
                  name="videoSrc"
                  value={formData.videoSrc}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=... or embed URL"
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video Summary *
                </label>
                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="Brief description of the video content"
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sponsor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recommended Video Sponsor
                </label>
                <input
                  type="text"
                  name="sponsor"
                  value={formData.sponsor}
                  onChange={handleInputChange}
                  placeholder="Sponsor name (optional)"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sponsor URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sponsor URL (Affiliate Link)
                </label>
                <input
                  type="url"
                  name="sponsorUrl"
                  value={formData.sponsorUrl}
                  onChange={handleInputChange}
                  placeholder="https://sponsor-website.com/affiliate-link"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description (max 300 characters)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={300}
                  rows={3}
                  placeholder="Detailed description of the strategy and video content..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.description.length}/300 characters
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPlan ? 'Update Plan' : 'Save Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Updated Training Room Component
const TrainingRoom = ({ trainingPlans = [] }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

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
        color: defaultStrategy.color,
        hasCustomContent: true
      };
    }
    return defaultStrategy;
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

// Demo AdminDashboard Component
const AdminDashboard = () => {
  const [trainingPlans, setTrainingPlans] = useState([]);

  const handleAddTrainingPlan = (planData) => {
    setTrainingPlans(prev => [...prev, planData]);
  };

  const handleUpdateTrainingPlan = (planData) => {
    setTrainingPlans(prev => prev.map(plan => 
      plan.id === planData.id ? planData : plan
    ));
  };

  const handleDeleteTrainingPlan = (planId) => {
    setTrainingPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Training Plans Management */}
          <div className="xl:col-span-2">
            <TrainingPlans
              trainingPlans={trainingPlans}
              onAddTrainingPlan={handleAddTrainingPlan}
              onUpdateTrainingPlan={handleUpdateTrainingPlan}
              onDeleteTrainingPlan={handleDeleteTrainingPlan}
            />
          </div>
          
          {/* Training Room Preview */}
          <div className="xl:col-span-2">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Training Room Preview</h2>
                  <p className="text-gray-400 mt-1">Preview how your training plans appear to users</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 max-h-96 overflow-y-auto">
                <TrainingRoom trainingPlans={trainingPlans} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('training');

  return (
    <div className="App">
      {/* Navigation */}
      <div className="bg-black/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Options Training Platform</h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('training')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'training'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Training Room
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'training' ? <TrainingRoom /> : <AdminDashboard />}
    </div>
  );
};

export default TrainingPlans;
