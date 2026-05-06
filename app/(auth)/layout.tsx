import { getSession } from '@/actions/auth';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'

export const dynamic = "force-dynamic";

export default async function DashboardLayout({children}:{children:ReactNode}) {


  const session = await getSession();
    if (session && session.user.role=="ADMIN"){
      redirect("/dashboard")
    }  else if (session && session.user.role=="USER") redirect("/");

  return (
    <div>
        {children}
    </div>
  )
}
