"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  LinkIcon,
  PenSquareIcon,
  ListIcon,
  CalendarIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  KeyIcon,
  UserIcon,
  BotIcon,
  SettingsIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Accounts", href: "/accounts", icon: LinkIcon },
]

const contentNav = [
  { title: "New Post", href: "/posts/new", icon: PenSquareIcon },
  { title: "Posts", href: "/posts", icon: ListIcon },
  { title: "Scheduler", href: "/scheduler", icon: CalendarIcon },
]

const engagementNav = [
  { title: "Comments", href: "/comments", icon: MessageSquareIcon },
  { title: "Review Queue", href: "/comments/review", icon: ShieldCheckIcon },
  { title: "Keyword Rules", href: "/auto-reply/rules", icon: KeyIcon },
  { title: "AI Personas", href: "/auto-reply/personas", icon: UserIcon },
]

const aiNav = [
  { title: "Copilot", href: "/copilot", icon: BotIcon },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BotIcon className="h-6 w-6" />
          <span className="text-lg font-semibold">Social Copilot</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Overview" items={mainNav} pathname={pathname} />
        <NavGroup label="Content" items={contentNav} pathname={pathname} />
        <NavGroup label="Engagement" items={engagementNav} pathname={pathname} />
        <NavGroup label="AI" items={aiNav} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <UserButton />
          <Link href="/settings">
            <SidebarMenuButton size="sm" tooltip="Settings">
              <SettingsIcon className="h-4 w-4" />
            </SidebarMenuButton>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string
  items: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }[]
  pathname: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
