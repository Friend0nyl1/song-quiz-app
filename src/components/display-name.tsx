import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { User, Shield, Crown, Star } from "lucide-react"

interface DisplayNameProps {
  name: string
  username?: string
  avatar?: string
  role?: "admin" | "moderator" | "premium" | "user"
  status?: "online" | "offline" | "away" | "busy"
  showAvatar?: boolean
  showStatus?: boolean
  showRole?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "card" | "minimal"
}

const roleIcons = {
  admin: Crown,
  moderator: Shield,
  premium: Star,
  user: User,
}

const roleColors = {
  admin: "bg-red-500",
  moderator: "bg-blue-500",
  premium: "bg-yellow-500",
  user: "bg-gray-500",
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
}

const sizeClasses = {
  sm: {
    avatar: "h-8 w-8",
    text: "text-sm",
    username: "text-xs",
  },
  md: {
    avatar: "h-10 w-10",
    text: "text-base",
    username: "text-sm",
  },
  lg: {
    avatar: "h-12 w-12",
    text: "text-lg",
    username: "text-base",
  },
}

export function DisplayName({
  name,
  username,
  avatar,
  role = "user",
  status = "offline",
  showAvatar = true,
  showStatus = true,
  showRole = true,
  size = "md",
  variant = "default",
}: DisplayNameProps) {
  const RoleIcon = roleIcons[role]
  const sizeClass = sizeClasses[size]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const content = (
    <div className="flex items-center gap-3">
      {showAvatar && (
        <div className="relative">
          <Avatar className={sizeClass.avatar}>
            <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          {showStatus && (
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${statusColors[status]}`}
            />
          )}
        </div>
      )}

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${sizeClass.text}`}>{name}</span>
          {showRole && role !== "user" && (
            <Badge variant="secondary" className="flex items-center gap-1 px-2 py-0.5">
              <RoleIcon className="h-3 w-3" />
              <span className="text-xs capitalize">{role}</span>
            </Badge>
          )}
        </div>
        {username && <span className={`text-muted-foreground ${sizeClass.username}`}>@{username}</span>}
      </div>
    </div>
  )

  if (variant === "card") {
    return (
      <Card className="w-fit">
        <CardContent className="p-4">{content}</CardContent>
      </Card>
    )
  }

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-2">
        <span className={`font-medium ${sizeClass.text}`}>{name}</span>
        {showRole && role !== "user" && <div className={`h-2 w-2 rounded-full ${roleColors[role]}`} />}
      </div>
    )
  }

  return content
}
