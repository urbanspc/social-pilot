import { db } from "@/lib/db"
import { ScheduleCard } from "@/components/scheduler/schedule-card"
import { Toaster } from "@/components/ui/sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenSquareIcon, CalendarIcon } from "lucide-react"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"

export default async function SchedulerPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams

  const currentMonth = month ? new Date(month + "-01") : new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // Fetch scheduled and recently published posts for this month
  const posts = await db.post.findMany({
    where: {
      scheduledAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      platformPosts: {
        include: { socialAccount: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })

  // Build calendar grid
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const prevMonth = format(subMonths(currentMonth, 1), "yyyy-MM")
  const nextMonth = format(addMonths(currentMonth, 1), "yyyy-MM")

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheduler</h1>
          <p className="mt-1 text-muted-foreground">
            Calendar view of your scheduled posts.
          </p>
        </div>
        <Link href="/posts/new">
          <Button>
            <PenSquareIcon className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Month navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Link href={`/scheduler?month=${prevMonth}`}>
          <Button variant="outline" size="sm">&larr; Previous</Button>
        </Link>
        <h2 className="text-lg font-semibold">
          <CalendarIcon className="mr-2 inline h-5 w-5" />
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Link href={`/scheduler?month=${nextMonth}`}>
          <Button variant="outline" size="sm">Next &rarr;</Button>
        </Link>
      </div>

      {/* Calendar grid */}
      <div className="mt-4 grid grid-cols-7 gap-px rounded-lg border bg-muted overflow-hidden">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayPosts = posts.filter((p) => p.scheduledAt && isSameDay(p.scheduledAt, day))
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth()

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] bg-background p-2 ${!isCurrentMonth ? "opacity-40" : ""}`}
            >
              <p className={`text-xs font-medium ${isToday(day) ? "rounded-full bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center" : "text-muted-foreground"}`}>
                {format(day, "d")}
              </p>
              <div className="mt-1 space-y-1">
                {dayPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block rounded bg-primary/10 px-1 py-0.5 text-xs truncate hover:bg-primary/20 transition-colors"
                  >
                    {post.scheduledAt ? format(post.scheduledAt, "HH:mm") : ""} {post.content.slice(0, 30)}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Upcoming scheduled posts list */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Upcoming Scheduled Posts</h2>
        {posts.filter((p) => p.status === "scheduled").length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">No scheduled posts this month.</p>
            <Link href="/posts/new" className="mt-3">
              <Button variant="outline" size="sm">
                <PenSquareIcon className="mr-2 h-4 w-4" />
                Schedule a Post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts
              .filter((p) => p.status === "scheduled")
              .map((post) => (
                <ScheduleCard
                  key={post.id}
                  id={post.id}
                  content={post.content}
                  status={post.status}
                  scheduledAt={post.scheduledAt!.toISOString()}
                  platforms={post.platformPosts.map((pp) => ({
                    platform: pp.socialAccount.platform,
                    username: pp.socialAccount.platformUsername,
                  }))}
                />
              ))}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
