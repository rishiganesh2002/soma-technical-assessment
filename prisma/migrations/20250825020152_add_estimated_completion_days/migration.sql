-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "estimatedCompletionDays" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Todo" ("createdAt", "dueDate", "id", "imageAlt", "imageUrl", "title") SELECT "createdAt", "dueDate", "id", "imageAlt", "imageUrl", "title" FROM "Todo";
DROP TABLE "Todo";
ALTER TABLE "new_Todo" RENAME TO "Todo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
