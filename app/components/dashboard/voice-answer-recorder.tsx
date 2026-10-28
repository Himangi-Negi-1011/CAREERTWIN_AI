"use client";

import { Loader2, Mic, Pause, Play, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type RecorderState = "idle" | "requesting" | "recording" | "review" | "transcribing" | "error";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export function VoiceAnswerRecorder({
  transcript,
  onTranscriptChange,
  sessionId,
}: {
  transcript: string;
  onTranscriptChange: (value: string) => void;
  sessionId?: string;
}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    if (state !== "recording") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function startRecording() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported in this browser. You can still type your answer below.");
      setState("error");
      return;
    }
    try {
      setState("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      setSeconds(0);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        audioBlobRef.current = blob.size ? blob : null;
        if (blob.size) setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setState("review");
      };
      recorder.start();
      setState("recording");
    } catch (cause) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(cause instanceof DOMException && cause.name === "NotAllowedError"
        ? "Microphone access was not allowed. Update your browser permission or type your answer instead."
        : "CareerTwin could not start the microphone. Check that another app is not using it, then try again.");
      setState("error");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function discardRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    audioBlobRef.current = null;
    setSeconds(0);
    setError("");
    setState("idle");
  }

  async function transcribe() {
    const blob = audioBlobRef.current; if (!blob || !sessionId) return;
    setState("transcribing"); setError("");
    try {
      const form = new FormData(); form.append("audio", blob, blob.type.includes("mp4") ? "answer.mp4" : "answer.webm");
      const response = await fetch(`/api/interviews/${sessionId}/transcribe`, { method: "POST", body: form });
      const payload = await response.json() as { data?: { transcript: string }; error?: { message: string } };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message || "Transcription could not be completed.");
      onTranscriptChange(payload.data.transcript); setState("review");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Transcription could not be completed."); setState("review"); }
  }

  return (
    <div className="mt-6 rounded-[22px] border border-ink/10 bg-[#f8faf8] p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label">Voice answer · transcript review</p>
          <h3 className="mt-2 font-bold">Record, transcribe, edit, then submit.</h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate">{sessionId ? "Audio stays in this browser tab unless you explicitly choose Transcribe. That action sends the recording to Gemini; CareerTwin does not save the audio." : "Audio stays in this browser tab and is not uploaded. Automatic transcription and AI evaluation are not enabled for local practice."}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/15 bg-mint/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent"><ShieldCheck size={13}/>{sessionId ? "Upload by choice" : "Local only"}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {state !== "recording" && state !== "requesting" && (
          <button type="button" onClick={startRecording} className="button-primary"><Mic size={15}/>{audioUrl ? "Record again" : "Start recording"}</button>
        )}
        {state === "requesting" && <span className="inline-flex min-h-11 items-center rounded-full bg-cream px-4 text-sm font-bold text-slate" aria-live="polite">Requesting microphone…</span>}
        {state === "recording" && <>
          <button type="button" onClick={stopRecording} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-700 px-4 text-sm font-bold text-white"><Pause size={15}/>Stop recording</button>
          <span className="inline-flex items-center gap-2 font-mono text-sm font-bold text-red-700" aria-live="polite"><span className="size-2 animate-pulse rounded-full bg-red-600"/>REC {formatTime(seconds)}</span>
        </>}
        {audioUrl && <>
          <audio src={audioUrl} controls className="h-10 max-w-full" aria-label="Recorded answer preview" />
          {sessionId && <button type="button" onClick={transcribe} disabled={state === "transcribing"} className="button-primary disabled:opacity-40">{state === "transcribing" ? <Loader2 className="animate-spin" size={14}/> : <Mic size={14}/>} {state === "transcribing" ? "Transcribing…" : "Transcribe with Gemini"}</button>}
          <button type="button" onClick={startRecording} className="button-secondary px-4 py-2.5"><RotateCcw size={14}/>Re-record</button>
          <button type="button" onClick={discardRecording} className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 size={14}/>Discard</button>
        </>}
      </div>
      {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-800" role="alert">{error}</p>}

      <label className="mt-5 block text-xs font-bold">Answer transcript or notes
        <textarea value={transcript} onChange={(event) => onTranscriptChange(event.target.value)} maxLength={8000} rows={5} className="mt-2 w-full resize-y rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-accent" placeholder="Type your answer, or review and edit the transcript before submission."/>
      </label>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate"><Play size={12}/>Transcript review is mandatory: edit any transcription errors before submitting your answer.</p>
    </div>
  );
}
