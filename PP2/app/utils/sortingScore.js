export function valueScore(upvotes, downvotes) {
  return upvotes - downvotes;
}

export function controversyScore(upvotes, downvotes) {
  if (Math.max(upvotes, downvotes) === 0) {
    return -1; // lowest possible score
  }
  return (upvotes + downvotes) ** (Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes));
}