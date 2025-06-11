"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Lock, Globe, Music, Settings, Clock, Users, Plus } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { useSocket } from "../hook/socketContext"



const musicGenres = ["Pop", "Rock", "Hip-Hop", "Electronic", "Country", "Jazz", "Classical", "R&B", "Mixed"]
const difficulties = ["Easy", "Medium", "Hard", "Expert"]
const questionCounts = [10, 15, 20, 25, 30]

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState("")
  const [genre, setGenre] = useState("")
  const [questionCount, setQuestionCount] = useState("15")
  const [timePerQuestion, setTimePerQuestion] = useState("30")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(true)
  const [maxPlayers, setMaxPlayers] = useState("6")
  const { socket } = useSocket()

  const [isLoading, setIsLoading] = useState(false)



  const handleCreateRoom = () => {
    socket.connect()
    socket.emit("createRoom", {
      roomName,
      description,
      questionCount,
      timePerQuestion,
      isPrivate,
      maxPlayers,
    })
    setIsLoading(true)

  }

  useEffect(() => {

    socket.on(`roomCreated-room-${roomName}`, (data: { roomName: string, isCreated: boolean }) => {
      console.log(data.isCreated)
      if (data.isCreated) {
        console.log("room created")
        setIsLoading(false)
        window.location.href = `/room/${roomName}`
      }
    })
  }, [socket, roomName])
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_#1a1a3a_0%,_#0a0a1a_50%,_#000000_100%)]">
      {/* Navigation */}
      <nav className="border-b border-white/20 backdrop-blur-sm bg-black/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">SongQuiz</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-500/30 border border-purple-400/50 rounded-full px-6 py-3 mb-8">
              <Settings className="w-5 h-5 text-purple-200" />
              <span className="text-purple-100 text-sm font-semibold">Quiz Setup</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Create Your Quiz</h1>
            <p className="text-xl text-gray-200 font-medium">Configure the perfect music challenge for your friends</p>
          </div>

          {/* Form */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <Card className="bg-black/40 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl font-bold">Basic Information</CardTitle>
                <CardDescription className="text-gray-200 font-medium">Set up your quiz room details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="room-name" className="text-gray-100 font-semibold">
                    Quiz Room Name
                  </Label>
                  <Input
                    id="room-name"
                    placeholder="Enter an exciting quiz name..."
                    value={roomName}
                    disabled={isLoading}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-gray-300 focus:border-purple-400 rounded-xl font-medium"
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="genre" className="text-gray-100 font-semibold">
                    Music Genre
                  </Label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white rounded-xl font-medium">
                      <SelectValue placeholder="Choose your music style" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {musicGenres.map((g) => (
                        <SelectItem key={g} value={g} className="text-white hover:bg-gray-700 font-medium">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-100 font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell players what makes your quiz special..."
                    value={description}
                    disabled={isLoading}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-white/10 border-white/30 text-white placeholder:text-gray-300 focus:border-purple-400 rounded-xl font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Game Settings */}
            <Card className="bg-black/40 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl font-bold">Game Settings</CardTitle>
                <CardDescription className="text-gray-200 font-medium">Customize the quiz experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-gray-100 font-semibold">
                    Difficulty Level
                  </Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white rounded-xl font-medium">
                      <SelectValue placeholder="Select challenge level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {difficulties.map((d) => (
                        <SelectItem key={d} value={d} className="text-white hover:bg-gray-700 font-medium">
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-100 font-semibold flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Questions
                    </Label>
                    <Select value={questionCount} onValueChange={setQuestionCount}
                      disabled={isLoading}

                    >
                      <SelectTrigger className="bg-white/10 border-white/30 text-white rounded-xl font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {questionCounts.map((count) => (
                          <SelectItem
                            key={count}
                            value={count.toString()}
                            className="text-white hover:bg-gray-700 font-medium"
                          >
                            {count}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-100 font-semibold flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Time Limit
                    </Label>
                    <Select value={timePerQuestion} onValueChange={setTimePerQuestion}
                      disabled={isLoading}

                    >
                      <SelectTrigger className="bg-white/10 border-white/30 text-white rounded-xl font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {[15, 20, 30, 45, 60].map((time) => (
                          <SelectItem
                            key={time}
                            value={time.toString()}
                            className="text-white hover:bg-gray-700 font-medium"
                          >
                            {time}s
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-100 font-semibold flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Max Players
                  </Label>
                  <Select value={maxPlayers} onValueChange={setMaxPlayers}
                    disabled={isLoading}

                  >
                    <SelectTrigger className="bg-white/10 border-white/30 text-white rounded-xl font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem
                          key={num}
                          value={num.toString()}
                          className="text-white hover:bg-gray-700 font-medium"
                        >
                          {num} players
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Privacy & Create */}
          <div className="mt-8 space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {isPrivate ? (
                      <Lock className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Globe className="w-6 h-6 text-green-400" />
                    )}
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {isPrivate ? "Private Quiz Room" : "Public Quiz Room"}
                      </h3>
                      <p className="text-gray-200 font-medium">
                        {isPrivate ? "Only invited players can join" : "Anyone can discover and join"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={isPrivate} disabled={true} onCheckedChange={setIsPrivate} />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            // disabled={!roomName.trim() || !genre || !difficulty}

            >
              Create Quiz Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
