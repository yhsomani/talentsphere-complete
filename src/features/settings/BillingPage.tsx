'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, Card, Badge } from '@/components/ui';
import {
  Check,
  Zap,
  ArrowLeft,
  FileText,
  Download,
  Plus,
} from 'lucide-react';

export function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Candidate Basic',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Essential career identity and job discovery tools.',
      features: [
        'Browse and apply to unlimited jobs',
        'Standard candidate career profile',
        'Up to 3 verified skill assessments',
        'Direct messaging with hiring managers',
        'Standard application status tracking',
      ],
      current: true,
    },
    {
      id: 'pro',
      name: 'TalentSphere Pro',
      priceMonthly: 19,
      priceYearly: 190,
      description: 'Accelerate your career with AI reviews and unlimited arena access.',
      popular: true,
      features: [
        'All Basic features included',
        'Unlimited code arena assessments & XP',
        'AI resume score and ATS optimization',
        'Verified Talent Gold badge on search results',
        'Priority applicant review for partner companies',
        'Early access to new tech job listings',
      ],
      current: false,
    },
    {
      id: 'recruiter',
      name: 'Recruiter Growth',
      priceMonthly: 149,
      priceYearly: 1490,
      description: 'Hire verified talent with automated pipeline management.',
      features: [
        '5 active job requisitions',
        'Direct access to verified candidate database',
        'Automated skill assessment scoring',
        'Hiring pipeline Kanban board',
        'Team collaboration and interview scorecards',
      ],
      current: false,
    },
  ];

  const invoices = [
    { id: 'INV-2026-001', date: 'Jan 15, 2026', description: 'TalentSphere Candidate Basic', amount: '$0.00', status: 'Paid' },
  ];

  return (
    <DashboardLayout userRole="candidate">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your plan, payment methods, and invoice receipts.
              </p>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Yearly (Save 15%)
            </button>
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            const period = billingCycle === 'monthly' ? '/mo' : '/yr';

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-50/70 to-white border-2 border-blue-600 shadow-md relative'
                    : 'bg-white border border-gray-200 shadow-xs'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                    {plan.current && (
                      <Badge variant="success" size="sm">Current Plan</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-extrabold text-gray-900">${price}</span>
                    <span className="text-xs text-gray-500 font-medium ml-1">{period}</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-gray-100">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  {plan.current ? (
                    <Button variant="outline" className="w-full" disabled>
                      Active Plan
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? 'primary' : 'secondary'}
                      className="w-full gap-2"
                      onClick={() => alert(`Upgrading to ${plan.name} will redirect to Stripe checkout.`)}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Upgrade to {plan.name}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Methods */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Cards and bank accounts used for subscription renewals.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => alert('Secure payment method form')}
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-8 bg-blue-600 text-white font-bold rounded flex items-center justify-center text-xs tracking-wider">
                VISA
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Visa ending in 4242</p>
                <p className="text-xs text-gray-500">Expires 12/28 • Default payment method</p>
              </div>
            </div>
            <Badge variant="info" size="sm">Default</Badge>
          </div>
        </Card>

        {/* Invoices History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Invoice History</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Download past invoices and tax receipts.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{inv.id}</p>
                    <p className="text-xs text-gray-500">{inv.date} • {inv.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">{inv.amount}</span>
                  <Badge variant="success" size="sm">{inv.status}</Badge>
                  <button
                    onClick={() => alert(`Downloading ${inv.id}`)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    title="Download invoice"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
