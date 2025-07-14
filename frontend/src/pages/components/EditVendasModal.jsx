import { useState, useEffect } from 'react'

export default function EditVendaModal({ venda, onClose, onSave }) {
  const [form, setForm] = useState({ cod: '', qtdven: '', dataven: '' })

  useEffect(() => {
    if (venda) {
      setForm({
        cod: venda.cod_prod,
        qtdven: venda.qtd_ven,
        dataven: venda.data_ven
      })
    }
  }, [venda])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl mb-4">Editar Venda</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm">Código do Produto:</label>
            <input
              name="cod"
              value={form.cod}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Quantidade:</label>
            <input
              name="qtdven"
              type="number"
              value={form.qtdven}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Data da Venda:</label>
            <input
              name="dataven"
              type="date"
              value={form.dataven}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
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
  )
}
