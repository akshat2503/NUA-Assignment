import { Box, Button, Input, TextField } from '@mui/material'
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid'
import axios from 'axios';
import React, { useEffect, useState } from 'react'

export default function Search() {
    const [data, setData] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSizeState, setPageSizeState] = useState(10);
    const [loading, setLoading] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [author, setAuthor] = useState('');

    useEffect(() => {
        const fetchBooks = async (pageIndex, pageSize) => {
            try {
                setLoading(true);
                const response = await axios.get(`https://openlibrary.org/search.json?author=${author}&limit=${pageSize}&offset=${pageIndex * pageSize}`);
                const books = response.data.docs.map((book, index) => ({
                    ...book,
                    id: `${pageIndex * pageSize + index}`,
                    authorName: book.author_name[0]
                }));

                const booksWithRating = await Promise.all(books.map(async (book) => {
                    if (book.author_key) {
                        try {
                            const ratingResponse = await axios.get(`https://openlibrary.org${book.key}/ratings.json`)
                            const rating = ratingResponse.data.summary.average;
                            return { ...book, rating: rating ? rating.toFixed(1) : 'N/A' };
                        } catch (error) {
                            console.error(`Error fetching author details for ${book.authorName}:`, error);
                            return { ...book, rating: 'N/A' };
                        }
                    }
                    return { ...book, authorBirthDate: 'N/A' };
                }));

                setData(booksWithRating);
                setRowCount(response.data.numFound);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching books:", error);
                setLoading(false);
            }
        };

        fetchBooks(pageIndex, pageSizeState);
    }, [author, pageIndex, pageSizeState]);

    const columns = [
        { field: 'authorName', headerName: 'Author Name', width: 200, editable: true },
        { field: 'title', headerName: 'Title', width: 300, editable: true },
        { field: 'first_publish_year', headerName: 'First Publish Year', width: 150, editable: true },
        { field: 'rating', headerName: 'Average Rating', width: 150, editable: true },
        { field: 'subject', headerName: 'Subject', flex: 1, editable: true },
    ];

    const handlePaginationModelChange = (params) => {
        setPageIndex(params.page);
        setPageSizeState(params.pageSize);
        console.log("Page index:", params.page);
        console.log("Page size:", params.pageSize);
    };

    const handleAuthorSubmit = (e) => {
        if (e.keyCode === 13) {
            console.log("Setting author")
            setAuthor(e.target.value);
        }
    }

    function CustomToolbar() {
        return (
            <GridToolbarContainer style={{ justifyContent: 'flex-end' }}>
                <TextField variant='outlined' label="Author's Name" onKeyDown={handleAuthorSubmit} style={{ marginRight: 4 }} />
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
                // slots={{ toolbar: CustomToolbar }}
                slots={{
                    toolbar: CustomToolbar
                }}
                localeText={{ noRowsLabel: `Start Searching by Author's name` }}
            />
        </Box>
    )
}
