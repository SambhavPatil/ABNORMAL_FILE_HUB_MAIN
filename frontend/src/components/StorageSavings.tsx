import React, { useState, useEffect } from 'react';
import fileService, { TotalSavingsType } from '../services/fileService';

const StorageSavings: React.FC = () => {
  const [savings, setSavings] = useState<TotalSavingsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        setLoading(true);
        const data = await fileService.getTotalSavings();
        setSavings(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching storage savings:', err);
        setError('Failed to load storage savings data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();
    
    // Refresh savings data every 60 seconds
    const interval = setInterval(fetchSavings, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Storage Savings</h2>
      
      {loading ? (
        <div className="py-4 text-center">
          <p className="text-gray-500">Loading data...</p>
        </div>
      ) : error ? (
        <div className="py-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : savings ? (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Space Saved</span>
              <span className="text-green-600 font-bold">{savings.human_bytes_saved}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: savings.bytes_saved > 0 ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Files Deduplicated</p>
                <p className="text-xl font-bold mt-1">{savings.file_count}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Efficiency</p>
                <p className="text-xl font-bold mt-1 text-green-600">
                  {savings.file_count > 0 ? '100%' : '0%'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="text-blue-800 font-medium mb-1">How it works</h3>
              <p className="text-blue-700 text-sm">
                Our system detects duplicate files and stores them only once, saving storage space while maintaining all your references.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-gray-500">No savings data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default StorageSavings;