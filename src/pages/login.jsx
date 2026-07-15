import { useState } from 'react'
import logo from '../assets/logo.png'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ userId: '', password: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCancel = () => {
    setForm({ userId: '', password: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // À connecter plus tard à l'API d'authentification
    console.log('Connexion demandée avec :', form)
  }

  return (
    <div className="login-page">
      <style>{`
        :root {
          --bg: #0B1F17;
          --bg-2: #0F2A20;
          --card: #12241C;
          --accent: #1E8F5E;
          --accent-light: #33B37A;
          --ink: #0B1F17;
          --muted: #6B7A72;
          --border: #E4E9E6;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          font-family: 'Inter', sans-serif;
          background: radial-gradient(circle at 20% -10%, var(--bg-2), var(--bg) 60%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          color: var(--ink);
        }

        .barcode-bg {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          pointer-events: none;
          background-image: repeating-linear-gradient(90deg, #ffffff 0 2px, transparent 2px 6px, #ffffff 6px 9px, transparent 9px 18px, #ffffff 18px 21px, transparent 21px 30px);
          mask-image: radial-gradient(circle at 30% 30%, black, transparent 65%);
        }

        .scene {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 400px;
        }

        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .brand-logo { width: 34px; height: 34px; object-fit: contain; }
        .brand-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; color: #F4F7F5; letter-spacing: -0.02em; }
        .brand-name span { color: var(--accent-light); }

        .card {
          background: var(--card);
          width: 100%;
          border-radius: 18px;
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
          overflow: hidden;
        }

        .scan-strip {
          height: 10px;
          width: 100%;
          background: repeating-linear-gradient(90deg, #F4F7F5 0 2px, transparent 2px 5px, #F4F7F5 5px 6px, transparent 6px 11px, #F4F7F5 11px 14px, transparent 14px 22px);
          position: relative;
          overflow: hidden;
        }
        .scan-strip::after {
          content: "";
          position: absolute;
          top: 0; left: -30%;
          width: 30%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(30,143,94,0.9), transparent);
          animation: scan 2.8s ease-in-out infinite;
        }
        @keyframes scan {
          0% { left: -30%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scan-strip::after { animation: none; display: none; }
        }

        .card-body { padding: 34px 32px 28px; }
        .tagline { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: #F4F7F5; margin-bottom: 4px; }
        .subtext { font-size: 13px; color: var(--muted); margin-bottom: 26px; }

        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1.5px solid #24382E;
          border-radius: 10px;
          padding: 11px 13px;
          transition: border-color .15s ease, box-shadow .15s ease;
          background: #0E1C15;
        }
        .input-wrap:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(30,143,94,0.18);
          background: #0E1C15;
        }
        .input-wrap svg { width: 17px; height: 17px; color: var(--muted); flex-shrink: 0; }
        .input-wrap:focus-within svg { color: var(--accent); }
        .input-wrap input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          width: 100%;
          color: #F4F7F5;
        }
        .input-wrap input::placeholder { color: #5C6E64; }
        .toggle-pass { cursor: pointer; color: var(--muted); display: flex; }
        .toggle-pass:hover { color: #F4F7F5; }

        .actions { display: flex; gap: 10px; margin-top: 22px; }
        .btn {
          flex: 1;
          padding: 12px 14px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          border: none;
          transition: transform .12s ease, filter .12s ease, background .15s ease;
        }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-primary:hover { filter: brightness(1.07); }
        .btn-ghost { background: transparent; color: var(--muted); border: 1.5px solid #24382E; }
        .btn-ghost:hover { color: #F4F7F5; border-color: #3A5346; }

        .links { display: flex; justify-content: space-between; margin-top: 18px; }
        .links a { font-size: 12.5px; color: var(--muted); text-decoration: none; border-bottom: 1px solid transparent; }
        .links a:hover { color: var(--accent); border-bottom-color: var(--accent); }

        .footer { text-align: center; padding: 14px 0 6px; }
        .footer span { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.06em; color: rgba(244,247,245,0.45); }
        .footer span b { color: var(--accent-light); font-weight: 500; }
      `}</style>

      <div className="barcode-bg"></div>

      <div className="scene">
        <div className="brand">
          <img src={logo} alt="OptiStock" className="brand-logo" />
          <div className="brand-name">Opti<span>Stock</span></div>
        </div>

        <div className="card">
          <div className="scan-strip"></div>
          <div className="card-body">
            <div className="tagline">Votre business, numérisé.</div>
            <div className="subtext">Connectez-vous à votre espace de gestion.</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="userId">Identifiant</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="3.5"/>
                    <path d="M4.5 20c1.6-3.6 4.5-5.5 7.5-5.5s5.9 1.9 7.5 5.5"/>
                  </svg>
                  <input
                    type="text"
                    id="userId"
                    name="userId"
                    placeholder="Nom d'utilisateur ou e-mail"
                    autoComplete="username"
                    value={form.userId}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password">Mot de passe</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="10.5" width="14" height="9.5" rx="2"/>
                    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <span
                    className="toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                    title="Afficher le mot de passe"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
                        <path d="M3 3l18 18"/>
                        <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24"/>
                        <path d="M6.5 6.7C4.5 8 3 12 3 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.2M17.5 17.3C19.4 16 21 12 21 12s-1.2-2.4-3.4-4.3"/>
                        <path d="M9.5 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </span>
                </div>
              </div>

              <div className="actions">
                <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Se connecter
                </button>
              </div>
            </form>

            <div className="links">
              <a href="#">Mot de passe oublié ?</a>
              <a href="#">Besoin d'aide ?</a>
            </div>
          </div>
        </div>

        <div className="footer">
          <span>Propulsé par <b>StellarBrightSoftware</b></span>
        </div>
      </div>
    </div>
  )
}