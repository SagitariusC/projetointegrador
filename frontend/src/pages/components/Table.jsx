import React from 'react';

export default function Table({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white rounded">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="px-4 py-2 text-left">Código</th>
            <th className="px-4 py-2 text-left">Produto</th>
            <th className="px-4 py-2 text-left">Grupo Produto</th>
            <th className="px-4 py-2 text-left">Status Produto</th>
            <th className="px-4 py-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((p) => (
              <tr key={p.cod_prod} className="hover:bg-gray-100">
                <td className="px-4 py-2">{p.cod_prod}</td>
                <td className="px-4 py-2">{p.nome_prod}</td>
                <td className="px-4 py-2">{p.grupo_produto}</td>
                <td className="px-4 py-2">
                  {p.status_prod ? 'Ativo' : 'Inativo'}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(p.cod_prod)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}