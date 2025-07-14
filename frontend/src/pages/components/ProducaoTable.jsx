import React from 'react';

export default function ProducaoTable({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white rounded">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="px-4 py-2">Código</th>
            <th className="px-4 py-2">Produto</th>
            <th className="px-4 py-2">Grupo</th>
            <th className="px-4 py-2">Quantidade</th>
            <th className="px-4 py-2">Dias Validade</th>
            <th className="px-4 py-2">Data Produção</th>
            <th className="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((producao, idx) => (
            <tr key={idx} className="hover:bg-gray-100">
              <td className="px-4 py-2">{producao.cod_prod}</td>
              <td className="px-4 py-2">{producao.nome_prod}</td>
              <td className="px-4 py-2">{producao.grupo_produto}</td>
              <td className="px-4 py-2">{producao.qtd_est}</td>
              <td className="px-4 py-2">{producao.validade_est}</td>
              <td className="px-4 py-2">{producao.datafab_est}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => onEdit(producao)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(producao)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                Nenhuma produção encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}