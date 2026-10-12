import type { Request, Response } from "express"
import Post from "../models/post.model"
import { uploadToCloudinary } from "../config/cloudinary"


//  author populate  
const authorPapulate = { path:"author", select:"name email"}
// get posts
export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.find().populate(authorPapulate)
    res.status(200).json({ success: true, data: { post } })
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message })
  }
}

//  get post by id 
export const getUserPosts = async (req:Request,res:Response)=>{
  try {
    const currentUser = (req as any).user
    const post = await Post.find({author:currentUser}).populate(authorPapulate).sort({ createdAt :-1})

    res.status(200).json({
      success:true,
      data : {post}
    })

  } catch (error) {
   res.status(200).json({
      success:false,
      message:(error as any).message
    }) 
  }
}

// create post
export const createPost = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user
    const { title, description } = req.body
    const file = req.file // multer memoryStorage: file.buffer

    if (!file) {
      return res.status(400).json({ success: false, message: "please choose the image.." })
    }

    // 1) Cloudinary u dir, wuxuu soo celiyaa url iyo public_id
    const result = await uploadToCloudinary(file.buffer)

    // 2) Keydi post-ka: image waa object, ma aha buffer
    const post = await Post.create({
      title,
      description,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      author: currentUser._id,
    })

    return res.status(201).json({ success: true, data: { post } })
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message })
  }
}

// update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description } = req.body
    const currentUser = (req as any).user

    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ success: false, message: "Post lama helin" })
    }

    if (post.author.toString() !== currentUser._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Ma lihid fasax aad ku beddesho post-kan" })
    }

    post.title = title
    post.description = description
    await post.save()

    res.status(200).json({ success: true, data: { post } })
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message })
  }
}
