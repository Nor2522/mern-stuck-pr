export interface Category {
  _id: string
  name: string
  slug: string
}

export interface AdminCategory extends Category {
  postsCount: number
  createdAt: string
}
