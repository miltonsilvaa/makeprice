import { useRef, useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'
import FormPanel from './components/FormPanel'
import SignPreview from './components/SignPreview'

const DEFAULT_FORM = {
  productName: '',
  variety: '',
  price: '',
  unit: 'KG',
  customUnit: '',
  highlightText: 'HOJE É DIA DE FEIRA',
  footerText: '',
  instagramUser: '',
  qrDataUrl: '',
  template: 'feira',
  bannerColor: '#D32F2F',
  priceColor: '#D32F2F',
  accentColor: '#1565C0',
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('makeprice_history') || '[]') } catch { return [] }
}

function saveHistory(list) {
  localStorage.setItem('makeprice_history', JSON.stringify(list))
}

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [history, setHistory] = useState(loadHistory)
  const [batchList, setBatchList] = useState([])
  const [hiddenBatchForm, setHiddenBatchForm] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const previewRef = useRef(null)
  const hiddenRef = useRef(null)

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  // Generate QR data URL whenever instagramUser changes
  useEffect(() => {
    const user = (form.instagramUser || '').trim()
    if (!user) {
      setForm(prev => ({ ...prev, qrDataUrl: '' }))
      return
    }
    QRCode.toDataURL(`https://instagram.com/${user}`, {
      width: 168, margin: 1,
      color: { dark: '#333333', light: '#FFFFFF' },
    })
      .then(dataUrl => setForm(prev => ({ ...prev, qrDataUrl: dataUrl })))
      .catch(() => setForm(prev => ({ ...prev, qrDataUrl: '' })))
  }, [form.instagramUser])

  const handleSave = () => {
    if (!form.productName) return
    const entry = { ...form, id: Date.now(), savedAt: new Date().toISOString() }
    const next = [entry, ...history].slice(0, 30)
    setHistory(next)
    saveHistory(next)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }

  const handleLoadHistory = (entry) => {
    const { id, savedAt, ...formData } = entry
    setForm(formData)
  }

  const handleDeleteHistory = (id) => {
    const next = history.filter((h) => h.id !== id)
    setHistory(next)
    saveHistory(next)
  }

  // ── Batch handlers ──
  const handleAddToBatch = () => {
    if (!form.productName) return
    setBatchList(prev => [...prev, { ...form, batchId: Date.now() }])
  }

  const handleRemoveFromBatch = (batchId) => {
    setBatchList(prev => prev.filter(item => item.batchId !== batchId))
  }

  const handleClearBatch = () => setBatchList([])

  // ── Single PNG ──
  const captureCanvas = async (el) => {
    await document.fonts.ready
    await new Promise(r => setTimeout(r, 150))
    return html2canvas(el, {
      scale: 3, useCORS: true, allowTaint: true,
      backgroundColor: '#ffffff', imageTimeout: 15000, logging: false,
    })
  }

  const exportPNG = async () => {
    setExporting(true)
    try {
      const canvas = await captureCanvas(previewRef.current)
      const link = document.createElement('a')
      link.download = `placa-${form.productName || 'produto'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally { setExporting(false) }
  }

  // ── Single PDF ──
  const exportPDF = () => {
    const signEl = previewRef.current
    if (!signEl) return

    const isPortrait = form.template === 'feira'
    const signW = isPortrait ? 500 : 560
    const signH = isPortrait ? 707 : 420
    const pageW = isPortrait ? 210 * 3.7795 : 297 * 3.7795
    const pageH = isPortrait ? 297 * 3.7795 : 210 * 3.7795
    const scale = Math.min(pageW / signW, pageH / signH)

    const pw = window.open('', '_blank', 'width=900,height=1100')
    if (!pw) { alert('Permite popups neste site para exportar o PDF.'); return }

    pw.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Boogaloo&family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4 ${isPortrait ? 'portrait' : 'landscape'}; margin: 0; }
  *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: white; overflow: hidden; }
  body { width: ${isPortrait ? '210mm' : '297mm'}; height: ${isPortrait ? '297mm' : '210mm'}; position: relative; }
  #sign-wrap { position: absolute; top: 0; left: 0; transform-origin: top left; transform: scale(${scale.toFixed(6)}); }
</style>
</head>
<body>
<div id="sign-wrap">${signEl.outerHTML}</div>
<script>
  document.fonts.ready.then(function() { setTimeout(function() { window.print(); }, 1000); });
</script>
</body>
</html>`)
    pw.document.close()
  }

  // ── Batch PDF: renders each sign into hidden container, captures outerHTML ──
  const exportBatchPDF = () => {
    if (batchList.length === 0) return

    const signW = 500, signH = 707
    const scale = Math.min(210 * 3.7795 / signW, 297 * 3.7795 / signH).toFixed(6)
    const signsHTML = []

    for (const item of batchList) {
      flushSync(() => setHiddenBatchForm(item))
      if (hiddenRef.current) signsHTML.push(hiddenRef.current.outerHTML)
    }
    flushSync(() => setHiddenBatchForm(null))

    if (signsHTML.length === 0) return

    const pw = window.open('', '_blank', 'width=900,height=1100')
    if (!pw) { alert('Permite popups neste site para exportar o PDF.'); return }

    pw.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Boogaloo&family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 0; }
  *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: white; }
  .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; }
  .page:last-child { page-break-after: avoid; }
  .sign-wrap { position: absolute; top: 0; left: 0; transform-origin: top left; transform: scale(${scale}); }
</style>
</head>
<body>
${signsHTML.map(html => `<div class="page"><div class="sign-wrap">${html}</div></div>`).join('')}
<script>
  document.fonts.ready.then(function() { setTimeout(function() { window.print(); }, 1200); });
</script>
</body>
</html>`)
    pw.document.close()
  }

  // ── Batch ZIP: renders each sign hidden, captures via html2canvas ──
  const exportBatchZIP = async () => {
    if (batchList.length === 0) return
    setExporting(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      await document.fonts.ready

      for (let i = 0; i < batchList.length; i++) {
        const item = batchList[i]
        flushSync(() => setHiddenBatchForm(item))
        await new Promise(r => setTimeout(r, 200))

        if (hiddenRef.current) {
          const canvas = await html2canvas(hiddenRef.current, {
            scale: 3, useCORS: true, allowTaint: true,
            backgroundColor: '#ffffff', imageTimeout: 15000, logging: false,
          })
          const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
          const name = `${(item.productName || 'placa').toLowerCase().replace(/\s+/g, '-')}-${i + 1}.png`
          zip.file(name, blob)
        }
      }

      flushSync(() => setHiddenBatchForm(null))

      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = 'placas-makeprice.zip'
      link.click()
    } catch (err) {
      console.error('Batch ZIP error:', err)
      alert('Erro ao gerar ZIP. Tente novamente.')
    } finally {
      setExporting(false)
      flushSync(() => setHiddenBatchForm(null))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <span className="text-white font-black text-sm leading-none">M</span>
            </div>
            <span className="font-black text-xl text-slate-800 tracking-tight">
              Make<span className="text-green-600">Price</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 hidden sm:block">
            Crie placas de preço para feira e hortifruti
          </p>
        </div>
      </header>

      {/* Saved flash */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${savedFlash ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">
          ✓ Placa salva no histórico!
        </div>
      </div>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-[320px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <FormPanel
              form={form}
              update={update}
              onExportPNG={exportPNG}
              onExportPDF={exportPDF}
              onSave={handleSave}
              history={history}
              onLoadHistory={handleLoadHistory}
              onDeleteHistory={handleDeleteHistory}
              exporting={exporting}
              batchList={batchList}
              onAddToBatch={handleAddToBatch}
              onRemoveFromBatch={handleRemoveFromBatch}
              onClearBatch={handleClearBatch}
              onExportBatchPDF={exportBatchPDF}
              onExportBatchZIP={exportBatchZIP}
            />
          </div>

          <div className="flex-1 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pré-visualização</h2>
              <span className="text-xs text-slate-400">Preview em tempo real</span>
            </div>
            <div className="w-full flex justify-center overflow-x-auto pb-2">
              <div className="shrink-0 shadow-2xl ring-1 ring-slate-300">
                <SignPreview ref={previewRef} form={form} />
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              A placa exportada terá alta resolução (3×) — ideal para impressão
            </p>
          </div>
        </div>
      </main>

      {/* Hidden sign used for batch rendering — never visible */}
      {hiddenBatchForm && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, visibility: 'hidden', pointerEvents: 'none' }}>
          <SignPreview ref={hiddenRef} form={hiddenBatchForm} />
        </div>
      )}
    </div>
  )
}
