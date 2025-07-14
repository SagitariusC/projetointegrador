import { useState, useEffect } from 'react';
import Table from './components/Table';
import NewProductModal from './components/NewProductModal';
import EditProductModal from './components/EditProductModal';
import api from '../api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showNewProduct, setShowNewProduct] = useState(false);

  // Carrega produtos
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/produtos');
      console.log('Produtos carregados:', res.data);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert('Não foi possível carregar produtos');
    }
  };

  // Cria novo produto
  const handleCreate = async (data) => {
    try {
      await api.post('/produtos', {
        cod: data.cod,
        nome: data.nome,
        grupo: data.grupo,
        stat: data.stat,
      });
      setShowNewProduct(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Falha ao criar produto');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await api.put(`/produtos/${editingProduct.cod_prod}`, {
        cod: data.cod,
        nome: data.nome,
        grupo: data.grupo,
        stat: data.stat,
      });
      setEditingProduct(null);
      loadProducts(); // Atualiza os dados após editar
    } catch (err) {
      console.error(err);
      alert('Falha ao atualizar produto');
    }
  };

  const handleDelete = async (cod) => {
    if (!window.confirm('Confirma exclusão?')) return;
    try {
      await api.delete(`/produtos/${cod}`);
      loadProducts(); // Atualiza os dados após deletar
    } catch (err) {
      console.error(err);
      alert('Falha ao deletar produto');
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6 w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Produtos</h2>
        <button
          onClick={() => setShowNewProduct(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Novo
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum produto encontrado.</p>
      ) : (
        <Table
          data={products}
          onEdit={(p) => setEditingProduct(p)}
          onDelete={(cod) => handleDelete(cod)}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdate}
        />
      )}

      {showNewProduct && (
        <NewProductModal
          onClose={() => setShowNewProduct(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}