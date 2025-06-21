import { useState } from 'react';
import Table from '../components/Table';
import EditProductModal from '../components/EditProductModal';
import NewProductModal from '../components/NewProductModal';
import { mockProducts } from '../data/mockProducts';

export default function Dashboard() {
  const [editingProduct, setEditingProduct] = useState(null);
  const [showNewProduct, setShowNewProduct] = useState(false);

  return (
    <div className="bg-white rounded-md shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Bem Vindo Usuário</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowNewProduct(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Novo
          </button>
          <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700">Anexar</button>
        </div>
      </div>
      <Table data={mockProducts} onEdit={setEditingProduct} />
      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />
      )}
      {showNewProduct && <NewProductModal onClose={() => setShowNewProduct(false)} />}
    </div>
  );
}