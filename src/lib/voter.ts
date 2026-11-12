/** Returns a stable anonymous voter ID for this browser (stored in localStorage). */
let memoryVoterId: string | null = null;

/**
 * This browser's voter ID if it has one, without creating it. Loading the
 * homepage used to create and store an ID for every visitor before anyone
 * voted; now one exists only after a vote.
 */
export function peekVoterId(): string | null {
  try {
    return localStorage.getItem('fmt_voter_id') ?? memoryVoterId;
  } catch {
    return memoryVoterId;
  }
}

export function getVoterId(): string {
  // localStorage throws when a browser blocks site storage; the vote still
  // counts, it just is not remembered after this visit.
  try {
    let id = localStorage.getItem('fmt_voter_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('fmt_voter_id', id);
    }
    return id;
  } catch {
    memoryVoterId ??= crypto.randomUUID();
    return memoryVoterId;
  }
}
