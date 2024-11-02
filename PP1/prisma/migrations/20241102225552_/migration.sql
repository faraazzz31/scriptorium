/*
  Warnings:

  - You are about to drop the column `content` on the `BlogPost` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenAt" DATETIME,
    "hiddenById" INTEGER,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_hiddenById_fkey" FOREIGN KEY ("hiddenById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BlogPost" ("authorId", "createdAt", "description", "downvotes", "hiddenAt", "hiddenById", "id", "isHidden", "title", "updatedAt", "upvotes") SELECT "authorId", "createdAt", "description", "downvotes", "hiddenAt", "hiddenById", "id", "isHidden", "title", "updatedAt", "upvotes" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
