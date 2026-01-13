-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_production_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "production_order_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity_planned" REAL NOT NULL,
    "quantity_real" REAL,
    "lot_used_id" TEXT,
    CONSTRAINT "production_order_items_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "production_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_order_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_order_items_lot_used_id_fkey" FOREIGN KEY ("lot_used_id") REFERENCES "lots" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_production_order_items" ("id", "ingredient_id", "lot_used_id", "production_order_id", "quantity_planned", "quantity_real") SELECT "id", "ingredient_id", "lot_used_id", "production_order_id", "quantity_planned", "quantity_real" FROM "production_order_items";
DROP TABLE "production_order_items";
ALTER TABLE "new_production_order_items" RENAME TO "production_order_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
