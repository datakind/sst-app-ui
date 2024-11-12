import { useState } from 'react';
import {ChevronDownIcon} from "@heroicons/react/24/solid";

const SingleSelectDropdown = ({ options, defaultOption, onSelect }) => {
    const [selectedOption, setSelectedOption] = useState(defaultOption || options[0]);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        setSelectedOption(option);
        onSelect(option);
        setIsOpen(false); // Close the dropdown after selection
    };

    const toggleDropdown = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };

    const handleOpen = () => {
        if (!isOpen) {
            setIsOpen(true);
        }else{
            setIsOpen(false);

        }
    };

    return (
        <div className="relative w-full my-1 text-gray">
            <div className="w-full relative z-10" onClick={handleOpen}>
                <div
                    className={`w-full flex justify-between items-center inline-block cursor-pointer border ${isOpen ? 'border-primary' : 'border-gray-light'} bg-white rounded-md px-4 py-2 text-sm font-medium`}
                >
                    {selectedOption}
                    <ChevronDownIcon className="w-4 h-4"></ChevronDownIcon>
                </div>
            </div>
            {isOpen && (
                <div className="w-full absolute inset-x-0 top-full z-10 bg-white border border-gray-300 rounded-md mt-1 overflow-hidden">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="cursor-pointer px-4 py-2 text-sm text-gray hover:bg-primary hover:text-white"
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SingleSelectDropdown;
