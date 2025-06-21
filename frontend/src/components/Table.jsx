export default function Table({ data, onEdit }) {
  return (
    <div className="overflow-x-auto border rounded bg-white">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Código</th>
            <th className="px-4 py-2">Produto</th>
            <th className="px-4 py-2">Grupo Produto</th>
            <th className="px-4 py-2">Status Produto</th>
            <th className="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.nome}</td>
              <td className="px-4 py-2">{item.categoria}</td>
              <td className="px-4 py-2">Ativo</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  onClick={() => onEdit(item)}
                >
                  Editar
                </button>
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}