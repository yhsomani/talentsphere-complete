'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  challengeService,
  type ChallengeRecord,
  type SubmissionResult,
  type SubmissionHistoryItem,
} from '@/services/challenge.service';
import { createBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Award,
  Code2,
  Terminal,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  Layers,
  History,
  Check,
  Calendar,
} from 'lucide-react';

interface ChallengeSolverPageProps {
  challengeId: string;
}

export default function ChallengeSolverPage({ challengeId }: ChallengeSolverPageProps) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<ChallengeRecord | null>(null);
  const [_userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'problem' | 'hints' | 'submissions'>('problem');
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const fetchSubmissions = useCallback(async (uid: string) => {
    try {
      setIsLoadingSubmissions(true);
      const history = await challengeService.getSubmissions(challengeId, uid);
      setSubmissions(history);
    } catch (err) {
      console.error('Failed to load submissions history:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [challengeId]);

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        setIsLoading(true);
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          fetchSubmissions(user.id);
        }

        const data = await challengeService.getChallengeById(challengeId, user?.id);
        if (data) {
          setChallenge(data);
          setCode(data.starter_code || `function solution(input) {\n  // Write your solution here\n  return input;\n}`);
          setLanguage(data.programming_language || 'javascript');
        }
      } catch (err) {
        console.error('Failed to load challenge:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (challengeId) {
      loadChallenge();
    }
  }, [challengeId, fetchSubmissions]);

  const handleRestoreCode = (submission: SubmissionHistoryItem) => {
    if (code.trim() && code !== submission.code) {
      if (!window.confirm(`Load submission from ${new Date(submission.submitted_at).toLocaleTimeString()} into the code editor? Unsaved edits will be replaced.`)) {
        return;
      }
    }
    setCode(submission.code);
    if (submission.language) setLanguage(submission.language);
    setRestoredId(submission.id);
    setTimeout(() => setRestoredId(null), 3000);
  };

  const handleRunOrSubmit = useCallback(async () => {
    if (!challenge) return;

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/auth/signin?redirect=/challenges/${challengeId}`);
      return;
    }

    try {
      setIsRunning(true);
      const res = await challengeService.submitChallenge(
        challenge.id,
        user.id,
        code,
        language,
        challenge.test_cases || [],
        challenge.xp_reward || 100
      );

      setSubmissionResult(res);

      if (res.status === 'passed') {
        setShowCelebration(true);
      }

      // Re-fetch submissions history so new attempt immediately displays
      await fetchSubmissions(user.id);
    } catch (err) {
      console.error('Error submitting code:', err);
    } finally {
      setIsRunning(false);
    }
  }, [challenge, challengeId, code, fetchSubmissions, language, router]);

  // Keyboard shortcut Ctrl/Cmd + Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunOrSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunOrSubmit]);

  const handleReset = () => {
    if (!challenge) return;
    if (window.confirm('Reset code to initial starter template?')) {
      setCode(challenge.starter_code || `function solution(input) {\n  // Write your solution here\n  return input;\n}`);
      setSubmissionResult(null);
    }
  };

  const lineNumbers = useMemo(() => {
    const count = code.split('\n').length;
    return Array.from({ length: Math.max(count, 18) }, (_, i) => i + 1);
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-400 mt-4 font-mono">Initializing Code Arena...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
          <Code2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Challenge Not Found</h2>
        <p className="text-slate-400 mb-6 max-w-md text-sm">
          The requested engineering challenge does not exist or has been decommissioned.
        </p>
        <Link href="/challenges">
          <Button variant="primary">Return to Arena</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/challenges"
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Exit to Challenges Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {challenge.title}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              challenge.difficulty === 'easy'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : challenge.difficulty === 'medium'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {challenge.difficulty}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
            <Award className="w-3.5 h-3.5" />
            <span>+{challenge.xp_reward || 100} XP</span>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
            title="Reset code template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isRunning}
            onClick={handleRunOrSubmit}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 shadow-lg shadow-indigo-500/25"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run & Submit</span>
            <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-indigo-700/80 rounded border border-indigo-500/40 text-indigo-200 font-mono">
              Ctrl ↵
            </kbd>
          </Button>
        </div>
      </header>

      {/* Main Split Screen Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Problem Description & Tabs */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 overflow-hidden">
          {/* Tabs */}
          <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center gap-4 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('problem')}
              className={`h-full flex items-center gap-1.5 border-b-2 transition-colors px-1 ${
                activeTab === 'problem'
                  ? 'border-indigo-500 text-white font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Problem Description
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`h-full flex items-center gap-1.5 border-b-2 transition-colors px-1 ${
                activeTab === 'hints'
                  ? 'border-indigo-500 text-white font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Algorithm Hints ({challenge.hints?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`h-full flex items-center gap-1.5 border-b-2 transition-colors px-1 ${
                activeTab === 'submissions'
                  ? 'border-indigo-500 text-white font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Submissions ({submissions.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
            {activeTab === 'problem' ? (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{challenge.title}</h2>
                  <div className="leading-relaxed whitespace-pre-line text-slate-300">
                    {challenge.description}
                  </div>
                </div>

                {/* Example Test Cases */}
                {challenge.test_cases && challenge.test_cases.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Sample Test Cases
                    </h3>
                    {challenge.test_cases.slice(0, 3).map((tc, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs font-mono">
                        <p className="font-bold text-slate-400 font-sans">Example {idx + 1}:</p>
                        <div>
                          <span className="text-slate-500 font-sans">Input: </span>
                          <code className="text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/50">
                            {tc.input}
                          </code>
                        </div>
                        <div>
                          <span className="text-slate-500 font-sans">Expected Output: </span>
                          <code className="text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">
                            {tc.expected}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === 'hints' ? (
              <div className="space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Hints & Architectural Approaches
                </h3>
                {challenge.hints && challenge.hints.length > 0 ? (
                  challenge.hints.map((hint, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                      <p className="font-bold text-indigo-400">Hint {idx + 1}</p>
                      <p className="leading-relaxed">{hint}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No hints unlocked for this challenge. Analyze constraints carefully.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    Attempt & Submission History
                  </h3>
                  <span className="text-xs text-slate-400">
                    {submissions.length} {submissions.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                {isLoadingSubmissions ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <LoadingSpinner size="sm" />
                    <p className="text-xs mt-3">Loading past submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <History className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">No Submissions Yet</p>
                    <p className="text-xs max-w-xs mx-auto">
                      Click <span className="text-indigo-400 font-semibold">Run & Submit</span> to test your code against verified test cases and record your snapshot.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub, index) => {
                      const isPassed = sub.status === 'passed';
                      const isRestored = restoredId === sub.id;
                      const dateFormatted = new Date(sub.submitted_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={sub.id || index}
                          className={`p-4 rounded-2xl border transition-all ${
                            isPassed
                              ? 'bg-slate-950/70 border-emerald-900/40 hover:border-emerald-700/60'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {isPassed ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Passed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  <XCircle className="w-3 h-3" />
                                  {sub.status === 'compilation_error' ? 'Syntax Error' : 'Failed'}
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-mono">
                                {sub.passed_tests}/{sub.total_tests} tests
                              </span>
                            </div>

                            <button
                              onClick={() => handleRestoreCode(sub)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                                isRestored
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 hover:text-white'
                              }`}
                              title="Load this code snapshot into your editor"
                            >
                              {isRestored ? (
                                <>
                                  <Check className="w-3 h-3 text-white" />
                                  <span>Restored!</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Load Code</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {dateFormatted}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {sub.execution_time_ms}ms
                              </span>
                            </div>
                            <span className="uppercase text-[10px] font-mono tracking-wider text-slate-500">
                              {sub.language}
                            </span>
                          </div>

                          {/* Code Preview snippet */}
                          <div className="mt-3 bg-slate-900/90 rounded-xl p-2.5 border border-slate-800/80 font-mono text-[11px] text-slate-400 max-h-20 overflow-hidden relative group">
                            <pre className="line-clamp-2">{sub.code.trim()}</pre>
                            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor & Console */}
        <div className="w-full lg:w-1/2 flex flex-col bg-slate-950 overflow-hidden">
          {/* Editor Header */}
          <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs shrink-0">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              Source Solution
            </span>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3</option>
              </select>
            </div>
          </div>

          {/* Textarea Code Editor with Gutter */}
          <div className="flex-1 relative overflow-hidden flex bg-slate-950 font-mono">
            {/* Line Numbers Gutter */}
            <div className="w-10 select-none py-4 text-right pr-3 text-slate-600 bg-slate-950/80 border-r border-slate-900 text-xs font-mono shrink-0">
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>

            {/* Editor Area */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full h-full p-4 font-mono text-xs sm:text-sm bg-transparent text-slate-100 resize-none focus:outline-none leading-6 selection:bg-indigo-900/60"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Bottom Console / Test Results */}
          <div className="h-52 border-t border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
            <div className="h-9 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs shrink-0">
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                Test Output & Runtime Console
              </span>
              {submissionResult && (
                <span className={`text-xs font-bold flex items-center gap-1.5 ${
                  submissionResult.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  <Clock className="w-3 h-3" />
                  {submissionResult.passed_tests} / {submissionResult.total_tests} Passed ({submissionResult.execution_time_ms}ms)
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2">
              {!submissionResult ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic text-xs">
                  Run your code or press Ctrl + Enter to execute against verified test cases.
                </div>
              ) : (
                submissionResult.test_results.map((tr, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-4 transition-colors ${
                      tr.passed
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {tr.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-semibold">{tr.name}</span>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <span>Expected: <span className="text-slate-200">{tr.expected}</span></span>
                      {tr.actual !== undefined && (
                        <span className="ml-2 font-mono">| Output: <span className={tr.passed ? 'text-emerald-300' : 'text-rose-300'}>{tr.actual}</span></span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Challenge Solved!</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Outstanding work! All test cases passed with optimal execution metrics. You earned{' '}
              <span className="font-bold text-amber-400">+{challenge.xp_reward || 100} XP</span> toward your engineering rank.
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <Button variant="primary" onClick={() => setShowCelebration(false)}>
                Continue Coding
              </Button>
              <Link href="/challenges">
                <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                  All Challenges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
