import { Link } from "react-router"
import { Button } from "@/components/ui/button"

const HomePage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Share your progress. Stay motivated.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        A community where programmers post about what they build, learn and
        struggle with. The home page is built in the next task.
      </p>
      <div className="mt-6 flex gap-2">
        <Button render={<Link to="/explore" />}>Browse posts</Button>
      </div>
    </div>
  )
}

export default HomePage
