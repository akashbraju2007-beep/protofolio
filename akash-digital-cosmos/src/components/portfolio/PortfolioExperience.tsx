import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowDown,
  ArrowUpRight,
  Bot,
  Braces,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
  Gauge,
  Github,
  GraduationCap,
  Maximize2,
  MessageCircle,
  Moon,
  Music2,
  Palette,
  Pause,
  Play,
  Rocket,
  Send,
  Share2,
  Sun,
  Terminal,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/akash-profile.png";
import { ParticleField } from "./ParticleField";

const nav = ["work", "skills", "journey", "lab", "contact"] as const;
const palettes = ["violet", "cyan", "rose", "orange", "mono"] as const;
type PaletteName = (typeof palettes)[number];

const starterCode = `<main class="signal-card">
  <span class="status">● SYSTEM ONLINE</span>
  <h2>Ideas become interfaces.</h2>
  <p>Change this code. The preview updates instantly.</p>
  <button>Launch experiment →</button>
</main>

<style>
body { display:grid; place-items:center; min-height:100vh;
  margin:0; background:#090b13; color:#f5f7ff;
  font-family:system-ui; }
.signal-card { width:min(420px,80vw); padding:42px;
  border:1px solid #2a3150; background:#101523; }
.status { color:#67e8f9; font:12px monospace; }
h2 { font-size:42px; line-height:1; margin:28px 0 14px; }
p { color:#9da7be; line-height:1.6; }
button { margin-top:22px; padding:12px 18px; border:0;
  background:#ff6b35; color:#0b0c10; font-weight:800; }
</style>`;

const demoProjects = [
  {
    index: "01",
    title: "Java Calculator",
    type: "JAVA FUNDAMENTALS / DEMO CONCEPT",
    copy: "A beginner-friendly console calculator concept covering arithmetic operations, user input, and division-by-zero handling.",
    metrics: ["JAVA", "SCANNER", "SWITCH"],
    code: "// Java Calculator\nScanner input = new Scanner(System.in);\ndouble a = input.nextDouble();\ndouble b = input.nextDouble();\nSystem.out.println(a + b);",
  },
  {
    index: "02",
    title: "Pulse Command",
    type: "REAL-TIME OPERATIONS / DEMO",
    copy: "A dense command center concept that turns live product signals into calm, readable decisions.",
    metrics: ["96 SPEED", "AA A11Y", "42ms UI"],
  },
  {
    index: "03",
    title: "Orbit Learning",
    type: "ADAPTIVE LEARNING / DEMO",
    copy: "A playful learning system concept with progressive challenges and a visual map of mastery.",
    metrics: ["97 SPEED", "100 BEST", "3D UX"],
  },
  {
    index: "04",
    title: "Number Guessing Game",
    type: "JAVA FUNDAMENTALS / DEMO CONCEPT",
    copy: "A console game concept with a randomly chosen number, higher-or-lower hints, and an attempt counter. A practical exercise in loops and conditionals.",
    metrics: ["JAVA", "RANDOM", "LOOPS"],
    code: '// Number Guessing Game\nint secret = new Random().nextInt(100) + 1;\nint guess;\ndo {\n  guess = input.nextInt();\n  System.out.println(guess < secret ? "Higher!" :\n    guess > secret ? "Lower!" : "Correct!");\n} while (guess != secret);',
  },
  {
    index: "05",
    title: "Student Grade Tracker",
    type: "JAVA FUNDAMENTALS / DEMO CONCEPT",
    copy: "A basic student-record concept that stores subject marks, calculates averages, and assigns grades using arrays, methods, and simple classes.",
    metrics: ["JAVA", "ARRAYS", "CLASSES"],
    code: '// Student Grade Tracker\nint[] marks = {85, 92, 78};\nint total = 0;\nfor (int mark : marks) total += mark;\ndouble average = (double) total / marks.length;\nSystem.out.println("Average: " + average);',
  },
];

const skills = [
  { name: "React", detail: "Interface systems", x: "50%", y: "8%" },
  { name: "TypeScript", detail: "Reliable applications", x: "77%", y: "24%" },
  { name: "Node", detail: "Server experiences", x: "83%", y: "60%" },
  { name: "Canvas", detail: "Generative interaction", x: "52%", y: "82%" },
  { name: "APIs", detail: "Connected products", x: "17%", y: "62%" },
  { name: "Design", detail: "Creative direction", x: "18%", y: "25%" },
];

const quiz = [
  {
    q: "Which hook memoizes a computed value?",
    options: ["useMemo", "useEffect", "useRef"],
    answer: 0,
  },
  {
    q: "What protects API secrets?",
    options: ["CSS variables", "Server code", "Local storage"],
    answer: 1,
  },
  { q: "Which format is native to the web?", options: ["WebGL", "PSD", "Figma file"], answer: 0 },
];

function sectionClass(extra = "") {
  return `relative mx-auto w-full max-w-[1440px] px-5 py-24 sm:px-8 lg:px-14 lg:py-32 ${extra}`;
}

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
      <span className="text-primary">{number}</span>
      <span className="h-px w-10 bg-border" />
      {children}
    </div>
  );
}

function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let time = Math.random() * 1000;
    const seed = Math.random() * 200;
    const pointer = { x: 0.5, y: 0.5 };
    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - box.left) / box.width;
      pointer.y = (event.clientY - box.top) / box.height;
    };
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(6,10,22,.14)";
      ctx.fillRect(0, 0, width, height);
      for (let line = 0; line < 14; line += 1) {
        ctx.beginPath();
        for (let x = -30; x <= width + 30; x += 18) {
          const distance = Math.abs(x / width - pointer.x);
          const y =
            height * (line / 13) +
            Math.sin(x * 0.012 + time * 0.012 + line + seed) * (18 + (1 - distance) * 30);
          if (x < 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = line % 3 === 0 ? "rgba(6,182,212,.22)" : "rgba(167,139,250,.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      time += 0.32;
      frame = requestAnimationFrame(draw);
    };
    resize();
    canvas.addEventListener("pointermove", move);
    addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", move);
      removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden="true" />;
}

function SkillOrbit() {
  const [active, setActive] = useState(0);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] [perspective:1100px]">
      <div className="absolute inset-[15%] animate-orbit-slow rounded-full border border-primary/25" />
      <div className="absolute inset-[26%] animate-orbit-reverse rounded-full border border-accent/20" />
      <div className="absolute inset-[38%] grid place-items-center rounded-full border border-border bg-background/70 font-display text-3xl font-black shadow-neon backdrop-blur-xl">
        AR
      </div>
      {skills.map((skill, index) => (
        <button
          key={skill.name}
          type="button"
          onMouseEnter={() => setActive(index)}
          onFocus={() => setActive(index)}
          className={`absolute z-10 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center border font-mono text-[10px] uppercase transition duration-500 ${active === index ? "scale-110 border-primary bg-primary text-primary-foreground shadow-neon" : "border-border bg-card text-foreground hover:border-primary"}`}
          style={{ left: skill.x, top: skill.y }}
        >
          {skill.name}
        </button>
      ))}
      <div className="absolute bottom-0 left-1/2 w-64 -translate-x-1/2 border-l border-primary pl-4 text-sm">
        <p className="font-bold text-foreground">{skills[active]?.name}</p>
        <p className="text-muted-foreground">{skills[active]?.detail}</p>
      </div>
    </div>
  );
}

function CodeLab() {
  const [code, setCode] = useState(starterCode);
  const [running, setRunning] = useState(true);
  const complexity = Math.min(
    99,
    18 + code.split("\n").length + (code.match(/[{};]/g)?.length ?? 0),
  );
  return (
    <div className="overflow-hidden border border-border bg-code shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <Terminal className="size-4 text-primary" /> index.html{" "}
          <span className="hidden sm:inline">LIVE SANDBOX</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            COMPLEXITY {complexity}
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => setRunning((value) => !value)}
            aria-label={running ? "Pause preview" : "Run preview"}
            title={running ? "Pause preview" : "Run preview"}
          >
            {running ? <Pause /> : <Play />}
          </Button>
        </div>
      </div>
      <div className="grid min-h-[520px] lg:grid-cols-2">
        <div className="relative border-b border-border lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute left-0 top-0 flex w-10 flex-col items-end px-2 py-5 font-mono text-xs leading-6 text-muted-foreground/40">
            {Array.from({ length: 22 }, (_, index) => (
              <span key={index}>{index + 1}</span>
            ))}
          </div>
          <textarea
            aria-label="Editable live code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setRunning(true);
            }}
            spellCheck={false}
            className="h-[420px] w-full resize-none bg-transparent py-5 pl-12 pr-5 font-mono text-xs leading-6 text-code-foreground outline-none lg:h-full"
          />
        </div>
        <div className="relative min-h-[360px] bg-preview">
          <div className="absolute left-3 top-3 z-10 bg-background/80 px-2 py-1 font-mono text-[9px] uppercase text-primary backdrop-blur">
            Instant output
          </div>
          {running ? (
            <iframe
              title="Live code output"
              sandbox="allow-scripts"
              srcDoc={code}
              className="size-full min-h-[420px] border-0"
            />
          ) : (
            <div className="grid size-full min-h-[420px] place-items-center font-mono text-xs text-muted-foreground">
              PREVIEW PAUSED
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    throttle: 50,
  });
  useEffect(() => {
    const saved = localStorage.getItem("akash-ari-chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved) as UIMessage[]);
      } catch {
        localStorage.removeItem("akash-ari-chat");
      }
    }
  }, [setMessages]);
  useEffect(() => {
    if (messages.length) localStorage.setItem("akash-ari-chat", JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);
  const submit = async ({ text }: { text: string }) => {
    const value = text.trim();
    if (!value || status === "submitted" || status === "streaming") return;
    setInput("");
    await sendMessage({ text: value });
  };
  return (
    <div className="fixed bottom-5 right-5 z-[90] sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            className="mb-3 flex h-[min(610px,76vh)] w-[min(390px,calc(100vw-40px))] flex-col overflow-hidden border border-border bg-card/95 shadow-panel backdrop-blur-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center border border-primary bg-primary/10 font-display font-black text-primary">
                  AR
                </span>
                <div>
                  <p className="text-sm font-bold">AI-buddy</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-success">
                    ● Portfolio guide online
                  </p>
                </div>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                <X />
              </Button>
            </header>
            <Conversation className="min-h-0">
              <ConversationContent className="gap-5 p-4">
                <Message from="assistant">
                  <MessageContent>
                    <MessageResponse>
                      Hi — I’m **AI-buddy**, Akash’s portfolio guide. Want to explore his work,
                      skills, or the hidden experiments?
                    </MessageResponse>
                  </MessageContent>
                </Message>
                {messages.map((message) => {
                  const text = message.parts
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("");
                  if (!text) return null;
                  return (
                    <Message key={message.id} from={message.role}>
                      <MessageContent>
                        <MessageResponse>{text}</MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                })}
                {status === "submitted" && (
                  <Shimmer className="text-xs">Thinking through Akash’s work...</Shimmer>
                )}
                {error && <p className="text-xs text-destructive">{error.message}</p>}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            <div className="border-t border-border p-3">
              <PromptInput onSubmit={submit}>
                <PromptInputTextarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about skills or secret projects…"
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit status={status} disabled={!input.trim()} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        variant="signal"
        size="icon-lg"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className="rounded-full shadow-neon"
      >
        {open ? <X /> : <MessageCircle />}
      </Button>
    </div>
  );
}

function QuizGame() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const answer = (index: number) => {
    if (index === quiz[step]?.answer) setScore((value) => value + 1);
    if (step === quiz.length - 1) setDone(true);
    else setStep((value) => value + 1);
  };
  return (
    <div className="border border-border bg-card p-6 sm:p-9">
      <div className="mb-8 flex items-center justify-between">
        <span className="font-mono text-xs text-primary">SKILL.MATCH()</span>
        <span className="font-mono text-xs text-muted-foreground">
          {done ? "COMPLETE" : `${step + 1} / ${quiz.length}`}
        </span>
      </div>
      {done ? (
        <div>
          <p className="font-display text-4xl font-black">
            MATCH SCORE {score}/{quiz.length}
          </p>
          <p className="mt-3 text-muted-foreground">
            {score === quiz.length
              ? "Perfect signal. You and Akash would build well together."
              : "Strong start. The lab is always open."}
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => {
              setStep(0);
              setScore(0);
              setDone(false);
            }}
          >
            Play again
          </Button>
        </div>
      ) : (
        <div>
          <h3 className="max-w-xl font-display text-2xl font-bold">{quiz[step]?.q}</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {quiz[step]?.options.map((option, index) => (
              <Button
                key={option}
                variant="outline"
                className="h-auto justify-start whitespace-normal py-4"
                onClick={() => answer(index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PortfolioExperience() {
  const [cursorSpeed, setCursorSpeed] = useState(0);
  const [palette, setPalette] = useState<PaletteName>("violet");
  const [dark, setDark] = useState(true);
  const [sound, setSound] = useState(false);
  const [before, setBefore] = useState(48);
  const [project, setProject] = useState(0);
  const [nameClicks, setNameClicks] = useState(0);
  const [secret, setSecret] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [formState, setFormState] = useState<"idle" | "pending">("idle");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 150, damping: 30 });

  useEffect(() => {
    const stored = localStorage.getItem("akash-theme") as PaletteName | null;
    if (stored && palettes.includes(stored)) setPalette(stored);
  }, []);
  useEffect(() => {
    document.documentElement.dataset["palette"] = palette;
    document.documentElement.classList.toggle("light", !dark);
    localStorage.setItem("akash-theme", palette);
  }, [palette, dark]);
  useEffect(() => {
    const sequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let index = 0;
    let typed = "";
    const keydown = (event: KeyboardEvent) => {
      index = event.key === sequence[index] ? index + 1 : 0;
      if (index === sequence.length) {
        setSecret(true);
        index = 0;
      }
      if (event.key.length === 1) typed = (typed + event.key.toLowerCase()).slice(-6);
      if (typed === "secret") setSecret(true);
    };
    addEventListener("keydown", keydown);
    console.info(
      "%cAKASH_OS // Developer mode unlocked. Try the Konami code.",
      "color:#67e8f9;font-size:16px;font-weight:bold",
    );
    return () => removeEventListener("keydown", keydown);
  }, []);

  const playTone = useCallback(() => {
    if (!sound) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(420, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(760, context.currentTime + 0.08);
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  }, [sound]);

  const downloadResume = () => {
    const html = `<!doctype html><title>Akash B Raju — Resume</title><style>body{font:16px system-ui;max-width:760px;margin:60px auto;padding:20px;color:#161821}h1{font-size:52px;margin:0}h2{margin-top:40px;border-bottom:1px solid #ddd;padding-bottom:8px}.tag{color:#555}small{color:#777}</style><h1>AKASH B RAJU</h1><p class="tag">Full Stack Developer · NIAT Institution · Creative Digital Architect</p><h2>Profile</h2><p>Student developer focused on modern full-stack experiences, interactive systems, and creative web engineering.</p><h2>Public work</h2><p>GitHub: github.com/akashbraju2007-beep · Public repository: protofolio</p><h2>Capabilities</h2><p>React · TypeScript · Node · APIs · Canvas/WebGL · Interface design</p><small>Portfolio résumé preview · Add verified experience and contact details before professional use.</small>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "akash-b-raju-resume.html";
    link.click();
    URL.revokeObjectURL(url);
  };
  const share = async () => {
    const data = {
      title: "Akash B Raju — Portfolio",
      text: "Explore Akash’s interactive developer portfolio.",
      url: location.href,
    };
    if (navigator.share) await navigator.share(data);
    else await navigator.clipboard.writeText(location.href);
  };
  const submitContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      form.website ||
      !form.name.trim() ||
      !/^\S+@\S+\.\S+$/.test(form.email) ||
      form.message.trim().length < 10
    )
      return;
    setFormState("pending");
  };
  const current = demoProjects[project];
  if (!current) return null;
  const formProgress =
    ([
      form.name.trim(),
      /^\S+@\S+\.\S+$/.test(form.email) ? form.email : "",
      form.message.trim().length >= 10 ? form.message : "",
    ].filter(Boolean).length /
      3) *
    100;

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
      onPointerDown={playTone}
    >
      <motion.div
        className="fixed left-0 top-0 z-[100] h-0.5 w-full origin-left bg-primary"
        style={{ scaleX: progress }}
      />
      <ParticleField onSpeed={setCursorSpeed} />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
          <a
            href="#top"
            className="font-display text-lg font-black tracking-normal"
            aria-label="Akash B Raju home"
          >
            AKASH<span className="text-primary">.</span>
          </a>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((item, index) => (
              <a
                key={item}
                href={`#${item}`}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-primary"
              >
                <span className="mr-1 text-primary">0{index + 1}</span>
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <span className="mr-3 hidden font-mono text-[9px] text-muted-foreground sm:inline">
              VELOCITY {cursorSpeed}
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setSound((value) => !value)}
              aria-label={sound ? "Mute interface sounds" : "Enable interface sounds"}
            >
              {sound ? <Volume2 /> : <VolumeX />}
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setDark((value) => !value)}
              aria-label="Switch color mode"
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative min-h-[92svh] border-b border-border pt-16">
          <AmbientCanvas />
          <div className="absolute inset-0 bg-hero-grid opacity-60" />
          <div className="relative mx-auto grid min-h-[calc(92svh-4rem)] max-w-[1440px] items-center px-5 py-14 sm:px-8 lg:grid-cols-[1.25fr_.75fr] lg:px-14">
            <div className="z-10 max-w-5xl">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
                className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-primary"
              >
                <span className="size-2 animate-pulse rounded-full bg-success" /> Available for
                ambitious builds
              </motion.p>
              <button
                type="button"
                onClick={() => {
                  const next = nameClicks + 1;
                  setNameClicks(next);
                  if (next >= 5) setSecret(true);
                }}
                className="text-left"
                aria-label="Akash B Raju"
              >
                <h1
                  className={`morph-title font-display text-[clamp(4.3rem,11vw,10rem)] font-black uppercase leading-[0.76] ${secret ? "animate-glitch" : ""}`}
                >
                  <span>AKASH</span>
                  <br />
                  <span className="text-outline">B RAJU</span>
                </h1>
              </button>
              <p className="mt-10 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Full Stack Developer <span className="text-primary">/</span> NIAT Institution{" "}
                <span className="text-accent">/</span> Creative Digital Architect
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="signal">
                  <a href="#work">
                    Explore the work <ArrowDown />
                  </a>
                </Button>
                <Button size="lg" variant="outline" onClick={downloadResume}>
                  <Download /> Build résumé
                </Button>
                <Button size="icon-lg" variant="ghost" onClick={share} aria-label="Share portfolio">
                  <Share2 />
                </Button>
              </div>
            </div>
            <div className="relative mt-14 flex items-center justify-center lg:mt-0">
              <div className="absolute -inset-8 rounded-full bg-radial from-primary/25 via-accent/15 to-transparent blur-3xl pointer-events-none" />

              <div className="portrait-stage relative aspect-square w-[min(78vw,420px)] sm:w-[420px] lg:w-[440px] xl:w-[460px]">
                <div className="portrait-halo-spin" aria-hidden="true" />

                <div className="absolute inset-2 sm:inset-3 rounded-full border border-primary/40 bg-gradient-to-b from-card/80 via-background/60 to-card/90 shadow-2xl backdrop-blur-xl overflow-hidden">
                  <div className="absolute inset-0 bg-hero-grid opacity-30" />
                  <div className="absolute inset-5 rounded-full border border-primary/20" />
                  <div className="absolute inset-12 rounded-full border border-accent/20" />
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 size-52 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
                </div>

                <div className="portrait-halo-ring" aria-hidden="true" />

                <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
                  <img
                    src={profilePhoto}
                    alt="Akash B Raju, wearing a white shirt with arms crossed"
                    className="portrait-subject relative z-10 h-[115%] w-[108%] max-w-none object-contain object-bottom pointer-events-none select-none"
                  />
                </div>

                <div
                  className="portrait-badge absolute -top-1 -left-2 sm:-left-4 z-20 flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/90 px-3 py-1 font-mono text-[10px] tracking-wider text-primary shadow-lg backdrop-blur-md"
                  style={{ animationDelay: "0s" }}
                >
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  <span>FULL STACK</span>
                </div>

                <div
                  className="portrait-badge absolute top-12 -right-2 sm:-right-6 z-20 flex items-center gap-1.5 rounded-full border border-accent/40 bg-background/90 px-3 py-1 font-mono text-[10px] tracking-wider text-accent shadow-lg backdrop-blur-md"
                  style={{ animationDelay: "1.4s" }}
                >
                  <span className="size-1.5 rounded-full bg-accent" />
                  <span>REACT 19</span>
                </div>

                <div
                  className="portrait-badge absolute bottom-14 -left-3 sm:-left-6 z-20 flex items-center gap-1.5 rounded-full border border-success/40 bg-background/90 px-3 py-1 font-mono text-[10px] tracking-wider text-success shadow-lg backdrop-blur-md"
                  style={{ animationDelay: "2.8s" }}
                >
                  <span className="size-1.5 rounded-full bg-success" />
                  <span>NODE · APIS</span>
                </div>

                <div
                  className="portrait-badge absolute bottom-12 -right-3 sm:-right-6 z-20 flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/90 px-3 py-1 font-mono text-[10px] tracking-wider text-primary shadow-lg backdrop-blur-md"
                  style={{ animationDelay: "4s" }}
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span>WEBGL · UI</span>
                </div>

                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-25 flex items-center gap-2 rounded-full border border-success/50 bg-background/95 px-4 py-1.5 shadow-xl backdrop-blur-lg">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-foreground">
                    AVAILABLE FOR CLIENT PROJECTS
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex h-10 items-center overflow-hidden border-t border-border bg-background/60 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            <div className="animate-marquee whitespace-nowrap">
              INTERACTIVE SYSTEMS — CREATIVE ENGINEERING — FULL STACK CRAFT — NIAT INSTITUTION —
              INTERACTIVE SYSTEMS — CREATIVE ENGINEERING — FULL STACK CRAFT — NIAT INSTITUTION —
            </div>
          </div>
        </section>

        <section className={sectionClass()}>
          <SectionLabel number="00">About the signal</SectionLabel>
          <div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr]">
            <div className="font-mono text-xs leading-7 text-muted-foreground">
              GITHUB STATUS
              <br />
              <span className="text-success">● PUBLIC PROFILE CONNECTED</span>
              <br />1 PUBLIC REPOSITORY
              <br />
              JOINED AUG 2025
            </div>
            <p className="font-display text-[clamp(2.2rem,5vw,5rem)] font-semibold leading-[1.02]">
              I build digital experiences at the intersection of{" "}
              <span className="text-primary">logic</span>, motion, and human curiosity.
            </p>
          </div>
        </section>

        <section id="work" className="border-y border-border bg-section">
          <div className={sectionClass()}>
            <SectionLabel number="01">Featured project concepts</SectionLabel>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs text-primary">
                  {current.index} / {String(demoProjects.length).padStart(2, "0")}
                </p>
                <h2 className="mt-2 font-display text-4xl font-black sm:text-6xl">
                  {current.title}
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setProject((project + demoProjects.length - 1) % demoProjects.length)
                  }
                  aria-label="Previous project"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setProject((project + 1) % demoProjects.length)}
                  aria-label="Next project"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
            <div className="grid border border-border bg-card lg:grid-cols-[1.35fr_.65fr]">
              <div className="relative min-h-[440px] overflow-hidden bg-project-grid">
                {current.code ? (
                  <div className="relative z-20 flex min-h-[440px] flex-col justify-center bg-code p-6 sm:p-10">
                    <Terminal className="mb-6 size-8 text-primary" />
                    <pre className="overflow-x-auto whitespace-pre font-mono text-xs leading-7 text-code-foreground sm:text-sm">
                      <code>{current.code}</code>
                    </pre>
                    <p className="mt-6 font-mono text-[10px] text-muted-foreground">
                      ILLUSTRATIVE JAVA SNIPPET / DEMO CONCEPT
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden border-r border-primary"
                      style={{ width: `${before}%` }}
                    >
                      <div className="grid h-full min-w-[760px] place-items-center bg-before-pattern">
                        <div className="text-center">
                          <Braces className="mx-auto size-16 text-muted-foreground" />
                          <p className="mt-4 font-mono text-xs text-muted-foreground">
                            BEFORE / STATIC SYSTEM
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 -z-0 grid place-items-center">
                      <div className="relative size-64">
                        <div className="absolute inset-0 animate-spin-slow border border-accent/60" />
                        <div className="absolute inset-8 animate-orbit-reverse border border-primary/60" />
                        <Rocket className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-primary" />
                      </div>
                    </div>
                    <input
                      aria-label="Before and after comparison"
                      type="range"
                      min="15"
                      max="85"
                      value={before}
                      onChange={(event) => setBefore(Number(event.target.value))}
                      className="absolute inset-x-8 bottom-8 z-10 accent-primary"
                    />
                    <span className="absolute bottom-14 left-8 font-mono text-[9px] text-muted-foreground">
                      BEFORE
                    </span>
                    <span className="absolute bottom-14 right-8 font-mono text-[9px] text-primary">
                      AFTER
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-col p-7 sm:p-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  {current.type}
                </p>
                <p className="mt-7 text-lg leading-8 text-muted-foreground">{current.copy}</p>
                <div className="my-8 grid grid-cols-3 border-y border-border py-5">
                  {current.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="text-center font-mono text-[10px] text-foreground"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
                <p className="mb-5 text-xs text-muted-foreground">
                  Demo concept — not a verified completed project.
                </p>
                <Button asChild variant="outline" className="mt-auto">
                  <a href="https://github.com/akashbraju2007-beep" target="_blank" rel="noreferrer">
                    View GitHub profile <ArrowUpRight />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className={sectionClass()}>
          <SectionLabel number="02">Technology constellation</SectionLabel>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-5xl font-black sm:text-7xl">
                Built for the whole stack.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                From interface motion to server logic, every layer is treated as part of the
                experience.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-px bg-border border border-border">
                {[
                  ["24K+", "LINES / DEMO"],
                  ["12", "BUILDS / DEMO"],
                  ["1", "PUBLIC REPO"],
                  ["React", "FOCUS TECH"],
                ].map(([value, label]) => (
                  <div key={label} className="bg-background p-5">
                    <strong className="font-display text-3xl text-primary">{value}</strong>
                    <p className="mt-1 font-mono text-[9px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <SkillOrbit />
          </div>
        </section>

        <section id="journey" className="border-y border-border bg-section">
          <div className={sectionClass()}>
            <SectionLabel number="03">Experience & education</SectionLabel>
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute bottom-0 left-4 top-0 w-px bg-border sm:left-1/2" />
              {[
                {
                  year: "NOW",
                  title: "NIAT Institution",
                  text: "Building a foundation in software engineering through practical, product-oriented learning.",
                  icon: GraduationCap,
                },
                {
                  year: "2026",
                  title: "Portfolio Systems Lab",
                  text: "Exploring generative art, conversational interfaces, real-time previews, and expressive interaction.",
                  icon: Code2,
                },
                {
                  year: "NEXT",
                  title: "The ambitious chapter",
                  text: "Open to internships, collaborations, and hard problems with people who care about craft.",
                  icon: Rocket,
                },
              ].map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  className={`relative mb-12 pl-14 sm:w-1/2 sm:pl-0 ${index % 2 ? "sm:ml-auto sm:pl-14" : "sm:pr-14 sm:text-right"}`}
                >
                  <span
                    className={`absolute left-0 top-0 grid size-9 place-items-center border border-primary bg-background text-primary sm:left-auto ${index % 2 ? "sm:-left-[18px]" : "sm:-right-[18px]"}`}
                  >
                    <item.icon className="size-4" />
                  </span>
                  <p className="font-mono text-xs text-primary">{item.year}</p>
                  <h3 className="mt-2 font-display text-3xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="lab" className={sectionClass()}>
          <SectionLabel number="04">Live code laboratory</SectionLabel>
          <div className="mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <h2 className="max-w-3xl font-display text-5xl font-black sm:text-7xl">
              Don’t just view it. Break it.
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Edit the HTML and CSS. The isolated output runs instantly beside it.
            </p>
          </div>
          <CodeLab />
        </section>

        <section className="relative overflow-hidden border-y border-border bg-section">
          <div className={sectionClass()}>
            <SectionLabel number="05">Generative installation</SectionLabel>
            <div className="relative min-h-[540px] overflow-hidden border border-border bg-background">
              <AmbientCanvas />
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-mono text-xs text-primary">UNIQUE SEED / EVERY VISIT</p>
                  <h2 className="mt-4 font-display text-5xl font-black sm:text-7xl">
                    Move through the field.
                  </h2>
                </div>
              </div>
              <Button
                variant="outline"
                className="absolute bottom-5 right-5"
                onClick={() => window.print()}
              >
                <Download /> Save view
              </Button>
            </div>
          </div>
        </section>

        <section className={sectionClass()}>
          <SectionLabel number="06">Live dashboard</SectionLabel>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["024,781", "LINES / DEMO"],
              ["001", "PUBLIC REPO"],
              ["098", "LIGHTHOUSE / DEMO"],
              ["React", "MOST USED / DEMO"],
            ].map(([value, label], index) => (
              <div key={label} className="relative overflow-hidden bg-background p-7">
                <p className="font-display text-4xl font-black sm:text-5xl">{value}</p>
                <p className="mt-3 font-mono text-[10px] text-muted-foreground">{label}</p>
                <div
                  className="absolute bottom-0 left-0 h-1 bg-primary"
                  style={{ width: `${60 + index * 10}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Live GitHub profile: akashbraju2007-beep</span>
            <a
              className="flex items-center gap-2 text-primary"
              href="https://github.com/akashbraju2007-beep"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="size-4" /> View source
            </a>
          </div>
        </section>

        <section className="border-y border-border bg-section">
          <div className={sectionClass()}>
            <SectionLabel number="07">Hidden challenge</SectionLabel>
            <QuizGame />
          </div>
        </section>

        <section id="contact" className={sectionClass()}>
          <SectionLabel number="08">Start a conversation</SectionLabel>
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-5xl font-black sm:text-7xl">Have a hard problem?</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Bring the challenge. Akash brings curiosity, code, and an appetite for details.
              </p>
              <div className="mt-10 flex flex-wrap gap-2">
                {palettes.map((item) => (
                  <Button
                    key={item}
                    size="icon"
                    variant={palette === item ? "default" : "outline"}
                    onClick={() => setPalette(item)}
                    aria-label={`Use ${item} color palette`}
                    title={`${item} palette`}
                  >
                    <Palette />
                  </Button>
                ))}
              </div>
            </div>
            <form onSubmit={submitContact} className="border border-border bg-card p-6 sm:p-9">
              <div className="mb-8">
                <div className="mb-2 flex justify-between font-mono text-[9px] text-muted-foreground">
                  <span>MESSAGE COMPLETION</span>
                  <span>{Math.round(formProgress)}%</span>
                </div>
                <div className="h-1 bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
              </div>
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.website}
                onChange={(event) => setForm({ ...form, website: event.target.value })}
                className="hidden"
              />
              <label className="mb-5 block">
                <span className="mb-2 block font-mono text-[10px] text-muted-foreground">
                  YOUR NAME
                </span>
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full border-b border-border bg-transparent px-0 py-3 text-lg outline-none transition focus:border-primary"
                />
              </label>
              <label className="mb-5 block">
                <span className="mb-2 block font-mono text-[10px] text-muted-foreground">
                  EMAIL
                </span>
                <input
                  required
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full border-b border-border bg-transparent px-0 py-3 text-lg outline-none transition focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] text-muted-foreground">
                  WHAT SHOULD WE BUILD?
                </span>
                <textarea
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={5}
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  className="w-full resize-none border-b border-border bg-transparent px-0 py-3 text-lg outline-none transition focus:border-primary"
                />
              </label>
              {formState === "pending" ? (
                <div className="mt-7 border border-primary/40 bg-primary/10 p-4 text-sm">
                  <Check className="mr-2 inline size-4 text-primary" /> Message looks ready. Email
                  delivery activates after Akash’s sender domain and inbox are connected.
                </div>
              ) : (
                <Button type="submit" size="lg" variant="signal" className="mt-7 w-full">
                  Prepare message <Send />
                </Button>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-section">
        <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-14">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="font-display text-2xl font-black">
                AKASH B RAJU<span className="text-primary">.</span>
              </p>
              <p className="mt-2 font-mono text-[9px] text-muted-foreground">
                PORTFOLIO OS v1.0.0 / OPTIMIZED BY AKASH
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-[9px] text-muted-foreground">
                <Gauge className="size-3 text-success" />
                98 DEMO SCORE
              </span>
              <span className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-[9px] text-muted-foreground">
                <Maximize2 className="size-3 text-success" />
                RESPONSIVE
              </span>
              <span className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-[9px] text-muted-foreground">
                <Music2 className="size-3 text-success" />
                {sound ? "AUDIO ON" : "AUDIO OFF"}
              </span>
            </div>
          </div>
          <p className="mt-8 border-t border-border pt-6 text-xs leading-6 text-muted-foreground">
            Demo projects and performance values are illustrative until verified data is supplied.
            GitHub profile details are public facts.
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {secret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] grid place-items-center bg-background/95 p-5 backdrop-blur-xl"
          >
            <button
              type="button"
              aria-label="Close secret project"
              className="absolute right-6 top-6"
              onClick={() => setSecret(false)}
            >
              <X />
            </button>
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-3xl border border-primary bg-card p-8 shadow-neon sm:p-14"
            >
              <p className="font-mono text-xs text-primary">CLASSIFIED // EASTER EGG FOUND</p>
              <h2 className="mt-5 font-display text-5xl font-black sm:text-7xl">
                Project: Alive Interface
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                An experiment in interfaces that notice rhythm, intent, and curiosity—then transform
                in response. You found the hidden layer.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ChatAssistant />
    </div>
  );
}
