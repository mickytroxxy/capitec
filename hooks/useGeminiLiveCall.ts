import { getPaymentsForAccount } from "@/firebase";
import { setPayments } from "@/state/slices/payments";
import { RootState } from "@/state/store";
import * as base64js from "base64-js";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import LiveAudioStream from "react-native-live-audio-stream";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "./useAuth";

const GEMINI_API_KEY = "";
const MODEL_NAME = "models/gemini-2.5-flash-native-audio-preview-12-2025";

// Build a WAV Data URI from raw PCM chunks for streaming playback
const createWavDataUri = (pcmData: Uint8Array, sampleRate: number = 24000) => {
  const dataLength = pcmData.length;
  const wavBuffer = new Uint8Array(44 + dataLength);
  const view = new DataView(wavBuffer.buffer);

  const writeString = (v: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      v.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  wavBuffer.set(pcmData, 44);

  const base64Wav = base64js.fromByteArray(wavBuffer);
  return `data:audio/wav;base64,${base64Wav}`;
};

export function useGeminiLiveCall() {
  const { accountInfo } = useAuth();
  const { payments } = useSelector((s: RootState) => s.payments);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      if (!accountInfo?.accountNumber) return;
      const resp = await getPaymentsForAccount(accountInfo.accountNumber);
      dispatch(setPayments(resp || []));
    })();
  }, [accountInfo?.accountNumber, dispatch]);
  const filteredPayments = payments?.filter(
    (p) => !p?.statementDescription?.toLowerCase().includes("fee"),
  );
  const [callStatus, setCallStatus] = useState<
    "connecting" | "listening" | "speaking"
  >("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const setupCompleteRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);

  // Streaming playback variables
  const isReceivingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const playbackQueueRef = useRef<string[]>([]);

  // PCM accumulator to smooth out small chunks
  const pcmBufferRef = useRef<Uint8Array[]>([]);
  const lastAudioTimeRef = useRef<number>(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUserAudioRef = useRef<boolean>(false);
  const USER_SILENCE_THRESHOLD_MS = 1500;

  // Session management: resumption token for reconnecting
  const resumptionTokenRef = useRef<string | null>(null);

  // Flush accumulated PCM data as a single audio segment
  const flushPcmBuffer = async () => {
    if (pcmBufferRef.current.length === 0 || isPlayingRef.current) return;

    isPlayingRef.current = true;

    // Combine all buffered PCM chunks into one
    const totalLength = pcmBufferRef.current.reduce(
      (sum, chunk) => sum + chunk.length,
      0,
    );
    const combinedPcm = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of pcmBufferRef.current) {
      combinedPcm.set(chunk, offset);
      offset += chunk.length;
    }
    pcmBufferRef.current = [];

    const dataUri = createWavDataUri(combinedPcm, 24000);

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: dataUri });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
          isPlayingRef.current = false;

          // Check if more PCM arrived while we were playing
          if (pcmBufferRef.current.length > 0) {
            flushPcmBuffer();
          } else if (!isReceivingRef.current) {
            isSpeakingRef.current = false;
            setCallStatus("listening");
            console.log("[Gemini] Playback finished — listening for user...");
          }
        }
      });
      await sound.playAsync();
    } catch (err) {
      console.error("[Gemini] Buffer flush error:", err);
      isPlayingRef.current = false;
    }
  };

  // Smooth playback of small PCM chunks sequentially
  const playNextChunk = async () => {
    if (isPlayingRef.current) return;

    if (playbackQueueRef.current.length === 0) {
      if (!isReceivingRef.current && isSpeakingRef.current) {
        // Queue empty and turn is complete
        isSpeakingRef.current = false;
        setCallStatus("listening");
        console.log(
          "[Gemini] Stream playback finished — listening for user...",
        );
      }
      return;
    }

    isPlayingRef.current = true;
    const dataUri = playbackQueueRef.current.shift();

    if (!dataUri) {
      isPlayingRef.current = false;
      playNextChunk();
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: dataUri });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
          isPlayingRef.current = false;
          // Immediately play next chunk for smooth stream
          playNextChunk();
        }
      });
      await sound.playAsync();
    } catch (err) {
      console.error("[Gemini] Streaming chunk playback error:", err);
      isPlayingRef.current = false;
      playNextChunk();
    }
  };

  const stopAudio = async () => {
    playbackQueueRef.current = [];
    pcmBufferRef.current = [];
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    hasUserAudioRef.current = false;
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) {}
      soundRef.current = null;
    }
    isPlayingRef.current = false;
    isSpeakingRef.current = false;
    isReceivingRef.current = false;
  };

  const sendToGemini = (payload: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const parseGeminiMessage = (rawData: any): any | null => {
    try {
      let text: string;
      if (typeof rawData === "string") {
        text = rawData;
      } else if (rawData instanceof ArrayBuffer) {
        text = new TextDecoder("utf-8").decode(rawData);
      } else {
        text = rawData.toString();
      }
      if (!text || text === "[]" || text.trim() === "") return null;
      return JSON.parse(text);
    } catch {
      return null;
    }
  };
  const prompt = `
You are a friendly and professional Capitec bank consultant speaking to a customer over the phone.

You are a real human agent — never refer to yourself as an AI, bot, or assistant.

At the start of the conversation:

* Greet the user warmly
* Introduce yourself using a natural human name (choose one randomly, e.g. "Thabo", "Lerato", "Sizwe", "Ayesha", "Daniel", "Naledi")
* Keep it short and natural (like a real call centre agent)
* Ask how you can help

Tone and delivery:

* Speak in clear, natural South African English
* Sound relaxed, warm, and conversational
* Use short sentences (2–3 sentences max)
* Add natural flow (like real speech, not scripted)
* Occasionally acknowledge the user (e.g. "I hear you", "Got you", "Alright")

Accent and style:

* Use a subtle but clear South African English tone
* Sound like a Johannesburg-based bank consultant
* Avoid robotic or overly formal language

IMPORTANT RULES:

* NEVER interrupt the user while they are speaking
* ALWAYS respond in the same language the user is speaking
* If you don’t understand, politely ask for clarification
* If the user asks you to perform actions on their account, explain that you’ll guide them through the correct process
* If asked about a pending payment, say it is being processed and will reflect within 24–48 hours depending on the bank

Context you can use:

* Account information: ${JSON.stringify(accountInfo)}
* Last 15 payments: ${JSON.stringify(filteredPayments?.slice(15))}

Conversation behaviour:

* Keep responses concise and natural
* Speak like you're helping a real customer on a call
* Engage naturally and assist with banking-related queries
* Do not over-explain or sound scripted
  `;
  useEffect(() => {
    let active = true;

    const start = async () => {
      stopAudio(); // ensure clean state

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        console.warn("[Gemini] Microphone permission not granted!");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      LiveAudioStream.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6, // VOICE_RECOGNITION on Android
        bufferSize: 1024, // STREAMING FIX: lower latency buffer
        wavFile: "",
      });

      LiveAudioStream.on("data", (base64Data: string) => {
        if (!setupCompleteRef.current) return;
        if (isSpeakingRef.current) return;

        sendToGemini({
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: "audio/pcm;rate=16000",
                data: base64Data,
              },
            ],
          },
        });

        // Mark that we've received user audio
        hasUserAudioRef.current = true;
        lastAudioTimeRef.current = Date.now();

        // Clear any existing silence timer and start new one
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          // Only end turn if we have actual audio and Gemini isn't speaking
          if (hasUserAudioRef.current && !isSpeakingRef.current) {
            console.log("[Gemini] User silence — ending turn");
            hasUserAudioRef.current = false;
            sendToGemini({
              clientContent: {
                turns: [],
                turnComplete: true,
              },
            });
          }
        }, USER_SILENCE_THRESHOLD_MS);
      });

      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
      console.log("[Gemini] Connecting to WebSocket...");

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!active) return;
        console.log("[Gemini] WebSocket opened. Sending setup...");

        sendToGemini({
          setup: {
            model: MODEL_NAME,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede",
                  },
                },
              },
            },
            systemInstruction: {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          },
        });
      };

      ws.onmessage = async (event) => {
        if (!active) return;

        const data = parseGeminiMessage(event.data);
        if (!data) return;

        if (data.setupComplete !== undefined) {
          console.log("[Gemini] Setup complete! Starting session...");
          setupCompleteRef.current = true;
          setCallStatus("listening");

          sendToGemini({
            clientContent: {
              turns: [
                {
                  role: "user",
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              turnComplete: true,
            },
          });

          setTimeout(() => {
            LiveAudioStream.start();
            console.log("[Gemini] Microphone started.");
          }, 500);
          return;
        }

        // STREAMING FIX: Buffer PCM chunks for smoother playback
        if (data.serverContent?.modelTurn) {
          hasUserAudioRef.current = false;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          isSpeakingRef.current = true;
          isReceivingRef.current = true;
          setCallStatus("speaking");

          const parts = data.serverContent.modelTurn.parts ?? [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              const pcmBytes = base64js.toByteArray(part.inlineData.data);
              pcmBufferRef.current.push(pcmBytes);
            }
          }

          // Start playback if not already playing
          if (!isPlayingRef.current && pcmBufferRef.current.length > 0) {
            flushPcmBuffer();
          }
        }

        // TURN COMPLETE FLAG
        if (data.serverContent?.turnComplete) {
          console.log("[Gemini] Turn complete signal received.");
          isReceivingRef.current = false;

          // Flush any remaining buffer
          if (pcmBufferRef.current.length > 0 && !isPlayingRef.current) {
            flushPcmBuffer();
          }

          // Check if everything ended
          if (pcmBufferRef.current.length === 0 && !isPlayingRef.current) {
            isSpeakingRef.current = false;
            setCallStatus("listening");
          }
        }

        // INTERRUPTION HANDLING: User spoke while model was responding
        if (data.serverContent?.interrupted) {
          console.log(
            "[Gemini] User interrupted — stopping playback immediately.",
          );
          stopAudio(); // Immediately discard audio buffer to prevent agent continuing
          setCallStatus("listening");
        }

        // SESSION RESUMPTION: Capture resumption token for reconnecting
        if (data.sessionResumptionUpdate) {
          resumptionTokenRef.current =
            data.sessionResumptionUpdate.resumptionToken;
          console.log(
            "[Gemini] Resumption token captured for session recovery.",
          );
        }

        // GOAWAY HANDLING: Gracefully handle connection termination
        if (data.goAway) {
          console.log(
            "[Gemini] GoAway received. timeLeft:",
            data.goAway.timeLeft,
          );
          // Could implement reconnection logic here with resumption token
        }

        // GENERATION COMPLETE: Update UI when model finishes generating
        if (data.generationComplete) {
          console.log("[Gemini] Generation complete signal received.");
        }

        if (data.error) {
          console.error("[Gemini] Server error:", JSON.stringify(data.error));
        }
      };

      ws.onerror = (e) => {
        console.error("[Gemini] WebSocket error:", e);
      };

      ws.onclose = (e) => {
        console.log("[Gemini] WebSocket closed:", e.code, e.reason);
        setupCompleteRef.current = false;
        stopAudio();
        LiveAudioStream.stop();
      };
    };

    start();

    return () => {
      active = false;
      setupCompleteRef.current = false;
      LiveAudioStream.stop();
      stopAudio();
      wsRef.current?.close();
    };
  }, []);

  return { callStatus };
}
