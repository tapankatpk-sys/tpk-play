'use client'

import { useState, useEffect } from 'react'

interface Game {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
}

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/tapankatpk/',
  instagram: 'https://www.instagram.com/tapankatpk?igsh=YnQ4dnJ2czE0YzJz',
  whatsapp: 'https://whatsapp.com/channel/YnQ4dnJ2czE0YzJz',
  whatsappGroup: 'https://wa.me/573112632365',
}

type Step = 'rules' | 'social' | 'form' | 'success'

export default function RegistrationSection() {
  const [step, setStep] = useState<Step>('rules')
  const [games, setGames] = useState<Game[]>([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    teamSlug: '',
    gameId: '',
  })
  const [socials, setSocials] = useState({
    facebook: false,
    instagram: false,
    whatsapp: false,
  })
  const [registrationCode, setRegistrationCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSection, setShowSection] = useState(false)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/games')
        const data = await res.json()
        setGames(data.filter((g: Game) => g.isActive))
      } catch (err) {
        console.error('Error fetching games:', err)
      }
    }
    fetchGames()
  }, [])

  const handleSubmit = async () => {
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.teamSlug.trim()) {
      setError('Todos los campos son requeridos, incluyendo tu equipo hincha')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          teamSlug: form.teamSlug,
          followedFb: socials.facebook,
          followedIg: socials.instagram,
          followedWa: socials.whatsapp,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al registrar')
        return
      }
      setRegistrationCode(data.code)
      setStep('success')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const openSocial = (url: string, key: keyof typeof socials) => {
    window.open(url, '_blank')
    setSocials(prev => ({ ...prev, [key]: true }))
  }

  if (!showSection) {
    return (
      <div className="w-full flex flex-col items-center py-8">
        <button
          onClick={() => setShowSection(true)}
          className="relative px-10 py-4 rounded-full font-black text-lg tracking-wider uppercase overflow-hidden group cursor-pointer transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #f97316 50%, #22c55e 100%)',
            color: '#fff',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(249, 115, 22, 0.3), 0 0 60px rgba(34, 197, 94, 0.2)',
          }}
        >
          <span className="relative z-10">Regístrate y Juega</span>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['rules', 'social', 'form'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: step === s
                  ? 'linear-gradient(135deg, #a855f7, #f97316)'
                  : ['rules', 'social', 'form'].indexOf(step) > i
                    ? '#22c55e'
                    : 'rgba(255,255,255,0.1)',
                color: step === s || ['rules', 'social', 'form'].indexOf(step) > i ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: step === s ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none',
              }}
            >
              {['rules', 'social', 'form'].indexOf(step) > i ? '✓' : i + 1}
            </div>
            {i < 2 && (
              <div className="w-8 h-[2px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step: Rules */}
      {step === 'rules' && (
        <div className="space-y-6">
          <h3
            className="text-2xl font-black text-center uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #d8b4fe, #f97316, #4ade80)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Reglas de Participación
          </h3>

          <div className="space-y-4">
            {[
              {
                icon: '📋',
                title: 'Registra tus datos',
                desc: 'Completa el formulario con tu nombre completo, correo electrónico y número de teléfono.',
              },
              {
                icon: '👍',
                title: 'Síguenos en redes sociales',
                desc: 'Sigue a TAPANKA TPK en Facebook, Instagram y nuestro canal de WhatsApp para mantenerte informado.',
              },
              {
                icon: '🎫',
                title: 'Recibe tu código TPK',
                desc: 'Al registrarte recibirás un código alfanumérico único que empieza con TPK. Este código es tu identificación para participar.',
              },
              {
                icon: '🎮',
                title: '¡Participa y gana!',
                desc: 'Usa tu código TPK para participar en los juegos lúdicos deportivos y ganar premios increíbles.',
              },
            ].map((rule, i) => (
              <div
                key={i}
                className="p-4 rounded-xl flex gap-4 items-start transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(168, 85, 247, 0.15)',
                }}
              >
                <div className="text-2xl flex-shrink-0">{rule.icon}</div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#d8b4fe' }}>{rule.title}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{rule.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy notice */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.25)',
            }}
          >
            <div className="flex gap-3 items-start">
              <span className="text-lg">🔒</span>
              <div>
                <div className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: '#fdba74' }}>
                  Aviso de Privacidad
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Tus datos personales (nombre, correo electrónico y teléfono) serán utilizados exclusivamente para fines de marketing de la marca <strong style={{ color: '#d8b4fe' }}>TAPANKA TPK</strong>, incluyendo promociones de zapatillas, prendas y complementos deportivos personalizados. No compartiremos tu información con terceros. Al registrarte aceptas esta política de uso de datos.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('social')}
            className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: 'white',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
            }}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* Step: Social Follow */}
      {step === 'social' && (
        <div className="space-y-6">
          <h3
            className="text-2xl font-black text-center uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #f97316, #d8b4fe, #4ade80)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Síguenos en Redes
          </h3>

          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Sigue a TAPANKA TPK en nuestras redes sociales para completar tu registro. Haz clic en cada botón para visitar y luego confirma.
          </p>

          <div className="space-y-3">
            {/* Facebook */}
            <div
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(59, 89, 152, 0.1)', border: '1px solid rgba(59, 89, 152, 0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#3b5998' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#8b9dc3' }}>Facebook</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>@tapankatpk</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSocial(SOCIAL_LINKS.facebook, 'facebook')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  style={{ background: 'rgba(59, 89, 152, 0.3)', color: '#8b9dc3', border: '1px solid rgba(59, 89, 152, 0.4)' }}
                >
                  Visitar
                </button>
                <button
                  onClick={() => setSocials(prev => ({ ...prev, facebook: !prev.facebook }))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    background: socials.facebook ? '#22c55e' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${socials.facebook ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                    color: socials.facebook ? '#fff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {socials.facebook ? '✓' : '○'}
                </button>
              </div>
            </div>

            {/* Instagram */}
            <div
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(225, 48, 108, 0.08)', border: '1px solid rgba(225, 48, 108, 0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#e1306c' }}>Instagram</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>@tapankatpk</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSocial(SOCIAL_LINKS.instagram, 'instagram')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  style={{ background: 'rgba(225, 48, 108, 0.2)', color: '#e1306c', border: '1px solid rgba(225, 48, 108, 0.4)' }}
                >
                  Visitar
                </button>
                <button
                  onClick={() => setSocials(prev => ({ ...prev, instagram: !prev.instagram }))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    background: socials.instagram ? '#22c55e' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${socials.instagram ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                    color: socials.instagram ? '#fff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {socials.instagram ? '✓' : '○'}
                </button>
              </div>
            </div>

            {/* WhatsApp Channel */}
            <div
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#22c55e' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.694-1.358A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.136 0-4.144-.62-5.845-1.688l-.414-.258-2.965.858.87-2.89-.276-.438A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#4ade80' }}>Canal WhatsApp</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>TAPANKA TPK</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSocial(SOCIAL_LINKS.whatsapp, 'whatsapp')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)' }}
                >
                  Visitar
                </button>
                <button
                  onClick={() => setSocials(prev => ({ ...prev, whatsapp: !prev.whatsapp }))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    background: socials.whatsapp ? '#22c55e' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${socials.whatsapp ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                    color: socials.whatsapp ? '#fff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {socials.whatsapp ? '✓' : '○'}
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp group button */}
          <div
            className="p-4 rounded-xl text-center"
            style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px dashed rgba(34, 197, 94, 0.3)' }}
          >
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Únete al grupo de WhatsApp TPK PLAY para recibir información de los juegos
            </p>
            <a
              href={SOCIAL_LINKS.whatsappGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.694-1.358A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.136 0-4.144-.62-5.845-1.688l-.414-.258-2.965.858.87-2.89-.276-.438A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Grupo WhatsApp TPK PLAY
            </a>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('rules')}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ← Atrás
            </button>
            <button
              onClick={() => setStep('form')}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                color: 'white',
                boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
              }}
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* Step: Form */}
      {step === 'form' && (
        <div className="space-y-6">
          <h3
            className="text-2xl font-black text-center uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #4ade80, #d8b4fe, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Completa tu Registro
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#d8b4fe' }}>
                Nombre Completo *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#fdba74' }}>
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#4ade80' }}>
                Número de Teléfono *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+57 3XX XXX XXXX"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-2"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              />
            </div>

            {/* Equipo Hincha - OBLIGATORIO */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#facc15' }}>
                Equipo Hincha *
              </label>
              <p className="text-[0.6rem] mb-2" style={{ color: 'rgba(250,204,21,0.5)' }}>
                Selecciona el equipo del que eres hincha. Es obligatorio para participar.
              </p>
              <select
                value={form.teamSlug}
                onChange={(e) => setForm({ ...form, teamSlug: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: form.teamSlug ? '1px solid rgba(250,204,21,0.5)' : '1px solid rgba(239,68,68,0.5)',
                  boxShadow: form.teamSlug ? '0 0 8px rgba(250,204,21,0.15)' : '0 0 8px rgba(239,68,68,0.15)',
                }}
              >
                <option value="">Selecciona tu equipo hincha</option>
                <optgroup label="Antioquia">
                  <option value="aguilas-doradas">Águilas Doradas</option>
                  <option value="atletico-nacional">Atl. Nacional</option>
                  <option value="independiente-medellin">Ind. Medellín</option>
                </optgroup>
                <optgroup label="Atlántico">
                  <option value="atletico-junior">Atl. Junior</option>
                </optgroup>
                <optgroup label="Boyacá">
                  <option value="boyaca-chico">Boyacá Chicó</option>
                </optgroup>
                <optgroup label="Caldas">
                  <option value="once-caldas">Once Caldas</option>
                </optgroup>
                <optgroup label="Cesar">
                  <option value="alianza-valledupar">Alianza Valledupar</option>
                </optgroup>
                <optgroup label="Córdoba">
                  <option value="jaguares-de-cordoba">Jaguares</option>
                </optgroup>
                <optgroup label="Cundinamarca">
                  <option value="fortaleza-ceif">Fortaleza CEIF</option>
                  <option value="independiente-santa-fe">Ind. Santa Fe</option>
                  <option value="internacional-de-bogota">Internacional</option>
                  <option value="millonarios">Millonarios</option>
                </optgroup>
                <optgroup label="Meta">
                  <option value="llaneros">Llaneros</option>
                </optgroup>
                <optgroup label="Nariño">
                  <option value="deportivo-pasto">Deportivo Pasto</option>
                </optgroup>
                <optgroup label="Norte de Santander">
                  <option value="cucuta-deportivo">Cúcuta Deportivo</option>
                </optgroup>
                <optgroup label="Risaralda">
                  <option value="deportivo-pereira">Deportivo Pereira</option>
                </optgroup>
                <optgroup label="Santander">
                  <option value="atletico-bucaramanga">Atl. Bucaramanga</option>
                </optgroup>
                <optgroup label="Tolima">
                  <option value="deportes-tolima">Deportes Tolima</option>
                </optgroup>
                <optgroup label="Valle">
                  <option value="america-de-cali">América de Cali</option>
                  <option value="deportivo-cali">Deportivo Cali</option>
                </optgroup>
              </select>
              {!form.teamSlug && (
                <p className="text-[0.55rem] mt-1 font-bold" style={{ color: '#ef4444' }}>
                  Debes seleccionar tu equipo hincha para continuar
                </p>
              )}
              {form.teamSlug && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
                  <img
                    src={`/images/teams/${form.teamSlug}${form.teamSlug === 'internacional-de-bogota' ? '.png' : '.svg'}`}
                    alt={form.teamSlug}
                    className="w-6 h-6 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="text-xs font-bold" style={{ color: '#facc15' }}>
                    {(() => {
                      const teamMap: Record<string, string> = {
                        'aguilas-doradas': 'Águilas Doradas', 'alianza-valledupar': 'Alianza Valledupar',
                        'america-de-cali': 'América de Cali', 'atletico-bucaramanga': 'Atl. Bucaramanga',
                        'atletico-junior': 'Atl. Junior', 'atletico-nacional': 'Atl. Nacional',
                        'boyaca-chico': 'Boyacá Chicó', 'cucuta-deportivo': 'Cúcuta Deportivo',
                        'deportes-tolima': 'Deportes Tolima', 'deportivo-cali': 'Deportivo Cali',
                        'deportivo-pasto': 'Deportivo Pasto', 'deportivo-pereira': 'Deportivo Pereira',
                        'fortaleza-ceif': 'Fortaleza CEIF', 'independiente-medellin': 'Ind. Medellín',
                        'independiente-santa-fe': 'Ind. Santa Fe', 'internacional-de-bogota': 'Internacional',
                        'jaguares-de-cordoba': 'Jaguares', 'llaneros': 'Llaneros',
                        'millonarios': 'Millonarios', 'once-caldas': 'Once Caldas',
                      }
                      return teamMap[form.teamSlug] || form.teamSlug
                    })()}
                  </span>
                </div>
              )}
            </div>

            {games.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Juego (Opcional)
                </label>
                <select
                  value={form.gameId}
                  onChange={(e) => setForm({ ...form, gameId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <option value="">Selecciona un juego</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl text-center text-xs font-bold" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('social')}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ← Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
              }}
            >
              {submitting ? 'Registrando...' : 'Registrarme'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="space-y-6 text-center">
          <div className="text-6xl">🎉</div>
          <h3
            className="text-2xl font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #4ade80, #d8b4fe, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ¡Registro Exitoso!
          </h3>

          <div
            className="p-6 rounded-xl"
            style={{
              background: 'rgba(168, 85, 247, 0.1)',
              border: '2px solid rgba(168, 85, 247, 0.4)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)',
            }}
          >
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Tu código de registro
            </div>
            <div
              className="text-4xl font-black tracking-[0.2em]"
              style={{
                color: '#d8b4fe',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.6), 0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
              }}
            >
              {registrationCode}
            </div>
            <div className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Guarda este código. Lo necesitarás para participar.
            </div>
          </div>

          <div
            className="p-4 rounded-xl text-left"
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
            }}
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Tu información ha sido enviada al grupo de WhatsApp <strong style={{ color: '#4ade80' }}>TPK PLAY</strong>. Te contactaremos con las novedades de los juegos y las promociones de <strong style={{ color: '#d8b4fe' }}>TAPANKA TPK</strong>.
            </p>
          </div>

          <a
            href={SOCIAL_LINKS.whatsappGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.694-1.358A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.136 0-4.144-.62-5.845-1.688l-.414-.258-2.965.858.87-2.89-.276-.438A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Ir al Grupo WhatsApp TPK PLAY
          </a>

          <button
            onClick={() => {
              setStep('rules')
              setForm({ name: '', email: '', phone: '', teamSlug: '', gameId: '' })
              setSocials({ facebook: false, instagram: false, whatsapp: false })
              setRegistrationCode('')
              setShowSection(false)
            }}
            className="w-full py-2 text-xs uppercase tracking-wider cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )
}
