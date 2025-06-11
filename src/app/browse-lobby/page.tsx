"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Users, Globe, Clock, Music, Filter } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { io } from "socket.io-client";
import { useSocket } from "../hook/socketContext"
import { usePathname, useRouter } from "next/navigation"

// Mock data for quiz rooms
// const mockRooms = [
//   {
//     id: "1",
//     name: "90s Pop Hits Challenge",
//     genre: "Pop",
//     description: "Test your knowledge of iconic 90s pop classics and chart-toppers",
//     currentPlayers: 3,
//     maxPlayers: 6,
//     isPublic: true,
//     createdAt: "2 min ago",
//     difficulty: "Medium",
//     questions: 20,
//     timePerQuestion: 30,
//   }
// ]
interface Room {
  id: string
  name: "90s Pop Hits Challenge"
  genre: "Pop"
  description: "Test your knowledge of iconic 90s pop classics and chart-toppers"
  currentPlayers: 3
  maxPlayers: 6
  isPublic: true
  createdAt: "2 min ago"
  difficulty: "Medium"
  questions: 20
  timePerQuestion: 30
}
const difficultyColors = {
  Easy: "bg-green-500/30 text-green-200 border-green-400/50",
  Medium: "bg-yellow-500/30 text-yellow-200 border-yellow-400/50",
  Hard: "bg-orange-500/30 text-orange-200 border-orange-400/50",
  Expert: "bg-red-500/30 text-red-200 border-red-400/50",
}

export default function BrowseLobbyPage() {
  const { socket } = useSocket()
  const [searchTerm, setSearchTerm] = useState("")
  const [mockRooms, setMockRooms] = useState<Room[]>([])
  const filteredRooms = mockRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

      let initialRoom = {
      id: "1",
      name: "90s Pop Hits Challenge",
      genre: "Pop",
      description: "Test your knowledge of iconic 90s pop classics and chart-toppers",
      currentPlayers: 3,
      maxPlayers: 6,
      isPublic: true,
      createdAt: "2 min ago",
      difficulty: "Medium",
      questions: 20,
      timePerQuestion: 30,
    }
    socket.on("roomCreated", (room : Room) => {

    console.log("Received rooms:", {...initialRoom, ...room});
      setMockRooms((prevRooms) => [...prevRooms, {...initialRoom, ...room}]);
    });
    socket.on("roomUpdated", (rooms : Room[]) => {
    const updatedRooms = rooms.map((room) => ({...initialRoom, ...room}))
      console.log("Received rooms:", updatedRooms);
      setMockRooms(updatedRooms);
    })

  useEffect(() => {


    return () => {
      socket.off("roomCreated");
      socket.off("roomUpdated");
    };
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-500/30 border border-blue-400/50 rounded-full px-6 py-3 mb-8">
            <Search className="w-5 h-5 text-blue-200" />
            <span className="text-blue-100 text-sm font-semibold">Discover Quizzes</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Browse Active Quizzes</h1>
          <p className="text-xl text-gray-200 font-medium">Find the perfect music challenge and join the fun</p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
            <Input
              placeholder="Search by name, genre, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 bg-white/10 border-white/30 text-white placeholder:text-gray-300 focus:border-purple-400 rounded-xl text-lg font-medium"
            />
            <Button
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white hover:bg-white/20"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="group bg-black/40 backdrop-blur-sm border border-white/20 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {room.name}
                  </CardTitle>
                  <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
                </div>
                <CardDescription className="text-gray-200 leading-relaxed font-medium">
                  {room.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500/30 text-blue-200 border border-blue-400/50 px-3 py-1 font-semibold">
                    {room.genre}
                  </Badge>
                  <Badge
                    className={`border px-3 py-1 font-semibold ${difficultyColors[room.difficulty as keyof typeof difficultyColors]}`}
                  >
                    {room.difficulty}
                  </Badge>
                </div>

                {/* Quiz Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-white font-bold">{room.questions}</div>
                    <div className="text-gray-200 font-medium">Questions</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-white font-bold">{room.timePerQuestion}s</div>
                    <div className="text-gray-200 font-medium">Per Question</div>
                  </div>
                </div>

                {/* Room Stats */}
                <div className="flex items-center justify-between text-sm text-gray-200 pt-2 border-t border-white/20 font-medium">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {room.currentPlayers}/{room.maxPlayers} players
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{room.createdAt}</span>
                  </div>
                </div>

                {/* Join Button */}
                <Link href={`/room/${room.id}`} className="w-full">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-lg hover:shadow-xl"
                    disabled={room.currentPlayers >= room.maxPlayers}
                  >
                    {room.currentPlayers >= room.maxPlayers ? "Quiz Full" : "Join Quiz"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Quizzes Found</h3>
            <p className="text-gray-200 mb-6 font-medium">Try adjusting your search terms or create your own quiz!</p>
            <Link href="/create-room">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl">
                Create New Quiz
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
