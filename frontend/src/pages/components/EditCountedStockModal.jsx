import { useState, useEffect } from 'react';

export default function EditCountedStockModal({ countedStock, onClose, onSave }) {
  const [form, setForm] = useState({
    cod: '',
    nome: '',
    grupo: '',
    qtdest: '',
    validade: '',
    datest: '',
  });

  useEffect(() => {
    if (countedStock) {
      setForm({
        cod: countedStock.cod_prod,
        nome: countedStock.nome_prod,
        grupo: countedStock.grupo_produto,
        qtdest: countedStock.qtd_est,
        validade: countedStock.validade_est,
        datest: countedStock.datafab_est,
      });
    }
  }, [countedStock]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Editar Estoque Contado</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="cod"
            value={form.cod}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Código"
            disabled
          />
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Nome"
          />
          <input
            type="text"
            name="grupo"
            value={form.grupo}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Grupo"
          />
          <input
            type="number"
            name="qtdest"
            value={form.qtdest}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Quantidade"
          />
          <input
            type="number"
            name="validade"
            value={form.validade}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Validade (dias)"
          />
          <input
            type="date"
            name="datest"
            value={form.datest}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Data de Contagem"
          />
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}