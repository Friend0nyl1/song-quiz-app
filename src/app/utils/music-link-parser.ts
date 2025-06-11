import { MusicLink } from "@/types/music-link"



export function detectMusicPlatform(url: string): MusicLink["platform"] {
  if (url.includes("spotify.com")) return "spotify"
  if (url.includes("music.apple.com")) return "apple-music"
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube"
  if (url.includes("soundcloud.com")) return "soundcloud"
  return "unknown"
}

export async function fetchMusicMetadata(url: string): Promise<Partial<MusicLink>> {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    const html = data.contents

    // Parse Open Graph meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/)
    const imageMatch = html.match(/<meta property="og:image" content="([^"]*)"/)
    const descriptionMatch = html.match(/<meta property="og:description" content="([^"]*)"/)

    return {
      title: titleMatch ? titleMatch[1] : undefined,
      coverUrl: imageMatch ? imageMatch[1] : undefined,
      artist: descriptionMatch ? descriptionMatch[1] : undefined,
    }
  } catch (error) {
    console.error("Failed to fetch metadata:", error)
    return {}
  }
}

export function getDefaultCover(platform: MusicLink["platform"]): string {
    const covers = new Map<MusicLink["platform"], string>([
      ["spotify", "/placeholder.svg?height=64&width=64&text=🎵"],
      ["apple-music", "/placeholder.svg?height=64&width=64&text=🍎"],
      ["youtube", "/placeholder.svg?height=64&width=64&text=▶️"],
      ["soundcloud", "/placeholder.svg?height=64&width=64&text=☁️"],
      ["unknown", "/placeholder.svg?height=64&width=64&text=🎶"],
    ])
    const cover = covers.get(platform)
    if (cover) {
      return cover
    }else{
      return covers.get("unknown") || "/placeholder.svg?height=64&width=64&text=🎶"
    }

    
}
