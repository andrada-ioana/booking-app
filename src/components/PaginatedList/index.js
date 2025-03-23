import React, { useState, useEffect } from "react";

const PaginatedList = ({ items, itemsPerPage = 5, renderItem }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 if items change
    }, [items]);

    const currentItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="hotel-list">
                {currentItems.length > 0 ? (
                    currentItems.map((item, index) => renderItem(item, index))
                ) : (
                    <p className="no-hotels">No hotels match your criteria.</p>
                )}
            </div>

            {items.length > itemsPerPage && (
                <div className="pagination">
                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        Prev
                    </button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaginatedList;
