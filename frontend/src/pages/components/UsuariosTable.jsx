import React from 'react';

export default function UsuariosTable({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-white rounded">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">E-mail</th>
            <th className="px-4 py-2">Permissão</th>
            <th className="px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((usuario, idx) => (
            <tr key={idx} className="hover:bg-gray-100">
              <td className="px-4 py-2">{usuario.nome_usu}</td>
              <td className="px-4 py-2">{usuario.email_usu}</td>
              <td className="px-4 py-2">{usuario.descricao_per}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => onEdit(usuario)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(usuario.email_usu)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                Nenhum usuário encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}