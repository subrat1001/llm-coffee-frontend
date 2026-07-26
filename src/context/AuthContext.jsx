/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        const stored = localStorage.getItem("token");
        return stored && stored !== "undefined" && stored !== "null" ? stored : null;
    });

    useEffect(() => {
        if (token && token !== "undefined" && token !== "null") {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    const login = (newToken) => {
        if (newToken && newToken !== "undefined" && newToken !== "null") {
            localStorage.setItem("token", newToken);
            setToken(newToken);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}