import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import TableContainer from '../Components/Sections/TableContainer';
import PaginationControls from '../Components/Sections/PaginationControls';
import TableColumnSelection from '../Components/Fields/TableColumnSelection';
import SearchBar from '../Components/Fields/SearchBar';

export default function DataDictionary() {
    const [dictionary, setDictionary] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('field_name');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        axios.get(route('read.data-dictionary'))
            .then(res => {
                setDictionary(res.data);
                const keys = Object.keys(res.data[0] || {});
                setSelectedColumns(keys.filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at'));
            })
            .catch(err => console.log(err));
    }, []);

    const filteredData = dictionary.filter(row =>
        selectedColumns.some(col => row[col] && row[col].toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (sortColumn) {
            const aValue = a[sortColumn] ? String(a[sortColumn]) : ''; // Ensure string comparison
            const bValue = b[sortColumn] ? String(b[sortColumn]) : ''; // Ensure string comparison
            return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
    });

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

    const handleExportAll = () => {
        const csvContent = [
            selectedColumns.join(','),
            ...sortedData.map(row => selectedColumns.map(col => `"${row[col] || ''}"`).join(',')) // Add rows
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'hiequity_map_data_dictionary.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout>
            <div className="max-w-full mx-auto mb-12">
                <div className="flex justify-end items-center mx-12 space-x-4">
                    <TableColumnSelection
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        selectedColumns={selectedColumns}
                        setSelectedColumns={setSelectedColumns}
                        dictionary={dictionary}
                    />
                    <button
                        onClick={handleExportAll}
                        className="bg-gray-200 text-gray-700 py-2 px-3 rounded-lg mb-4"
                    >
                        Download to CSV
                    </button>
                </div>
                <div className="mx-12">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>
                <TableContainer
                    dictionary={paginatedData}
                    selectedColumns={selectedColumns}
                    setSortColumn={setSortColumn}
                    sortColumn={sortColumn}
                    setSortDirection={setSortDirection}
                    sortDirection={sortDirection}
                />
                <div className="mx-12">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
