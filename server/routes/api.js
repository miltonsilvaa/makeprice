const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/api/entries', (req, res) => {
  const { phone, date } = req.query
  const entries = db.getEntries({ phone, date })
  res.json(entries)
})

router.get('/api/summary', (req, res) => {
  const { phone, period } = req.query
  const summary = db.getSummary({ phone, period })
  res.json(summary)
})

router.delete('/api/entries/:id', (req, res) => {
  const deleted = db.deleteEntry(req.params.id)
  if (!deleted) return res.status(404).json({ ok: false, error: 'Entrada não encontrada' })
  res.json({ ok: true })
})

module.exports = router
