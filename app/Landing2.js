import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/Dashboard");
  }

  return (
    <div className=''>
    </div>
  );
}