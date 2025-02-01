import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FiSearch } from "react-icons/fi";
import { Music, Video, FileText, Gamepad2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: number;
  title: string;
  type: 'music' | 'video' | 'document' | 'game';
  artist?: string;
  file_path?: string;
  url?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "Search your content..." }: SearchBarProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching search results for:', query);
        const response = await fetch(
          `http://localhost:8888/backend/api/search.php?query=${encodeURIComponent(query)}`,
          {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        console.log('Search response status:', response.status);
        const data = await response.json();
        console.log('Search response data:', data);
        
        if (data.status === 'success') {
          setResults(data.data);
          setShowDropdown(true);
        } else {
          console.error('Search failed:', data.message);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      if (query.trim()) {
        fetchSearchResults();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setQuery('');
    setShowDropdown(false);
    setResults([]);

    // Navigate based on content type
    switch (result.type) {
      case 'music':
        navigate('/music', { state: { selectedId: result.id } });
        break;
      case 'video':
        navigate('/videos', { state: { selectedId: result.id } });
        break;
      case 'document':
        navigate('/documents', { state: { selectedId: result.id } });
        break;
      case 'game':
        navigate('/games', { state: { selectedId: result.id } });
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'music':
        return <Music className="h-4 w-4 text-muted-foreground" />;
      case 'video':
        return <Video className="h-4 w-4 text-muted-foreground" />;
      case 'document':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'game':
        return <Gamepad2 className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            const newQuery = e.target.value;
            console.log('Search query changed:', newQuery);
            setQuery(newQuery);
            onSearch(newQuery);
          }}
          placeholder={placeholder}
          className="pl-10 pr-4 w-full"
        />
      </div>

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ScrollArea className="max-h-[300px]">
            <div className="py-1">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                >
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    {result.artist && (
                      <p className="text-sm text-gray-500 truncate">by {result.artist}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 