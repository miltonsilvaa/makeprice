const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')

const adapter = new FileSync(path.join(__dirname, 'makeprice.json'))
const db = low(adapter)

db.defaults({ tenants: [], entries: [] }).write()

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function now() {
  return new Date().toISOString()
}

function filterByPeriod(entries, period) {
  const d = new Date()
  if (period === 'today') {
    const today = d.toISOString().slice(0, 10)
    return entries.filter(e => e.created_at.slice(0, 10) === today)
  }
  if (period === 'week') {
    const since = new Date(d - 7 * 24 * 60 * 60 * 1000).toISOString()
    return entries.filter(e => e.created_at >= since)
  }
  if (period === 'month') {
    const since = new Date(d - 30 * 24 * 60 * 60 * 1000).toISOString()
    return entries.filter(e => e.created_at >= since)
  }
  return entries
}

module.exports = {
  ensureTenant(phone) {
    const exists = db.get('tenants').find({ phone }).value()
    if (!exists) {
      db.get('tenants').push({ id: uid(), phone, created_at: now() }).write()
    }
  },

  addEntry(phone, type, produto, quantidade, valor, rawMessage) {
    const entry = {
      id: uid(),
      tenant_phone: phone,
      type,
      produto: produto || null,
      quantidade: quantidade || null,
      valor: valor || 0,
      raw_message: rawMessage,
      created_at: now(),
    }
    db.get('entries').push(entry).write()
    return entry
  },

  getEntries({ phone, date } = {}) {
    let entries = db.get('entries').value()
    if (phone) entries = entries.filter(e => e.tenant_phone === phone)
    if (date) entries = entries.filter(e => e.created_at.slice(0, 10) === date)
    return entries.slice().reverse()
  },

  getSummary({ phone, period } = {}) {
    let entries = db.get('entries').value()
    if (phone) entries = entries.filter(e => e.tenant_phone === phone)
    entries = filterByPeriod(entries, period)
    entries = entries.slice().reverse()

    const totalVendas = entries.filter(e => e.type === 'venda').reduce((s, e) => s + (e.valor || 0), 0)
    const totalGastos = entries.filter(e => e.type === 'gasto').reduce((s, e) => s + (e.valor || 0), 0)
    const lucro = totalVendas - totalGastos

    return { totalVendas, totalGastos, lucro, entries }
  },

  deleteEntry(id) {
    const before = db.get('entries').size().value()
    db.get('entries').remove({ id }).write()
    const after = db.get('entries').size().value()
    return before !== after
  },
}
