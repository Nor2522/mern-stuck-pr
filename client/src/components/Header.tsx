import { Link } from "react-router"


const Header = () => {
  return (
    <header className="flex justify-between items-center py-4 px-8 bg-gray-800 text-white">
      <Link to="/">my app</Link>
      <ul className="flex justify-between items-center space-x-2">
        <Link to="/" >Home</Link>
        <Link to="/dashboard">Dashbord</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>

      </ul>
    </header>
  )
}

export default Header