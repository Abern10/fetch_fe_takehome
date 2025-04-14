// src/components/Pagination.tsx

"use client";

import React from 'react';

interface PaginationProps {
  totalResults: number;
  resultsPerPage: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  brandColors: {
    purple: string;
    orange: string;
  };
}

const Pagination: React.FC<PaginationProps> = ({
  totalResults,
  resultsPerPage,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  brandColors,
}) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Show up to 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max to display, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of displayed page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range if near start or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis1');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis2');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1 mt-6">
      {/* Previous button */}
      <button
        onClick={onPreviousPage}
        disabled={!hasPreviousPage}
        className={`px-2 py-2 rounded-md flex items-center ${hasPreviousPage
            ? 'text-gray-700 hover:bg-gray-200'
            : 'text-gray-400 cursor-not-allowed'
          }`}
        aria-label="Previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers */}
      <div className="hidden sm:flex space-x-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === 'ellipsis1' || page === 'ellipsis2' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`w-10 h-10 rounded-md flex items-center justify-center ${currentPage === page
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`}
                style={{
                  backgroundColor: currentPage === page ? brandColors.purple : 'transparent',
                }}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile page indicator */}
      <span className="sm:hidden px-3 py-2 text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next button */}
      <button
        onClick={onNextPage}
        disabled={!hasNextPage}
        className={`px-2 py-2 rounded-md flex items-center ${hasNextPage
            ? 'text-gray-700 hover:bg-gray-200'
            : 'text-gray-400 cursor-not-allowed'
          }`}
        aria-label="Next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;