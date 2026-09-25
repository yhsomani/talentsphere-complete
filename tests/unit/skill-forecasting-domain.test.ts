import { describe, it, expect } from 'vitest';
import {
  recordSkillMarketSignal,
  computeSkillForecast,
  rankTopEmergingSkills,
  SkillMarketSignal,
} from '../../packages/domain/src/skill-forecasting.js';
import { DomainError } from '../../packages/domain/src/index.js';

describe('Skill Supply/Demand Forecasting Domain (F-151, F-84, F-86, F-97)', () => {
  const skillId = '10000000-0000-4000-a000-000000000001';

  describe('Signal Recording & Invariants', () => {
    it('records a valid skill market signal with standard parameters', () => {
      const signal = recordSkillMarketSignal({
        skillId,
        demandPostingsCount: 1500,
        activeCandidatesCount: 900,
        avgSalaryOffered: 145000.5,
        geographicRegion: 'North America',
        industry: 'Technology',
      });

      expect(signal.id).toBeDefined();
      expect(signal.skillId).toBe(skillId);
      expect(signal.demandPostingsCount).toBe(1500);
      expect(signal.activeCandidatesCount).toBe(900);
      expect(signal.avgSalaryOffered).toBe(145000.5);
      expect(signal.geographicRegion).toBe('North America');
      expect(signal.industry).toBe('Technology');
      expect(signal.recordedAt).toBeDefined();
    });

    it('applies standard defaults when optional fields are omitted', () => {
      const signal = recordSkillMarketSignal({
        skillId,
        demandPostingsCount: 500,
        activeCandidatesCount: 400,
      });

      expect(signal.geographicRegion).toBe('Global');
      expect(signal.industry).toBe('Technology');
      expect(signal.avgSalaryOffered).toBeUndefined();
    });

    it('rejects signals with invalid or missing skillId', () => {
      expect(() =>
        recordSkillMarketSignal({
          skillId: '',
          demandPostingsCount: 100,
          activeCandidatesCount: 50,
        })
      ).toThrow(DomainError);

      expect(() =>
        recordSkillMarketSignal({
          skillId: '   ',
          demandPostingsCount: 100,
          activeCandidatesCount: 50,
        })
      ).toThrow(DomainError);
    });

    it('rejects negative or non-integer postings and candidate counts', () => {
      expect(() =>
        recordSkillMarketSignal({
          skillId,
          demandPostingsCount: -5,
          activeCandidatesCount: 50,
        })
      ).toThrow(DomainError);

      expect(() =>
        recordSkillMarketSignal({
          skillId,
          demandPostingsCount: 12.5,
          activeCandidatesCount: 50,
        })
      ).toThrow(DomainError);

      expect(() =>
        recordSkillMarketSignal({
          skillId,
          demandPostingsCount: 100,
          activeCandidatesCount: -1,
        })
      ).toThrow(DomainError);
    });

    it('rejects non-positive salary values', () => {
      expect(() =>
        recordSkillMarketSignal({
          skillId,
          demandPostingsCount: 100,
          activeCandidatesCount: 50,
          avgSalaryOffered: 0,
        })
      ).toThrow(DomainError);

      expect(() =>
        recordSkillMarketSignal({
          skillId,
          demandPostingsCount: 100,
          activeCandidatesCount: 50,
          avgSalaryOffered: -1000,
        })
      ).toThrow(DomainError);
    });
  });

  describe('Forecast Computation Engine (12-Month Horizon & Scarcity)', () => {
    const baseSignals: SkillMarketSignal[] = [
      {
        id: 's1',
        skillId,
        demandPostingsCount: 1000,
        activeCandidatesCount: 1000,
        avgSalaryOffered: 120000,
        geographicRegion: 'North America',
        industry: 'Technology',
        recordedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 's2',
        skillId,
        demandPostingsCount: 1500,
        activeCandidatesCount: 1100,
        avgSalaryOffered: 135000,
        geographicRegion: 'Europe',
        industry: 'Finance',
        recordedAt: '2025-07-01T00:00:00.000Z',
      },
    ];

    it('computes 12-month forward forecast with realistic growth and scarcity metrics', () => {
      const forecast = computeSkillForecast({
        skillId,
        signals: baseSignals,
        forecastHorizonMonths: 12,
        skillCategory: 'Programming Languages',
      });

      expect(forecast.skillId).toBe(skillId);
      expect(forecast.forecastHorizonMonths).toBe(12);
      expect(forecast.confidenceLevel).toBe(0.95);
      expect(forecast.demandGrowthPct).toBeGreaterThan(0);
      expect(forecast.supplyGrowthPct).toBeGreaterThan(0);
      expect(forecast.scarcityIndex).toBeGreaterThanOrEqual(0.001);
      expect(forecast.scarcityIndex).toBeLessThanOrEqual(0.999);
      expect(forecast.projectedMedianSalary).toBeGreaterThan(100000);
      expect(forecast.salaryLowerBound).toBeLessThanOrEqual(forecast.projectedMedianSalary);
      expect(forecast.salaryUpperBound).toBeGreaterThanOrEqual(forecast.projectedMedianSalary);
      expect(forecast.estimatedWeeksToMarketability).toBeGreaterThan(0);
      expect(forecast.regionalDistribution).toHaveProperty('North America');
      expect(forecast.regionalDistribution).toHaveProperty('Europe');
      expect(forecast.industryDistribution).toHaveProperty('Technology');
      expect(forecast.industryDistribution).toHaveProperty('Finance');
    });

    it('adapts learning velocity based on skill category and prerequisite depth', () => {
      const aiForecast = computeSkillForecast({
        skillId,
        signals: baseSignals,
        skillCategory: 'AI / Machine Learning',
        prerequisiteDepth: 2,
      });

      const frontendForecast = computeSkillForecast({
        skillId,
        signals: baseSignals,
        skillCategory: 'Frontend Development',
        prerequisiteDepth: 0,
      });

      expect(aiForecast.estimatedWeeksToMarketability).toBeGreaterThan(
        frontendForecast.estimatedWeeksToMarketability
      );
      // AI base (16) + 2*4 = 24 weeks
      expect(aiForecast.estimatedWeeksToMarketability).toBe(24);
      // Frontend base (6) + 0 = 6 weeks
      expect(frontendForecast.estimatedWeeksToMarketability).toBe(6);
    });

    it('computes historical accuracy MAPE when previous forecast is supplied', () => {
      const prevForecast = computeSkillForecast({
        skillId,
        signals: [baseSignals[0]],
        forecastHorizonMonths: 12,
      });

      const updatedForecast = computeSkillForecast({
        skillId,
        signals: baseSignals,
        previousForecast: prevForecast,
      });

      expect(updatedForecast.historicalAccuracyMape).toBeDefined();
      expect(typeof updatedForecast.historicalAccuracyMape).toBe('number');
      expect(updatedForecast.historicalAccuracyMape!).toBeGreaterThanOrEqual(0);
    });

    it('rejects invalid horizon months (<1 or >36)', () => {
      expect(() =>
        computeSkillForecast({
          skillId,
          signals: baseSignals,
          forecastHorizonMonths: 0,
        })
      ).toThrow(DomainError);

      expect(() =>
        computeSkillForecast({
          skillId,
          signals: baseSignals,
          forecastHorizonMonths: 48,
        })
      ).toThrow(DomainError);
    });

    it('rejects forecasting when no signals are provided', () => {
      expect(() =>
        computeSkillForecast({
          skillId,
          signals: [],
        })
      ).toThrow(DomainError);
    });
  });

  describe('Top Emerging Skills Ranking Engine', () => {
    it('ranks skills in descending order of composite emerging score', () => {
      const forecastHigh = computeSkillForecast({
        skillId: 'high-growth-skill',
        signals: [
          {
            id: 'h1',
            skillId: 'high-growth-skill',
            demandPostingsCount: 100,
            activeCandidatesCount: 100,
            recordedAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: 'h2',
            skillId: 'high-growth-skill',
            demandPostingsCount: 400,
            activeCandidatesCount: 120,
            recordedAt: '2025-07-01T00:00:00.000Z',
          },
        ],
      });

      const forecastLow = computeSkillForecast({
        skillId: 'slow-growth-skill',
        signals: [
          {
            id: 'l1',
            skillId: 'slow-growth-skill',
            demandPostingsCount: 500,
            activeCandidatesCount: 500,
            recordedAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: 'l2',
            skillId: 'slow-growth-skill',
            demandPostingsCount: 510,
            activeCandidatesCount: 530,
            recordedAt: '2025-07-01T00:00:00.000Z',
          },
        ],
      });

      const ranked = rankTopEmergingSkills(
        [
          { skillId: 'slow-growth-skill', skillName: 'Legacy Tech', forecast: forecastLow },
          { skillId: 'high-growth-skill', skillName: 'GenAI Engineering', forecast: forecastHigh },
        ],
        10
      );

      expect(ranked).toHaveLength(2);
      expect(ranked[0].skillId).toBe('high-growth-skill');
      expect(ranked[0].emergingScore).toBeGreaterThan(ranked[1].emergingScore);
      expect(ranked[1].skillId).toBe('slow-growth-skill');
    });

    it('respects limit parameter', () => {
      const dummyForecast = computeSkillForecast({
        skillId: 'dummy',
        signals: [
          {
            id: 'd1',
            skillId: 'dummy',
            demandPostingsCount: 100,
            activeCandidatesCount: 100,
            recordedAt: '2025-01-01T00:00:00.000Z',
          },
        ],
      });

      const skills = [
        { skillId: 's1', skillName: 'Skill 1', forecast: dummyForecast },
        { skillId: 's2', skillName: 'Skill 2', forecast: dummyForecast },
        { skillId: 's3', skillName: 'Skill 3', forecast: dummyForecast },
      ];

      const top2 = rankTopEmergingSkills(skills, 2);
      expect(top2).toHaveLength(2);
    });
  });
});
