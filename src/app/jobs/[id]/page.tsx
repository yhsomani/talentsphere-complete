import { Suspense } from 'react';
import type { Metadata } from 'next';
import JobDetailPage from '@/features/jobs/JobDetailPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { jobsService } from '@/services/jobs.service';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await jobsService.getJobById(id);
    if (job) {
      const company = job.organization?.name || job.posted_by?.full_name || 'TalentSphere';
      return {
        title: `${job.title} at ${company} | TalentSphere`,
        description: job.description
          ? job.description.slice(0, 160)
          : 'View job details, requirements, and apply directly on TalentSphere.',
        alternates: {
          canonical: `/jobs/${id}`,
        },
        openGraph: {
          title: `${job.title} | ${company}`,
          description: job.description ? job.description.slice(0, 160) : undefined,
          type: 'article',
        },
      };
    }
  } catch {
    // Fallback if job not found or during build
  }

  return {
    title: 'Job Opportunity | TalentSphere',
    description: 'View role details, responsibilities, required skills, and apply directly on TalentSphere.',
    alternates: {
      canonical: `/jobs/${id}`,
    },
  };
}

export default async function JobPage({ params }: PageProps) {
  const { id } = await params;
  let jsonLd: Record<string, unknown> | null = null;

  try {
    const job = await jobsService.getJobById(id);
    if (job) {
      const companyName = job.organization?.name || job.posted_by?.full_name || 'TalentSphere Partner';
      const employmentTypeMap: Record<string, string> = {
        full_time: 'FULL_TIME',
        part_time: 'PART_TIME',
        contract: 'CONTRACTOR',
        internship: 'INTERN',
        temporary: 'TEMPORARY',
      };

      jsonLd = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.created_at,
        validThrough: job.application_deadline || undefined,
        employmentType: employmentTypeMap[job.job_type] || 'FULL_TIME',
        hiringOrganization: {
          '@type': 'Organization',
          name: companyName,
          sameAs: job.organization?.website || undefined,
          logo: job.organization?.logo_url || undefined,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.location_city || undefined,
            addressCountry: job.location_country || 'US',
          },
        },
        ...(job.work_mode === 'remote'
          ? {
              jobLocationType: 'TELECOMMUTE',
              applicantLocationRequirements: {
                '@type': 'Country',
                name: 'Worldwide',
              },
            }
          : {}),
        ...((job.salary_min || job.salary_max)
          ? {
              baseSalary: {
                '@type': 'MonetaryAmount',
                currency: job.currency || 'USD',
                value: {
                  '@type': 'QuantitativeValue',
                  minValue: job.salary_min || undefined,
                  maxValue: job.salary_max || undefined,
                  unitText:
                    job.salary_period === 'yearly'
                      ? 'YEAR'
                      : job.salary_period === 'monthly'
                        ? 'MONTH'
                        : 'HOUR',
                },
              },
            }
          : {}),
      };
    }
  } catch {
    // Gracefully continue without JSON-LD if fetching fails
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <JobDetailPage jobId={id} />
      </Suspense>
    </>
  );
}
