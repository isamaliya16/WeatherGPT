import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Check, Compass, Building, Trees, Waves, Mountain } from 'lucide-react';
import { LocationPreset } from '../types';
import { INDIA_LOCATIONS } from '../data/indiaLocations';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationPreset;
  onSelectLocation: (loc: LocationPreset) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationPreset[]>(INDIA_LOCATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(INDIA_LOCATIONS);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/locations/search?query=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.warn('Geocoding search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const popularIndianHubs = [
    'Ahmedabad',
    'Rajkot',
    'Surat',
    'Vadodara',
    'Morbi',
    'Mumbai',
    'Delhi',
    'Bengaluru',
    'Chennai',
    'Kolkata',
    'Jaipur',
    'Shimla'
  ];

  const getRegionIcon = (regionType: string) => {
    switch (regionType) {
      case 'Coastal / Fishery':
        return <Waves className="w-4 h-4 text-sky-600" />;
      case 'Hilly / Flood Prone':
        return <Mountain className="w-4 h-4 text-purple-600" />;
      case 'Urban Metropolis':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'Agricultural Hub':
      default:
        return <Trees className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="location-picker-modal"
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                Select Indian Location
              </h2>
              <p className="text-xs text-slate-500">
                Search states, districts, cities, towns, and villages across India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type any city, town or village (e.g., Valsad, Morbi, Shimla, Varanasi)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Hub Badges */}
          {!query && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-600 mr-1">Quick Select:</span>
              {popularIndianHubs.map(hub => (
                <button
                  key={hub}
                  onClick={() => setQuery(hub)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                >
                  {hub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-50">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Querying dynamic India geocoding database...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <p className="font-medium text-slate-700">No locations found for "{query}"</p>
              <p className="text-xs text-slate-600 mt-1">Try searching by district or state name</p>
            </div>
          ) : (
            results.map(loc => {
              const isSelected =
                currentLocation.city.toLowerCase() === loc.city.toLowerCase() &&
                currentLocation.state.toLowerCase() === loc.state.toLowerCase();
              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                      : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200/80">
                      {getRegionIcon(loc.region_type)}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{loc.city}</span>
                        <span className="text-xs text-slate-500">
                          {loc.district && loc.district !== loc.city ? `${loc.district}, ` : ''}
                          {loc.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="font-medium text-emerald-700">{loc.region_type}</span>
                        <span>•</span>
                        <span>
                          {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                        </span>
                        {loc.primary_crops && loc.primary_crops.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="truncate">Crops: {loc.primary_crops.slice(0, 2).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 font-medium shrink-0 group-hover:text-emerald-600">
                      Select
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-600">
            Powered by IMD Synoptic Stations & Open-Meteo High-Resolution Geospatial Models
          </p>
        </div>
      </div>
    </div>
  );
};
