import { PostComposer } from "@/components/posts/post-composer"
import { Toaster } from "@/components/ui/sonner"

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Post</h1>
        <p className="mt-1 text-muted-foreground">
          Compose a new post for your social media accounts.
        </p>
      </div>
      <PostComposer />
      <Toaster />
    </div>
  )
}
