import { useState } from 'react'

const UNITS = ['KG', 'UN', 'DZ', 'CX', 'PCT', 'L', 'OUTRO']
const UNIT_LABELS = { KG: 'KG – Quilograma', UN: 'UN – Unidade', DZ: 'DZ – Dúzia', CX: 'CX – Caixa', PCT: 'PCT – Pacote', L: 'L – Litro', OUTRO: 'Outro...' }

const THEMES = [
  { id: 'classico', name: 'Clássico', bannerColor: '#D32F2F', priceColor: '#D32F2F', accentColor: '#1565C0' },
  { id: 'promocao', name: 'Promoção', bannerColor: '#E65100', priceColor: '#E65100', accentColor: '#212121' },
  { id: 'verao', name: 'Verão', bannerColor: '#2E7D32', priceColor: '#2E7D32', accentColor: '#F9A825' },
  { id: 'roxo', name: 'Premium', bannerColor: '#4A148C', priceColor: '#6A1B9A', accentColor: '#00897B' },
]

const LAYOUT_TEMPLATES = [
  { id: 'feira', name: 'Feira Tradicional', desc: 'Estilo hortifruti — retrato A4' },
  { id: 'classico', name: 'Clássico', desc: 'Layout horizontal de feira' },
  { id: 'destaque', name: 'Destaque', desc: 'Preço em evidência máxima' },
  { id: 'minimalista', name: 'Minimalista', desc: 'Visual limpo e moderno' },
]

const TABS = [
  { id: 'produto', label: 'Produto', icon: '🥬' },
  { id: 'preco', label: 'Preço', icon: '💰' },
  { id: 'cores', label: 'Cores', icon: '🎨' },
  { id: 'salvo', label: 'Salvo', icon: '📋' },
]

export default function FormPanel({ form, update, onExportPNG, onExportPDF, onSave, history, onLoadHistory, onDeleteHistory, exporting }) {
  const [activeTab, setActiveTab] = useState('produto')

  const applyTheme = (theme) => {
    update('bannerColor', theme.bannerColor)
    update('priceColor', theme.priceColor)
    update('accentColor', theme.accentColor)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-bold tracking-wide transition-colors ${
              activeTab === tab.id
                ? 'border-b-[3px] border-green-600 text-green-700 bg-green-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="block text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5 bg-white">

        {/* ── TAB: PRODUTO ── */}
        {activeTab === 'produto' && (
          <div className="flex flex-col gap-5">
            <Field label="Texto do destaque">
              <input type="text" value={form.highlightText} onChange={(e) => update('highlightText', e.target.value)} placeholder="HOJE É DIA DE FEIRA" className="input" />
              <p className="text-xs text-slate-400 mt-1">Faixa do topo da placa</p>
            </Field>

            <Field label="Nome do produto *">
              <input type="text" value={form.productName} onChange={(e) => update('productName', e.target.value.toUpperCase())} placeholder="Ex: LARANJA, MANGA, GOIABA" className="input" autoFocus />
            </Field>

            <Field label="Variedade / tipo">
              <input type="text" value={form.variety} onChange={(e) => update('variety', e.target.value)} placeholder="Ex: Bahia, Palmer, Pera D'Rio (opcional)" className="input" />
            </Field>

            <Field label="Texto do rodapé">
              <input type="text" value={form.footerText} onChange={(e) => update('footerText', e.target.value)} placeholder="Ex: Produto Nacional, Orgânico... (opcional)" className="input" />
              <p className="text-xs text-slate-400 mt-1">Aparece na parte inferior da placa</p>
            </Field>
          </div>
        )}

        {/* ── TAB: PREÇO ── */}
        {activeTab === 'preco' && (
          <div className="flex flex-col gap-5">
            <Field label="Preço">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">R$</span>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value.replace(/[^\d,]/g, ''))}
                  placeholder="13,99"
                  className="input pl-11"
                  inputMode="decimal"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Use vírgula para centavos: 13,99 ou 5,00</p>
            </Field>

            <Field label="Unidade de medida">
              <select value={form.unit} onChange={(e) => update('unit', e.target.value)} className="input">
                {UNITS.map((u) => (
                  <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                ))}
              </select>
            </Field>

            {form.unit === 'OUTRO' && (
              <Field label="Unidade personalizada">
                <input type="text" value={form.customUnit} onChange={(e) => update('customUnit', e.target.value)} placeholder="Ex: BDJ – Bandeja, SC – Saco..." className="input" />
              </Field>
            )}
          </div>
        )}

        {/* ── TAB: CORES ── */}
        {activeTab === 'cores' && (
          <div className="flex flex-col gap-6">
            {/* Layout templates */}
            <div>
              <p className="text-sm font-bold text-slate-600 mb-3">Layout da placa</p>
              <div className="flex flex-col gap-2">
                {LAYOUT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => update('template', t.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      form.template === t.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <TemplateIcon id={t.id} active={form.template === t.id} bannerColor={form.bannerColor} priceColor={form.priceColor} />
                    <div>
                      <p className={`text-sm font-bold ${form.template === t.id ? 'text-green-700' : 'text-slate-700'}`}>{t.name}</p>
                      <p className="text-xs text-slate-400">{t.desc}</p>
                    </div>
                    {form.template === t.id && (
                      <span className="ml-auto text-green-600 text-sm font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Color themes */}
            <div>
              <p className="text-sm font-bold text-slate-600 mb-3">Temas de cores prontos</p>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-transparent hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left"
                  >
                    <div className="flex gap-1 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full border border-black/10" style={{ background: theme.bannerColor }} />
                      <div className="w-5 h-5 rounded-full border border-black/10" style={{ background: theme.accentColor }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual pickers */}
            <div>
              <p className="text-sm font-bold text-slate-600 mb-3">Personalizar cores</p>
              <div className="flex flex-col gap-4">
                <ColorRow label="Faixa do topo" value={form.bannerColor} onChange={(v) => update('bannerColor', v)} />
                <ColorRow label="Cor do preço" value={form.priceColor} onChange={(v) => update('priceColor', v)} />
                <ColorRow label="Detalhes decorativos" value={form.accentColor} onChange={(v) => update('accentColor', v)} />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: SALVO ── */}
        {activeTab === 'salvo' && (
          <div className="flex flex-col gap-3">
            {history.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm font-bold text-slate-500">Nenhuma placa salva ainda</p>
                <p className="text-xs text-slate-400 mt-1">Clique em "Salvar placa" para guardar suas criações</p>
              </div>
            ) : (
              history.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onLoad={() => { onLoadHistory(entry); setActiveTab('produto') }}
                  onDelete={() => onDeleteHistory(entry.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Export + Save buttons */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
        <button
          onClick={onSave}
          disabled={!form.productName}
          className="w-full py-2.5 rounded-xl border-2 border-green-600 text-green-700 font-bold text-sm tracking-wide hover:bg-green-50 active:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          💾 Salvar placa no histórico
        </button>
        <div className="flex gap-2">
          <button onClick={onExportPNG} disabled={exporting} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-sm tracking-wide transition-colors disabled:opacity-60">
            {exporting ? '...' : '⬇ PNG'}
          </button>
          <button onClick={onExportPDF} disabled={exporting} className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white font-bold text-sm tracking-wide transition-colors disabled:opacity-60">
            {exporting ? '...' : '⬇ PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative cursor-pointer">
        <div className="w-9 h-9 rounded-full border-2 border-white shadow-md ring-1 ring-black/15" style={{ background: value }} />
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute opacity-0 inset-0 w-full h-full cursor-pointer" />
      </label>
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 uppercase">{value}</p>
      </div>
    </div>
  )
}

function TemplateIcon({ id, active, bannerColor, priceColor }) {
  const color = active ? bannerColor : '#94a3b8'
  const prColor = active ? priceColor : '#94a3b8'
  if (id === 'feira') return (
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="30" height="42" rx="2" fill="white" stroke={color} strokeWidth="0.5" opacity="0.3"/>
      <polygon points="0,0 32,0 32,14 16,22 0,14" fill={color} opacity="0.9" />
      <rect x="5" y="25" width="22" height="3.5" rx="1" fill="#1a1a1a" opacity="0.7" />
      <rect x="3" y="31" width="14" height="9" rx="1" fill={prColor} opacity="0.85" />
      <rect x="18" y="31" width="11" height="4" rx="1" fill={prColor} opacity="0.6" />
      <rect x="18" y="36" width="11" height="4" rx="1" fill="#1a1a1a" opacity="0.5" />
    </svg>
  )
  if (id === 'classico') return (
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
      <rect x="1" y="1" width="38" height="30" rx="2" stroke={color} strokeWidth="1.5" fill="white" />
      <polygon points="0,0 40,0 37,8 3,8" fill={color} opacity="0.9" />
      <rect x="10" y="13" width="20" height="3" rx="1" fill="#1a1a1a" opacity="0.6" />
      <rect x="8" y="18" width="24" height="6" rx="1" fill={prColor} opacity="0.8" />
      <rect x="15" y="26" width="10" height="2" rx="1" fill="#333" opacity="0.4" />
    </svg>
  )
  if (id === 'destaque') return (
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
      <rect x="1" y="1" width="38" height="30" rx="2" stroke={color} strokeWidth="1.5" fill="white" />
      <polygon points="0,0 40,0 37,8 3,8" fill={color} opacity="0.9" />
      <rect x="12" y="11" width="16" height="2.5" rx="1" fill="#1a1a1a" opacity="0.5" />
      <rect x="5" y="15" width="30" height="11" rx="1" fill={prColor} opacity="0.85" />
      <rect x="14" y="28" width="12" height="2" rx="1" fill="#333" opacity="0.3" />
    </svg>
  )
  if (id === 'minimalista') return (
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
      <rect x="1" y="1" width="38" height="30" rx="2" stroke={color} strokeWidth="1.5" fill="white" />
      <rect x="1" y="1" width="38" height="7" rx="2" fill={color} opacity="0.9" />
      <rect x="4" y="4" width="32" height="30" rx="1" stroke={color} strokeWidth="0.5" fill="none" opacity="0.3" />
      <rect x="10" y="12" width="20" height="3" rx="1" fill="#1a1a1a" opacity="0.6" />
      <rect x="6" y="17" width="28" height="8" rx="2" stroke={prColor} strokeWidth="1.5" fill="none" />
      <rect x="10" y="20" width="20" height="3" rx="1" fill={prColor} opacity="0.6" />
    </svg>
  )
  return null
}

function HistoryCard({ entry, onLoad, onDelete }) {
  const date = new Date(entry.savedAt)
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  const templateLabels = { classico: 'Clássico', destaque: 'Destaque', minimalista: 'Minimalista' }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all group">
      {/* Color preview */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex flex-col">
        <div className="flex-1" style={{ background: entry.bannerColor }} />
        <div className="flex-1" style={{ background: entry.priceColor }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{entry.productName}</p>
        <p className="text-xs text-slate-500">
          {entry.price ? `R$ ${entry.price}` : '—'} · {entry.unit === 'OUTRO' ? entry.customUnit : entry.unit}
          {entry.template && entry.template !== 'classico' && ` · ${templateLabels[entry.template] || ''}`}
        </p>
        <p className="text-xs text-slate-400">{dateStr}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onLoad} title="Carregar" className="w-8 h-8 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm flex items-center justify-center transition-colors">
          ↩
        </button>
        <button onClick={onDelete} title="Excluir" className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-bold text-sm flex items-center justify-center transition-colors">
          ✕
        </button>
      </div>
    </div>
  )
}
