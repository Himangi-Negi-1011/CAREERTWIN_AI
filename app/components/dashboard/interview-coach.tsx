"use client";

import { ArrowRight, Bot, CheckCircle2, ClipboardCheck, Lightbulb, Loader2, Save, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { VoiceAnswerRecorder } from "./voice-answer-recorder";

type InterviewType = "behavioral" | "technical" | "communication";
type Difficulty = "beginner" | "intermediate" | "advanced";
type Criterion = { criterion: string; weight: number; rating: number | null; assessed: boolean; explanation: string; evidence: string[] };
type Evaluation = { strengths: string[]; missingDetails: string[]; suggestions: string[]; improvedAnswer: string; criteria: Criterion[] };
type EvaluationResponse = { data?: { evaluation: Evaluation; summary: { coverage: number; overallScore: number | null }; nextQuestion?: SessionQuestion | null; readyToComplete?: boolean }; error?: { code: string; message: string } };
type SessionQuestion = { id: string; ordinal: number; prompt: string; category: string; guidance: string; difficulty: Difficulty };
type ActiveSession = { id: string; questionCount: 5 | 10 | 15; current: SessionQuestion };

const questions: Record<InterviewType, Array<{ id: string; category: string; prompt: string; tip: string }>> = {
  behavioral: [
    { id: "story", category: "Career story", prompt: "Walk me through your background and why this role is your next step.", tip: "Connect past evidence, current strengths, and the direction you are pursuing." },
    { id: "problem", category: "Problem solving", prompt: "Tell me about a difficult problem you solved. How did you decide what to do first?", tip: "Use context, constraints, actions, and an observable result." },
    { id: "tradeoff", category: "Judgement", prompt: "Describe a trade-off you made when time, quality, or resources were limited.", tip: "Name the options, decision criteria, risk, choice, and learning." },
    { id: "feedback", category: "Collaboration", prompt: "Give an example of critical feedback you received and what changed afterward.", tip: "Show that you listened, acted, and reflected without blaming others." },
    { id: "learning", category: "Learning", prompt: "How do you learn an unfamiliar skill quickly enough to use it responsibly?", tip: "Explain how you choose sources, practise, seek feedback, and verify work." },
  ],
  technical: [
    { id: "technical-approach", category: "Technical reasoning", prompt: "Explain how you would approach an unfamiliar technical problem in your target role.", tip: "Clarify requirements, constraints, assumptions, validation, and trade-offs." },
    { id: "technical-quality", category: "Quality", prompt: "How do you verify that technical work is correct and safe to release?", tip: "Use checks appropriate to your field rather than generic claims." },
    { id: "technical-debug", category: "Diagnosis", prompt: "Describe a difficult defect or failure you investigated and how you found the cause.", tip: "Separate symptoms, hypotheses, evidence, experiments, and resolution." },
    { id: "technical-design", category: "Design", prompt: "Describe a system or solution you designed and the most important trade-off you made.", tip: "Explain constraints, alternatives, decision criteria, and consequences." },
    { id: "technical-edge", category: "Edge cases", prompt: "Tell me about an edge case you nearly missed. How did you discover and address it?", tip: "Be specific about detection, impact, mitigation, and prevention." },
  ],
  communication: [
    { id: "communication-complex", category: "Clarity", prompt: "Explain a complex idea from your field to someone without your background.", tip: "Lead with the purpose, reduce jargon, and check understanding." },
    { id: "communication-disagree", category: "Responsiveness", prompt: "Describe a professional disagreement and how you communicated your position.", tip: "Show listening, evidence, respectful challenge, and resolution." },
    { id: "communication-brief", category: "Conciseness", prompt: "Give a one-minute summary of a project you are proud of.", tip: "Use a clear beginning, contribution, outcome, and learning." },
    { id: "communication-stakeholder", category: "Audience", prompt: "How do you adapt the same update for a peer, manager, and customer?", tip: "Explain how detail, language, risk, and action change by audience." },
    { id: "communication-question", category: "Listening", prompt: "Tell me about a time a follow-up question changed your understanding of a problem.", tip: "Show curiosity, what changed, and how the new information affected action." },
  ],
};

export function InterviewCoach({ role, practiceCount, onSave }: {
  role: string;
  practiceCount: number;
  onSave: (record: { questionId: string; rating: number; note: string; answerText?: string; mode: "text" | "voice-review" }) => void;
}) {
  const [type, setType] = useState<InterviewType>("behavioral");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15>(5);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(false);
  const [playbackEnabled, setPlaybackEnabled] = useState(true);
  const [activeSession, setActiveSession] = useState<ActiveSession>();
  const [nextSessionQuestion, setNextSessionQuestion] = useState<SessionQuestion | null>();
  const [sessionReadyToComplete, setSessionReadyToComplete] = useState(false);
  const [finalReport, setFinalReport] = useState<{ overallScore: number | null; scoreExplanation: string; topStrengths: string[]; priorityImprovements: string[]; practicePlan: Array<{ title: string; detail: string; estimatedMinutes: number }> }>();
  const [roadmapApplied, setRoadmapApplied] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [index, setIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [showTip, setShowTip] = useState(false);
  const [saved, setSaved] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResponse["data"]>();
  const [evaluationError, setEvaluationError] = useState("");
  const [clarification, setClarification] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [aiAvailability, setAiAvailability] = useState<"checking" | "available" | "unavailable">("checking");
  const [aiProvider, setAiProvider] = useState("");
  const set = questions[type];
  const localQuestion = set[index];
  const question = activeSession ? { id: activeSession.current.id, category: activeSession.current.category, prompt: activeSession.current.prompt, tip: activeSession.current.guidance } : localQuestion;
  const questionOrdinal = activeSession?.current.ordinal ?? index + 1;
  const totalQuestions = activeSession?.questionCount ?? set.length;

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/health/ai", { signal: controller.signal })
      .then(async (response) => {
        const status = await response.json() as { initialized?: boolean; provider?: string | null };
        if (response.ok && status.initialized) {
          setAiProvider(status.provider || "AI");
          setAiAvailability("available");
        } else {
          setAiAvailability("unavailable");
        }
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setAiAvailability("unavailable");
      });
    return () => controller.abort();
  }, []);

  function resetAnswer() { setRating(0); setNote(""); setAnswerText(""); setClarification(""); setShowTip(false); setSaved(false); setEvaluation(undefined); setEvaluationError(""); }
  function changeType(value: InterviewType) { setType(value); setIndex(0); setActiveSession(undefined); resetAnswer(); }
  function next() { if (activeSession) return; setIndex((value) => (value + 1) % set.length); resetAnswer(); }
  function save() { if (!rating) return; onSave({ questionId: question.id, rating, note: note.trim(), answerText: answerText.trim() || undefined, mode: answerText.trim() ? "voice-review" : "text" }); setSaved(true); }
  function continueSecureSession() { if (!activeSession || !nextSessionQuestion) return; setActiveSession({ ...activeSession, current: nextSessionQuestion }); setNextSessionQuestion(undefined); resetAnswer(); }

  async function startSecureSession() {
    if (aiAvailability !== "available") return;
    setStartingSession(true); setEvaluationError("");
    try {
      const response = await fetch("/api/interviews/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ interviewType: type, difficulty, adaptiveDifficulty, questionCount, playbackEnabled, targetRole: role || "Target role not selected", allowProfileContext: false }) });
      const payload = await response.json() as { data?: { session: { id: string; question_count: 5 | 10 | 15 }; question: SessionQuestion }; error?: { message: string } };
      if (!response.ok || !payload.data) { setEvaluationError(payload.error?.message || "The secure interview session could not be started."); return; }
      setActiveSession({ id: payload.data.session.id, questionCount: payload.data.session.question_count, current: payload.data.question }); resetAnswer();
    } catch { setEvaluationError("CareerTwin could not reach the interview service."); }
    finally { setStartingSession(false); }
  }

  async function requestReassessment() {
    if (!activeSession || clarification.trim().length < 10) return; setEvaluating(true); setEvaluationError("");
    try { const response = await fetch(`/api/interviews/${activeSession.id}/questions/${activeSession.current.id}/reassess`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clarification: clarification.trim() }) }); const payload = await response.json() as EvaluationResponse; if (!response.ok || !payload.data) { setEvaluationError(payload.error?.message || "Reassessment could not be completed."); return; } setEvaluation(payload.data); setClarification(""); }
    catch { setEvaluationError("CareerTwin could not reach the reassessment service."); } finally { setEvaluating(false); }
  }

  async function completeSecureSession() {
    if (!activeSession) return; setEvaluating(true); setEvaluationError("");
    try { const response = await fetch(`/api/interviews/${activeSession.id}/complete`, { method: "POST" }); const payload = await response.json() as { data?: { finalReport: NonNullable<typeof finalReport> }; error?: { message: string } }; if (!response.ok || !payload.data) { setEvaluationError(payload.error?.message || "The final report could not be generated."); return; } setFinalReport(payload.data.finalReport); }
    catch { setEvaluationError("CareerTwin could not reach the report service."); } finally { setEvaluating(false); }
  }

  async function applyRoadmapProposal() {
    if (!activeSession || !finalReport || !window.confirm("Apply these reviewed interview practice tasks to your roadmap? This cannot be represented as approved unless the server succeeds.")) return;
    setEvaluating(true); setEvaluationError("");
    try { const response = await fetch(`/api/interviews/${activeSession.id}/apply-to-roadmap`, { method: "POST" }); const payload = await response.json() as { data?: { twinUpdated?: boolean }; warning?: string; error?: { message: string } }; if (!response.ok) { setEvaluationError(payload.error?.message || "Roadmap changes were not applied."); return; } setRoadmapApplied(true); if(payload.data?.twinUpdated){window.dispatchEvent(new CustomEvent("careertwin:sync-state",{detail:{status:"saved",message:"Interview practice tasks added to your Career Twin."}}))}else if(payload.warning)setEvaluationError(payload.warning); }
    catch { setEvaluationError("CareerTwin could not reach the roadmap service."); } finally { setEvaluating(false); }
  }

  function speakQuestion() {
    if (!("speechSynthesis" in window)) { setEvaluationError("Question playback is not supported in this browser."); return; }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(question.prompt));
  }

  async function requestEvaluation() {
    if (answerText.trim().length < 20) return;
    setEvaluating(true); setEvaluation(undefined); setEvaluationError("");
    try {
      const response = await fetch(activeSession ? `/api/interviews/${activeSession.id}/questions/${activeSession.current.id}/submit` : "/api/interviews/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(activeSession ? { answer: answerText.trim(), inputMode: "text" } : { interviewType: type, difficulty, targetRole: role || "Target role not selected", question: question.prompt, answer: answerText.trim() }) });
      const payload = await response.json() as EvaluationResponse;
      if (!response.ok || !payload.data) { setEvaluationError(payload.error?.message || "Evaluation could not be completed."); return; }
      setEvaluation(payload.data);
      if (activeSession) { setNextSessionQuestion(payload.data.nextQuestion ?? null); setSessionReadyToComplete(Boolean(payload.data.readyToComplete)); }
    } catch { setEvaluationError("CareerTwin could not reach the evaluation service. Your answer was not lost."); }
    finally { setEvaluating(false); }
  }

  return <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
    <section className="rounded-[28px] border border-ink/10 bg-white p-6 md:p-8">
      <div className="grid gap-3 border border-ink/8 bg-cream/45 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-bold">Interview type<select disabled={Boolean(activeSession)} value={type} onChange={(event)=>changeType(event.target.value as InterviewType)} className="mt-2 w-full border border-ink/10 bg-white px-3 py-2.5 text-sm disabled:opacity-60"><option value="behavioral">HR and behavioral</option><option value="technical">Technical</option><option value="communication">Communication</option></select></label>
        <label className="text-xs font-bold">Difficulty<select disabled={Boolean(activeSession)} value={difficulty} onChange={(event)=>setDifficulty(event.target.value as Difficulty)} className="mt-2 w-full border border-ink/10 bg-white px-3 py-2.5 text-sm disabled:opacity-60"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
        <label className="text-xs font-bold">Session length<select disabled={Boolean(activeSession)} value={questionCount} onChange={(event)=>setQuestionCount(Number(event.target.value) as 5|10|15)} className="mt-2 w-full border border-ink/10 bg-white px-3 py-2.5 text-sm disabled:opacity-60"><option value={5}>5 questions</option><option value={10}>10 questions</option><option value={15}>15 questions</option></select></label>
        <div className="space-y-2 pt-1 text-xs font-bold"><label className="flex items-center gap-2"><input type="checkbox" disabled={Boolean(activeSession)} checked={adaptiveDifficulty} onChange={(event)=>setAdaptiveDifficulty(event.target.checked)} />Adaptive difficulty</label><label className="flex items-center gap-2"><input type="checkbox" checked={playbackEnabled} onChange={(event)=>setPlaybackEnabled(event.target.checked)} />Question playback</label></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">{!activeSession?<button type="button" onClick={startSecureSession} disabled={aiAvailability!=="available"||startingSession} className="button-primary disabled:opacity-40">{startingSession?<Loader2 className="animate-spin" size={15}/>:<Bot size={15}/>}Start secure AI session</button>:<span className="inline-flex items-center gap-2 border border-accent/20 bg-mint/20 px-3 py-2 text-xs font-bold text-accent"><CheckCircle2 size={14}/>Session active · answers persist securely</span>}<span className="text-xs text-slate">Local five-question practice remains available without AI.</span></div>
      <div className="mt-6 flex items-start justify-between gap-3"><div><p className="label">{question.category} · Question {questionOrdinal} of {totalQuestions}</p><h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-[-.035em]">{question.prompt}</h2></div><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint/35 text-accent"><ClipboardCheck size={20}/></span></div>
      <div className="mt-5 flex flex-wrap gap-3">{playbackEnabled&&<button type="button" onClick={speakQuestion} className="button-secondary px-4 py-2.5"><Volume2 size={15}/>Play question</button>}<button type="button" onClick={()=>setShowTip(!showTip)} className="button-secondary px-4 py-2.5"><Lightbulb size={15}/>{showTip?"Hide":"Show"} guidance</button></div>
      {showTip&&<p className="mt-3 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm leading-6 text-slate">{question.tip}</p>}
      <VoiceAnswerRecorder sessionId={activeSession?.id} transcript={answerText} onTranscriptChange={(value)=>{setAnswerText(value);setSaved(false);setEvaluation(undefined)}} />
      <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={requestEvaluation} disabled={answerText.trim().length<20||evaluating||aiAvailability!=="available"||Boolean(evaluation)} className="button-primary disabled:cursor-not-allowed disabled:opacity-40">{evaluating?<Loader2 className="animate-spin" size={15}/>:<Bot size={15}/>} {activeSession?"Submit answer":"Request AI feedback"}</button><span className="text-xs text-slate" aria-live="polite">{aiAvailability==="checking"?"Checking secure AI availability…":aiAvailability==="available"?`${aiProvider} feedback is available.`:"AI feedback is unavailable until a server-side provider is configured. You can still practise and save your reflection."}</span></div>
      {evaluationError&&<p role="alert" className="mt-3 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-ink">{evaluationError}</p>}
      {evaluation&&<div className="mt-5 rounded-[22px] border border-accent/20 bg-mint/10 p-5"><div className="flex items-center justify-between"><h3 className="font-bold">Evidence-based feedback</h3><span className="text-xs font-bold text-accent">{Math.round(evaluation.summary.coverage*100)}% rubric assessed</span></div>{evaluation.summary.overallScore!==null?<p className="mt-3 text-sm"><strong>{evaluation.summary.overallScore}/5</strong> overall score</p>:<p className="mt-3 text-sm text-slate">No overall score: less than 75% of rubric weight had sufficient evidence.</p>}<div className="mt-4 grid gap-4 md:grid-cols-2"><div><h4 className="text-xs font-bold">Strengths</h4><ul className="mt-2 space-y-1 text-sm text-slate">{evaluation.evaluation.strengths.map((item)=><li key={item}>• {item}</li>)}</ul></div><div><h4 className="text-xs font-bold">Improve next</h4><ul className="mt-2 space-y-1 text-sm text-slate">{evaluation.evaluation.suggestions.map((item)=><li key={item}>• {item}</li>)}</ul></div></div><details className="mt-4"><summary className="cursor-pointer text-sm font-bold">Review criterion evidence</summary><div className="mt-3 space-y-3">{evaluation.evaluation.criteria.map((item)=><div key={item.criterion} className="rounded-xl bg-white p-3 text-sm"><strong>{item.criterion}: {item.assessed?`${item.rating}/5`:"Not assessed"}</strong><p className="mt-1 text-slate">{item.explanation}</p></div>)}</div></details><details className="mt-3"><summary className="cursor-pointer text-sm font-bold">Suggested improved answer</summary><p className="mt-2 whitespace-pre-wrap rounded-xl bg-white p-3 text-sm leading-6 text-slate">{evaluation.evaluation.improvedAnswer}</p></details>{activeSession&&<div className="mt-4 border-t border-ink/10 pt-4"><label className="text-xs font-bold">Dispute or clarify this assessment<textarea value={clarification} onChange={(event)=>setClarification(event.target.value)} rows={2} maxLength={2000} className="mt-2 w-full border border-ink/10 bg-white p-3 text-sm font-normal" placeholder="Point to evidence the assessment may have missed."/></label><button type="button" onClick={requestReassessment} disabled={clarification.trim().length<10||evaluating} className="button-secondary mt-3 px-4 py-2.5 disabled:opacity-40">Request reassessment</button><p className="mt-2 text-[11px] text-slate">The original assessment remains immutable; a successful reassessment is saved as a new version.</p></div>}{activeSession&&nextSessionQuestion&&<button type="button" onClick={continueSecureSession} className="button-primary mt-5">Continue to question {nextSessionQuestion.ordinal}<ArrowRight size={15}/></button>}{activeSession&&sessionReadyToComplete&&!finalReport&&<button type="button" onClick={completeSecureSession} disabled={evaluating} className="button-primary mt-5">Generate final report<ArrowRight size={15}/></button>}</div>}
      {finalReport&&<section className="mt-5 border border-accent/20 bg-white p-5"><p className="label">Final interview report</p><h3 className="mt-2 text-xl font-bold">{finalReport.overallScore===null?"Score withheld":`${finalReport.overallScore}/5 overall`}</h3><p className="mt-2 text-sm text-slate">{finalReport.scoreExplanation}</p><div className="mt-4 grid gap-4 md:grid-cols-2"><div><h4 className="font-bold">Top strengths</h4><ul className="mt-2 text-sm text-slate">{finalReport.topStrengths.map((item)=><li key={item}>• {item}</li>)}</ul></div><div><h4 className="font-bold">Priority improvements</h4><ul className="mt-2 text-sm text-slate">{finalReport.priorityImprovements.map((item)=><li key={item}>• {item}</li>)}</ul></div></div><details className="mt-4 border-t border-ink/10 pt-4"><summary className="cursor-pointer text-sm font-bold">Preview proposed roadmap changes</summary><div className="mt-3 space-y-2">{finalReport.practicePlan.map((task)=><div key={task.title} className="border border-ink/10 p-3 text-sm"><strong>{task.title} · {task.estimatedMinutes} min</strong><p className="mt-1 text-slate">{task.detail}</p></div>)}</div></details><p className="mt-4 text-xs text-slate">Roadmap tasks are proposals only and are not applied without explicit confirmation.</p><button type="button" onClick={applyRoadmapProposal} disabled={roadmapApplied||evaluating} className="button-primary mt-4 disabled:opacity-40">{roadmapApplied?"Roadmap changes approved":"Previewed — confirm roadmap changes"}</button></section>}
      <fieldset className="mt-7"><legend className="text-xs font-bold">Your own rating</legend><div className="mt-3 grid grid-cols-5 gap-2">{[1,2,3,4,5].map((value)=><button type="button" key={value} aria-pressed={rating===value} onClick={()=>{setRating(value);setSaved(false)}} className={`min-h-11 rounded-xl border text-sm font-bold ${rating===value?"border-accent bg-accent text-white":"border-ink/10"}`}>{value}</button>)}</div></fieldset>
      <label className="mt-6 block text-xs font-bold">Reflection note<textarea value={note} onChange={(event)=>{setNote(event.target.value);setSaved(false)}} maxLength={600} rows={4} className="mt-2 w-full rounded-2xl border border-ink/10 bg-cream/35 px-4 py-3 text-sm font-normal" placeholder="What worked? What would you change?"/></label>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={save} disabled={!rating} className="button-primary disabled:opacity-40"><Save size={15}/>Save practice</button><button type="button" onClick={next} className="button-secondary">Next question<ArrowRight size={15}/></button>{saved&&<span className="inline-flex items-center gap-1 text-xs font-bold text-accent" aria-live="polite"><CheckCircle2 size={14}/>Practice saved as a browser draft; secure sync status appears above.</span>}</div>
    </section>
    <aside className="space-y-4"><div className="rounded-[24px] bg-ink p-6 text-white"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-mint">Practice history</p><strong className="mt-3 block text-4xl">{practiceCount}</strong><p className="mt-1 text-sm text-white/60">answers reflected on</p></div><div className="rounded-[24px] border border-ink/10 bg-white p-5"><h3 className="font-bold">Scoring integrity</h3><p className="mt-3 text-sm leading-6 text-slate">AI feedback is saved only when you choose to preserve it. Scores require sufficient rubric evidence and are not hiring predictions.</p></div></aside>
  </div>;
}
