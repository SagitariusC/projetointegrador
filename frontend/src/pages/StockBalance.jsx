import { useState, useEffect } from 'react';
import api from '../api';

export default function StockBalance() {
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return today;
  });
  const [data, setData] = useState([]);

  const loadData = async () => {
    try {
      const res = await api.get(`/balancoestoque/${date}`);
      setData(res.data);
    } catch (err) {
      console.error('Erro ao carregar balanço de estoque:', err);
      alert('Não foi possível carregar o balanço de estoque');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white rounded-md shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Balanço de Estoque</h2>

      <div className="flex items-center mb-6">
        <label htmlFor="filterDate" className="mr-2">Data:</label>
        <input
          id="filterDate"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={loadData}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Filtrar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2">Produto</th>
              <th className="px-4 py-2">Grupo Produto</th>
              <th className="px-4 py-2">Estoque Dia Anterior</th>
              <th className="px-4 py-2">Produção</th>
              <th className="px-4 py-2">Vendas</th>
              <th className="px-4 py-2">Estoque Calculado</th>
              <th className="px-4 py-2">Estoque Contado</th>
              <th className="px-4 py-2">Delta</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-100">
                <td className="px-4 py-2">{item.nome_prod}</td>
                <td className="px-4 py-2">{item.grupo_produto}</td>
                <td className="px-4 py-2">{item.qtd_estoque_anterior}</td>
                <td className="px-4 py-2">{item.qtd_producao}</td>
                <td className="px-4 py-2">{item.qtd_vendas}</td>
                <td className="px-4 py-2">{item.qtd_estoque_calculado}</td>
                <td className="px-4 py-2">{item.qtd_contado}</td>
                <td className="px-4 py-2">{item.qtd_balanco}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  Nenhum registro para a data selecionada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}