export interface MusicLink {
  url: string
  title?: string
  artist?: string
  coverUrl?: string
  platform?: "spotify" | "apple-music" | "youtube" | "soundcloud" | "unknown"
  isLoading?: boolean
}
