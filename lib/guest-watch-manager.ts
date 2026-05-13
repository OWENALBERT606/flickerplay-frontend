export const GuestWatchManager = {
  getWatchedMovies(): string[] {
    if (typeof window === "undefined") return [];
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("guest_movies="))
      ?.split("=")[1];
    if (!cookie) return [];
    return decodeURIComponent(cookie).split(",").filter(Boolean);
  },

  addWatchedMovie(movieId: string) {
    if (typeof window === "undefined") return;
    const watched = this.getWatchedMovies();
    if (!watched.includes(movieId)) {
      watched.push(movieId);
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `guest_movies=${encodeURIComponent(
        watched.join(",")
      )}; expires=${expires.toUTCString()}; path=/`;
    }
  },

  getWatchCount(): number {
    return this.getWatchedMovies().length;
  },

  hasReachedLimit(): boolean {
    return this.getWatchCount() >= 2;
  },

  canWatch(movieId: string): boolean {
    const watched = this.getWatchedMovies();
    if (watched.includes(movieId)) return true;
    return watched.length < 2;
  }
};
