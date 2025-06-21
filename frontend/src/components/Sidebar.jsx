export default function Sidebar({ onSelect, selectedPage }) {
  const menuItems = [
    { label: 'Estoque Inicial', key: 'EstoqueInicial' },
    { label: 'Produção', key: 'Producao' },
    { label: 'Venda', key: 'Venda' },
    { label: 'Produtos', key: 'Dashboard' },
    { label: 'Estoque Contado', key: 'EstoqueContado' },
    { label: 'Balanço Estoque', key: 'StockBalance' },
  ];

  return (
    <aside className="w-64 bg-black text-white flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-center items-center h-24">
          <div className="bg-white text-black rounded-full w-14 h-14 flex items-center justify-center">
            <span className="text-2xl font-bold">👤</span>
          </div>
        </div>
        <nav className="px-6 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`block text-left w-full py-1 border-l-2 pl-2 ${
                selectedPage === item.key ? 'text-green-500 border-green-500' : 'border-transparent'
              } hover:text-green-400`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-gray-700">
        <button className="text-white text-sm">Sair</button>
      </div>
    </aside>
  );
}