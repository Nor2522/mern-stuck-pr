import { Children, createContext, useContext, useState, type ReactNode } from "react";

interface User {
  id: string;
  name: String;
  email: string;
}
const UserContext = createContext<any | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const login = (userData: User, expireIn: number) => {
    const expiretionTime = new Date().getTime() + expireIn;

    localStorage.setItem("expiretionTime", expiretionTime.toString());
    localStorage.setItem("userData", JSON.stringify(userData));

    setUser(userData);
  };
  return (
    <UserContext.Provider value={{ user, setUser, login }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser=()=>{
    return useContext(UserContext)
}
export default useUser