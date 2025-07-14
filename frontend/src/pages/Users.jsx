import { useState, useEffect } from 'react';
import api from '../api';
import UsuariosTable from './components/UsuariosTable';
import NewUsuarioModal from './components/NewUsuarioModal';
import EditUsuarioModal from './components/EditUsuarioModal';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // Carrega usuários
  const load = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      alert('Erro ao carregar usuários');
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Criação de novo usuário
  const handleCreate = async (data) => {
    try {
      await api.post('/usuarios', {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        permissao: data.permissao,
      });
      setShowNew(false);
      load();
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      alert('Erro ao criar usuário');
    }
  };

  // Atualização de usuário
  const handleUpdate = async (data) => {
    try {
      await api.put(`/usuarios/${editing.email_usu}`, {
        nome: data.nome,
        email: data.email,
        permissao: data.permissao,
      });
      setEditing(null);
      load();
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      alert('Erro ao atualizar usuário');
    }
  };

  // Exclusão de usuário
  const handleDelete = async (email) => {
    if (!window.confirm('Confirma exclusão?')) return;
    try {
      await api.delete(`/usuarios/${email}`);
      load();
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      alert('Erro ao deletar usuário');
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Usuários</h2>
        <button
          onClick={() => setShowNew(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Novo Usuário
        </button>
      </div>

      <UsuariosTable
        data={usuarios}
        onEdit={(u) => setEditing(u)}
        onDelete={(email) => handleDelete(email)}
      />

      {editing && (
        <EditUsuarioModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}
      {showNew && (
        <NewUsuarioModal
          onClose={() => setShowNew(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}