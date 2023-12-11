import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import { useSearchParams } from "next/navigation";
import { Home } from "./Home";

export default async function HomePage() {
  return <Home />;
}
