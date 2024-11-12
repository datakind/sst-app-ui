import React from 'react';

export default function PaginationControls({ currentPage, totalPages, setCurrentPage }) {
    return (
        <div className="flex justify-between mt-4">
            <button
                className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white'}`}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
                className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white'}`}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
}
