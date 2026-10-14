import { Link } from "react-router"
import {
  Bookmark,
  Heart,
  PenLine,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { useAuth } from "@/features/auth/auth-context"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: PenLine,
    title: "Share your progress",
    description:
      "Post the wins, the lessons and the days you got stuck. Half-finished is still progress.",
  },
  {
    icon: TrendingUp,
    title: "Grow in public",
    description:
      "Keep a visible trail of what you learn, so future you knows how far you have come.",
  },
  {
    icon: Users,
    title: "Never ship alone",
    description:
      "Read stories from developers in the same boat and cheer each other on.",
  },
  {
    icon: Heart,
    title: "Encourage others",
    description:
      "A like or a kind comment can be the nudge someone needs to keep going.",
  },
  {
    icon: Bookmark,
    title: "Save what inspires you",
    description:
      "Keep the posts that motivate you close, so you can come back whenever you need a boost.",
  },
  {
    icon: Sparkles,
    title: "Build momentum",
    description:
      "Turn sharing into a habit and watch small, consistent steps add up.",
  },
]

const AboutPage = () => {
  useDocumentTitle("About")
  const { user } = useAuth()
  const primaryTo = user ? "/dashboard" : "/register"
  const primaryLabel = user ? "Go to dashboard" : "Join the community"

  return (
    <div className="mx-auto max-w-4xl px-4">
      <section className="py-20 text-center sm:py-24">
        <h1 className="mx-auto max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Programmers helping each other stay{" "}
          <span className="text-primary">motivated</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          DevMotiv is a community where developers share what they build, learn
          and struggle with, so nobody ships alone.
        </p>
      </section>

      <section className="py-8">
        <h2 className="font-heading text-2xl font-semibold">Our mission</h2>
        <div className="mt-4 space-y-4 text-muted-foreground">
          <p>
            Learning to code is full of quiet, lonely moments. Bugs that refuse
            to die, tutorials that never stick, projects abandoned halfway. Too
            often we only ever see the polished results of other people's work,
            never the messy middle.
          </p>
          <p>
            DevMotiv is the antidote to that. It is a place to be honest about
            the process, celebrate small steps, and find people who understand
            exactly what you are going through.
          </p>
        </div>
      </section>

      <section className="py-8">
        <h2 className="font-heading text-2xl font-semibold">
          What you can do here
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border p-6">
              <feature.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-heading font-medium">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 pb-16">
        <div className="rounded-xl border bg-muted/30 p-8 text-center">
          <h2 className="font-heading text-xl font-semibold">
            Ready to share your progress?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Join the community and make sharing progress a habit.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link to={primaryTo} />}
            >
              {primaryLabel}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/explore" />}
            >
              Browse posts
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
