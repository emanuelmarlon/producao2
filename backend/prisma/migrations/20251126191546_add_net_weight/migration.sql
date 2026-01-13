-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "supplier_code" TEXT,
    "type" TEXT NOT NULL,
    "density" REAL NOT NULL DEFAULT 1.0,
    "net_weight" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "current_cost" REAL NOT NULL DEFAULT 0,
    "min_stock" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_products" ("barcode", "created_at", "current_cost", "density", "description", "id", "min_stock", "name", "sku", "supplier_code", "type", "unit", "updated_at") SELECT "barcode", "created_at", "current_cost", "density", "description", "id", "min_stock", "name", "sku", "supplier_code", "type", "unit", "updated_at" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
