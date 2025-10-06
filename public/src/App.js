import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Globe, MapPin, TrendingUp, Users, MessageSquare, ThumbsUp, Search, Filter, Plus, BarChart3, Activity, ZoomIn, ZoomOut, Home, Sparkles, Send } from 'lucide-react';
import * as d3 from 'd3';

const GlobalGovernancePlatform = () => {
  const [activeView, setActiveView] = useState('map');
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponses, setAiResponses] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const bubbleChartRef = useRef(null);
  const networkChartRef = useRef(null);

  const wishes = [
    { id: 1, title: "Clean Energy Initiative", description: "Transition buildings to solar", author: "Sarah Chen", location: { region: 'Australia', city: 'Melbourne', lat: -37.8136, lng: 144.9631 }, category: 'environment', votes: 1247, solutions: 8, comments: 34, created: '2025-09-15', momentum: 85 },
    { id: 2, title: "Global Education Platform", description: "Free digital education resources", author: "Marcus Johnson", location: { region: 'Global', city: 'Multiple', lat: 20, lng: 0 }, category: 'education', votes: 3891, solutions: 23, comments: 156, created: '2025-09-10', momentum: 95 },
    { id: 3, title: "Urban Green Spaces", description: "Parks across London boroughs", author: "Emma Wilson", location: { region: 'UK', city: 'London', lat: 51.5074, lng: -0.1278 }, category: 'environment', votes: 892, solutions: 12, comments: 45, created: '2025-09-20', momentum: 72 },
    { id: 4, title: "Health Monitoring", description: "Real-time health tracking", author: "Carlos Rodriguez", location: { region: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 }, category: 'healthcare', votes: 654, solutions: 7, comments: 28, created: '2025-09-18', momentum: 65 },
    { id: 5, title: "Water Management", description: "Collaborative water resources", author: "Amara Okonkwo", location: { region: 'East Africa', city: 'Multiple', lat: -1.2921, lng: 36.8219 }, category: 'infrastructure', votes: 2134, solutions: 15, comments: 89, created: '2025-09-12', momentum: 88 },
    { id: 6, title: "Smart Traffic", description: "AI traffic optimization", author: "Jennifer Lee", location: { region: 'USA', city: 'New York', lat: 40.7128, lng: -74.0060 }, category: 'infrastructure', votes: 1823, solutions: 19, comments: 67, created: '2025-09-14', momentum: 80 },
    { id: 7, title: "Food Gardens", description: "Urban farming spaces", author: "Yuki Tanaka", location: { region: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 }, category: 'environment', votes: 945, solutions: 11, comments: 38, created: '2025-09-16', momentum: 70 },
    { id: 8, title: "Legal Aid Platform", description: "Pro bono legal services", author: "Priya Sharma", location: { region: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 }, category: 'education', votes: 2156, solutions: 14, comments: 92, created: '2025-09-11', momentum: 90 }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: Filter },
    { id: 'environment', name: 'Environment', icon: Globe },
    { id: 'education', name: 'Education', icon: Users },
    { id: 'healthcare', name: 'Healthcare', icon: TrendingUp },
    { id: 'infrastructure', name: 'Infrastructure', icon: MapPin }
  ];

  const regions = ['global', 'Australia', 'UK', 'Brazil', 'East Africa', 'USA', 'Japan', 'India'];

  const filteredWishes = useMemo(() => {
    return wishes.filter(wish => {
      const matchesCategory = selectedCategory === 'all' || wish.category === selectedCategory;
      const matchesRegion = selectedRegion === 'global' || wish.location.region === selectedRegion;
      const matchesSearch = searchQuery === '' || 
        wish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wish.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [wishes, selectedCategory, selectedRegion, searchQuery]);

  const stats = useMemo(() => ({
    totalWishes: wishes.length,
    totalVotes: wishes.reduce((sum, w) => sum + w.votes, 0),
    totalSolutions: wishes.reduce((sum, w) => sum + w.solutions, 0),
    activeUsers: 12847
  }), [wishes]);

  const getCategoryColor = (category) => {
    const colors = { environment: '#10b981', education: '#3b82f6', healthcare: '#ef4444', infrastructure: '#8b5cf6' };
    return colors[category] || '#6b7280';
  };

  const analyzeWithAI = (query) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      let response = {};
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('most votes') || lowerQuery.includes('highest votes')) {
        const topWish = wishes.reduce((max, w) => w.votes > max.votes ? w : max);
        response = { query, answer: `"${topWish.title}" has the most votes with ${topWish.votes.toLocaleString()} votes. This ${topWish.category} initiative in ${topWish.location.city} has ${topWish.momentum}% momentum and ${topWish.solutions} solutions.` };
      } else if (lowerQuery.includes('category') && (lowerQuery.includes('lead') || lowerQuery.includes('top'))) {
        const categoryTotals = categories.filter(c => c.id !== 'all').map(cat => ({
          name: cat.name,
          votes: wishes.filter(w => w.category === cat.id).reduce((sum, w) => sum + w.votes, 0)
        })).sort((a, b) => b.votes - a.votes);
        response = { query, answer: `${categoryTotals[0].name} leads with ${categoryTotals[0].votes.toLocaleString()} votes, followed by ${categoryTotals[1].name} (${categoryTotals[1].votes.toLocaleString()}) and ${categoryTotals[2].name} (${categoryTotals[2].votes.toLocaleString()}).` };
      } else if (lowerQuery.includes('trend') || lowerQuery.includes('momentum')) {
        const highMomentum = wishes.filter(w => w.momentum >= 80).sort((a, b) => b.momentum - a.momentum);
        response = { query, answer: `${highMomentum.length} wishes have high momentum (≥80%). Top: "${highMomentum[0].title}" with ${highMomentum[0].momentum}% momentum and ${highMomentum[0].votes} votes.` };
      } else if (lowerQuery.includes('region')) {
        const regionStats = {};
        wishes.forEach(w => {
          if (!regionStats[w.location.region]) regionStats[w.location.region] = { votes: 0, count: 0 };
          regionStats[w.location.region].votes += w.votes;
          regionStats[w.location.region].count += 1;
        });
        const topRegion = Object.entries(regionStats).sort((a, b) => b[1].votes - a[1].votes)[0];
        response = { query, answer: `${topRegion[0]} leads with ${topRegion[1].votes.toLocaleString()} votes across ${topRegion[1].count} wishes.` };
      } else {
        response = { query, answer: `We have ${stats.totalWishes} wishes with ${stats.totalVotes.toLocaleString()} total votes. Try: "which category leads?" or "what's trending?"` };
      }
      setAiResponses(prev => [response, ...prev]);
      setIsAnalyzing(false);
      setAiQuery('');
    }, 1500);
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (aiQuery.trim()) analyzeWithAI(aiQuery);
  };

  useEffect(() => {
    if (activeView !== 'analytics' || !bubbleChartRef.current) return;
    const container = bubbleChartRef.current;
    container.innerHTML = '';
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
    const xScale = d3.scaleLinear().domain([0, d3.max(filteredWishes, d => d.votes) * 1.1]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, d3.max(filteredWishes, d => d.solutions) * 1.1]).range([height - margin.bottom, margin.top]);
    const sizeScale = d3.scaleSqrt().domain([0, d3.max(filteredWishes, d => d.comments)]).range([8, 40]);
    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(xScale)).style('font-size', '11px');
    svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(yScale)).style('font-size', '11px');
    svg.append('text').attr('x', width / 2).attr('y', 20).style('text-anchor', 'middle').style('font-size', '14px').style('font-weight', '700').text('Engagement Analysis');
    svg.selectAll('.bubble').data(filteredWishes).enter().append('circle').attr('cx', d => xScale(d.votes)).attr('cy', d => yScale(d.solutions)).attr('r', 0).style('fill', d => getCategoryColor(d.category)).style('opacity', 0.7).style('stroke', 'white').style('stroke-width', 2).transition().duration(800).delay((d, i) => i * 80).attr('r', d => sizeScale(d.comments));
  }, [activeView, filteredWishes]);

  useEffect(() => {
    if (activeView !== 'analytics' || !networkChartRef.current) return;
    const container = networkChartRef.current;
    container.innerHTML = '';
    const width = container.clientWidth;
    const height = 350;
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
    const categoryData = categories.filter(c => c.id !== 'all').map(cat => ({
      id: cat.id,
      name: cat.name,
      votes: wishes.filter(w => w.category === cat.id).reduce((sum, w) => sum + w.votes, 0)
    }));
    const radiusScale = d3.scaleSqrt().domain([0, d3.max(categoryData, d => d.votes)]).range([35, 75]);
    const simulation = d3.forceSimulation(categoryData).force('charge', d3.forceManyBody().strength(60)).force('center', d3.forceCenter(width / 2, height / 2)).force('collision', d3.forceCollide().radius(d => radiusScale(d.votes) + 12));
    const nodes = svg.selectAll('.node').data(categoryData).enter().append('g');
    nodes.append('circle').attr('r', d => radiusScale(d.votes)).style('fill', d => getCategoryColor(d.id)).style('opacity', 0.85).style('stroke', 'white').style('stroke-width', 3);
    nodes.append('text').attr('text-anchor', 'middle').attr('dy', 4).style('font-size', '12px').style('font-weight', '700').style('fill', 'white').text(d => d.name);
    simulation.on('tick', () => { nodes.attr('transform', d => `translate(${d.x},${d.y})`); });
  }, [activeView]);

  useEffect(() => {
    if (activeView !== 'map' || !mapRef.current || mapInstanceRef.current) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.async = true;
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, { center: [20, 0], zoom: 2, minZoom: 2, maxZoom: 18 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      mapInstanceRef.current = map;
      updateMarkers(L, map);
    };
    document.head.appendChild(script);
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeView]);

  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      updateMarkers(window.L, mapInstanceRef.current);
    }
  }, [filteredWishes]);

  const updateMarkers = (L, map) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    filteredWishes.forEach(wish => {
      const color = getCategoryColor(wish.category);
      const size = Math.min(10 + (wish.votes / 200), 30);
      const icon = L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });
      const marker = L.marker([wish.location.lat, wish.location.lng], { icon }).addTo(map).bindPopup(`<strong>${wish.title}</strong><br>${wish.location.city}<br>${wish.votes} votes`);
      markersRef.current.push(marker);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Global Governance</h1>
                <p className="text-xs text-gray-500">Democratic Solutions at Scale</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Wish</span>
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div><div className="text-2xl font-bold text-blue-600">{stats.totalWishes}</div><div className="text-xs text-gray-600">Active Wishes</div></div>
            <div><div className="text-2xl font-bold text-purple-600">{stats.totalVotes.toLocaleString()}</div><div className="text-xs text-gray-600">Total Votes</div></div>
            <div><div className="text-2xl font-bold text-green-600">{stats.totalSolutions}</div><div className="text-xs text-gray-600">Solutions</div></div>
            <div><div className="text-2xl font-bold text-indigo-600">{stats.activeUsers.toLocaleString()}</div><div className="text-xs text-gray-600">Citizens</div></div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-6">
            <button onClick={() => setActiveView('map')} className={`px-4 py-3 border-b-2 text-sm ${activeView === 'map' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'}`}>
              <MapPin className="w-4 h-4 inline mr-2" />Map
            </button>
            <button onClick={() => setActiveView('list')} className={`px-4 py-3 border-b-2 text-sm ${activeView === 'list' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'}`}>
              <TrendingUp className="w-4 h-4 inline mr-2" />Trending
            </button>
            <button onClick={() => setActiveView('analytics')} className={`px-4 py-3 border-b-2 text-sm ${activeView === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'}`}>
              <Activity className="w-4 h-4 inline mr-2" />Analytics
            </button>
            <button onClick={() => setActiveView('ai')} className={`px-4 py-3 border-b-2 text-sm ${activeView === 'ai' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'}`}>
              <Sparkles className="w-4 h-4 inline mr-2" />Ask AI
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h3 className="font-semibold mb-3 flex items-center"><Search className="w-4 h-4 mr-2" />Search</h3>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h3 className="font-semibold mb-3">Region</h3>
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                {regions.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center space-x-2 ${selectedCategory === cat.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <cat.icon className="w-4 h-4" /><span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-9">
            {activeView === 'map' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="bg-gray-50 border-b px-4 py-3 flex justify-between">
                  <span className="text-sm font-medium">World Map</span>
                  <div className="flex space-x-2">
                    <button onClick={() => mapInstanceRef.current?.zoomIn()} className="p-2 bg-white border rounded"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={() => mapInstanceRef.current?.zoomOut()} className="p-2 bg-white border rounded"><ZoomOut className="w-4 h-4" /></button>
                    <button onClick={() => mapInstanceRef.current?.setView([20, 0], 2)} className="p-2 bg-white border rounded"><Home className="w-4 h-4" /></button>
                  </div>
                </div>
                <div ref={mapRef} style={{ height: '600px' }} />
              </div>
            )}

            {activeView === 'list' && (
              <div className="space-y-4">
                {filteredWishes.map(wish => (
                  <div key={wish.id} className="bg-white rounded-lg shadow-sm p-6 border hover:shadow-md transition">
                    <div className="mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{wish.category}</span>
                      <span className="text-xs text-gray-500 ml-2">{wish.location.city}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{wish.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{wish.description}</p>
                    <div className="flex justify-between pt-4 border-t">
                      <div className="flex space-x-6">
                        <span className="flex items-center text-sm"><ThumbsUp className="w-4 h-4 mr-1" />{wish.votes}</span>
                        <span className="flex items-center text-sm"><MessageSquare className="w-4 h-4 mr-1" />{wish.solutions} solutions</span>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm">View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="font-semibold mb-2">Engagement Bubble Chart</h3>
                  <div ref={bubbleChartRef} style={{ minHeight: '400px' }} />
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="font-semibold mb-2">Category Network</h3>
                  <div ref={networkChartRef} style={{ minHeight: '350px' }} />
                </div>
              </div>
            )}

            {activeView === 'ai' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-6 h-6" />
                    <h2 className="text-lg font-bold">Ask AI About Governance Data</h2>
                  </div>
                  <form onSubmit={handleAiSubmit} className="flex gap-3">
                    <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} placeholder="Ask anything about the data..." className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none" disabled={isAnalyzing} />
                    <button type="submit" disabled={isAnalyzing || !aiQuery.trim()} className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 flex items-center space-x-2">
                      {isAnalyzing ? <><div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div><span>Analyzing...</span></> : <><Send className="w-4 h-4" /><span>Ask</span></>}
                    </button>
                  </form>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => setAiQuery("Which category has the most votes?")} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full">Category leader?</button>
                    <button onClick={() => setAiQuery("What are the trending wishes?")} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full">Trending</button>
                    <button onClick={() => setAiQuery("Compare all regions")} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full">Compare regions</button>
                  </div>
                </div>

                {aiResponses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                      AI Insights
                    </h3>
                    {aiResponses.map((response, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                        <div className="text-sm font-semibold text-purple-900 mb-2">Q: {response.query}</div>
                        <div className="text-sm text-gray-700">{response.answer}</div>
                      </div>
                    ))}
                  </div>
                )}

                {aiResponses.length === 0 && (
                  <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Ask me anything!</h3>
                    <p className="text-sm text-gray-600">Try questions like "Which category leads?" or "What's trending?"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalGovernancePlatform;
