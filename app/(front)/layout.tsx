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
      {/*
        pt-32 on mobile  = ~128px  — covers the 2-row mobile header (main row + search bar)
        pt-20 on desktop = ~80px   — covers the single desktop header row
        pb-20 on mobile  = 80px    — space for the bottom nav
      */}
      <div className="pt-32 md:pt-20 pb-20 md:pb-0">
        {children}
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
