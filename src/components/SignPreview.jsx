import { forwardRef } from 'react'

const UNIT_LABELS = {
  KG: 'o kg', UN: 'a unidade', DZ: 'a dúzia', CX: 'a caixa', PCT: 'o pacote', L: 'o litro',
}
const UNIT_SHORT = {
  KG: 'KG', UN: 'UN', DZ: 'DZ', CX: 'CX', PCT: 'PCT', L: 'L',
}

function formatPrice(raw) {
  if (!raw) return { reais: '00', centavos: '00' }
  const clean = raw.replace(/[^\d,]/g, '')
  const [reais = '0', centavos = '00'] = clean.split(',')
  return { reais: reais || '0', centavos: centavos.padEnd(2, '0').slice(0, 2) }
}

const SIGN_DIMS = {
  classico:    { width: 560, height: 420 },
  destaque:    { width: 560, height: 420 },
  minimalista: { width: 560, height: 420 },
  feira:       { width: 500, height: 707 },
}

const SignPreview = forwardRef(function SignPreview({ form }, ref) {
  const {
    productName, variety, price, unit, customUnit,
    highlightText, bannerColor, priceColor, accentColor,
    footerText, template = 'feira',
  } = form

  const displayUnit  = unit === 'OUTRO' ? customUnit : (UNIT_LABELS[unit] || unit)
  const unitShort    = unit === 'OUTRO' ? (customUnit || '').toUpperCase() : (UNIT_SHORT[unit] || unit)
  const displayProduct = productName || 'PRODUTO'
  const showVariety  = !!(variety && variety.trim())
  const showPrice    = !!(price && price.trim())
  const { reais, centavos } = formatPrice(price)
  const dims = SIGN_DIMS[template] || SIGN_DIMS.classico

  const outerStyle = {
    width: `${dims.width}px`,
    height: `${dims.height}px`,
    background: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Nunito', sans-serif",
    userSelect: 'none',
    // No border here — border would be captured by html2canvas and appear in exports
  }

  const ctx = {
    displayProduct, displayUnit, unitShort, showVariety, showPrice,
    reais, centavos, variety, highlightText, footerText,
    bannerColor, priceColor, accentColor,
  }

  return (
    <div ref={ref} style={outerStyle}>
      {template === 'feira'       && <TemplateFeira       {...ctx} />}
      {template === 'classico'    && <TemplateClassico    {...ctx} />}
      {template === 'destaque'    && <TemplateDestaque    {...ctx} />}
      {template === 'minimalista' && <TemplateMinimalista {...ctx} />}
    </div>
  )
})

/* ─── TEMPLATE: FEIRA TRADICIONAL ─── */
function TemplateFeira({ displayProduct, unitShort, showVariety, showPrice, reais, centavos, variety, highlightText, footerText, bannerColor, priceColor, accentColor }) {

  // Proportional section heights — must sum to 707px
  const BANNER_H  = 148
  const PRODUCT_H = 118
  const VARIETY_H = showVariety ? 52 : 0
  const FOOTER_H  = footerText ? 44 : 0
  const PRICE_H   = 707 - BANNER_H - PRODUCT_H - VARIETY_H - FOOTER_H

  // Product name: scales with character count — wider range for more prominence
  const nameFontSize = Math.max(76, Math.min(112, Math.floor(480 / Math.max(displayProduct.length, 4))))

  // Price font sizes — increased for better visual impact; width-tested at 468px content area
  const reaisFontSize = reais.length <= 1 ? 328 : reais.length <= 2 ? 248 : 185
  const centsFontSize = Math.round(reaisFontSize * 0.42)
  const unitFontSize  = Math.round(reaisFontSize * 0.30)

  // Right column height spans the reais visual height (used to space cents + KG)
  const extY = Math.round(reaisFontSize / 20)
  const priceGroupH = Math.round(reaisFontSize * 0.9) + extY

  // 3D extrusion depth proportional to font size (text-shadow stacking)
  const makeShadow = (size) => {
    const depth = Math.round(size / 20)
    return Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 #000`).join(', ')
  }

  // Clean solid 3D shadow for product name — solid offsets, no blurry stroke simulation
  const nameShadow = '3px 3px 0 #111, 5px 5px 0 rgba(0,0,0,0.35)'

  const bannerShadow = '2px 2px 0 #000,-2px 2px 0 #000,2px -2px 0 #000,-2px -2px 0 #000'

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Banner ── */}
      <div style={{
        height: `${BANNER_H}px`, flexShrink: 0,
        background: bannerColor,
        clipPath: 'polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '14px',
      }}>
        <div style={{
          fontFamily: "'Bangers', cursive",
          fontSize: '62px', lineHeight: 1.0,
          color: '#fff', textShadow: bannerShadow,
          letterSpacing: '3px', textTransform: 'uppercase',
          textAlign: 'center', maxWidth: '90%', wordBreak: 'break-word',
        }}>
          {highlightText || 'HOJE É DIA DE FEIRA'}
        </div>
      </div>

      {/* ── Nome do produto ── */}
      <div style={{
        height: `${PRODUCT_H}px`, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
      }}>
        <span style={{
          fontFamily: "'Boogaloo', cursive",
          fontStyle: 'italic',
          fontSize: `${nameFontSize}px`,
          lineHeight: 1,
          color: '#1a1a1a',
          textShadow: nameShadow,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          {displayProduct}
        </span>
      </div>

      {/* ── Variedade ── */}
      {showVariety && (
        <div style={{
          height: `${VARIETY_H}px`, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px',
        }}>
          <FeiraCurl color={accentColor} />
          <span style={{
            fontFamily: "'Boogaloo', cursive",
            fontStyle: 'italic',
            fontSize: '30px',
            color: '#333',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            {variety}
          </span>
          <FeiraCurl color={accentColor} mirror />
        </div>
      )}

      {/* ── Preço (elemento principal) ── */}
      <div style={{
        height: `${PRICE_H}px`, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', userSelect: 'none' }}>
          {/* Reais — grande */}
          <span style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: `${reaisFontSize}px`,
            lineHeight: 0.9,
            color: priceColor,
            textShadow: makeShadow(reaisFontSize),
            letterSpacing: '1px',
          }}>
            {showPrice ? reais : '0'}
          </span>
          {/* Coluna direita: centavos (topo) + unidade (baixo) */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            height: `${priceGroupH}px`,
            paddingLeft: '6px',
            paddingBottom: '4px',
          }}>
            <span style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: `${centsFontSize}px`,
              lineHeight: 1,
              color: priceColor,
              textShadow: makeShadow(centsFontSize),
              letterSpacing: '0px',
            }}>
              ,{showPrice ? centavos : '00'}
            </span>
            <span style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: `${unitFontSize}px`,
              color: '#1a1a1a',
              textShadow: makeShadow(unitFontSize),
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}>
              {unitShort}
            </span>
          </div>
        </div>
      </div>

      {/* ── Rodapé (opcional) ── */}
      {footerText && (
        <div style={{
          height: `${FOOTER_H}px`, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderTop: `2px dashed ${bannerColor}55`,
          padding: '0 20px',
        }}>
          <span style={{
            fontFamily: "'Fredoka One', cursive",
            fontSize: '20px',
            color: '#555',
            letterSpacing: '1px',
            textAlign: 'center',
          }}>
            {footerText}
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── TEMPLATE: CLÁSSICO ─── */
function TemplateClassico({ displayProduct, displayUnit, showVariety, showPrice, reais, centavos, variety, highlightText, footerText, bannerColor, priceColor, accentColor }) {
  return (
    <>
      <div style={{ background: bannerColor, clipPath: 'polygon(0 0, 100% 0, 94% 100%, 6% 100%)', paddingTop: '14px', paddingBottom: '18px', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Bangers', cursive", fontSize: '28px', color: '#FFF', letterSpacing: '3px', textShadow: '1px 1px 0 #000,-1px 1px 0 #000,1px -1px 0 #000,-1px -1px 0 #000', textTransform: 'uppercase' }}>
          {highlightText || 'HOJE É DIA DE FEIRA'}
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '18px 32px 12px', gap: '4px' }}>
        <div style={{ fontFamily: "'Bangers', cursive", fontSize: '72px', lineHeight: '1', color: '#1a1a1a', letterSpacing: '3px', textTransform: 'uppercase', textAlign: 'center', wordBreak: 'break-word' }}>
          {displayProduct}
        </div>
        {showVariety && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', marginBottom: '4px' }}>
            <Flourish color={accentColor} />
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '26px', color: '#333', letterSpacing: '1px' }}>{variety}</span>
            <Flourish color={accentColor} mirror />
          </div>
        )}
        <div style={{ width: '80%', height: '3px', background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`, margin: '8px 0', borderRadius: '2px' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: '38px', color: priceColor, textShadow: '2px 2px 0 #000', lineHeight: '1' }}>R$</span>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: showPrice ? '110px' : '80px', color: priceColor, textShadow: '3px 3px 0 #000,5px 5px 0 rgba(0,0,0,0.3)', lineHeight: '1' }}>{showPrice ? reais : '00'}</span>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: '52px', color: priceColor, textShadow: '2px 2px 0 #000', lineHeight: '1', alignSelf: 'flex-start', marginTop: '12px' }}>,{showPrice ? centavos : '00'}</span>
        </div>
        {displayUnit && <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', color: '#333', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '-4px' }}>{displayUnit}</div>}
        {footerText && <FooterText text={footerText} accentColor={accentColor} />}
      </div>
      <BottomStripe bannerColor={bannerColor} accentColor={accentColor} />
    </>
  )
}

/* ─── TEMPLATE: DESTAQUE ─── */
function TemplateDestaque({ displayProduct, displayUnit, showVariety, showPrice, reais, centavos, variety, highlightText, footerText, bannerColor, priceColor, accentColor }) {
  return (
    <>
      <div style={{ background: bannerColor, clipPath: 'polygon(0 0, 100% 0, 94% 100%, 6% 100%)', paddingTop: '12px', paddingBottom: '16px', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Bangers', cursive", fontSize: '24px', color: '#FFF', letterSpacing: '3px', textShadow: '1px 1px 0 #000,-1px 1px 0 #000,1px -1px 0 #000,-1px -1px 0 #000', textTransform: 'uppercase' }}>
          {highlightText || 'HOJE É DIA DE FEIRA'}
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 32px 12px', gap: '2px' }}>
        <div style={{ fontFamily: "'Bangers', cursive", fontSize: '42px', lineHeight: '1', color: '#1a1a1a', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' }}>{displayProduct}</div>
        {showVariety && <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', color: '#666', letterSpacing: '1px', marginBottom: '4px' }}>{variety}</div>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', margin: '8px 0 4px' }}>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: '34px', color: priceColor, textShadow: '2px 2px 0 #000', lineHeight: '1' }}>R$</span>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: showPrice ? '130px' : '100px', color: priceColor, textShadow: '4px 4px 0 #000,7px 7px 0 rgba(0,0,0,0.25)', lineHeight: '1' }}>{showPrice ? reais : '00'}</span>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: '62px', color: priceColor, textShadow: '2px 2px 0 #000', lineHeight: '1', alignSelf: 'flex-start', marginTop: '14px' }}>,{showPrice ? centavos : '00'}</span>
        </div>
        {displayUnit && <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '24px', color: '#222', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '-6px' }}>{displayUnit}</div>}
        {footerText && <FooterText text={footerText} accentColor={accentColor} />}
      </div>
      <BottomStripe bannerColor={bannerColor} accentColor={accentColor} />
    </>
  )
}

/* ─── TEMPLATE: MINIMALISTA ─── */
function TemplateMinimalista({ displayProduct, displayUnit, showVariety, showPrice, reais, centavos, variety, highlightText, footerText, bannerColor, priceColor, accentColor }) {
  return (
    <>
      <div style={{ background: bannerColor, padding: '12px 24px', textAlign: 'center', borderBottom: `4px solid ${accentColor}` }}>
        <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', color: '#FFF', letterSpacing: '4px', textTransform: 'uppercase' }}>{highlightText || 'HOJE É DIA DE FEIRA'}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 28px 16px', gap: '6px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '10px', border: `2px solid ${accentColor}`, borderRadius: '4px', opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Bangers', cursive", fontSize: '68px', lineHeight: '1', color: '#1a1a1a', letterSpacing: '4px', textTransform: 'uppercase', textAlign: 'center' }}>{displayProduct}</div>
        {showVariety && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '1px', background: accentColor }} />
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', color: '#555', letterSpacing: '1px' }}>{variety}</span>
            <div style={{ width: '40px', height: '1px', background: accentColor }} />
          </div>
        )}
        <div style={{ background: `${priceColor}12`, border: `3px solid ${priceColor}`, borderRadius: '8px', padding: '8px 32px', margin: '8px 0 4px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: '32px', color: priceColor, lineHeight: '1' }}>R$</span>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: showPrice ? '96px' : '72px', color: priceColor, textShadow: '2px 2px 0 rgba(0,0,0,0.2)', lineHeight: '1' }}>{showPrice ? reais : '00'}</span>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: '46px', color: priceColor, lineHeight: '1', alignSelf: 'flex-start', marginTop: '10px' }}>,{showPrice ? centavos : '00'}</span>
        </div>
        {displayUnit && <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', color: '#444', letterSpacing: '2px', textTransform: 'uppercase' }}>{displayUnit}</div>}
        {footerText && <FooterText text={footerText} accentColor={accentColor} />}
      </div>
      <div style={{ height: '12px', background: bannerColor, borderTop: `4px solid ${accentColor}` }} />
    </>
  )
}

/* ─── SHARED COMPONENTS ─── */

function FooterText({ text, accentColor }) {
  return (
    <div style={{ marginTop: '8px', borderTop: `1px dashed ${accentColor}`, paddingTop: '6px', width: '100%', textAlign: 'center' }}>
      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '16px', color: '#666', letterSpacing: '1px' }}>{text}</span>
    </div>
  )
}

function BottomStripe({ bannerColor, accentColor }) {
  return (
    <div style={{ height: '8px', background: `repeating-linear-gradient(90deg, ${bannerColor} 0px, ${bannerColor} 24px, ${accentColor} 24px, ${accentColor} 48px)` }} />
  )
}

function Flourish({ color, mirror }) {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" style={{ transform: mirror ? 'scaleX(-1)' : 'none', flexShrink: 0 }} fill="none">
      <path d="M2 10 C6 4, 12 4, 14 10 C16 16, 22 16, 26 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="2" cy="10" r="2.5" fill={color} />
      <path d="M22 5 L26 10 L22 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function FeiraCurl({ color, mirror }) {
  return (
    <svg
      width="42" height="14" viewBox="0 0 42 14"
      style={{ transform: mirror ? 'scaleX(-1)' : 'none', flexShrink: 0 }}
      fill="none"
    >
      {/* Elegant thin arc — outer end (left) → inner end (right, near text) */}
      <path d="M4 7 C10 4, 28 4, 38 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Small filled circle at outer end */}
      <circle cx="4" cy="7" r="2.2" fill={color} />
      {/* Small diamond at inner end, pointing toward text */}
      <path d="M38 7 L40 5 L42 7 L40 9 Z" fill={color} />
    </svg>
  )
}

export default SignPreview
