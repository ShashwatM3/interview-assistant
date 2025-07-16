import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { Button } from "@/components/ui/button";
import DashboardPage from "./DashboardPage";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>You are not logged in.</p>;
  }

  return (
    <div>
      <DashboardPage/>
    </div>
  );
}
