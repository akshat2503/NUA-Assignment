import { Stack } from '@mui/material';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
    const [page, setPage] = useState('/');
    const navigate = useNavigate();
    const handleNavigate = (path) => {
        console.log("Called")
        setPage(path);
        navigate(path);
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '2rem', paddingRight: '2rem' }}>
            {page === '/' ? (
                <h1 align="center">Book Table Dashboard</h1>
            ) : (
                <h1 align="center">Book Search by Author</h1>
            )}
            <Stack style={{}} direction="row" spacing={4}>
                <h3 style={{ cursor: 'pointer', textDecoration: `${page==='/'?'underline':'none'}` }} onClick={() => { handleNavigate('/') }}>Home</h3>
                <h3 style={{ cursor: 'pointer', textDecoration: `${page==='/'?'none':'underline'}` }} onClick={() => { handleNavigate('/search') }}>Search</h3>
            </Stack>
        </div>
    )
}
