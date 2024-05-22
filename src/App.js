import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookTable from './components/BookTable';
import Search from './components/Search';
import Navbar from './components/Navbar';

function App() {
    return (
        // <BookTable />
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<BookTable />} />
                <Route path="search" element={<Search />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
