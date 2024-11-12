
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, GlobeAltIcon, LockClosedIcon} from "@heroicons/react/24/solid";

export default function TableContainer({ dictionary, selectedColumns, sortColumn, setSortColumn, sortDirection, setSortDirection }) {
    const tableContainerRef = useRef(null);
    const [originalColumnOrder, setOriginalColumnOrder] = useState([]);

    useEffect(() => {
        if (dictionary.length > 0 && originalColumnOrder.length === 0) {
            setOriginalColumnOrder(Object.keys(dictionary[0]));
        }
    }, [dictionary, originalColumnOrder]);

    const handleScrollLeft = () => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollBy({ left: -tableContainerRef.current.offsetWidth / selectedColumns.length, behavior: 'smooth' });
        }
    };

    const handleScrollRight = () => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollBy({ left: tableContainerRef.current.offsetWidth / selectedColumns.length, behavior: 'smooth' });
        }
    };

    const tableWidth = tableContainerRef.current?.scrollWidth || 0;
    const containerWidth = tableContainerRef.current?.clientWidth || 0;
    const shouldShowScrollArrows = tableWidth > containerWidth;

    const formatColumnHeader = (key) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    };

    const handleContentRendering = (content) => {
        const isLink = typeof content === 'string' && content.startsWith('http');
        const isVisibility = typeof content === 'string' && content === 'Public' || content === 'Private';
        return isLink ? (
            <a href={content} target="_self" className="text-blue-600 underline">{content}</a>
        ) : (
            isVisibility ? (
                    content === 'Public' ? (
                        <GlobeAltIcon className="h-8 w-8 text-gray-500" />
                    ) : (
                        <LockClosedIcon className="h-8 w-8 text-gray-500" />
                    )
            ) :
            content
        );
    };

    return (
        <div className="relative mx-auto px-12 z-0">
            <div ref={tableContainerRef} className="overflow-x-auto rounded-lg border-2 border-gray-300 bg-white">
                <table className="min-w-full bg-white table-fixed">
                    <thead>
                    <tr>
                        {originalColumnOrder.map((key) =>
                                selectedColumns.includes(key) && (
                                    <th
                                        key={key}
                                        className="p-4 border-b border-gray-200 text-left text-sm cursor-pointer relative"
                                        onClick={() => {
                                            setSortColumn(key);
                                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                                        }}
                                    >
                                        {formatColumnHeader(key)}
                                        <ChevronDownIcon className={`h-4 w-4 inline absolute right-2 top-1/2 transform -translate-y-1/2 ${sortColumn === key ? 'block' : 'hidden'} ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                    </th>
                                )
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {dictionary.map((row, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            {originalColumnOrder.map(col => (
                                selectedColumns.includes(col) && (
                                    <td
                                        key={col}
                                        className={`px-4 py-1 border-b border-gray-200 text-sm overflow-x-scroll ${col === 'description' ? 'min-w-[30rem]' : 'w-[15rem] min-w-[15rem] max-w-[15rem]'} ${col === 'visibility' ? 'w-[5rem] min-w-[5rem] max-w-[5rem] text-center' : ''}`}
                                    >
                                        {handleContentRendering(row[col])}
                                    </td>
                                )
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {shouldShowScrollArrows && (
                <>
                    <div className="fixed top-1/2 mt-12 left-2">
                        <button onClick={handleScrollLeft} className="bg-gray-200 p-2 rounded-full">
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="fixed top-1/2 mt-12 right-2">
                        <button onClick={handleScrollRight} className="bg-gray-200 p-2 rounded-full">
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
