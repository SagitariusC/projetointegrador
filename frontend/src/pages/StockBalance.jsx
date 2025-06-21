const stockData = [
  {
    produto: 'Produto A',
    grupo: 'Grupo 1',
    anterior: 10,
    producao: 5,
    venda: 8,
    calculado: 7,
    contado: 7,
    delta: 0,
  },
  {
    produto: 'Produto B',
    grupo: 'Grupo 2',
    anterior: 20,
    producao: 0,
    venda: 2,
    calculado: 18,
    contado: 16,
    delta: -2,
  },
];

export default function StockBalance() {
  return (
    <div className="bg-white rounded-md shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Bem Vindo Usuário</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Produto</th>
              <th className="px-4 py-2">Grupo Produto</th>
              <th className="px-4 py-2">Estoque Dia Anterior</th>
              <th className="px-4 py-2">Produção Dia</th>
              <th className="px-4 py-2">Venda</th>
              <th className="px-4 py-2">Estoque Calculado</th>
              <th className="px-4 py-2">Estoque Contado</th>
              <th className="px-4 py-2">Delta</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{item.produto}</td>
                <td className="px-4 py-2">{item.grupo}</td>
                <td className="px-4 py-2">{item.anterior}</td>
                <td className="px-4 py-2">{item.producao}</td>
                <td className="px-4 py-2">{item.venda}</td>
                <td className="px-4 py-2">{item.calculado}</td>
                <td className="px-4 py-2">{item.contado}</td>
                <td className="px-4 py-2">{item.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
