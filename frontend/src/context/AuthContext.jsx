import { createContext, useContext, useState, useEffect } from 'react'
const AuthContext = createContext()

export function AuthProvider({ children }){
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('access_token'))
    const [loading, setLoading] = useState(true)

    useEffect(() =>{
        //check if user is already logged in
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('access_token')
        if (savedUser && savedToken){
            setUser(JSON.parse(savedUser))
            setToken(savedToken)
        }
        setLoading(false)
    }, [])

    const login = (userData, accessToken, refreshToken) => {
        setUser(userData)
        setToken(accessToken)
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user', JSON.stringify(userData))
    }
   
    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
        {children}
        </AuthContext.Provider>
    )
    
}

// custom hook to use auth context
export const useAuth = () => useContext(AuthContext)
