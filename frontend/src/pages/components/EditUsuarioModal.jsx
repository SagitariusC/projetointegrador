import { useState, useEffect } from 'react'

export default function EditUsuarioModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    permissao: 'VEN'
  })

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome_usu,
        email: user.email_usu,
        permissao: user.siglaper
      })
    }
  }, [user])

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
        <h3 className="text-xl mb-4">Editar Usuário</h3>
        <div className="space-y-3">
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
            <label className="block text-sm">E‐mail:</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Permissão:</label>
            <select
              name="permissao"
              value={form.permissao}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="VEN">Venda</option>
              <option value="PRD">Produção</option>
              <option value="CON">Estoque Contado</option>
              <option value="ADM">Geral</option>
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
  )
}
