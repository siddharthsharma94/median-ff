import { publicProcedure, router } from "@/lib/server/trpc";
import { z } from "zod";

interface User {
  user_id: string;
  settings: null;
  metadata: Record<string, string>;
  league_id: string;
  is_owner: boolean;
  is_bot: boolean;
  display_name: string;
  avatar: string;
  score: number;
}

interface Roster {
  roster_id: string;
  owner_id: string;
}

interface Matchup {
  roster_id: string;
  points: number;
}

const leagueRouterInputSchema = z.object({
  leagueId: z.string(),
});

export const leaguesRouter = router({
  getLeagueData: publicProcedure
    .input(leagueRouterInputSchema)
    .query(async ({ ctx, input }) => {
      const leagueId = input.leagueId;
      const usersResponse = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/users`
      );
      const users: User[] = await usersResponse.json();

      const rostersResponse = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/rosters`
      );
      const rosters: Roster[] = await rostersResponse.json();

      const leagueResponse = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}`
      );
      const league = await leagueResponse.json();
      const currentWeek = league.settings.leg;

      const matchupsResponse = await fetch(
        `https://api.sleeper.app/v1/league/${leagueId}/matchups/${currentWeek}`
      );
      const matchups: Matchup[] = await matchupsResponse.json();

      const userRosterMap = rosters.reduce(
        (map: Record<string, Roster>, roster: Roster) => {
          if (roster.roster_id) {
            return { ...map, [roster.roster_id]: roster };
          } else {
            return map;
          }
        },
        {}
      );

      const userScores = matchups.reduce(
        (scores: Record<string, number>, matchup: Matchup) => {
          if (userRosterMap[matchup.roster_id]) {
            const owner_id = userRosterMap[matchup.roster_id].owner_id;
            return {
              ...scores,
              [owner_id]: (scores[owner_id] || 0) + matchup.points,
            };
          } else {
            return scores;
          }
        },
        {}
      );

      const sortedUsers = users.sort(
        (a: User, b: User) => userScores[b.user_id] - userScores[a.user_id]
      );

      const sortedUsersWithScores = sortedUsers
        .map((user: User) => ({
          ...user,
          score: userScores[user.user_id],
          avatar: `https://sleepercdn.com/avatars/${user.avatar}`,
        }))
        .filter((user: User) => user.score !== undefined);

      return sortedUsersWithScores;
    }),
});
