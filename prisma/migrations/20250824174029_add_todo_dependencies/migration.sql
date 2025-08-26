-- CreateTable
CREATE TABLE "TodoDependency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parentTodo" INTEGER NOT NULL,
    "childTodo" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TodoDependency_parentTodo_fkey" FOREIGN KEY ("parentTodo") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TodoDependency_childTodo_fkey" FOREIGN KEY ("childTodo") REFERENCES "Todo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TodoDependency_parentTodo_childTodo_key" ON "TodoDependency"("parentTodo", "childTodo");
