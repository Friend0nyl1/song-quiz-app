// random-noise-processor.js (หรือ audio-stream-processor.js)

const BUFFER_SIZE_FRAMES = 4096; // ขนาดบัฟเฟอร์ภายใน Worklet (อาจจะปรับได้)
                                 // 4096 frames * (1/48000 Hz) = 0.085 วินาที
const CHUNK_SIZE_BYTES = 71340;  // ขนาดข้อมูลที่ server ส่งมาใน 1 chunk (bytes)
                                 // หาก 16-bit stereo (4 bytes/sample), 71340 bytes / 4 = 17835 samples/chunk

class RandomNoiseProcessor extends AudioWorkletProcessor {
    audioBufferQueue = []; // เก็บ Float32Array chunks ที่ได้รับจาก Main Thread
    currentPlayingBuffer = null; // Buffer ที่กำลังเล่นอยู่
    currentReadIndex = 0; // ตำแหน่งที่อ่านไปแล้วใน currentPlayingBuffer

    constructor() {
        super();
        this.port.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(event) {
        if (event.data instanceof ArrayBuffer) {
            // แปลง ArrayBuffer เป็น Float32Array
            const int16Array = new Int16Array(event.data);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / 32768.0;
            }
            this.audioBufferQueue.push(float32Array);
        } else {
            console.warn("AudioStreamProcessor: Received non-ArrayBuffer data:", event.data);
        }
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const outputChannel0 = output[0];
        const outputChannel1 = output.length > 1 ? output[1] : null;

        const framesToProcess = outputChannel0.length; // 128 frames

        let framesCopied = 0;

        // Loop จนกว่าจะเติม output buffer ได้เต็ม หรือไม่มีข้อมูลในคิวแล้ว
        while (framesCopied < framesToProcess) {
            // ถ้าไม่มี buffer ที่กำลังเล่นอยู่ หรือเล่น buffer นี้จบแล้ว
            if (!this.currentPlayingBuffer || this.currentReadIndex >= this.currentPlayingBuffer.length) {
                // ลองดึง buffer ใหม่จากคิว
                if (this.audioBufferQueue.length > 0) {
                    this.currentPlayingBuffer = this.audioBufferQueue.shift();
                    this.currentReadIndex = 0;
                } else {
                    // **สำคัญ:** ถ้าคิวว่าง (Underrun) ให้เติมด้วย silence
                    // และออกจาก loop เพื่อรอข้อมูลใหม่
                    for (let i = framesCopied; i < framesToProcess; i++) {
                        outputChannel0[i] = 0;
                        if (outputChannel1) outputChannel1[i] = 0;
                    }
                    return true; // Keep processor alive
                }
            }

            // คำนวณจำนวนเฟรมที่จะ copy จาก currentPlayingBuffer
            // และจำนวนเฟรมที่เหลืออยู่ใน output buffer ที่ต้องเติม
            const remainingInCurrentBuffer = this.currentPlayingBuffer.length - this.currentReadIndex;
            const remainingInOutputBuffer = framesToProcess - framesCopied;
            const framesToCopy = Math.min(remainingInCurrentBuffer, remainingInOutputBuffer);

            // Copy data
            // สมมติว่า currentPlayingBuffer เป็น Stereo Interleaved (L, R, L, R...)
            // และ outputChannel0/1 เป็น Non-Interleaved (L... L, R... R)
            for (let i = 0; i < framesToCopy; i++) {
                outputChannel0[framesCopied + i] = this.currentPlayingBuffer[this.currentReadIndex + (i * 2)];
                if (outputChannel1) {
                    outputChannel1[framesCopied + i] = this.currentPlayingBuffer[this.currentReadIndex + (i * 2) + 1];
                }
            }

            this.currentReadIndex += framesToCopy * 2; // Read 2 samples (L+R) per frame
            framesCopied += framesToCopy;
        }

        return true; // Keep processor alive
    }
}

registerProcessor('random-noise-processor', RandomNoiseProcessor);