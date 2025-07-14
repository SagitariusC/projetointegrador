import React from 'react';

export default function VendasTable({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white rounded">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="px-4 py-2">Código</th>
            <th className="px-4 py-2">Produto</th>
            <th className="px-4 py-2">Grupo</th>
            <th className="px-4 py-2">Quantidade</th>
            <th className="px-4 py-2">Data Venda</th>
            <th className="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((venda, idx) => (
            <tr key={idx} className="hover:bg-gray-100">
              <td className="px-4 py-2">{venda.cod_prod}</td>
              <td className="px-4 py-2">{venda.nome_prod}</td>
              <td className="px-4 py-2">{venda.grupo_produto}</td>
              <td className="px-4 py-2">{venda.qtd_ven}</td>
              <td className="px-4 py-2">{venda.data_ven}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => onEdit(venda)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(venda)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                Nenhuma venda encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}