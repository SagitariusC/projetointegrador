import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './pages/components/Sidebar';
import Dashboard from './pages/Dashboard';
import StockBalance from './pages/StockBalance';
import Vendas from './pages/Sales';
import BalancoEstoque from './pages/StockBalance';
import Usuarios from './pages/Users';
import Login from './pages/components/Login';
import Producao from './pages/Production'
import CountedStock from './pages/CountedStock';
import InitialStock from './pages/InitialStock';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Routes>
                  <Route path="/produtos" element={<Dashboard />} />
                  <Route path="/estoque-inicial" element={<InitialStock tipo="inicial" />} />
                  <Route path="/estoque-contado" element={<CountedStock tipo="contado" />} />
                  <Route path="/producao" element={<Producao />} /> 
                  <Route path="/vendas" element={<Vendas />} />
                  <Route path="/balanco-estoque" element={<BalancoEstoque />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}