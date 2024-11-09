-- CreateTable
CREATE TABLE "_UserUpvotedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserUpvotedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserUpvotedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserDownvotedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserDownvotedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserDownvotedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserUpvotedComments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserUpvotedComments_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserUpvotedComments_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserDownvotedComments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserDownvotedComments_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserDownvotedComments_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserUpvotedPosts_AB_unique" ON "_UserUpvotedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_UserUpvotedPosts_B_index" ON "_UserUpvotedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserDownvotedPosts_AB_unique" ON "_UserDownvotedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_UserDownvotedPosts_B_index" ON "_UserDownvotedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserUpvotedComments_AB_unique" ON "_UserUpvotedComments"("A", "B");

-- CreateIndex
CREATE INDEX "_UserUpvotedComments_B_index" ON "_UserUpvotedComments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserDownvotedComments_AB_unique" ON "_UserDownvotedComments"("A", "B");

-- CreateIndex
CREATE INDEX "_UserDownvotedComments_B_index" ON "_UserDownvotedComments"("B");
