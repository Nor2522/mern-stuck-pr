export interface PostAuthor {
  _id: string
  name: string
  email: string
}

export interface PostType {
  _id: string
  title: string
  description: string
  image: {
    url: string
    publicId: string
  }
  author?: PostAuthor | null
  createdAt: string
}
