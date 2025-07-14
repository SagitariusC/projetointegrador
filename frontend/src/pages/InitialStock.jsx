import { useState, useEffect } from 'react';
import api from '../api';
import InitialStockTable from './components/InitialStockTable';
import NewInitialStockModal from './components/InitialStockTable';

export default function InitialStock() {
  const [initialStock, setInitialStock] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // Carrega dados de estoque inicial
  const load = async () => {
    try {
      const res = await api.get('/estoqueinicial');
      setInitialStock(res.data);
    } catch (err) {
      console.error('Erro ao carregar estoque inicial:', err);
      alert('Erro ao carregar estoque inicial');
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Criação de novo estoque inicial
  const handleCreate = async (data) => {
    try {
      await api.post('/estoqueinicial', {
        cod: data.cod,
        nome: data.nome,
        grupo: data.grupo,
        qtdest: data.qtdest,
        validade: data.validade,
        datest: data.datest,
      });

      await api.post('/historicoinicial', {
        cod: data.cod,
        nome: data.nome,
        grupo: data.grupo,
        qtdest: data.qtdest,
        validade: data.validade,
        datest: data.datest,
      });

      setShowNew(false);
      load();
    } catch (err) {
      console.error('Erro ao criar estoque inicial:', err);
      alert('Erro ao criar estoque inicial');
    }
  };

  // Atualização de estoque inicial
  const handleUpdate = async (data) => {
    try {
      await api.put(`/estoqueinicial/${editing.cod_prod}/${editing.datafab_est}`, {
        cod: data.cod,
        datest: data.datest,
        validade: data.validade,
        qtdest: data.qtdest,
      });
      setEditing(null);
      load();
    } catch (err) {
      console.error('Erro ao atualizar estoque inicial:', err);
      alert('Erro ao atualizar estoque inicial');
    }
  };

  // Exclusão de estoque inicial
  const handleDelete = async (cod, datest) => {
    if (!window.confirm('Confirma exclusão?')) return;
    try {
      await api.delete(`/estoqueinicial/${cod}/${datest}`);
      load();
    } catch (err) {
      console.error('Erro ao deletar estoque inicial:', err);
      alert('Erro ao deletar estoque inicial');
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Estoque Inicial</h2>
        <button
          onClick={() => setShowNew(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Novo Estoque
        </button>
      </div>

      <InitialStockTable
        data={initialStock}
        onEdit={(p) => setEditing(p)}
        onDelete={(p) => handleDelete(p.cod_prod, p.datafab_est)}
      />

      {editing && (
        <EditInitialStockModal
          initialStock={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}
      {showNew && (
        <NewInitialStockModal
          onClose={() => setShowNew(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}