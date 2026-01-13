/*
  Warnings:

  - You are about to drop the column `quantity` on the `formula_items` table. All the data in the column will be lost.
  - Added the required column `percentage` to the `formula_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN "barcode" TEXT;
ALTER TABLE "products" ADD COLUMN "sku" TEXT;
ALTER TABLE "products" ADD COLUMN "supplier_code" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_formula_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formula_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "phase" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    CONSTRAINT "formula_items_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "formula_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_formula_items" ("formula_id", "id", "ingredient_id", "notes", "phase", "unit") SELECT "formula_id", "id", "ingredient_id", "notes", "phase", "unit" FROM "formula_items";
DROP TABLE "formula_items";
ALTER TABLE "new_formula_items" RENAME TO "formula_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
