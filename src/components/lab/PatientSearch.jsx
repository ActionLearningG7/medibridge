/**
 * PatientSearch Component
 * Search and select patient for doctor lab order booking
 */

import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Input, Button, Card } from '../../ui';

export const PatientSearch = ({
  onPatientSelect,
  isLoading,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_GATEWAY_BASE_URL}/patients/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Patient search error:', err);
      setError('Failed to search patients');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient) => {
    onPatientSelect(patient);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <Card>
      <div className="p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg">Select Patient</h3>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {searchResults.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
              >
                <p className="font-medium text-gray-900">{patient.fullName}</p>
                <p className="text-sm text-gray-600">{patient.email}</p>
                <p className="text-sm text-gray-500">{patient.phone}</p>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {searchQuery && searchResults.length === 0 && !isSearching && !error && (
          <p className="text-center py-8 text-gray-500">
            {searchQuery.length < 2
              ? 'Type at least 2 characters to search'
              : 'No patients found'}
          </p>
        )}

        {/* Loading */}
        {isSearching && (
          <p className="text-center py-4 text-gray-500">
            Searching...
          </p>
        )}

        {/* Help text */}
        <p className="text-xs text-gray-500 mt-4">
          Search patients by name, email, or phone number
        </p>
      </div>
    </Card>
  );
};
