import { Outlet } from "react-router"
import { Footer } from "./components/layout/Footer"
import { Navbar } from "./components/layout/Navbar"
import { useScrollToHash } from "./hooks/useScrollToHash"

function App() {
  useScrollToHash()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
