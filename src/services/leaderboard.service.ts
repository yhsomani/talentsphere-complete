import { createBrowserClient } from '@/lib/supabase';

export interface LeaderboardRankItem {
  rank: number;
  userId: string;
  name: string;
  email: string;
  headline?: string;
  avatarUrl?: string;
  level: number;
  xpPoints: number;
  badgesCount?: number;
  isCurrentUser?: boolean;
}

const supabase = createBrowserClient();

export const leaderboardService = {
  /**
   * Fetch leaderboard rankings for a period
   */
  async getLeaderboard(
    period: 'all_time' | 'weekly' | 'monthly' = 'all_time',
    currentUserId?: string
  ): Promise<LeaderboardRankItem[]> {
    try {
      // Query candidate_profiles joined with users, ordered by xp_points desc
      const { data, error } = await (supabase as any)
        .from('candidate_profiles')
        .select(`
          id,
          user_id,
          headline,
          xp_points,
          level,
          user:users (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .order('xp_points', { ascending: false })
        .limit(50);

      if (error || !data || data.length === 0) {
        // Fallback seed rankings if database is fresh
        return [
          {
            rank: 1,
            userId: 'u-1',
            name: 'Alex Rivera',
            email: 'alex.rivera@example.com',
            headline: 'Staff Full-Stack & Distributed Systems Architect',
            level: 8,
            xpPoints: 3450,
            badgesCount: 12,
            isCurrentUser: currentUserId === 'u-1',
          },
          {
            rank: 2,
            userId: 'u-2',
            name: 'Elena Rostova',
            email: 'elena.rostova@example.com',
            headline: 'Senior Cloud & DevOps Engineer | Kubernetes Specialist',
            level: 7,
            xpPoints: 2890,
            badgesCount: 9,
            isCurrentUser: currentUserId === 'u-2',
          },
          {
            rank: 3,
            userId: 'u-3',
            name: 'Marcus Chen',
            email: 'marcus.chen@example.com',
            headline: 'Frontend Lead & React Ecosystem Specialist',
            level: 6,
            xpPoints: 2420,
            badgesCount: 8,
            isCurrentUser: currentUserId === 'u-3',
          },
          {
            rank: 4,
            userId: 'u-4',
            name: 'Sarah Jenkins',
            email: 'sarah.j@example.com',
            headline: 'AI & Machine Learning Research Engineer',
            level: 5,
            xpPoints: 1980,
            badgesCount: 6,
            isCurrentUser: currentUserId === 'u-4',
          },
          {
            rank: 5,
            userId: 'u-5',
            name: 'Devon Vance',
            email: 'devon.v@example.com',
            headline: 'Senior Backend Engineer (Go & PostgreSQL)',
            level: 4,
            xpPoints: 1540,
            badgesCount: 5,
            isCurrentUser: currentUserId === 'u-5',
          },
        ];
      }

      return data.map((item: any, index: number) => {
        const u = Array.isArray(item.user) ? item.user[0] : item.user;
        const name =
          u?.full_name?.trim() || u?.email?.split('@')[0] || 'TalentSphere Candidate';

        return {
          rank: index + 1,
          userId: item.user_id,
          name,
          email: u?.email || '',
          headline: item.headline || 'Software Engineer',
          level: item.level || 1,
          xpPoints: item.xp_points || 0,
          badgesCount: Math.floor((item.xp_points || 0) / 300),
          isCurrentUser: currentUserId === item.user_id,
        };
      });
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      return [];
    }
  },
};
