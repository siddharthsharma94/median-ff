import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = req.nextUrl.searchParams;
  const leagueId = searchParams.get("leagueId");

  // Get all users in a league
  const usersResponse = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/users`
  );
  const users: User[] = await usersResponse.json();

  // Get all rosters in a league
  const rostersResponse = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/rosters`
  );
  const rosters: Roster[] = await rostersResponse.json();

  // Get all matchups in a league for a given week
  // Get current week from the league API
  const leagueResponse = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}`
  );
  const league = await leagueResponse.json();
  const currentWeek = league.settings.leg;

  // Get all matchups in a league for the current week
  const matchupsResponse = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${currentWeek}`
  );
  const matchups: Matchup[] = await matchupsResponse.json();

  // Map users to their rosters
  // Ignore null owners
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

  // Calculate total scores for each user
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

  // Sort users based on their total scores from top to bottom
  const sortedUsers = users.sort(
    (a: User, b: User) => userScores[b.user_id] - userScores[a.user_id]
  );

  const sortedUsersWithScores = sortedUsers.map((user: User) => ({
    ...user,
    score: userScores[user.user_id],
  }));

  return Response.json(sortedUsersWithScores);
}
