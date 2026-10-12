import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { api } from "@/lib/api";
import useUser from "@/hooks/useUser";
import { Button } from "./ui/button";

const Header = () => {
  const { user, logOut } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/user/sign-out");
      logOut();
      navigate("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Logout wuu fashilmay",
      );
    }
  };

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
              onClick={handleLogout}
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
