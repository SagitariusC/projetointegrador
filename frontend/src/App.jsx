import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StockBalance from './pages/StockBalance';

export default function App() {
  const [selectedPage, setSelectedPage] = useState('Dashboard');

  const renderPage = () => {
    switch (selectedPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'StockBalance':
        return <StockBalance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Sidebar onSelect={setSelectedPage} selectedPage={selectedPage} />
      <main className="flex-1 p-6 overflow-auto">{renderPage()}</main>
    </div>
  );
}