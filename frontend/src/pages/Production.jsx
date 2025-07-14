import { useState, useEffect } from 'react';
import api from '../api';
import ProducaoTable from './components/ProducaoTable';
import NewProducaoModal from './components/NewProductionModal';

export default function Producao() {
  const [producao, setProducao] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // Carrega dados de produção
  const load = async () => {
    try {
      const res = await api.get('/estoqueproducao');
      setProducao(res.data);
    } catch (err) {
      console.error('Erro ao carregar produção:', err);
      alert('Erro ao carregar produção');
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Criação de nova produção
  const handleCreate = async (data) => {
    try {
      const res = await api.get(`/produtos/${data.cod}`);
      const produto = res.data;

      if (!produto || !produto.estoque_inicial) {
        alert('Não é possível cadastrar uma produção sem um estoque inicial para este produto.');
        return;
      }

      await api.post('/estoqueproducao', {
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
      console.error('Erro ao criar produção:', err);
      alert('Erro ao criar produção');
    }
  };

  // Atualização de produção
  const handleUpdate = async (data) => {
    try {
      await api.put(`/estoqueproducao/${editing.cod_prod}/${editing.datafab_est}`, {
        cod: data.cod,
        nome: data.nome,
        grupo: data.grupo,
        qtdest: data.qtdest,
        validade: data.validade,
        datest: data.datest,
      });
      setEditing(null);
      load();
    } catch (err) {
      console.error('Erro ao atualizar produção:', err);
      alert('Erro ao atualizar produção');
    }
  };

  // Exclusão de produção
  const handleDelete = async (cod, datest) => {
    if (!window.confirm('Confirma exclusão?')) return;
    try {
      await api.delete(`/estoqueproducao/${cod}/${datest}`);
      load();
    } catch (err) {
      console.error('Erro ao deletar produção:', err);
      alert('Erro ao deletar produção');
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Produção teste</h2>
        <button
          onClick={() => setShowNew(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Nova Produção
        </button>
      </div>

      <ProducaoTable
        data={producao}
        onEdit={(p) => setEditing(p)}
        onDelete={(p) => handleDelete(p.cod_prod, p.datafab_est)}
      />

      {editing && (
        <EditProducaoModal
          producao={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}
      {showNew && (
        <NewProducaoModal
          onClose={() => setShowNew(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}