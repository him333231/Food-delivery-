import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles, Mic, ImagePlus, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; image?: string };

const STARTERS = [
  "What should I eat tonight?",
  "Recommend a healthy lunch under 500 kcal.",
  "Find spicy Indian food.",
  "Suggest a combo for one person under ₹400.",
];

// Minimal Web Speech API typing to avoid `any`
type SpeechRecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionEvent = { results: ArrayLike<SpeechRecognitionResult> };
type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  onresult: (e: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Bites AI. Ask me for meal ideas, healthy picks, combos, or upload a food photo and I'll analyze it. 🍽️",
    },
  ]);
  const [input, setInput] = useState("");
  const [attached, setAttached] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text && !attached) return;
    const userMsg: Msg = {
      role: "user",
      content: text || "What's in this image?",
      image: attached ?? undefined,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    const img = attached;
    setAttached(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          imageDataUrl: img ?? undefined,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) {
        const err =
          res.status === 429
            ? "I'm getting a lot of requests right now — please try again in a moment."
            : res.status === 402
              ? "AI credits are exhausted. Please add credits in your workspace."
              : data.error ?? "Something went wrong.";
        setMessages((m) => [...m, { role: "assistant", content: err }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.text || "…" },
        ]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onPickImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setAttached(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleVoice = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Voice input isn't supported in this browser.");
      return;
    }
    if (listening) return;
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? prev + " " + t : t));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-2xl transition hover:scale-105"
          aria-label="Open AI assistant"
        >
          <Bot className="h-5 w-5" />
          <span className="hidden text-sm font-semibold sm:inline">Ask Bites AI</span>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
            <Sparkles className="h-3 w-3" />
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-x-2 bottom-2 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:w-[380px]">
          <header className="flex items-center gap-2 border-b border-border/60 bg-primary px-4 py-3 text-primary-foreground">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">Bites AI</div>
              <div className="text-[10px] opacity-80">Your food assistant</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.image && (
                      <img
                        src={m.image}
                        alt="attached"
                        className="mb-2 max-h-40 rounded-lg object-cover"
                      />
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                  </div>
                </div>
              )}
              {messages.length <= 1 && !loading && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {attached && (
            <div className="flex items-center gap-2 border-t border-border/60 bg-background px-3 py-2">
              <img src={attached} alt="preview" className="h-10 w-10 rounded-md object-cover" />
              <span className="flex-1 truncate text-xs text-muted-foreground">
                Image attached — send to analyze
              </span>
              <button
                onClick={() => setAttached(null)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
          )}

          <footer className="flex items-end gap-1.5 border-t border-border/60 bg-card p-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary"
              aria-label="Attach image"
              title="Upload food photo"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickImage(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={toggleVoice}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-secondary ${
                listening ? "text-destructive" : "text-muted-foreground hover:text-primary"
              }`}
              aria-label="Voice input"
              title="Voice input"
            >
              <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask me anything about food…"
              className="min-w-0 flex-1 rounded-full border border-border/60 bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => send()}
              disabled={loading || (!input.trim() && !attached)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </footer>
        </div>
      )}
    </>
  );
}
