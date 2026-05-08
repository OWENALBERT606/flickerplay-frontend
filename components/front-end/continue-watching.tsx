
// import { ContinueWatchingContent } from "../continue-watching-component";

import { getContinueWatching } from "@/actions/watchHistory";
import { ContinueWatchingContent } from "../continue-watching-component";

// interface ContinueWatchingProps {
//   userId?: string | null;
// }

// export async function ContinueWatching({ userId }: ContinueWatchingProps) {
//   if (!userId) {
//     return null; // Don't show if user not logged in
//   }

//   const result = await getContinueWatching(userId, 6);
//   const continueWatching = result.data || [];

//   if (continueWatching.length === 0) {
//     return null; // Don't show section if no items
//   }

//   return <ContinueWatchingContent items={continueWatching} userId={userId} />;
// }



interface ContinueWatchingProps {
  userId?: string | null;
}

export async function ContinueWatching({ userId }: ContinueWatchingProps) {
  if (!userId) {
    return null;
  }

  const result = await getContinueWatching(userId, 4); // last 4 only
  const continueWatching = result.data || [];

  if (continueWatching.length === 0) {
    return null;
  }

  return <ContinueWatchingContent items={continueWatching} userId={userId} />;
}
