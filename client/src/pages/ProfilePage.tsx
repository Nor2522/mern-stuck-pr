import { useParams } from "react-router"

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-2xl font-semibold">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Public profile for <span className="font-mono">{id}</span> is built in
        T2.6.
      </p>
    </div>
  )
}

export default ProfilePage
