'use client';

import Link from 'next/link';
import { Target, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Target className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TalentSphere</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600">We&apos;ve sent you a verification link</p>
        </div>

        {/* Verification Notice Card */}
        <Card className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-3">Verification Email Sent</h2>
          <p className="text-gray-600 mb-6">
            Please click the confirmation link in the email we sent you to verify your account and activate your profile.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Once confirmed, you will be able to access your personalized candidate dashboard, assessments, and job applications.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/auth/signin" className="block w-full">
              <Button className="w-full" size="lg">
                Continue to Sign In
              </Button>
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-900 pt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to homepage</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
