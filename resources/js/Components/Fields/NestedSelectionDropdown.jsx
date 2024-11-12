import { useState, useRef, useEffect } from 'react';
import DropdownButton from '@/Components/Buttons/DropdownButton';
import SearchBar from '@/Components/Fields/SearchBar';
import VariableList from '@/Components/Sections/VariableList';

const NestedSelectionDropdown = ({ locationType, availableVariables, selectedVariables, setSelectedVariables, analysisType }) => {
    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isOpen, setIsOpen] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const transformVariables = (variables) => {
        const sectionsMap = {};
        variables.forEach(({ map_name, domain: category, id }) => {
            if (!sectionsMap[category]) {
                sectionsMap[category] = [];
            }
            sectionsMap[category].push({ label: map_name, value: id });
        });
        return Object.entries(sectionsMap).map(([name, variables]) => ({ name, variables }));
    };

    const handleSelect = (sectionName, variable, isOpen) => {
        setSelectedVariables((prevVariables) => {
            const availableKeys = availableVariables.map(availVar => `${availVar.id}:${availVar.name}`);
            const selectedArray = prevVariables ? prevVariables.split(',').map(item => item.trim()) : [];
            const normalizeKey = (item) => item.split(' ')[0];  // Take only the first part of the string before the first space

            const filteredSelectedArray = selectedArray.filter(item => {
                const normalizedItem = normalizeKey(item);
                return availableKeys.some(key => normalizeKey(key) === normalizedItem);
            });

            const selectionKey = `${variable.value}:${variable.label}`;
            const index = filteredSelectedArray.indexOf(selectionKey);

            if (index > -1) {
                selectedArray.splice(index, 1);
            } else {
                if (analysisType === 'multivariate') {
                    selectedArray.push(selectionKey);
                } else if (analysisType === 'bivariate') {
                    if (filteredSelectedArray.length < 2) {
                        selectedArray.push(selectionKey);
                    } else {
                        selectedArray[1] = selectionKey;
                    }
                } else {
                    selectedArray[0] = selectionKey;
                    setDropdownOpen(false);
                }
            }
            return Array.from(new Set(selectedArray)).join(',');

        });
    };

    const filteredSections = transformVariables(availableVariables)
        .filter((section) =>
            section.variables.some((variable) =>
                variable.label.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        .map((section) => ({
            ...section,
            variables: section.variables.filter((variable) =>
                variable.label.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        }));

    const getSelectedNames = () => {
        return selectedVariables
            .split(',')
            .map(item => item.trim())
            .map(selection => selection.split(':')[1])
            .filter(name => name)
            .join(', ');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        if (searchTerm.trim()) {
            const allSections = transformVariables(availableVariables);
            const openSections = allSections.reduce((acc, section) => {
                acc[section.name] = true;
                return acc;
            }, {});
            setIsOpen(openSections);
        } else {
            setIsOpen({});
        }
    }, [searchTerm]);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <DropdownButton
                getSelectedNames={getSelectedNames}
                selectedVariables={selectedVariables}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
            />
            {dropdownOpen && (
                <div className="absolute bg-white w-full border rounded-lg mt-1 z-30">
                    <div className="p-4">
                        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        <VariableList
                            filteredSections={filteredSections}
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            handleSelect={handleSelect}
                            selectedVariables={selectedVariables}
                            getSelectedNames={getSelectedNames}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default NestedSelectionDropdown;
