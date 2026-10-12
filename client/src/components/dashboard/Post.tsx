import { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const Post = ({post}:{post:ReactNode}) => {
  return (
 <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
           <CardDescription>{post.content}</CardDescription>
       </CardHeader>
         <CardContent>
           { <img src={post.image} alt={post.title}/>}
        </CardContent>
 </Card> )}

export default Post
