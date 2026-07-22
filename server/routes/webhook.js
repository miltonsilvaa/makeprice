const express = require('express')
const router = express.Router()
const db = require('../db')
const { parseMessage } = require('../parser')

router.post('/webhook/evolution', (req, res) => {
  try {
    const payload = req.body
    const phone = payload?.data?.key?.remoteJid?.replace('@s.whatsapp.net', '') || null
    const text = payload?.data?.message?.conversation || null

    if (!phone || !text) {
      return res.status(400).json({ ok: false, error: 'Payload inválido' })
    }

    db.ensureTenant(phone)

    const parsed = parseMessage(text)
    for (const item of parsed) {
      db.addEntry(phone, item.type, item.produto, item.quantidade, item.valor, item.raw)
    }

    res.json({ ok: true, saved: parsed.length })
  } catch (err) {
    console.error('Erro no webhook:', err)
    res.status(500).json({ ok: false, error: 'Erro interno' })
  }
})

module.exports = router
