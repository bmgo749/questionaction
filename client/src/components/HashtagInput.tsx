import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hash, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface HashtagInputProps {
  hashtags: string[];
  onChange: (hashtags: string[]) => void;
  isNsfw?: boolean;
  showSuggestions?: boolean;
  placeholder?: string;
}

const defaultHashtags = ['#pagefeed', '#queit-discuss'];
const nsfwHashtags = ['#nsfw', '#notsafe'];

export function HashtagInput({ 
  hashtags, 
  onChange, 
  isNsfw = false, 
  showSuggestions = true,
  placeholder = "Add hashtags..."
}: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionBox, setShowSuggestionBox] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch popular hashtags for autocomplete
  const { data: popularHashtagData = [] } = useQuery({
    queryKey: ['/api/hashtags/popular', { hideNsfw: !isNsfw }],
    queryFn: async () => {
      const response = await fetch(`/api/hashtags/popular?hideNsfw=${!isNsfw}`);
      if (!response.ok) throw new Error('Failed to fetch hashtags');
      return response.json() as { hashtag: string; count: number }[];
    },
  });

  // Extract hashtag strings from the data
  const popularHashtags = popularHashtagData.map(item => item.hashtag);

  useEffect(() => {
    // Add default hashtags when component mounts
    if (hashtags.length === 0) {
      const initialHashtags = [...defaultHashtags];
      if (isNsfw) {
        initialHashtags.push(...nsfwHashtags);
      }
      onChange(initialHashtags);
    }
  }, [hashtags.length, isNsfw, onChange]);

  useEffect(() => {
    if (inputValue.startsWith('#') && inputValue.length > 1) {
      const searchTerm = inputValue.toLowerCase();
      const filtered = popularHashtags
        .filter(tag => tag.toLowerCase().includes(searchTerm))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestionBox(true);
    } else if (inputValue === '#') {
      // Show top 3 trending hashtags when user types just #
      setSuggestions(popularHashtags.slice(0, 3));
      setShowSuggestionBox(true);
    } else {
      setShowSuggestionBox(false);
    }
  }, [inputValue]);

  const addHashtag = (tag: string) => {
    if (!tag.startsWith('#')) {
      tag = '#' + tag;
    }
    
    if (!hashtags.includes(tag) && hashtags.length < 10) {
      onChange([...hashtags, tag]);
    }
    setInputValue('');
    setShowSuggestionBox(false);
    inputRef.current?.focus();
  };

  const removeHashtag = (tagToRemove: string) => {
    // Don't allow removing default hashtags
    if (defaultHashtags.includes(tagToRemove) || 
        (isNsfw && nsfwHashtags.includes(tagToRemove))) {
      return;
    }
    onChange(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addHashtag(inputValue.trim());
    } else if (e.key === 'Escape') {
      setShowSuggestionBox(false);
    }
  };

  const isDefaultHashtag = (tag: string) => {
    return defaultHashtags.includes(tag) || 
           (isNsfw && nsfwHashtags.includes(tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {hashtags.map((tag, index) => (
          <Badge 
            key={index} 
            variant={isDefaultHashtag(tag) ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            <Hash className="h-3 w-3" />
            {tag.replace('#', '')}
            {!isDefaultHashtag(tag) && (
              <button
                type="button"
                onClick={() => removeHashtag(tag)}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10"
        />
        <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

        {showSuggestionBox && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addHashtag(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md"
              >
                <span className="text-blue-600 dark:text-blue-400">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Type # to see suggestions. Default hashtags cannot be removed.
      </p>
    </div>
  );
}