import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.defaults.baseURL = '/api'
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Optionally validate token with backend
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await axios.post('/auth/login', { email, password })
    const { access_token } = response.data.data
    localStorage.setItem('token', access_token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setUser({ email })
    return response.data
  }

  const register = async (email, password, full_name) => {
    const response = await axios.post('/auth/register', { email, password, full_name })
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!localStorage.getItem('token')
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
