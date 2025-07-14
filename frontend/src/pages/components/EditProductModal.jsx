import { useState, useEffect } from 'react';

export default function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    cod: '',
    nome: '',
    grupo: '',
    stat: true
  });

  useEffect(() => {
    if (product) {
      setForm({
        cod: product.cod_prod,
        nome: product.nome_prod,
        grupo: product.grupo_produto,
        stat: product.status_prod
      });
    }
  }, [product]);

  const handleChange = e => {
    let { name, value } = e.target;
    if (name === 'stat') value = value === 'true';
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl mb-4">Editar Produto</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm">Código:</label>
            <input
              name="cod"
              value={form.cod}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Nome:</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Grupo:</label>
            <input
              name="grupo"
              value={form.grupo}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Status:</label>
            <select
              name="stat"
              value={String(form.stat)}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}