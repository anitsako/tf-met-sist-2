import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user')
        return savedUser ? JSON.parse(savedUser) : null
    })
    
    const login = (userData) => {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        navigate('/dashboard')
    }
    
    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        navigate('/')
    }
    
    useEffect(() => {
        if(!user && window.location.pathname !== '/') {
            navigate('/') // Iniciar sesión
        }
    }, [user, navigate])
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
    )
    
}
    export const useAuth = () => useContext(AuthContext)

    export const AuthPage = ({children}) => {
        const { user } = useAuth()
        if(!user) return <Navigate to='/'/>

        return children
}