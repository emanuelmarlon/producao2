
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting...');
        await prisma.$connect();

        // 1. Create a test product (Ingredient)
        console.log('Creating ingredient...');
        const ingredient = await prisma.product.create({
            data: {
                name: 'Test Ingredient ' + Date.now(),
                type: 'raw_material',
                unit: 'kg',
                currentCost: 10,
                density: 1,
            }
        });
        console.log('Ingredient created:', ingredient.id);

        // 2. Create a test product (Finished Good)
        console.log('Creating finished product...');
        const finishedProduct = await prisma.product.create({
            data: {
                name: 'Test Finished Product ' + Date.now(),
                type: 'finished',
                unit: 'un',
                netWeight: 500,
            }
        });
        console.log('Finished product created:', finishedProduct.id);

        // 3. Create a formula
        console.log('Creating formula...');
        const formula = await prisma.formula.create({
            data: {
                productId: finishedProduct.id,
                version: '1.0',
                status: 'draft',
                batchSize: 1000,
                items: {
                    create: [
                        {
                            ingredientId: ingredient.id,
                            percentage: 100,
                            unit: 'kg',
                            phase: 1
                        }
                    ]
                }
            },
            include: {
                items: true
            }
        });
        console.log('Formula created successfully:', formula.id);

        // 4. Create a Production Order
        console.log('Creating production order...');
        const productionOrder = await prisma.productionOrder.create({
            data: {
                code: `OP-TEST-${Date.now()}`,
                productId: finishedProduct.id,
                formulaId: formula.id,
                quantityPlanned: 100,
                unit: 'un',
                status: 'planned',
                items: {
                    create: [
                        {
                            ingredientId: ingredient.id,
                            quantityPlanned: 10,
                        }
                    ]
                }
            }
        });
        console.log('Production Order created:', productionOrder.id);

        // 5. Create a Lot
        console.log('Creating lot...');
        const lot = await prisma.lot.create({
            data: {
                code: `L-TEST-${Date.now()}`,
                productId: ingredient.id,
                quantityInitial: 100,
                quantityCurrent: 100,
                status: 'active',
            }
        });
        console.log('Lot created:', lot.id);

        // 6. Create Stock Movement
        console.log('Creating stock movement...');
        const movement = await prisma.stockMovement.create({
            data: {
                productId: ingredient.id,
                lotId: lot.id,
                type: 'in',
                quantity: 50,
                cost: 10,
            }
        });
        console.log('Stock Movement created:', movement.id);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
