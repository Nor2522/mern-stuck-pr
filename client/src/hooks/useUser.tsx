import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
}
const UserContext = createContext<any | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const logOut = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("expiretionTime");
    setUser(null);
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const expiratinTime = localStorage.getItem("expiretionTime");

    if (storedUser && expiratinTime) {
      const currentTime = new Date().getTime();
      if (parseInt(expiratinTime) > currentTime) {
        setUser(JSON.parse(storedUser));
      } else {
        logOut();
      }
    }
  }, []);
  const login = (userData: User, expireIn: number) => {
    const expiretionTime = new Date().getTime() + expireIn;

    localStorage.setItem("expiretionTime", expiretionTime.toString());
    localStorage.setItem("userData", JSON.stringify(userData));

    setUser(userData);
  };
  return (
    <UserContext.Provider value={{ user, setUser, login, logOut }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  return useContext(UserContext);
};
export default useUser;
