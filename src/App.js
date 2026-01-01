import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/admin/Admin';
import Cardapio from './pages/pdv/Cardapio';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/admin" element={<Admin />} />
                <Route path="/" element={<Cardapio />} />
            </Routes>
        </Router>
    );
}

export default App;
