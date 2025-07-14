import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const handleNavigate = (path) => {
    navigate(path, { replace: true });
  };

  return (
    <div className="w-64 h-screen bg-black text-white flex flex-col">
      <div className="p-6 flex justify-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full" />
      </div>
      <nav className="flex-1 space-y-1 px-2">
        <button
          onClick={() => handleNavigate('/estoque-inicial')}
          className="block px-4 py-2 rounded text-white hover:bg-gray-700"
        >
          Estoque Inicial
        </button>
        <button
          onClick={() => handleNavigate('/producao')} 
          className="block px-4 py-2 rounded text-white hover:bg-gray-700"
        >
          Produção
        </button>
        <button
          onClick={() => handleNavigate('/vendas')}
          className="block px-4 py-2 rounded text-white hover:bg-gray-700"
        >
          Vendas
        </button>
        <button
          onClick={() => handleNavigate('/produtos')}
          className="block px-4 py-2 rounded text-white hover:bg-gray-700"
        >
          Produtos
        </button>
        <button
          onClick={() => handleNavigate('/estoque-contado')}
          className="block px-4 py-2 rounded text-white hover:bg-gray-700"
        >
          Estoque Contado
        </button>
        <button
          onClick={() => handleNavigate('/balanco-estoque')}
          className="block px-4 py-2 rounded text-white hover:bg-gray-700"
        >
          Balanço Estoque
        </button>
        <button
          onClick={() => handleNavigate('/usuarios')}
          className="block px-4 py-2 rounded text-white hover:bg-gray-700"
        >
          Usuários
        </button>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto mb-6 mx-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
      >
        Sair
      </button>
    </div>
  );
}