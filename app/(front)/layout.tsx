import { Header } from "@/components/front-end/header";
import { Footer } from "@/components/front-end/footer";
import { MobileBottomNav } from "@/components/front-end/mobile-bottom-nav";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FrontLayout({ children }: { children: React.ReactNode }) {
   const session = await getSession();
    // if (!session) redirect("/login");

    const user = session?.user;
  return (
    <>
      <Header user={user}/>
      <div className="pb-16 md:pb-0">
        {children}
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
