import { useState } from 'react';

export default function NewProductModal({ onClose }) {
  const [form, setForm] = useState({ id: '', nome: '', categoria: '', status: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Novo produto cadastrado:', form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Cadastrar Produto</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Código Produto:</label>
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nome Produto:</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Grupo Produto:</label>
            <input
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status Produto:</label>
            <input
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
}