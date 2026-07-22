import { useState, useEffect, useCallback } from 'react'

const PERIODS = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mês' },
]

function loadPhone() {
  return localStorage.getItem('makeprice_phone') || ''
}

function savePhone(phone) {
  localStorage.setItem('makeprice_phone', phone)
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function FinancePanel() {
  const [phone, setPhone] = useState(loadPhone)
  const [phoneInput, setPhoneInput] = useState(loadPhone)
  const [period, setPeriod] = useState('today')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async () => {
    if (!phone) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:3001/api/summary?phone=${phone}&period=${period}`)
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()
      setSummary(data)
    } catch (err) {
      setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [phone, period])

  useEffect(() => {
    fetchSummary()
    const interval = setInterval(fetchSummary, 30000)
    return () => clearInterval(interval)
  }, [fetchSummary])

  const handleSavePhone = () => {
    const cleaned = phoneInput.replace(/\D/g, '')
    setPhone(cleaned)
    savePhone(cleaned)
  }

  const handleDeleteEntry = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/entries/${id}`, { method: 'DELETE' })
      fetchSummary()
    } catch {
      setError('Erro ao deletar lançamento.')
    }
  }

  const lucro = summary ? (summary.totalVendas || 0) - (summary.totalGastos || 0) : 0

  if (!phone) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-5 px-2">
        <p className="text-4xl">💵</p>
        <p className="text-sm font-bold text-slate-700 text-center">Configure seu número para ver as finanças</p>
        <p className="text-xs text-slate-400 text-center">O número é usado para identificar seus lançamentos no servidor</p>
        <div className="w-full flex flex-col gap-2">
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
            placeholder="Ex: 5511999999999"
            className="input w-full"
          />
          <button
            onClick={handleSavePhone}
            disabled={!phoneInput}
            className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm tracking-wide transition-colors disabled:opacity-40"
          >
            Salvar número
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          type="tel"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
          placeholder="Número de telefone"
          className="input flex-1 text-sm"
        />
        <button
          onClick={handleSavePhone}
          disabled={phoneInput === phone}
          className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs tracking-wide transition-colors disabled:opacity-40 flex-shrink-0"
        >
          Salvar
        </button>
      </div>

      <div className="flex rounded-xl overflow-hidden border border-slate-200">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-1 py-2 text-xs font-bold tracking-wide transition-colors ${
              period === p.id
                ? 'bg-green-600 text-white'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {loading && !summary && (
        <div className="py-10 text-center">
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-2">
            <SummaryCard
              label="Total de Vendas"
              value={formatCurrency(summary.totalVendas)}
              color="green"
            />
            <SummaryCard
              label="Total de Gastos"
              value={formatCurrency(summary.totalGastos)}
              color="red"
            />
            <SummaryCard
              label="Lucro"
              value={formatCurrency(lucro)}
              color={lucro >= 0 ? 'blue' : 'red'}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lançamentos</p>

            {(!summary.entries || summary.entries.length === 0) ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-400">Nenhum lançamento neste período</p>
              </div>
            ) : (
              summary.entries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onDelete={() => handleDeleteEntry(entry.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  const colorMap = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  }
  const valueMap = {
    green: 'text-green-800',
    red: 'text-red-800',
    blue: 'text-blue-800',
  }
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${colorMap[color]}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${colorMap[color]}`}>{label}</p>
      <p className={`text-base font-black ${valueMap[color]}`}>{value}</p>
    </div>
  )
}

function EntryRow({ entry, onDelete }) {
  const isVenda = entry.tipo === 'venda'
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
      <div className={`flex-shrink-0 w-2 h-8 rounded-full ${isVenda ? 'bg-green-500' : 'bg-red-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{entry.produto || '—'}</p>
        <p className="text-xs text-slate-400">
          {isVenda ? 'Venda' : 'Gasto'} · {formatTime(entry.createdAt || entry.data)}
        </p>
      </div>
      <p className={`text-sm font-black flex-shrink-0 ${isVenda ? 'text-green-700' : 'text-red-600'}`}>
        {isVenda ? '+' : '-'}{formatCurrency(entry.valor)}
      </p>
      <button
        onClick={onDelete}
        className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold flex items-center justify-center transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
