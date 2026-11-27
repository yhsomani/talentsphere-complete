import type pg from 'pg';
import type { PortfolioProject } from '@talentsphere/domain';

/**
 * Portfolio projects (F-26, migration 00011; plan TS-03, ADR-026). The API
 * keeps projects in Maps as a read model (search, showcase and moderation
 * read them synchronously); this store is the write-through source of truth
 * the Maps are rebuilt from at boot. Writes go here first, then to the Maps.
 */
export interface PortfolioStore {
  /** Every project with its skills, evidence links and media, oldest first. */
  loadAll(): Promise<PortfolioProject[]>;
  /** Inserts or replaces the project and its skills, evidence links and media. */
  save(project: PortfolioProject): Promise<void>;
  remove(id: string): Promise<void>;
  eraseUser(userId: string): Promise<void>;
}

/** Memory mode keeps nothing across restarts; the Maps in server.ts are the data. */
export class MemoryPortfolioStore implements PortfolioStore {
  async loadAll(): Promise<PortfolioProject[]> {
    return [];
  }
  async save(): Promise<void> {}
  async remove(): Promise<void> {}
  async eraseUser(): Promise<void> {}
}

interface ProjectRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  project_url: string | null;
  repo_url: string | null;
  visibility: PortfolioProject['visibility'];
  featured: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

interface MediaRow {
  id: string;
  project_id: string;
  media_url: string;
  media_type: PortfolioProject['media'][number]['mediaType'];
  caption: string | null;
  order_index: number;
}

const iso = (d: Date) => new Date(d).toISOString();

export class PgPortfolioStore implements PortfolioStore {
  constructor(private readonly pool: pg.Pool) {}

  async loadAll(): Promise<PortfolioProject[]> {
    const [projects, skills, evidence, media] = await Promise.all([
      this.pool.query<ProjectRow>(
        'SELECT * FROM public.portfolio_projects ORDER BY created_at, id'
      ),
      this.pool.query<{ project_id: string; skill_id: string }>(
        'SELECT project_id, skill_id FROM public.portfolio_project_skills ORDER BY created_at, id'
      ),
      this.pool.query<{ project_id: string; evidence_id: string }>(
        'SELECT project_id, evidence_id FROM public.portfolio_project_evidence ORDER BY created_at, id'
      ),
      this.pool.query<MediaRow>(
        'SELECT * FROM public.portfolio_project_media ORDER BY order_index, created_at, id'
      ),
    ]);
    const group = <T>(rows: T[], key: (r: T) => string) => {
      const map = new Map<string, T[]>();
      for (const r of rows) map.set(key(r), [...(map.get(key(r)) ?? []), r]);
      return map;
    };
    const skillsBy = group(skills.rows, (r) => r.project_id);
    const evidenceBy = group(evidence.rows, (r) => r.project_id);
    const mediaBy = group(media.rows, (r) => r.project_id);
    return projects.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description,
      projectUrl: r.project_url ?? undefined,
      repoUrl: r.repo_url ?? undefined,
      visibility: r.visibility,
      featured: r.featured,
      orderIndex: r.order_index,
      skillIds: (skillsBy.get(r.id) ?? []).map((s) => s.skill_id),
      evidenceIds: (evidenceBy.get(r.id) ?? []).map((e) => e.evidence_id),
      media: (mediaBy.get(r.id) ?? []).map((m) => ({
        id: m.id,
        mediaUrl: m.media_url,
        mediaType: m.media_type,
        caption: m.caption ?? undefined,
        orderIndex: m.order_index,
      })),
      createdAt: iso(r.created_at),
      updatedAt: iso(r.updated_at),
    }));
  }

  async save(p: PortfolioProject): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO public.portfolio_projects
           (id, user_id, title, description, project_url, repo_url, visibility, featured,
            order_index, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, description = EXCLUDED.description,
           project_url = EXCLUDED.project_url, repo_url = EXCLUDED.repo_url,
           visibility = EXCLUDED.visibility, featured = EXCLUDED.featured,
           order_index = EXCLUDED.order_index, updated_at = EXCLUDED.updated_at
         WHERE portfolio_projects.user_id = EXCLUDED.user_id`,
        [
          p.id,
          p.userId,
          p.title,
          p.description,
          p.projectUrl ?? null,
          p.repoUrl ?? null,
          p.visibility,
          p.featured,
          p.orderIndex,
          p.createdAt,
          p.updatedAt,
        ]
      );
      // Children are replaced as a set, in the same transaction.
      for (const table of [
        'portfolio_project_skills',
        'portfolio_project_evidence',
        'portfolio_project_media',
      ]) {
        await client.query(`DELETE FROM public.${table} WHERE project_id = $1`, [p.id]);
      }
      for (const skillId of p.skillIds) {
        await client.query(
          'INSERT INTO public.portfolio_project_skills (project_id, skill_id) VALUES ($1, $2)',
          [p.id, skillId]
        );
      }
      for (const evidenceId of p.evidenceIds) {
        await client.query(
          'INSERT INTO public.portfolio_project_evidence (project_id, evidence_id) VALUES ($1, $2)',
          [p.id, evidenceId]
        );
      }
      for (const m of p.media) {
        await client.query(
          `INSERT INTO public.portfolio_project_media
             (id, project_id, media_url, media_type, caption, order_index)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [m.id, p.id, m.mediaUrl, m.mediaType, m.caption ?? null, m.orderIndex]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  async remove(id: string): Promise<void> {
    // Skills, evidence links and media cascade.
    await this.pool.query('DELETE FROM public.portfolio_projects WHERE id = $1', [id]);
  }

  async eraseUser(userId: string): Promise<void> {
    await this.pool.query('DELETE FROM public.portfolio_projects WHERE user_id = $1', [userId]);
  }
}
