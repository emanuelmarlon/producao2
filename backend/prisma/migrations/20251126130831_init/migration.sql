-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "density" REAL NOT NULL DEFAULT 1.0,
    "unit" TEXT NOT NULL,
    "current_cost" REAL NOT NULL DEFAULT 0,
    "min_stock" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "description" TEXT,
    "status" TEXT NOT NULL,
    "batch_size" REAL NOT NULL DEFAULT 100,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "formulas_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "formula_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formula_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "phase" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    CONSTRAINT "formula_items_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "formula_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "formula_id" TEXT NOT NULL,
    "quantity_planned" REAL NOT NULL,
    "quantity_real" REAL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "lot_number" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "production_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_orders_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "production_order_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity_planned" REAL NOT NULL,
    "quantity_real" REAL,
    "lot_used_id" TEXT,
    CONSTRAINT "production_order_items_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "production_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_order_items_lot_used_id_fkey" FOREIGN KEY ("lot_used_id") REFERENCES "lots" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity_initial" REAL NOT NULL,
    "quantity_current" REAL NOT NULL,
    "expiration_date" DATETIME,
    "manufacture_date" DATETIME,
    "status" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "cost" REAL NOT NULL DEFAULT 0,
    "production_order_id" TEXT,
    "reference" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "production_orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_code_key" ON "production_orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lots_code_key" ON "lots"("code");
