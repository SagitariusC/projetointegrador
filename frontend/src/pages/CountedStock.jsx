import { useState, useEffect } from 'react';
import api from '../api';
import CountedStockTable from './components/CountedStockTable';
import NewCountedStockModal from './components/NewCountedStockModal';
import EditCountedStockModal from './components/EditCountedStockModal';

export default function CountedStock() {
  const [countedStock, setCountedStock] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // Carrega dados de estoque contado
  const load = async () => {
    try {
      const res = await api.get('/estoquecontado');
      setCountedStock(res.data);
    } catch (err) {
      console.error('Erro ao carregar estoque contado:', err);
      alert('Erro ao carregar estoque contado');
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Criação de novo estoque contado
  const handleCreate = async (data) => {
    try {
      const res = await api.get(`/contagemestoqueinicial/${data.cod}`);
      const produto = res.data;

      if (!produto || produto.qtd === "0") {
        alert('Não existe um cadastro de Produto ou Estoque Inicial com esse código.');
        return;
      }

      await api.post('/estoquecontado', {
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
      console.error('Erro ao criar estoque contado:', err);
      alert('Erro ao criar estoque contado');
    }
  };

  // Atualização de estoque contado
  const handleUpdate = async (data) => {
    try {
      await api.put(`/estoquecontado/${editing.cod_prod}/${editing.datafab_est}`, {
        cod: data.cod,
        datest: data.datest,
        validade: data.validade,
        qtdest: data.qtdest,
      });
      setEditing(null);
      load();
    } catch (err) {
      console.error('Erro ao atualizar estoque contado:', err);
      alert('Erro ao atualizar estoque contado');
    }
  };

  // Exclusão de estoque contado
  const handleDelete = async (cod, datest) => {
    if (!window.confirm('Confirma exclusão?')) return;
    try {
      await api.delete(`/estoquecontado/${cod}/${datest}`);
      load();
    } catch (err) {
      console.error('Erro ao deletar estoque contado:', err);
      alert('Erro ao deletar estoque contado');
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Estoque Contado</h2>
        <button
          onClick={() => setShowNew(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Novo Estoque
        </button>
      </div>

      <CountedStockTable
        data={countedStock}
        onEdit={(p) => setEditing(p)}
        onDelete={(p) => handleDelete(p.cod_prod, p.datafab_est)}
      />

      {editing && (
        <EditCountedStockModal
          countedStock={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}
      {showNew && (
        <NewCountedStockModal
          onClose={() => setShowNew(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}