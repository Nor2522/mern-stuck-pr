import { useEffect,useState } from "react"
import Post from "./Post.tsx"
import axios from "axios"
import toast from "react-hot-toast"
import { Dialog } from "../ui/dialog.tsx"

const Posts = () => {
  
  const [ postData, setPostData ] = useState(null)
  const [ loading, setLoading ]= useState(false)
  useEffect(()=>{
   const readUserPost = async()=>{
     try {
        const { data } = await axios.get("/api/post")
        setLoading(false)
        setPostData(data)
      } catch (error) {
        toast.error((error as any).response.data)
        setLoading(false)
      } 
    }
    readUserPost()
  },[])
  return (
    <Dialog/>
    <div>
      {loading && <h1>Loading</h1>}
      {postData?.map(post=>(

      <Post key={post._id} post={post}/>
      )

      )}

    </div>
  )
}
export default Posts
