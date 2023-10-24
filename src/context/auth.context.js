import React, { useContext, useState } from "react";

const AuthContext = React.createContext();

export function useAuth(AuthContext) {
  return useContext(AuthContext)
}

export function AuthProvider({children}) {
  const [currentUser, setCurrentUser] = useState()

  function login(email, password) {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  const value = {
    currentUser
  }

  return <AuthContext.Provider>{children}</AuthContext.Provider>;
}
