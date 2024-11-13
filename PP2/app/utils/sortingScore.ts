export function valueScore(upvotes: number, downvotes: number) {
  return upvotes - downvotes;
}

export function controversyScore(upvotes: number, downvotes: number) {
  if (Math.max(upvotes, downvotes) === 0) {
    return -1; // lowest possible score
  }
  return (upvotes + downvotes) ** (Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes));
}