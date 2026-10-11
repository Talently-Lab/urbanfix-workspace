
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
  clearPersistedSession,
  loginWithCredentials,
  persistSession,
  restoreSession,
} from './authSession'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))
  const [sessionError, setSessionError] = useState('')

  const clearSession = useCallback(() => {
    setUser(null)
    setToken(null)
    setLoading(false)
    clearPersistedSession(localStorage)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession()
      setSessionError('')
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login', {
          replace: true,
          state: { message: 'Tu sesión expiró. Iniciá sesión nuevamente.' },
        })
      }
    }

    window.addEventListener('urbanfix:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('urbanfix:unauthorized', handleUnauthorized)
    }
  }, [clearSession, location.pathname, navigate])

  useEffect(() => {
    let active = true
    const savedToken = localStorage.getItem('token')

    if (!savedToken) {
      localStorage.removeItem('user')
      return () => {
        active = false
      }
    }

    restoreSession(api)
      .then((savedUser) => {
        if (active) {
          setUser(savedUser)
          setSessionError('')
          localStorage.setItem('user', JSON.stringify(savedUser))
        }
      })
      .catch((error) => {
        if (!active) return

        setUser(null)
        if (error.response?.status === 401) {
          clearSession()
          return
        }

        setSessionError(
          error.response?.data?.error ||
            'No se pudo validar la sesión. Verificá que el backend esté disponible.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [clearSession, token])

  const login = async (email, password) => {
    const { usuario, token: authToken } = await loginWithCredentials(api, email, password)

    setUser(usuario)
    setSessionError('')
    persistSession(localStorage, usuario, authToken)
    setToken(authToken)

    return usuario
  }

  const logout = () => {
    clearSession()
    setSessionError('')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, sessionError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
