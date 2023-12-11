import { computersRouter } from "./computers";
import { router } from "@/lib/server/trpc";
import { leaguesRouter } from "./leagues";

export const appRouter = router({
  computers: computersRouter,
  leagues: leaguesRouter,
});

export type AppRouter = typeof appRouter;
