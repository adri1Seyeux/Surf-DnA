'use client';

import { useState, useEffect } from 'react';
import { surfData } from '@/lib/data/surf-data';
import SurfSpotResults from './SurfSpotResults';

interface SurfSpot {
  name: string;
  description: string;
  bestFor: string[];
}

const SurfSpotFinder = () => {
  const [location, setLocation] = useState({
    country: '',
    region: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [surfSpots, setSurfSpots] = useState<SurfSpot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    const payload = {
      country: surfData.find(c => c.id === location.country)?.name,
      region: surfData.find(c => c.id === location.country)?.regions.find(r => r.id === location.region)?.name,
      searchMode: 'region',
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch recommendations: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.surfSpots || !Array.isArray(data.surfSpots)) {
        throw new Error('Invalid response format');
      }

      setSurfSpots(data.surfSpots);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setSurfSpots([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <select
            value={location.country}
            onChange={(e) => setLocation({ ...location, country: e.target.value, region: '' })}
            className="w-full p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Country</option>
            {surfData.map((country) => (
              <option 
                key={country.id} 
                value={country.id}
                disabled={country.disabled}
                className={country.disabled ? 'text-gray-400' : ''}
              >
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Region Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Region</label>
          <select
            value={location.region}
            onChange={(e) => setLocation({ ...location, region: e.target.value })}
            className="w-full p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
            disabled={!location.country}
          >
            <option value="">Select Region</option>
            {location.country && 
              surfData
                .find(c => c.id === location.country)
                ?.regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))
            }
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!location.country}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                  disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Finding Spots...' : 'Find Surf Spots'}
      </button>

      <div className="relative">
        <SurfSpotResults spots={surfSpots} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default SurfSpotFinder;

