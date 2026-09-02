import useUser from "@/hooks/useUser";
import { Link } from "react-router";
import { Button } from "./ui/button";

const Header = () => {
  const { user, logOut } = useUser();

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-gray-800 text-white">
      <Link to="/">my app</Link>
      <ul className="flex justify-between items-center space-x-2">
        {user ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashbord</Link>
            <Button
              variant={"outline"}
              className={"bg-slate-900/50"}
              onClick={() => logOut()}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </ul>
    </header>
  );
};

export default Header;
