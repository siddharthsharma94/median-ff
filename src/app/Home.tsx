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
import { useSearchParams } from "next/navigation";

export const Home = async () => {
  // const searchParams = useSearchParams();

  const leagueId = "974399495632891904";
  const users = await api.leagues.getLeagueData.query({ leagueId });
  const medianIndex = Math.floor((users.length - 1) / 2);
  const medianUser = users[medianIndex];
  const medianUserNext = users[medianIndex + 1];

  return (
    <main className="flex min-h-screen max-w-lg mx-auto flex-col items-center justify-between space-y-2 p-24">
      <Card className="mb-8 min-w-lg p-4" style={{ minWidth: "500px" }}>
        <CardContent>
          <CardTitle className="mb-4">League Median</CardTitle>
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
          style={{ minWidth: "500px" }}
          className={
            user === medianUser || user === medianUserNext
              ? "bg-yellow-200"
              : ""
          }
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
