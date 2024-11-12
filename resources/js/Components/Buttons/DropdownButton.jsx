import React, {useEffect, useRef} from 'react';
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const DropdownButton = ({ getSelectedNames, selectedVariables, dropdownOpen, setDropdownOpen }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);
    return (
        <button
            className={`w-full p-2 px-4 rounded-full flex justify-between text-left gap-2 items-center min-h-[36px] ${selectedVariables ? 'bg-gray-300' : 'bg-gray-100'}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
        >
            {selectedVariables ? getSelectedNames() : <span className="italic">None selected</span>}
            <ChevronDownIcon className="w-4 h-4 text-gray shrink-0" />
        </button>
    );
};

export default DropdownButton;
