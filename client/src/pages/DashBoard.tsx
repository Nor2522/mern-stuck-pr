import { useState } from "react"
import DailogForm from "@/components/dashboard/DailogForm"
import Posts from "@/components/dashboard/Posts"

const DashBoard = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((key) => key + 1)

  return (
    <div className="m-4 space-y-4">
      <DailogForm onCreated={refresh} />
      <Posts refreshKey={refreshKey} onChanged={refresh} />
    </div>
  )
}

export default DashBoard
