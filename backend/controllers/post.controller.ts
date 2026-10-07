import type { Request, Response,NextFunction } from "express";
import Post from "../models/post.model";

export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.find();
    res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error,
    });
  }
};

// create post

export const createPost = async (req: Request, res: Response) => {
 try {
  const currentUser = (req as any).user 

 } catch (error) {
   res.status(200).json({sucess:false,message:(error as any).message})
 }
}
// test 
const test = async(req:Request,res:Response,next:NextFunction)=>{

}

// update posts

export const updatePost=async(req:Request,res:Response)=>{
  try {
    const {title,description} = req.body
    const updatedPost = Post.findByIdAndUpdate({new:true},{title,description})
    res.status(200).json({sucess:true, data:updatedPost})
  } catch (error) {
     res.status(400).json({ success:false, message:(error as any).message})
    
  }
}
