'use client';

/**
 * TalentSphere Home & Marketing Landing Page
 * 
 * Premium visual design inspired by Orchid Security, Apple, LinkedIn, and HackerRank.
 * Combines crisp typography, ambient glow, interactive product preview, and verified talent metrics.
 */

import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import { 
  Target, 
  Users, 
  Briefcase, 
  Trophy, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Code2,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">TalentSphere</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Career OS</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
              <Link href="/jobs" className="hover:text-indigo-600 transition-colors">Marketplace</Link>
              <Link href="/challenges" className="hover:text-indigo-600 transition-colors">Code Arena</Link>
              <Link href="/courses" className="hover:text-indigo-600 transition-colors">Courses</Link>
              <Link href="/leaderboard" className="hover:text-indigo-600 transition-colors">Leaderboard</Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm" className="shadow-sm shadow-indigo-500/20">
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700 mb-8 hover:border-slate-300 transition-all">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>TalentSphere 2.0 is Live</span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-600 font-bold flex items-center">
              Explore Verified Signals <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>

          {/* Display Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Where Verified Skills Meet <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 bg-clip-text text-transparent">
              Career Acceleration
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A unified ecosystem replacing resume black holes with provable technical competencies, verified code arena challenges, and direct employer matchmaking.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold shadow-md shadow-indigo-500/25">
                <span>Start as Candidate</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/jobs" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold">
                Explore Jobs
              </Button>
            </Link>
          </div>

          {/* Interactive UI Mock / Hero Spotlight Card */}
          <div className="mt-16 sm:mt-20 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 text-left relative overflow-hidden ring-1 ring-slate-900/[0.04]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100/40 via-purple-50/20 to-transparent rounded-bl-full pointer-events-none" />
              
              {/* Top bar of mock */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    AR
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">Alex Rivera</h3>
                      <Badge variant="success" size="sm" dot>Verified Talent</Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Staff Distributed Systems Engineer • San Francisco, CA</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Level</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">Level 8</span>
                  </div>
                  <div className="bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-center">
                    <span className="text-[10px] text-amber-700 uppercase font-bold block">Arena XP</span>
                    <span className="text-sm font-extrabold text-amber-800 font-mono">3,450 XP</span>
                  </div>
                </div>
              </div>

              {/* Grid content inside mock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      Challenges
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600">14 Solved</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Top 1% execution time in Distributed Consensus & Graph Algorithms.</p>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Skill Verification
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600">99% Match</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Verified competencies in Go, TypeScript, PostgreSQL, & Kubernetes.</p>
                </div>

                <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Interview Request
                    </span>
                    <Badge variant="info" size="sm">Active</Badge>
                  </div>
                  <p className="text-[11px] text-indigo-800">Direct fast-track interview invitation from CloudScale AI.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">10,000+</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Active Candidates</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">500+</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Verified Employers</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">45,000+</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Skills Verified</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">0%</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Resume Black Holes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Comprehensive Platform</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Everything You Need to Excel and Hire</h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              TalentSphere replaces fragmented tools with a single cohesive operating system designed for modern engineering and tech careers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Certified Learning Modules"
              description="Access structured courses with curriculum tracking, interactive video players, and milestone completion certificates."
              tag="LMS Engine"
            />
            <FeatureCard
              icon={Trophy}
              title="Code Arena Challenges"
              description="Solve practical algorithmic problems in a browser-based IDE with real-time test runners and verifiable XP rewards."
              tag="Verification"
            />
            <FeatureCard
              icon={Users}
              title="Verified Career Identity"
              description="Showcase authenticated work experience, verified skill proficiencies, and live portfolio artifacts to top recruiters."
              tag="Profile OS"
            />
            <FeatureCard
              icon={Briefcase}
              title="Smart Job Marketplace"
              description="Discover transparent job requisitions with salary ranges, work mode options, and automatic skill match scores."
              tag="Discovery"
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Transparent Application Tracker"
              description="Never wonder where you stand. Real-time hiring pipeline tracking with stage milestones and direct messaging."
              tag="Pipelines"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Gamified Arena Rankings"
              description="Climb the global and periodic leaderboards, earn achievement badges, and gain prominent visibility with hiring teams."
              tag="Gamification"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Step-by-Step Flow</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How TalentSphere Works</h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600">A clear, objective progression from skill verification to verified employment.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StepCard
              number="01"
              title="Build Identity"
              description="Set up your profile, import GitHub repositories, and link verified education and certifications."
              icon={Layers}
            />
            <StepCard
              number="02"
              title="Prove Skills"
              description="Take test-driven code challenges in the Arena and complete certified courses to earn XP."
              icon={Cpu}
            />
            <StepCard
              number="03"
              title="Match & Apply"
              description="Browse jobs with transparent salary ranges and apply with your verified skills snapshot."
              icon={Target}
            />
            <StepCard
              number="04"
              title="Get Hired"
              description="Track stage progression in real-time, complete interviews, and receive competitive offers."
              icon={ShieldCheck}
            />
          </div>
        </div>
      </section>

      {/* High Impact CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Build Your Verified Career?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers and top hiring companies on the unified talent platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 shadow-lg shadow-indigo-600/30">
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/60 text-white hover:bg-slate-800 px-8">
                Sign In to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">TalentSphere</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed mb-4">
                The Unified Career Acceleration and Talent Acquisition Ecosystem. Connecting verified candidates with world-class employers.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-300 font-medium">All systems operational</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3.5">Platform</h4>
              <ul className="space-y-2.5">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Jobs Marketplace</Link></li>
                <li><Link href="/challenges" className="hover:text-white transition-colors">Code Arena</Link></li>
                <li><Link href="/courses" className="hover:text-white transition-colors">Certified Courses</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3.5">Candidates</h4>
              <ul className="space-y-2.5">
                <li><Link href="/candidates/profile" className="hover:text-white transition-colors">Career Profile</Link></li>
                <li><Link href="/applications" className="hover:text-white transition-colors">Applications Tracker</Link></li>
                <li><Link href="/messages" className="hover:text-white transition-colors">Direct Messaging</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Account Settings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3.5">Employers</h4>
              <ul className="space-y-2.5">
                <li><Link href="/jobs/post" className="hover:text-white transition-colors">Post a Requisition</Link></li>
                <li><Link href="/settings/billing" className="hover:text-white transition-colors">Enterprise Pricing</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Recruiter Sign Up</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} TalentSphere OS. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
              <Link href="#" className="hover:text-slate-300">Security Standards</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  tag
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  tag?: string;
}) {
  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Icon className="h-5 w-5" />
          </div>
          {tag && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {tag}
            </span>
          )}
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description,
  icon: Icon
}: { 
  number: string; 
  title: string; 
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-black font-mono text-indigo-600/30">
            {number}
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
        </div>
        <h4 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
