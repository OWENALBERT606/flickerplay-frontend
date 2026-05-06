// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Card } from "@/components/ui/card";
// import { 
//   User, 
//   CreditCard, 
//   Settings, 
//   History, 
//   Heart,
//   LogOut,
//   Crown,
//   Home
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import Image from "next/image";

// interface DashboardSidebarProps {
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     imageUrl?: string;
//     currentPlan?: string;
//   };
// }

// export function DashboardSidebar({ user }: DashboardSidebarProps) {
//   const pathname = usePathname();

//   const menuItems = [
//     {
//       title: "Profile",
//       href: "/account",
//       icon: User,
//     },
//     {
//       title: "Subscriptions",
//       href: "/account/subscriptions",
//       icon: CreditCard,
//     },
//     {
//       title: "Watch History",
//       href: "/account/watch-history",
//       icon: History,
//     },
//     {
//       title: "My List",
//       href: "/list",
//       icon: Heart,
//     },
//     {
//       title: "Settings",
//       href: "/account/settings",
//       icon: Settings,
//     },
//     {
//       title: "Home",
//       href: "/",
//       icon: Home,
//     },
//   ];

//   return (
//     <Card className="p-6 sticky top-24">
//       {/* User Info */}
//       <div className="text-center mb-6 pb-6 border-b border-border">
//         {user.imageUrl ? (
//           <Image
//             src={user.imageUrl}
//             alt={user.name}
//             width={80}
//             height={80}
//             className="rounded-full mx-auto mb-3"
//           />
//         ) : (
//           <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
//             {user.email?.[0]?.toUpperCase()}
//           </div>
//         )}
//         <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
//         <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
        
//         {user.currentPlan && (
//           <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-semibold">
//             <Crown className="w-3 h-3" />
//             {user.currentPlan}
//           </div>
//         )}
//       </div>

//       {/* Navigation */}
//       <nav className="space-y-2">
//         {menuItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = pathname === item.href;

//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={cn(
//                 "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
//                 isActive
//                   ? "bg-orange-500 text-white"
//                   : "hover:bg-secondary text-muted-foreground"
//               )}
//             >
//               <Icon className="w-5 h-5" />
//               <span className="font-medium">{item.title}</span>
//             </Link>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="mt-6 pt-6 border-t border-border">
//         <Link
//           href="/logout"
//           className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
//         >
//           <LogOut className="w-5 h-5" />
//           <span className="font-medium">Logout</span>
//         </Link>
//       </div>
//     </Card>
//   );
// }





"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  CreditCard, 
  Settings, 
  History, 
  Heart,
  LogOut,
  Crown,
  Home,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { logoutUser } from "@/actions/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DashboardSidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    currentPlan?: string;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, startTransition] = useTransition();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const menuItems = [
    {
      title: "Profile",
      href: "/account",
      icon: User,
    },
    {
      title: "Subscriptions",
      href: "/account/subscriptions",
      icon: CreditCard,
    },
    {
      title: "Watch History",
      href: "/account/watch-history",
      icon: History,
    },
    {
      title: "My List",
      href: "/list",
      icon: Heart,
    },
    {
      title: "Settings",
      href: "/account/settings",
      icon: Settings,
    },
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <>
      <Card className="p-6 sticky top-24">
        {/* User Info */}
        <div className="text-center mb-6 pb-6 border-b border-border">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-full mx-auto mb-3"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}
          <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
          
          {user.currentPlan && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-semibold">
              <Crown className="w-3 h-3" />
              {user.currentPlan}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "hover:bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-6 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setShowLogoutDialog(true)}
            disabled={isLoggingOut}
            className="w-full justify-start px-4 py-3 h-auto hover:bg-red-500/10 text-red-500 hover:text-red-600"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                <span className="font-medium">Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Logout</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the homepage and will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}