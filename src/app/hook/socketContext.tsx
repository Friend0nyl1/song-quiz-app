"use client";

import { useToast } from "@/hooks/use-toast";
import { LiveAudioPlayer } from "../../../public/modules/LiveAudioPlayer";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// --- Interface Definitions ---
interface LiveStreamStatus {
    isStreaming: boolean;
    song?: string;
    serverStartTime?: number;
    currentPosition?: number;
    duration?: number;
}

interface SocketContextProps {
    startFileStream: () => void;
    isReady: boolean;
    socket: Socket;
    socketId: string | null;
    isConnected: boolean;
    isLoading: boolean;
    analyser : AnalyserNode | null
    audioContextState : AudioContext | null
    playtest : () => void
}

// --- Create Socket Context ---
const SocketContext = createContext<SocketContextProps | undefined>(undefined);
    const workletPath = '/modules/audio-stream-processor.js';
    // **สำคัญ: เปลี่ยน URL นี้เป็น Socket.io Server ของคุณ**
    const socketUrl = 'http://192.168.1.2:3000'; 


// --- SocketProvider Component ---
const https = `${socketUrl}`; // Ensure this matches your server URL
const ioSocket = io(https, {
    transports: ['websocket', 'polling'],
    
    autoConnect: true, // Attempt to connect automatically
    
});
const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    // --- Socket.IO Connection Setup ---
    let socket = ioSocket;
    const startFileStream = () => {
         startPlayback();
    }
    const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
    const [audioContextState, setAudioContextState] = useState<AudioContext | null>(null);
    const [analyser , setAnalyser] = useState<AnalyserNode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [socketId , setSocketId] = useState<string | null>(null);
    const { toast } = useToast();
    // 1.1 Refs สำหรับ Audio Element, Socket.IO, MediaSource และ SourceBuffer
    const [isReady, setIsReady] = useState(false);
    const [status , setStatus] = useState<LiveStreamStatus>({
        isStreaming: false
    })









    const startPlayback = async () => {
        if(!audioPlayerRef.current) {
            console.log("AudioPlayer not initialized.");
            return
        };
        try {
           await audioPlayerRef.current.initialize();
           await audioPlayerRef.current.startPlay();
           setAudioContextState(audioPlayerRef.current.getAudioContext());
           setAnalyser(audioPlayerRef.current.getAnalyzerNode());
        } catch (error) {
            console.error("Error starting playback:", error);
        }
          console.log("startPlayback called.");




    }

    const playtest = () => {
        if(!audioPlayerRef.current) {
            toast({
                title: "Error",
                description: "AudioPlayer not initialized.",
                variant: "destructive",
            })
            return
        };
        audioPlayerRef.current.audioPlaybackStarted();
    }

    useEffect(() => {
        audioPlayerRef.current = new LiveAudioPlayer(workletPath, socket);
        console.log("AudioPlayer initialized.");
        const handleConnect = () => {
             toast({
                title: "Connected",
                description: "Connected to server",
                variant: "default",
            });
            // setSocketId(socket.id?? null);
            // setIsConnected(true);
            
        };

        const handleDisconnect = () => {
            toast({
                title: "Disconnected",
                description: "Disconnected from server",
                variant: "destructive",
            });
            console.log("Socket disconnected.");
            // จัดการการตัดการเชื่อมต่อ: ล้างบัฟเฟอร์, รีเซ็ตสถานะการเล่น
        
        };
        // const handleLiveAudio = (chunk: {type: string, data: ArrayBuffer}) => {
        //     toast({
        //         title: "Live Audio",
        //         description: "Received live audio data",
        //         variant: "default",
        //     })

            

        // };
        socket.on('restartStream', () => { 
            
           
        });
        // socket.connect();

        socket.on('connect', handleConnect);    
        socket.on('disconnect', handleDisconnect);
        // socket.on('liveAudio', handleLiveAudio);
        socket.on('stopStream', () => {
            console.log("Stopping stream...");
        });
        socket.on('liveStreamStarted', (status :LiveStreamStatus) => {
            setStatus(status);
        })
        // Cleanup function สำหรับเมื่อ Socket.IO events ถูกยกเลิกการฟัง
        return () => {
            console.log("Cleaning up Socket.IO listeners...");
            // socket.off('connect', handleConnect);
            // socket.off('disconnect', handleDisconnect);
            // socket.off('liveAudio', handleLiveAudio);
            // socket.disconnect();
            // ไม่ต้องทำ cleanup ของ MediaSource/Audio element ซ้ำที่นี่
            // เพราะมันควรจะอยู่ใน useEffect ตัวแรกแล้ว
        };
    }, []);

    return (
        <SocketContext.Provider value={{
            socket,
            startFileStream,
            isReady,
            socketId,
            isConnected,
            isLoading,
            analyser,
            audioContextState,
            playtest
        }}>
            {children}

            {/* คุณสามารถเพิ่ม audio element ใน JSX ตรงนี้ได้ถ้าต้องการให้มันเป็นส่วนหนึ่งของ React component tree */}
        </SocketContext.Provider>
    );
};

// --- Custom Hook to Use Socket Context ---
const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export { SocketProvider, useSocket };

    // Helper function to format time (e.g., 0:00)
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
