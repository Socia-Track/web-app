"use client"


import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/lib/auth-client"
import DashboardLayout from "@/components/DashboardLayout"
import { motion } from "framer-motion"
import { Twitter, MessageSquare, Plus, RefreshCw, AlertCircle, Calendar, TrendingUp } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SocialPost {
  id: string
  platform: string
  postId: string
  content: string
  authorId: string
  postUrl?: string
  postedAt: Date
  createdAt: Date
}

export default function SocialPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    platform: "twitter",
    postId: "",
    content: "",
    authorId: "",
    postUrl: "",
    postedAt: new Date().toISOString().slice(0, 16)
  })

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate("/")
    }
  }, [session, isPending, navigate])

  const fetchPosts = async () => {
    if (!session?.user?.uid) return

    setLoading(true)
    const token = localStorage.getItem("bearer_token")

    try {
      const response = await fetch('/api/social-posts?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error("Failed to fetch posts")

      const data = await response.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error("Failed to load social posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchPosts()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = localStorage.getItem("bearer_token")

    try {
      const response = await fetch('/api/social-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          postedAt: new Date(formData.postedAt).toISOString()
        })
      })

      if (!response.ok) throw new Error("Failed to create post")

      toast.success("Social post added successfully")
      setIsDialogOpen(false)
      setFormData({
        platform: "twitter",
        postId: "",
        content: "",
        authorId: "",
        postUrl: "",
        postedAt: new Date().toISOString().slice(0, 16)
      })
      fetchPosts()
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error("Failed to add social post")
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
        </div>
      </div>
    )
  }

  if (!session?.user) return null

  return (
    <DashboardLayout>
      <div className="container mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              Social Posts(COMING SOON)
            </h1>
            <p className="text-gray-400">Track and manage social media posts for attribution</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchPosts}
              className="border-white/10"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus size={16} className="mr-2" />
                  Add Post
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/10">
                <DialogHeader>
                  <DialogTitle>Add Social Post</DialogTitle>
                  <DialogDescription>
                    Add a social media post to track for attribution
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value) => setFormData({ ...formData, platform: value })}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postId">Post ID</Label>
                    <Input
                      id="postId"
                      value={formData.postId}
                      onChange={(e) => setFormData({ ...formData, postId: e.target.value })}
                      placeholder="Post ID from platform"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Input
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Post content or excerpt"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorId">Author ID</Label>
                    <Input
                      id="authorId"
                      value={formData.authorId}
                      onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                      placeholder="Author username or ID"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postUrl">Post URL</Label>
                    <Input
                      id="postUrl"
                      value={formData.postUrl}
                      onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="postedAt">Posted At</Label>
                    <Input
                      id="postedAt"
                      type="datetime-local"
                      value={formData.postedAt}
                      onChange={(e) => setFormData({ ...formData, postedAt: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Post</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-white/10 bg-card">
            <MessageSquare className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">No social posts yet</h3>
            <p className="text-gray-400 mb-6">Start tracking social media posts for attribution analysis</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Post
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border bg-card p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {post.platform === 'twitter' ? (
                      <Twitter className="text-primary" size={20} />
                    ) : (
                      <MessageSquare className="text-primary" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white capitalize">{post.platform}</span>
                      <span className="text-xs text-gray-500">@{post.authorId}</span>
                    </div>
                    <p className="text-gray-300 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.postedAt).toLocaleString()}
                      </div>
                      {post.postUrl && (
                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Post
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

