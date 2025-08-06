
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SearchResult } from '../../../server/src/schema';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  results: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
  isLoading: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  results,
  onResultSelect,
  isLoading
}: SearchBarProps) {
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Trigger search with debounce
    if (newValue.trim()) {
      onSearch(newValue);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
      setShowResults(true);
    }
  };

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
    setShowResults(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="Search for places..."
            className="bg-white shadow-lg pl-10 pr-4 py-2 rounded-full border-0 focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6"
          disabled={isLoading}
        >
          Search
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border max-h-80 overflow-y-auto z-50">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="text-gray-400 mt-0.5">
                  📍
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.display_name}
                  </p>
                  {result.address && (
                    <p className="text-xs text-gray-500 truncate">
                      {result.address}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-400">
                      {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                    </span>
                    {result.place_type && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {result.place_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && results.length === 0 && !isLoading && value.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border p-4 text-center text-gray-500 z-50">
          No places found for "{value}"
        </div>
      )}
    </div>
  );
}
