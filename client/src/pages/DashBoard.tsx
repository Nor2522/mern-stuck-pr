import { useState } from "react"
import DailogForm from "@/components/dashboard/DailogForm"
import Posts from "@/components/dashboard/Posts"

const DashBoard = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="m-4 space-y-4">
      <DailogForm onCreated={() => setRefreshKey((key) => key + 1)} />
      <Posts refreshKey={refreshKey} />
    </div>
  )
}

export default DashBoard
