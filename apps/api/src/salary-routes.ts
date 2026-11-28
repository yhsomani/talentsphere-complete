/**
 * Salary intelligence and compensation benchmarks (F-86, BR-177..BR-183).
 * Moved out of server.ts with no behaviour change (ADR-022, plan TS-12). The
 * two report Maps stay owned by server.ts (account erasure clears them);
 * these routes update them in place, as before.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  createSalaryReport,
  DomainError,
  queryCompanySalarySummary,
  querySalaryBenchmark,
  withdrawSalaryReport,
  type AuthPayload,
  type SalaryReport,
} from '@talentsphere/domain';
import { SalaryBenchmarkQuerySchema, SubmitSalaryReportInputSchema } from '@talentsphere/contracts';

export interface SalaryRouteDeps {
  extractUser(req: FastifyRequest): AuthPayload;
  auditLogs: { push(entry: unknown): void };
  salaryReportsById: Map<string, SalaryReport>;
  salaryReportsByUserId: Map<string, SalaryReport[]>;
}

export function registerSalaryRoutes(app: FastifyInstance, deps: SalaryRouteDeps): void {
  const { extractUser, auditLogs, salaryReportsById, salaryReportsByUserId } = deps;

  app.post('/api/v1/salaries/reports', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const input = SubmitSalaryReportInputSchema.parse(req.body);

    const userReports = salaryReportsByUserId.get(session.userId) || [];
    const today = new Date().toISOString().slice(0, 10);
    const reportsToday = userReports.filter((r) => r.createdAt.startsWith(today));
    if (reportsToday.length >= 5) {
      throw new DomainError(
        'RATE_LIMIT_EXCEEDED',
        'Daily salary submission limit reached (5 submissions/day).'
      );
    }

    const existingRoleReports = Array.from(salaryReportsById.values()).filter(
      (r) =>
        r.standardizedRole === input.standardizedRole.toLowerCase() &&
        r.seniorityLevel === input.seniorityLevel
    );

    const report = createSalaryReport({
      userId: session.userId,
      jobTitle: input.jobTitle,
      standardizedRole: input.standardizedRole,
      seniorityLevel: input.seniorityLevel,
      location: input.location,
      countryCode: input.countryCode,
      workMode: input.workMode,
      currency: input.currency,
      baseSalaryMinor: input.baseSalaryMinor,
      bonusMinor: input.bonusMinor,
      equityAnnualMinor: input.equityAnnualMinor,
      yearsOfExperience: input.yearsOfExperience,
      companyName: input.companyName,
      companySize: input.companySize,
      industry: input.industry,
      verificationType: input.verificationType,
      existingRoleReports,
    });

    salaryReportsById.set(report.id, report);
    userReports.push(report);
    salaryReportsByUserId.set(session.userId, userReports);

    auditLogs.push({
      event: 'salary_report.submitted',
      actorId: session.userId,
      targetId: report.id,
      metadata: {
        role: report.standardizedRole,
        level: report.seniorityLevel,
        status: report.status,
      },
      timestamp: new Date().toISOString(),
    });

    return reply.status(201).send({
      message: 'Salary report submitted successfully.',
      report,
    });
  });

  app.get('/api/v1/salaries/reports/my', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = extractUser(req);
    const reports = salaryReportsByUserId.get(session.userId) || [];
    return reply.status(200).send({ reports });
  });

  app.delete(
    '/api/v1/salaries/reports/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const session = extractUser(req);
      const { id } = req.params;

      const report = salaryReportsById.get(id);
      if (!report) {
        throw new DomainError('NOT_FOUND', `Salary report with ID ${id} not found.`);
      }

      const withdrawn = withdrawSalaryReport(report, session.userId);
      salaryReportsById.set(withdrawn.id, withdrawn);

      const userReports = salaryReportsByUserId.get(session.userId) || [];
      const idx = userReports.findIndex((r) => r.id === withdrawn.id);
      if (idx >= 0) userReports[idx] = withdrawn;

      auditLogs.push({
        event: 'salary_report.withdrawn',
        actorId: session.userId,
        targetId: withdrawn.id,
        timestamp: new Date().toISOString(),
      });

      return reply.status(200).send({
        message: 'Salary report withdrawn successfully (BR-181).',
        report: withdrawn,
      });
    }
  );

  app.get('/api/v1/salaries/benchmarks', async (req: FastifyRequest, reply: FastifyReply) => {
    const query = SalaryBenchmarkQuerySchema.parse(req.query || {});
    const allReports = Array.from(salaryReportsById.values());

    const result = querySalaryBenchmark(
      allReports,
      {
        role: query.role,
        level: query.level,
        location: query.location,
        currency: query.currency,
      },
      query.minCohortSize
    );

    return reply.status(200).send(result);
  });

  app.get(
    '/api/v1/salaries/company/:companyName',
    async (req: FastifyRequest<{ Params: { companyName: string } }>, reply: FastifyReply) => {
      const { companyName } = req.params;
      const allReports = Array.from(salaryReportsById.values());

      const result = queryCompanySalarySummary(allReports, companyName, 3);
      return reply.status(200).send(result);
    }
  );
}
