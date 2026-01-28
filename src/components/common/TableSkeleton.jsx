import React from 'react';

const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-200 h-10 w-full mb-4 rounded"></div>
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex space-x-4 mb-4">
                    {[...Array(columns)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TableSkeleton;
