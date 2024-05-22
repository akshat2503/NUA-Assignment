import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const BookTable = () => {
    const [data, setData] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSizeState, setPageSizeState] = useState(10);
    const [loading, setLoading] = useState(false);
    const [rowCount, setRowCount] = useState(0);

    // useEffect(() => {
    //     const fetchBooks = async (pageIndex, pageSize) => {
    //         try {
    //             setLoading(true);
    //             const response = await axios.get(`https://openlibrary.org/subjects/computer.json?limit=${pageSize}&offset=${pageIndex * pageSize}`);
    //             const books = response.data.works.map((book, index) => ({ ...book, id: `${pageIndex * pageSize + index}`, authorName: book.authors[0]?.name }));
    //             const authorResponse = await axios.get(`https://openlibrary.org/authors/${}.json`)
    //             setData(books);
    //             setRowCount(response.data.work_count);
    //             setLoading(false);
    //         } catch (error) {
    //             console.error("Error fetching books:", error);
    //             setLoading(false);
    //         }
    //     };

    //     fetchBooks(pageIndex, pageSizeState);
    // }, [pageIndex, pageSizeState]);

    useEffect(() => {
        const fetchBooks = async (pageIndex, pageSize) => {
            try {
                setLoading(true);
                const response = await axios.get(`https://openlibrary.org/subjects/computer.json?limit=${pageSize}&offset=${pageIndex * pageSize}`);
                const books = response.data.works.map((book, index) => ({
                    ...book,
                    id: `${pageIndex * pageSize + index}`,
                    authorKey: book.authors[0]?.key,
                    authorName: book.authors[0]?.name
                }));

                // Fetch each author's birth date
                const booksWithAuthorBirthDates = await Promise.all(books.map(async (book) => {
                    if (book.authorKey) {
                        try {
                            const authorResponse = await axios.get(`https://openlibrary.org${book.authorKey}.json`);
                            const ratingResponse = await axios.get(`https://openlibrary.org${book.key}/ratings.json`)
                            const rating = ratingResponse.data.summary.average;
                            const birthDate = authorResponse.data.birth_date;
                            let birthYear = 'N/A';

                            if (birthDate) {
                                const dateParts = birthDate.split(' ');
                                if (dateParts.length === 3) {
                                    birthYear = dateParts[2];
                                } else {
                                    birthYear = birthDate;
                                }
                            }

                            return { ...book, authorBirthDate: birthYear, rating: rating? rating.toFixed(1) : 'N/A' };
                        } catch (error) {
                            console.error(`Error fetching author details for ${book.authorName}:`, error);
                            return { ...book, authorBirthDate: 'N/A' };
                        }
                    }
                    return { ...book, authorBirthDate: 'N/A' };
                }));

                setData(booksWithAuthorBirthDates);
                setRowCount(response.data.work_count);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching books:", error);
                setLoading(false);
            }
        };

        fetchBooks(pageIndex, pageSizeState);
    }, [pageIndex, pageSizeState]);

    const columns = [
        { field: 'title', headerName: 'Title', width: 300, editable: true },
        { field: 'first_publish_year', headerName: 'First Publish Year', width: 150, editable: true },
        { field: 'subject', headerName: 'Subject', flex: 1, editable: true },
        { field: 'authorName', headerName: 'Author Name', width: 200, editable: true },
        { field: 'authorBirthDate', headerName: 'Author Birth Date', width: 150, editable: true },
        { field: 'rating', headerName: 'Average Rating', width: 150, editable: true },
    ];

    const handlePaginationModelChange = (params) => {
        setPageIndex(params.page);
        setPageSizeState(params.pageSize);
        console.log("Page index:", params.page);
        console.log("Page size:", params.pageSize);
    };

    function CustomToolbar() {
        return (
            <GridToolbarContainer style={{ justifyContent: 'flex-end' }}>
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    return (
        <Box paddingX={4} height={'85vh'}>
            <DataGrid
                rows={data}
                columns={columns}
                rowCount={rowCount}
                initialState={{
                    ...data.initialState,
                    pagination: { paginationModel: { pageSize: pageSizeState, page: pageIndex } },
                }}
                pageSizeOptions={[10, 50, 100]}
                paginationMode="server"
                onPaginationModelChange={handlePaginationModelChange}
                loading={loading}
                slots={{ toolbar: CustomToolbar }}
            />
        </Box>
    );
};

export default BookTable;
