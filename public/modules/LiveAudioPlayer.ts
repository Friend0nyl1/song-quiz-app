
import { io, Socket } from 'socket.io-client';

export class LiveAudioPlayer {
    private audioContext: AudioContext | null = null;
    private audioWorkletNode: AudioWorkletNode | null = null;
    private socket: Socket ;
    private isPlaying: boolean = false;
    private readonly workletPath: string; // path ไปยังไฟล์ Worklet
    private analyserNode: AnalyserNode | null = null;
    constructor(workletPath: string = '/modules/audio-stream-processor.js' , socket : Socket) {
        this.socket = socket;
        this.workletPath = workletPath;
    }

    async initialize() : Promise<void> {

        if (!this.audioContext) {
            try {
                this.audioContext = new AudioContext();
                await this.audioContext.audioWorklet.addModule(this.workletPath);
                this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'random-noise-processor', {
                     outputChannelCount: [2]
                });
                this.audioWorkletNode.connect(this.audioContext.destination);
                this.analyserNode = this.audioContext.createAnalyser();
                this.analyserNode.fftSize = 2048; // ขนาดของ FFT
                this.analyserNode.smoothingTimeConstant = 0.8; // ค่า smoothing (0-1)

                this.audioWorkletNode.connect(this.analyserNode); // เชื่อม Worklet ไปยัง Analyser
                this.analyserNode.connect(this.audioContext.destination);
                console.log("AudioContext created, state:", this.audioContext.state);
                this.socket.on('liveAudio', (chunk: ArrayBuffer) => {
                // console.log(`Received live audio data: ${data.type}`); // อาจจะ log เยอะไป ถ้าข้อมูลมาเร็ว
                if (this.audioWorkletNode) {
                    // ส่ง ArrayBuffer ไปยัง Worklet ด้วย transferList เพื่อประสิทธิภาพ
                    // const uint8Array = new Float32Array(chunk.data);
                    // console.log(uint8Array);
                    this.audioWorkletNode.port.postMessage(chunk, [chunk]);
                }
            });
            } catch (error) {
                console.error(error);
            }
        }

    }

    async startPlay(): Promise<void> {
        if (!this.audioContext) {
            console.warn("AudioContext not initialized. Call initAudio() first.");
            return;
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log("AudioContext resumed.");
        }

        if(this.socket && this.socket.connected) {
            console.log("Socket connected, starting playback.");
            return
        }
        

        
        
    }

    public getAudioContext(): AudioContext  | null {
        return this.audioContext ? this.audioContext : null;
    }

    public getAnalyzerNode(): AnalyserNode | null {
        return this.analyserNode;
    }

    public audioPlaybackStarted(): void {
        this.audioContext?.resume()
        ;
    }
}
