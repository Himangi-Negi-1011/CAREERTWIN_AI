"use client";

import { useState } from "react";
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Star,
  Sparkles,
} from "lucide-react";

interface FeedbackDialogProps {
  currentContext?: {
    page?: string;
    courseSlug?: string;
    lessonId?: string;
  };
  onClose: () => void;
}

export function FeedbackDialog({ currentContext, onClose }: FeedbackDialogProps) {
  const [category, setCategory] = useState<string>("confusing_lesson");
  const [message, setMessage] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setErrorMsg("Please provide at least 5 characters of feedback.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          rating,
          context: {
            page: currentContext?.page || window.location.pathname + window.location.search,
            courseSlug: currentContext?.courseSlug,
            lessonId: currentContext?.lessonId,
          },
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to submit feedback");
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-ink/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest">
                <MessageSquare className="h-4 w-4" />
              </span>
              <h2 id="feedback-title" className="text-lg font-bold text-ink">
                Student Learning Feedback
              </h2>
            </div>
            <p className="text-xs text-ink/60">
              Help us improve lessons, exercises, mock exams, or platform usability.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close feedback dialog"
            className="rounded-full p-1.5 text-ink/40 hover:bg-surface hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h3 className="text-lg font-bold text-ink">Thank You for Your Feedback!</h3>
            <p className="text-xs text-ink/70 max-w-xs mx-auto">
              Your report has been securely saved and will be reviewed by the curriculum engineering team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category Select */}
            <div className="space-y-1.5">
              <label htmlFor="fb-category" className="text-xs font-semibold text-ink">
                What would you like to report?
              </label>
              <select
                id="fb-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink focus:border-brand-forest focus:outline-hidden"
              >
                <option value="confusing_lesson">Confusing Lesson Content / Theory</option>
                <option value="incorrect_explanation">Incorrect Explanation / Answer</option>
                <option value="broken_video">Broken or Irrelevant Video Resource</option>
                <option value="difficult_exercise">Difficult or Ambiguous Code Exercise</option>
                <option value="incorrect_question">Incorrect Mock Exam Question</option>
                <option value="broken_navigation">Broken Navigation or Button</option>
                <option value="ai_tutor">AI Career Tutor Guidance Issue</option>
                <option value="general">General Suggestion or Feedback</option>
              </select>
            </div>

            {/* Experience Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Rating of this module:</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text Area */}
            <div className="space-y-1.5">
              <label htmlFor="fb-message" className="text-xs font-semibold text-ink">
                Your Observation or Suggestion:
              </label>
              <textarea
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Describe what was unclear, broken, or how we could make this lesson better..."
                className="w-full rounded-xl border border-ink/15 bg-white p-3 text-xs text-ink placeholder:text-ink/40 focus:border-brand-forest focus:outline-hidden leading-relaxed"
                required
              />
            </div>

            {/* Context Notice */}
            <div className="rounded-xl bg-surface p-2.5 text-[11px] text-ink/60 flex items-center justify-between">
              <span>Attached Page: {currentContext?.page || "Current Workspace"}</span>
              <span className="text-[10px] uppercase font-semibold text-brand-forest">
                Confidential
              </span>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-ink/70 hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-forest px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-forest/90 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
