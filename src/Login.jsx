import { useState } from 'react'
import './Login.css'

const users = {
  poe: '2a5678bx',
  poisson: 'chipijama'
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const user = username.toLowerCase()
      if (users[user] && users[user] === password) {
        onLogin(user)
      } else {
        setError('Usuario o contraseña incorrectos')
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">📊</div>
          <h1>SIGEG</h1>
          <p>Sistema de Gestión de Ganancias</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Introduce tu usuario"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <span className="btn-icon">→</span>
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  )
}

export default Login
