import { Link } from "react-router"
import { Code2 } from "lucide-react"

const footerLinks = [
  { to: "/explore", label: "Explore" },
  { to: "/about", label: "About" },
]

export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2 font-heading font-medium text-foreground">
          <Code2 className="size-4 text-primary" />
          DevMotiv
        </div>
        <nav className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p>Share your progress. Stay motivated.</p>
      </div>
    </footer>
  )
}
