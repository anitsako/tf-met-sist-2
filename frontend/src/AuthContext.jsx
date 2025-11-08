import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    
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
        if(user) {
            localStorage.setItem('user', JSON.stringify(user))
        } else {
            localStorage.removeItem('user')
        }


    }, [user])


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