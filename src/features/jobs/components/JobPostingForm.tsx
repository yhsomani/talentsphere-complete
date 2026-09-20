'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jobService } from '@/services/jobs.service';
import { createBrowserClient } from '@/lib/supabase';
import { slugify } from '@/utils';
import { Button } from '@/components/ui';
import type { Database } from '@/types/database.types';
import {
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function JobPostingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Array<{ id: string; name: string; category: string }>>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [jobType, setJobType] = useState<'full_time' | 'part_time' | 'contract' | 'internship' | 'apprenticeship'>('full_time');
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive'>('mid');
  const [locationCity, setLocationCity] = useState('');
  const [locationCountry, setLocationCountry] = useState('United States');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [salaryPeriod, setSalaryPeriod] = useState<'yearly' | 'monthly' | 'hourly'>('yearly');
  const [description, setDescription] = useState('');
  
  // List fields
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skills = await jobService.getUniqueSkills();
        setAvailableSkills(skills);
      } catch (err) {
        console.error('Failed to load skills for posting:', err);
      }
    };
    loadSkills();
  }, []);

  const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleRemoveField = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateField = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Job title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Job description is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/signin?redirect=/jobs/post');
        return;
      }

      // Check if user has an organization
      let organizationId: string | null = null;
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle();
      if (orgData) {
        organizationId = orgData.id;
      }

      const generatedSlug = `${slugify(title)}-${Date.now().toString(36)}`;
      const cleanResponsibilities = responsibilities.map(r => r.trim()).filter(Boolean);
      const cleanRequirements = requirements.map(r => r.trim()).filter(Boolean);
      const cleanBenefits = benefits.map(b => b.trim()).filter(Boolean);

      const newJob = await jobService.createJob({
        employer_id: user.id,
        organization_id: organizationId,
        title: title.trim(),
        slug: generatedSlug,
        description: description.trim(),
        department: department.trim() || null,
        job_type: jobType,
        work_mode: workMode,
        experience_level: experienceLevel,
        location_city: locationCity.trim() || null,
        location_country: locationCountry.trim() || null,
        location_remote: workMode === 'remote',
        salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
        salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
        salary_period: salaryPeriod,
        salary_currency: 'USD',
        status: 'active',
        responsibilities: cleanResponsibilities,
        requirements: cleanRequirements,
        benefits: cleanBenefits,
        required_skills: selectedSkills,
      } as Database['public']['Tables']['jobs']['Insert']);

      router.push(`/jobs/${newJob.id}`);
    } catch (err: unknown) {
      console.error('Error posting job:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish job. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>{error}</div>
        </div>
      )}

      {/* Basic Role Information */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">1. Basic Information</h2>
          <p className="text-sm text-gray-500">Provide the title, department, and employment terms for this opportunity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Full-Stack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              placeholder="e.g. Product Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Employment Type
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as typeof jobType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="full_time">Full-Time</option>
              <option value="part_time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="apprenticeship">Apprenticeship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as typeof workMode)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-Site</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as typeof experienceLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="entry">Entry Level (0-2 yrs)</option>
              <option value="mid">Mid Level (3-5 yrs)</option>
              <option value="senior">Senior Level (5-8 yrs)</option>
              <option value="lead">Lead / Staff (8+ yrs)</option>
              <option value="principal">Principal</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              City / Location
            </label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              placeholder="e.g. United States"
              value={locationCountry}
              onChange={(e) => setLocationCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">2. Compensation</h2>
          <p className="text-sm text-gray-500">Provide transparent salary ranges to attract higher quality applicants.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Minimum Salary (USD)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="e.g. 120000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Maximum Salary (USD)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="e.g. 160000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Pay Period
            </label>
            <select
              value={salaryPeriod}
              onChange={(e) => setSalaryPeriod(e.target.value as typeof salaryPeriod)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Description & Details */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">3. Role Description & Details</h2>
          <p className="text-sm text-gray-500">Detail the mission, day-to-day responsibilities, and qualifications.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Job Overview / Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            placeholder="Introduce the role, team goals, and why an engineer should be thrilled to join..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          />
        </div>

        {/* Responsibilities */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">Key Responsibilities</label>
            <button
              type="button"
              onClick={() => handleAddField(setResponsibilities)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          <div className="space-y-2.5">
            {responsibilities.map((resp, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`e.g. Design and implement microservices in TypeScript`}
                  value={resp}
                  onChange={(e) => handleUpdateField(i, e.target.value, setResponsibilities)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(i, setResponsibilities)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">Qualifications & Requirements</label>
            <button
              type="button"
              onClick={() => handleAddField(setRequirements)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          <div className="space-y-2.5">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`e.g. 4+ years of professional React and Next.js development`}
                  value={req}
                  onChange={(e) => handleUpdateField(i, e.target.value, setRequirements)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(i, setRequirements)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">Benefits & Perks</label>
            <button
              type="button"
              onClick={() => handleAddField(setBenefits)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          <div className="space-y-2.5">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`e.g. 100% company-paid healthcare and dental`}
                  value={b}
                  onChange={(e) => handleUpdateField(i, e.target.value, setBenefits)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveField(i, setBenefits)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Selection */}
      {availableSkills.length > 0 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">4. Tag Key Skills</h2>
            <p className="text-sm text-gray-500">Select skills required for automated matching and candidate filtering.</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {availableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.id);
              return (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="px-8"
        >
          Publish Job Posting
        </Button>
      </div>
    </form>
  );
}
