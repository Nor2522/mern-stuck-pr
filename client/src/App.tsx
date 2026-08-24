import { Outlet } from "react-router";
import "./App.css";

function App() {
  return (
    <>
      <h1 className="bg-slate-800 flex justify-center items-center w-full h-44">
        Hello Vite + React!
      </h1>
      <Outlet />
    </>
  );
}

export default App;
