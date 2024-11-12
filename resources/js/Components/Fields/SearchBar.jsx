import React from 'react';
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="flex items-center mb-6">
            <MagnifyingGlassIcon className="w-4 h-4 mr-2 text-gray" />
            <input
                type="text"
                placeholder="Search..."
                className="border border-gray-light items-center px-4 py-2 w-full rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
