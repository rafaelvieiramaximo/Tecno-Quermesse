"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Tipo apenas com os dados do usuário
interface UserData {
  userId: string;
  role: string;
  username: string;
  name: string;
}

// Tipo do contexto completo (dados + métodos)
interface UserContextType extends UserData {
  setUserData: (data: UserData) => void;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const setUserData = ({ userId, role, username, name }: UserData) => {
    setUserId(userId);
    setRole(role);
    setUsername(username);
    setName(name);
  };

  const clearUserData = () => {
    setUserId("");
    setRole("");
    setUsername("");
    setName("");
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        role,
        username,
        name,
        setUserData,
        clearUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext deve ser usado dentro de um UserProvider");
  }
  return context;
};
