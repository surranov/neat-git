import React, { useState, useCallback } from 'react';
import { CommitLogFilters } from '../../types/ui.types';

interface CommitFiltersProps {
  filters: CommitLogFilters;
  onFiltersChange: (filters: CommitLogFilters) => void;
}

/**
 * Commit filters component
 */
export const CommitFilters: React.FC<CommitFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [localFilters, setLocalFilters] = useState<CommitLogFilters>(filters);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, text: event.target.value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleAuthorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, author: event.target.value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleBranchChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...localFilters };
    if (event.target.value) {
      newFilters.branch = event.target.value;
    } else {
      delete newFilters.branch;
    }
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: CommitLogFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  return (
    <div className="commit-filters">
      <div className="filter-group">
        <label htmlFor="text-filter">Search:</label>
        <input
          id="text-filter"
          type="text"
          value={localFilters.text || ''}
          onChange={handleTextChange}
          placeholder="Search commits..."
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="author-filter">Author:</label>
        <input
          id="author-filter"
          type="text"
          value={localFilters.author || ''}
          onChange={handleAuthorChange}
          placeholder="Filter by author..."
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="branch-filter">Branch:</label>
        <select
          id="branch-filter"
          value={localFilters.branch || ''}
          onChange={handleBranchChange}
          className="filter-select"
        >
          <option value="">All branches</option>
          <option value="main">main</option>
          <option value="master">master</option>
          <option value="develop">develop</option>
        </select>
      </div>

      <div className="filter-actions">
        <button
          type="button"
          onClick={handleClearFilters}
          className="clear-filters-button"
          disabled={!localFilters.text && !localFilters.author && !localFilters.branch}
        >
          Clear
        </button>
      </div>
    </div>
  );
}; 