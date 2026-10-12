import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PostType } from "@/types/post";

const Post = ({ post }: { post: PostType }) => {
  const createdAt = new Date(post.createdAt).toLocaleDateString();

  return (
    <Card>
      {post.image?.url && (
        <img
          src={post.image.url}
          alt={post.title}
          className="aspect-video w-full rounded object-cover"
        />
      )}
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>{post.description}</CardDescription>
        <CardDescription>
          {post.author?.name ?? "Unknown"} · {createdAt}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default Post;
