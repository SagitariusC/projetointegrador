import { useState, useEffect } from 'react';
import api from '../api';
import VendasTable from './components/VendasTable';
import NewVendaModal from './components/NewVendasModal';
import EditVendaModal from './components/EditVendasModal';

export default function Vendas() {
    const [vendas, setVendas] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showNew, setShowNew] = useState(false);

    // Carrega vendas
    const load = async () => {
        try {
            const res = await api.get('/vendas');
            setVendas(res.data);
        } catch (err) {
            console.error('Erro ao carregar vendas:', err);
            alert('Erro ao carregar vendas');
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Validação e criação de nova venda
    const handleCreate = async (data) => {
        try {
            const res = await api.get(`/produtos/${data.cod}`);
            const produto = res.data;

            if (!produto || !produto.estoque_inicial) {
                alert('Não é possível cadastrar uma venda sem um estoque inicial para este produto.');
                return;
            }

            await api.post('/vendas', {
                cod: data.cod,
                qtdven: data.qtdven,
                dataven: data.dataven,
            });
            setShowNew(false);
            load();
        } catch (err) {
            console.error('Erro ao criar venda:', err);
            alert('Erro ao criar venda');
        }
    };

    // Atualização de venda
    const handleUpdate = async (data) => {
        try {
            await api.put(`/vendas/${editing.cod_prod}/${editing.data_ven}`, {
                cod: data.cod,
                qtdven: data.qtdven,
                dataven: data.dataven,
            });
            setEditing(null);
            load();
        } catch (err) {
            console.error('Erro ao atualizar venda:', err);
            alert('Erro ao atualizar venda');
        }
    };

    // Exclusão de venda
    const handleDelete = async (cod, dataven) => {
        if (!window.confirm('Confirma exclusão?')) return;
        try {
            await api.delete(`/vendas/${cod}/${dataven}`);
            load();
        } catch (err) {
            console.error('Erro ao deletar venda:', err);
            alert('Erro ao deletar venda');
        }
    };

    return (
        <div className="bg-white rounded-md shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Vendas</h2>
                <button
                    onClick={() => setShowNew(true)}
                    className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Nova Venda
                </button>
            </div>

            <VendasTable
                data={vendas}
                onEdit={(v) => setEditing(v)}
                onDelete={(v) => handleDelete(v.cod_prod, v.data_ven)}
            />

            {editing && (
                <EditVendaModal
                    venda={editing}
                    onClose={() => setEditing(null)}
                    onSave={handleUpdate}
                />
            )}
            {showNew && (
                <NewVendaModal
                    onClose={() => setShowNew(false)}
                    onSave={handleCreate}
                />
            )}
        </div>
    );
}