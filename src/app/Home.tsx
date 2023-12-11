import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { api } from "@/lib/trpc/api";
import { trpc } from "@/lib/trpc/client";
import { cx } from "class-variance-authority";
import { useSearchParams } from "next/navigation";
import { NextRequest } from "next/server";

export const Home = async ({ req }: { req: NextRequest }) => {
  // const searchParams = useSearchParams();

  const leagueId = "974399495632891904";
  const users = await api.leagues.getLeagueData.query({ leagueId });
  const medianIndex = Math.floor((users.length - 1) / 2);
  const medianUser = users[medianIndex];
  const medianUserNext = users[medianIndex + 1];

  let medianValue;
  if (users.length % 2 === 0) {
    medianValue = (medianUser.score + medianUserNext.score) / 2;
  } else {
    medianValue = medianUser.score;
  }

  return (
    <main className="flex min-h-screen mx-auto max-w-2xl flex-col items-center justify-between space-y-2 p-4 sm:p-24">
      <Card
        className="mb-8 min-w-full sm:min-w-lg p-4"
        style={{ minWidth: "100%" }}
      >
        <CardContent>
          <CardTitle className="mb-4">League Median: {medianValue}</CardTitle>
          <CardDescription>
            {`The median is between ${medianUser?.display_name} and ${medianUserNext?.display_name}`}
            {medianUser &&
              `, with ${medianUser.display_name} having a score of ${
                Math.round(medianUser.score * 100) / 100
              }`}
            {medianUserNext &&
              `, and ${medianUserNext.display_name} having a score of ${
                Math.round(medianUserNext.score * 100) / 100
              }`}
          </CardDescription>
        </CardContent>
      </Card>
      {users?.map((user) => (
        <Card
          key={user.user_id}
          style={{ minWidth: "100%", maxWidth: "500px" }}
          className={cx(
            user === medianUser || user === medianUserNext
              ? "bg-yellow-200 border-yellow-400 border-2 border-dotted"
              : ""
          )}
        >
          <CardHeader>
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.display_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{user.display_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Score: {user.score}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </main>
  );
};
