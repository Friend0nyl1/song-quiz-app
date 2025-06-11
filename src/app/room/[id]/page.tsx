"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Send, Users, Settings, Share2, Music, Crown, Play, Pause, Volume2, Zap, Mic, MicOff, Check, StopCircle, Settings2, PlayIcon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use, useCallback, useRef } from "react"
import { useParams, usePathname } from "next/navigation"
import { io } from "socket.io-client"
import { useSocket } from "@/app/hook/socketContext"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DisplayNameInput } from "@/components/display-name-input"
import { Separator } from "@/components/ui/separator"
import { mock } from "node:test"
import path from "path"
import { Player, } from "@/app/types/player"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"




export interface Room {
  id: string
  name: string
  genre?: string
  description: string
  currentPlayers: number
  maxPlayers: number
  difficulty?: string
  questions: number
  timePerQuestion: number
  status?: string
  isPrivate?: boolean
}

const mockRoomSet: Room = {
  id: "1",
  name: "90s Pop Hits Challenge",
  genre: "Pop",
  description: "Test your knowledge of iconic 90s pop classics and chart-toppers",
  currentPlayers: 3,
  maxPlayers: 6,
  difficulty: "Medium",
  questions: 20,
  timePerQuestion: 10,
}

// const mockUsers = [
//   { id: "1", name: "MusicLover", avatar: "/placeholder.svg", status: "ready", isHost: true, score: 0 },
//   { id: "2", name: "PopQueen", avatar: "/placeholder.svg", status: "ready", isHost: false, score: 0 },
//   { id: "3", name: "SongMaster", avatar: "/placeholder.svg", status: "not_ready", isHost: false, score: 0 },
// ]

// const mockQuestion = {
//   id: 1,
//   songTitle: "I Want It That Way",
//   artist: "Backstreet Boys",
//   audioUrl: "/placeholder-audio.mp3",
//   choices: ["Backstreet Boys", "NSYNC", "98 Degrees", "Boyz II Men"],
//   question : ["Who performed this song?" ,"Choose the correct artist from the options below"],
//   correctAnswer: "Backstreet Boys",
//   questionNumber: 1,
//   totalQuestions: 20,
// }

interface Question {
  id: number
  songTitle: string
  artist: string
  audioUrl: string
  choices: string[]
  question: string[]
  correctAnswer: string
  questionNumber: number
  totalQuestions: number
  timer: number
}

const mockMessages = [
  { id: "1", user: "MusicLover", message: "Ready for some 90s nostalgia! 🎵", timestamp: "2:30 PM" },
  { id: "2", user: "PopQueen", message: "This is going to be epic! I love this era", timestamp: "2:32 PM" },
  { id: "3", user: "SongMaster", message: "Let's see who's the real pop expert here! 🏆", timestamp: "2:35 PM" },
]
interface Message {
  id: string
  user: string
  message: string
  timestamp: string
}






export default function RoomPage() {
  const [mockUsers, setMockUsers] = useState<Player[]>([])
  const [mockRoom, setMockRoom] = useState<Room | null>(null)
  const [mockQuestion, setMockQuestion] = useState<Question | null>(null)
  const { socket, startFileStream, isLoading  ,playtest} = useSocket()
  const pathname = usePathname()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isReady, setIsReady] = useState(false)
  const [gameState, setGameState] = useState<"waiting" | "playing" | "finished" | "preparing">("waiting")
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [uniuqeId, setUniuqeId] = useState(uuidv4())
  const [username, setUsername] = useState<string>("")
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timeDelay, setTimeDelay] = useState(5)
  const [isShowLeaderboard, setIsShowLeaderboard] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(true)
  const [playlistId, setPlaylistId] = useState(0)
  const [playlist, setPlaylist] = useState<{ id: number, artist: string, album: string, playlist: string, url?: string } | null>(null)
  const [dialogGameSetting, setDialogGameSetting] = useState(false)
  const [loadingGameSetting, setLoadingGameSetting] = useState(true)
  const [catalog, setCatalog] = useState<{ id: number, artist: string, album: string, playlist: string, url?: string }[]>([
    {
      id: 1,
      artist: "All",
      album: "All",
      playlist: "All"
    },
    {
      id: 2,
      artist: "All",
      album: "All",
      playlist: "All"
    },
    {
      id: 2,
      artist: "All",
      album: "All",
      playlist: "All"
    },
    {
      id: 2,
      artist: "All",
      album: "All",
      playlist: "All"
    },
    {
      id: 2,
      artist: "All",
      album: "All",
      playlist: "All"
    },
    {
      id: 2,
      artist: "All",
      album: "All",
      playlist: "All"
    },
    {
      id: 2,
      artist: "All",
      album: "All",
      playlist: "All"
    },
    {
      id: 2,
      artist: "All",
      album: "All",
      playlist: "All"
    },
  ])

  useEffect(() => {
    const handleRoomUsers = (data: { players: Player[], roomInfo: Room }) => {
      console.log(data)
      const updatedUsers = data.players.map((user) => ({
        id: user.id,
        username: user.username,
        avatar: "/placeholder.svg",
        status: user.isReady ? "ready" : "not_ready",
        isHost: user.isHost,
        score: user.score,
        isReady: user.isReady
      }))
      setMockUsers(updatedUsers)
      const updatedRoomInfo: Room = {
        id: data.roomInfo.id,
        name: data.roomInfo.name,
        description: data.roomInfo.description,
        currentPlayers: data.roomInfo.currentPlayers,
        maxPlayers: data.roomInfo.maxPlayers,
        isPrivate: !data.roomInfo.isPrivate,
        questions: data.roomInfo.questions,
        timePerQuestion: data.roomInfo.timePerQuestion,
      }
      console.log(updatedRoomInfo)
      // setTimeLeft(data.roomInfo.timePerQuestion)
      setMockRoom(updatedRoomInfo)
    }
    const handleUserJoined = (users: Player) => {
      console.log(users)
      toast({
        title: "User joined",
        description: `${users.username} joined the room`,
      })
      setMockUsers((prevUsers) => {
        const existingUser = prevUsers.filter((user) => user.id !== users.id)
        return [...existingUser, { id: users.id, username: users.username, avatar: "/placeholder.svg", status: "ready", isHost: users.isHost, score: 0, isReady: users.isReady }]
      })
    }
    const handleUserRady = (users: Player) => {
      setMockUsers((prevUsers) => prevUsers.map((user) => user.id === users.id ? { ...user, isReady: users.isReady } : user))
    }
    const handleUserLeft = (users: Player) => {
      setMockUsers((prevUsers) => prevUsers.filter((user) => user.id !== users.id))
      toast({
        title: "User left",
        description: `${users.username} left the room`,
      })
    }
    const handleRoomNotFound = () => {
      toast({
        title: "Room not found",
        description: "The room you are trying to join does not exist.",
        variant: "destructive"
      })
    }
    const handleLoaded = (data: boolean) => {
      setLoading(data)

    }
    const handleQuestion = (data: Question) => {
      setMockQuestion(data)
      setShowResults(false)
      setTimeLeft(data.timer)
      setSelectedAnswer(null)
    }
    const handleState = (data: string) => {
      console.log(data)
      if (data === "playing") {
        setGameState(data)
      } else if (data === "preparing") {
        setTimeLeft(timeDelay)
        setGameState(data)

      } else if (data === "finished") {
        setGameState(data)
        setMockQuestion(null)
      }
      else {
        toast({
          title: "Can't Start Game",
          description: `${data}`,
        })
      }
    }

    const handleSetting = (data: { id: number, artist: string, album: string, playlist: string }) => {
      console.log(data)
      setPlaylist(data)
    }

    socket.connect()
    socket.on('roomUsers', handleRoomUsers)
    socket.on("userJoined", handleUserJoined)
    socket.on('userReady', handleUserRady)
    socket.on("userLeft", handleUserLeft)
    socket.on('roomNotFound', handleRoomNotFound)
    socket.on('loaded', handleLoaded)
    socket.on('Question', handleQuestion);
    socket.on('state', handleState)
    socket.on('settings', handleSetting)
    return () => {
      socket.off('roomUsers', handleRoomUsers)
      socket.off("userJoined", handleUserJoined)
      socket.off('userReady', handleUserRady)
      socket.off("userLeft", handleUserLeft)
      socket.off('roomNotFound', handleRoomNotFound)
      socket.off('loaded', handleLoaded)
      socket.off('Question', handleQuestion);


    }
  }, [socket])

  // Timer effect
  useEffect(() => {
    console.log(gameState, timeLeft, loading)
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
    else if (gameState === "preparing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
    else if (timeLeft === 0 && gameState === "playing") {
      setShowResults(true)
    }
  }, [timeLeft, gameState])



  useEffect(() => {
    console.log(timeLeft)
  }, [timeLeft])
  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        user: "You",
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (!showResults) {
      setSelectedAnswer(answer)
      socket.emit("answer", { roomId: pathname.split("/")[2], client: { id: uniuqeId, answer: answer }, })
    }
  }

  const startGame = async () => {
    socket.connect()
    socket.emit("startGame", { roomId: pathname.split("/")[2], username: username })

  }
  // useEffect(() => {
  //   if(playlist){
  //     setDialogGameSetting(false)
  //   }
  // }, [playlist])
  const handleDialogClose = () => {
    setDialogGameSetting(false)
    setPlaylistId(0), setPlaylist(null)
  }
  const handleDialogGameSetting = async () => {
    setDialogGameSetting((prev) => !prev)
    const playlist = await axios.get("api/playlist");
    console.log(playlist.data)
    setCatalog(playlist.data)
    setPlaylistId(0),
      setPlaylist(null)

  }
  const handleGameSettings = (id: number) => {
    socket.connect()
    socket.emit("gameSettings", { roomId: pathname.split("/")[2], client: { username: username, id: uniuqeId }, playlistId: id })
  }

  const handleReady = () => {
    // socket.connect()
    socket.emit("Ready", { roomId: pathname.split("/")[2], username: username, id: uniuqeId })
    setIsReady((prev) => !prev)
  }

  const handleSubmit = () => {
    // socket.connect()
    socket.emit("joinRoom", { roomId: pathname.split("/")[2], username: username, id: uniuqeId })
    startFileStream()

    handleDialogOpen()
  }
  const handleDialogOpen = () => {
    if (username === '') {
      setDialogOpen(true)
    } else {
      setDialogOpen(false)
    }
  }

  useEffect(() => {
    if (gameState === "finished") {
      setIsShowLeaderboard(true)
    }

  }, [gameState])

  interface CircleWave {
    radius: number
    targetRadius: number
    frequency: number
    amplitude: number
    color: { r: number; g: number; b: number }
    thickness: number
    opacity: number
    speed: number
  }
  interface VisualStyle {
    name: string
    waveStyle: "rings" | "ripples" | "pulse" | "spiral" | "burst"
    colorScheme: "spectrum" | "neon" | "fire" | "ocean" | "galaxy" | "rainbow" | "mono"
    animationStyle: "smooth" | "bouncy" | "elastic" | "sharp"
    backgroundStyle: "gradient" | "solid" | "radial" | "stars"
    glowEffect: boolean
    particleEffect: boolean
    centerEffect: boolean
  }
  const presetStyles: VisualStyle[] = [
    {
      name: "Classic Ripples",
      waveStyle: "ripples",
      colorScheme: "spectrum",
      animationStyle: "smooth",
      backgroundStyle: "gradient",
      glowEffect: true,
      particleEffect: false,
      centerEffect: true,
    },
    {
      name: "Neon Pulse",
      waveStyle: "pulse",
      colorScheme: "neon",
      animationStyle: "bouncy",
      backgroundStyle: "solid",
      glowEffect: true,
      particleEffect: true,
      centerEffect: true,
    },
    {
      name: "Fire Burst",
      waveStyle: "burst",
      colorScheme: "fire",
      animationStyle: "elastic",
      backgroundStyle: "radial",
      glowEffect: true,
      particleEffect: false,
      centerEffect: true,
    },
    {
      name: "Ocean Waves",
      waveStyle: "rings",
      colorScheme: "ocean",
      animationStyle: "smooth",
      backgroundStyle: "gradient",
      glowEffect: false,
      particleEffect: true,
      centerEffect: false,
    },
    {
      name: "Galaxy Spiral",
      waveStyle: "rings",
      colorScheme: "rainbow",
      animationStyle: "elastic",
      backgroundStyle: "radial",
      glowEffect: true,
      particleEffect: true,
      centerEffect: true,
    },
    {
      name: "Rainbow Ring",
      waveStyle: "rings",
      colorScheme: "rainbow",
      animationStyle: "bouncy",
      backgroundStyle: "solid",
      glowEffect: true,
      particleEffect: true,
      centerEffect: true,
    },
  ]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const animationRef = useRef<number>(3)
  const gridSize = 40
  const gridSpacing = 15
  const { analyser, audioContextState } = useSocket();

  const circleWavesRef = useRef<CircleWave[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioSrc, setAudioSrc] = useState<string>("")
  const [sensitivity, setSensitivity] = useState(2.0)
  const [showSettings, setShowSettings] = useState(false)
  const [waveCount, setWaveCount] = useState(64)
  const [smoothness, setSmoothness] = useState(0.15)
  const [maxRadius, setMaxRadius] = useState(400)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [expansionSpeed, setExpansionSpeed] = useState(1.5)
  const [currentStyle, setCurrentStyle] = useState<VisualStyle>(presetStyles[4])
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; size: number }>>([])
  useEffect(() => {
    console.log(analyser)
  }, [analyser])

  const initializeWaves = () => {
    const waves: CircleWave[] = []
    for (let i = 0; i < waveCount; i++) {
      waves.push({
        radius: 0,
        targetRadius: 0,
        frequency: (i / waveCount) * 20000, // 0-20kHz
        amplitude: 0,
        color: { r: 100, g: 150, b: 255 },
        thickness: 2,
        opacity: 0,
        speed: 1,
      })
    }
    circleWavesRef.current = waves
  }
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    switch (currentStyle.backgroundStyle) {
      case "gradient":
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
        gradient.addColorStop(0, "#0a0a2a")
        gradient.addColorStop(1, "#000000")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        break

      case "solid":
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, width, height)
        break

      case "radial":
        const radialGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
        radialGrad.addColorStop(0, "#1a1a3a")
        radialGrad.addColorStop(0.5, "#0a0a1a")
        radialGrad.addColorStop(1, "#000000")
        ctx.fillStyle = radialGrad
        ctx.fillRect(0, 0, width, height)
        break

      case "stars":
        ctx.fillStyle = "#000011"
        ctx.fillRect(0, 0, width, height)
        // Draw stars
        for (let i = 0; i < 150; i++) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`
          const size = Math.random() * 2
          ctx.fillRect(Math.random() * width, Math.random() * height, size, size)
        }
        break
    }
  }
  const getColorByScheme = (frequency: number, amplitude: number, scheme: string) => {
    const normalizedFreq = Math.min(frequency / 20000, 1)
    const intensity = amplitude * 255

    switch (scheme) {
      case "spectrum":
        if (normalizedFreq < 0.33) {
          return {
            r: Math.min(255, intensity + 100),
            g: Math.min(100, intensity * 0.3),
            b: Math.min(50, intensity * 0.1),
          }
        } else if (normalizedFreq < 0.66) {
          return {
            r: Math.min(200, intensity * 0.6),
            g: Math.min(255, intensity + 100),
            b: Math.min(100, intensity * 0.3),
          }
        } else {
          return {
            r: Math.min(100, intensity * 0.3),
            g: Math.min(150, intensity * 0.5),
            b: Math.min(255, intensity + 100),
          }
        }

      case "neon":
        const neonHue = normalizedFreq * 300 + 180
        return {
          r: Math.min(255, Math.sin((neonHue * Math.PI) / 180) * intensity + 150),
          g: Math.min(255, Math.sin(((neonHue + 120) * Math.PI) / 180) * intensity + 150),
          b: Math.min(255, Math.sin(((neonHue + 240) * Math.PI) / 180) * intensity + 150),
        }

      case "fire":
        return {
          r: Math.min(255, intensity + 200),
          g: Math.min(150, intensity * 0.6),
          b: Math.min(30, intensity * 0.1),
        }

      case "ocean":
        return {
          r: Math.min(50, intensity * 0.2),
          g: Math.min(150, intensity * 0.7),
          b: Math.min(255, intensity + 150),
        }

      case "galaxy":
        return {
          r: Math.min(255, intensity * 0.8 + normalizedFreq * 100),
          g: Math.min(100, intensity * 0.3),
          b: Math.min(255, intensity + normalizedFreq * 200),
        }

      case "rainbow":
        const rainbowHue = (normalizedFreq * 360 + Date.now() * 0.05) % 360
        const rad = (rainbowHue * Math.PI) / 180
        return {
          r: Math.min(255, Math.abs(Math.sin(rad)) * intensity + 100),
          g: Math.min(255, Math.abs(Math.sin(rad + (2 * Math.PI) / 3)) * intensity + 100),
          b: Math.min(255, Math.abs(Math.sin(rad + (4 * Math.PI) / 3)) * intensity + 100),
        }

      case "mono":
        return {
          r: intensity,
          g: intensity,
          b: intensity,
        }

      default:
        return { r: intensity, g: intensity, b: intensity }
    }
  }


  const getAnimationEasing = (current: number, target: number, style: string) => {
    const diff = target - current
    switch (style) {
      case "smooth":
        return current + diff * smoothness

      case "bouncy":
        return current + diff * smoothness * 1.8

      case "elastic":
        return current + diff * smoothness * 0.9 + Math.sin(Date.now() * 0.01) * diff * 0.05

      case "sharp":
        return current + diff * smoothness * 3

      default:
        return current + diff * smoothness
    }
  }

  const updateParticles = (audioLevel: number) => {
    const particles = particlesRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Add new particles based on audio level
    if (audioLevel > 0.2 && particles.length < 100) {
      for (let i = 0; i < Math.floor(audioLevel * 8); i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = audioLevel * 3 + 1
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          size: Math.random() * 3 + 1,
        })
      }
    }

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life -= 0.015

      if (particle.life <= 0) {
        particles.splice(i, 1)
      }
    }
  }
  const drawWaves = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const waves = circleWavesRef.current

    switch (currentStyle.waveStyle) {
      case "rings":
        drawRings(ctx, centerX, centerY, waves)
        break
      case "ripples":
        drawRipples(ctx, centerX, centerY, waves)
        break
      case "pulse":
        drawPulse(ctx, centerX, centerY, waves)
        break
      case "spiral":
        drawSpiral(ctx, centerX, centerY, waves)
        break
      case "burst":
        drawBurst(ctx, centerX, centerY, waves)
        break
    }
  }

  const drawRings = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, waves: CircleWave[]) => {
    for (const wave of waves) {
      if (wave.amplitude > 0.05 && wave.radius > 0) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`
        ctx.lineWidth = wave.thickness

        if (currentStyle.glowEffect) {
          ctx.shadowColor = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`
          ctx.shadowBlur = wave.amplitude * 20
        }

        ctx.arc(centerX, centerY, wave.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
  }

  const drawRipples = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, waves: CircleWave[]) => {
    for (const wave of waves) {
      if (wave.amplitude > 0.05) {
        // Multiple ripples per frequency
        for (let r = 0; r < 3; r++) {
          const rippleRadius = wave.radius + r * 30
          if (rippleRadius > 0) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity / (r + 1)})`
            ctx.lineWidth = wave.thickness / (r + 1)

            if (currentStyle.glowEffect) {
              ctx.shadowColor = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity / (r + 1)})`
              ctx.shadowBlur = wave.amplitude * 15
            }

            ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2)
            ctx.stroke()
            ctx.shadowBlur = 0
          }
        }
      }
    }
  }

  const drawPulse = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, waves: CircleWave[]) => {
    for (const wave of waves) {
      if (wave.amplitude > 0.1) {
        const pulseRadius = wave.radius * (1 + Math.sin(Date.now() * 0.01 + wave.frequency * 0.001) * 0.2)

        ctx.beginPath()
        ctx.fillStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity * 0.3})`

        if (currentStyle.glowEffect) {
          ctx.shadowColor = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`
          ctx.shadowBlur = wave.amplitude * 25
        }

        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
  }

  const drawSpiral = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, waves: CircleWave[]) => {
    const time = Date.now() * 0.001

    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i]
      if (wave.amplitude > 0.05) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`
        ctx.lineWidth = wave.thickness

        if (currentStyle.glowEffect) {
          ctx.shadowColor = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`
          ctx.shadowBlur = wave.amplitude * 15
        }

        // Draw spiral
        const angleStep = 0.1
        const radiusStep = wave.radius / (Math.PI * 4)
        let currentRadius = 0

        for (let angle = 0; angle < Math.PI * 4; angle += angleStep) {
          const x = centerX + Math.cos(angle + time + i * 0.1) * currentRadius
          const y = centerY + Math.sin(angle + time + i * 0.1) * currentRadius

          if (angle === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          currentRadius += radiusStep
        }

        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
  }

  const drawBurst = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, waves: CircleWave[]) => {
    for (const wave of waves) {
      if (wave.amplitude > 0.1) {
        const segments = 12
        const angleStep = (Math.PI * 2) / segments

        for (let i = 0; i < segments; i++) {
          const angle = i * angleStep
          const x1 = centerX + Math.cos(angle) * (wave.radius * 0.8)
          const y1 = centerY + Math.sin(angle) * (wave.radius * 0.8)
          const x2 = centerX + Math.cos(angle) * wave.radius
          const y2 = centerY + Math.sin(angle) * wave.radius

          ctx.beginPath()
          ctx.strokeStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`
          ctx.lineWidth = wave.thickness

          if (currentStyle.glowEffect) {
            ctx.shadowColor = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`
            ctx.shadowBlur = wave.amplitude * 20
          }

          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }
    }
  }

  const drawCenterEffect = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    if (!currentStyle.centerEffect || audioLevel < 0.1) return

    const centerRadius = audioLevel * 30 + 5

    ctx.beginPath()
    ctx.fillStyle = `rgba(255, 255, 255, ${audioLevel * 0.8})`

    if (currentStyle.glowEffect) {
      ctx.shadowColor = `rgba(255, 255, 255, ${audioLevel})`
      ctx.shadowBlur = audioLevel * 30
    }

    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current
    for (const particle of particles) {
      const alpha = particle.life

      ctx.beginPath()
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const updateWavesFromAudio = () => {
    if (!analyser) return
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    analyser.getByteFrequencyData(dataArray)

    const sum = dataArray.reduce((a, b) => a + b, 0)
    const currentAudioLevel = sum / dataArray.length / 255
    setAudioLevel(currentAudioLevel)

    const waves = circleWavesRef.current
    const frequencyBinCount = dataArray.length
    const sampleRate = audioContextState?.sampleRate ?? 44100

    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i]
      const frequency = (i / waves.length) * 20000

      // Map frequency to bin
      const binIndex = Math.floor((frequency / (sampleRate / 2)) * frequencyBinCount)
      const clampedBinIndex = Math.min(binIndex, frequencyBinCount - 1)

      const amplitude = dataArray[clampedBinIndex] / 255
      wave.amplitude = amplitude
      wave.frequency = frequency

      // Calculate target radius based on amplitude and frequency
      const baseRadius = (i / waves.length) * maxRadius
      const amplitudeBoost = amplitude * sensitivity * 100
      wave.targetRadius = baseRadius + amplitudeBoost

      // Update color
      wave.color = getColorByScheme(frequency, amplitude, currentStyle.colorScheme)

      // Update visual properties
      wave.thickness = 1 + amplitude * 5
      wave.opacity = Math.min(1, amplitude * 2 + 0.1)

      // Apply easing
      wave.radius = getAnimationEasing(wave.radius, wave.targetRadius, currentStyle.animationStyle)
    }

    // Update particles if enabled
    if (currentStyle.particleEffect) {
      updateParticles(currentAudioLevel)
    }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    drawBackground(ctx, width, height)
    updateWavesFromAudio()

    const centerX = width / 2
    const centerY = height / 2

    drawWaves(ctx, width, height)
    drawCenterEffect(ctx, centerX, centerY)

    if (currentStyle.particleEffect) {
      drawParticles(ctx)
    }

    animationRef.current = requestAnimationFrame(draw)
  }
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    initializeWaves()
    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }



      if (audioSrc) {
        URL.revokeObjectURL(audioSrc)
      }
    }
  }, [analyser])

  useEffect(() => {
    initializeWaves()
  }, [waveCount])

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    draw()
  }, [isPlaying, sensitivity, smoothness, maxRadius, expansionSpeed, currentStyle])
  return (

    <div className="relative w-full h-screen  overflow-hidden">
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpen} >

        <DialogContent className="sm:max-w-[425px] ">
          <DialogHeader>
            <DialogTitle>

            </DialogTitle>
            <DialogDescription>

            </DialogDescription>
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Setting Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <DisplayNameInput placeholder="Choose your display name" required onChange={setUsername} value={username} onValidationChange={setIsValid} />
                      <Separator />

                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full" onClick={handleSubmit} disabled={!isValid}>Join Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogGameSetting} onOpenChange={handleDialogGameSetting} >

        <DialogContent className="w-full  bg-zinc-900 border border-black">
          <DialogHeader>
          </DialogHeader>
          <DialogTitle className="text-lg text-white">
            Game Setting
          </DialogTitle>

          <div className="flex items-center gap-2 grid grid-cols-1 ">
            <Input className="text-white" placeholder="Playlist ID or ID"></Input>
            <div>
              <Tabs defaultValue="ALL">
                <TabsList>
                  <TabsTrigger value="ALL" onClick={() => { }}>ALL</TabsTrigger>
                </TabsList>
                <TabsContent value="ALL" className="">
                  <div className="flex  w-full gap-2 h-full overflow-y-scroll grid grid-cols-4">
                    {catalog.map((playlist, index) => (
                      <div key={index + 1} className="flex gap-2  h-full gird grid-cols-1">
                        <div className="col-span-1" onClick={() => { setPlaylistId(playlist.id), handleGameSettings(playlist.id) }}>
                          <Image src={playlist.url ?? '/placeholder.svg'} alt="Playlist" width={100} height={100} className="w-32 h-28 " />
                          <p className="text-white text-sm">{playlist.playlist}</p>
                          <p className="text-white/40 text-xs">{playlist.artist}</p>
                        </div>

                      </div>
                    ))

                    }
                  </div>
                </TabsContent>
              </Tabs>
            </div>

          </div>
          <DialogDescription>
          </DialogDescription>


          <DialogFooter>
            <div className="grid flex-1 gap-2 grid-cols-2">
              <Button className="w-full" variant={"destructive"} onClick={() => { handleDialogClose() }} >Cancel</Button>
              <Button className="w-full" variant={"default"} disabled={playlistId === 0} onClick={() => {
                setDialogGameSetting(false)
              }} >Done</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Leaderboard */}

      {gameState === "finished" && mockRoom && mockUsers &&
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 grid grid-cols-3 gap-4 p-4 flex items-center">
            {mockUsers.sort((a, b) => b.score - a.score).map((user, index) => {
              if (index + 1 > 3) return
              return (
                <div key={user.id} className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 rounded-xl p-4 flex items-center space-x-3 ">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold">
                          {user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <p className="font-bold text-white">{user.username}</p>
                        {user.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-200 font-medium">Score: {user.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {mockUsers && mockUsers.length > 3 && <div className="col-span-3 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-4 text-white">
              <Table >
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-white">Rank</TableHead>
                    <TableHead className="text-left text-white">Name</TableHead>
                    <TableHead className="text-right text-white">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.sort((a, b) => b.score - a.score).map((user, index) => {
                    if (index + 1 <= 3) return
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell className="text-right">{user.score}</TableCell>
                      </TableRow>
                    )
                  }
                  )}
                </TableBody>
              </Table>
            </div>}
          </div>

        </div>}
      {/* Controls */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <Button
          onClick={() => {
            handleReady()
          }}
          variant={isReady ? "destructive" : "default"}
          size="lg"
          className="flex items-center gap-2 backdrop-blur-sm bg-black/20 border-white/20"
          disabled={gameState === "finished" || gameState === "waiting" ? false : true}
        >
          {isReady ? <StopCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          {isReady ? "Not Ready" : "Ready"}

        </Button>

        {mockUsers.find((user) => user.id === uniuqeId)?.isHost && <Button
          onClick={() => {
            startGame()
          }}
          variant={"default"}
          size="lg"
          disabled={gameState === "finished" || gameState === "waiting" ? false : true}
          className="flex items-center gap-2 backdrop-blur-sm bg-black/20 border-white/20"
        >

          <PlayIcon className="w-5 h-5" />
          Start Game
        </Button>}
        {mockUsers.find((user) => user.id === uniuqeId)?.isHost && <Button

          variant={"default"}
          size="lg"
          disabled={gameState === "finished" || gameState === "waiting" ? false : true}
          className="flex items-center gap-2 backdrop-blur-sm bg-black/20 border-white/20"
        >

          <Settings2 className="w-5 h-5" />
          Setting
        </Button>}

        {/* <Button className="flex items-center gap-2 backdrop-blur-sm bg-black/20 border-white/20"
          onClick={() => {
          playtest()
        }}>Playtest</Button> */}

        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 rounded-xl p-4 flex items-center space-x-3"
          onClick={() => {
            handleDialogGameSetting()
          }}
        >
          {playlist && <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Image src={playlist.url ?? '/placeholder.svg'} alt={playlist.artist} width={128} height={128} className=" rounded-lg object-cover" />
            </div>
          </div>}
          {!playlist && <div className="flex-1">
            <div className="flex items-center space-x-1">
              <p className="font-bold text-white">Playlist</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200 font-medium">No playlist</span>
            </div>
          </div>}
        </div>


      </div>
      {gameState !== "finished" && <div className="absolute top-6 right-6 z-10  h-3/4 overflow-y-scroll myscroll">
        {true && mockRoom && <div className="lg:col-span-1 space-y-4">
          {mockUsers.map((user, index) => (
            <div key={user.id} className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 rounded-xl p-4 flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold">
                      {user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-1">
                    <p className="font-bold text-white">{user.username}</p>
                    {user.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-200 font-medium">Score: {user.score}</span>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${user.isReady === true ? "bg-green-400" : "bg-gray-400"
                          }`}
                      />
                      <span className="text-xs text-gray-200 font-medium">
                        {user.isReady === true ? "Ready" : "Not Ready"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {gameState === "waiting" && Array.from({ length: mockRoom.maxPlayers - mockUsers.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 rounded-xl p-4 flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-gray-300 font-medium">Waiting for player...</p>
              </div>
            </div>
          ))}
        </div>}
      </div>}

      {/* Instructions */}
      {<div className="absolute bottom-6 left-6 right-6 z-10">


        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-white text-center border border-white/10">
          {gameState === "preparing" && <Progress value={(timeLeft / timeDelay) * 100} className="bg-gradient-to-r from-blue-500 to-cyan-500" />}
          {gameState === "playing" && mockRoom && <Progress value={(timeLeft / mockRoom.timePerQuestion) * 100} className="bg-gradient-to-r from-blue-500 to-cyan-500" />}
          <p className="text-lg font-medium mb-2">{mockQuestion?.question}</p>
          <div>
            <div className="grid grid-cols-2 gap-4">
              {mockQuestion?.choices.map((choice, index) => (
                <Button
                  key={index}
                  variant="default"
                  className={`h-10 text-lg bg-black/40 border-white/30 text-white hover:bg-white/20 rounded-xl transition-all duration-300 font-bold ${selectedAnswer === choice
                    ? showResults
                      ? choice === mockQuestion.correctAnswer
                        ? "bg-green-950 border-green-400 hover:bg-green-950 text-white"
                        : "bg-rose-950 border-rose-950 hover:bg-rose-950 text-white"
                      : "bg-blue-50 border-blue-400 hover:bg-blue-50/80 text-black"
                    : showResults && choice === mockQuestion.correctAnswer
                      ? "bg-green-950 border-green-950 hover:bg-green-950 text-white"
                      : ""
                    }`}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={showResults || selectedAnswer !== null}
                >
                  <div className="flex items-center space-x-3">
                    <span className="">{String.fromCharCode(65 + index)}.</span>
                    <span className="">{choice}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>}
    </div>
  )
}
