// Test script to create a formula directly
import axios from 'axios';

const testFormula = {
    productId: "7870e00a-f4a8-4a0a-a4b0-4f5a1d29fa80",
    version: "1.0",
    description: "",
    status: "draft",
    batchSize: 500,
    items: [
        {
            ingredientId: "29557956-a78b-4cb3-b826-a6acad1be06d",
            percentage: 100,
            unit: "kg",
            phase: 1
        }
    ]
};

async function testCreateFormula() {
    try {
        console.log('Enviando requisição para criar fórmula...');
        console.log('Dados:', JSON.stringify(testFormula, null, 2));

        const response = await axios.post('http://localhost:3000/formulas', testFormula);

        console.log('✅ Sucesso!');
        console.log('Resposta:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('❌ Erro ao criar fórmula:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados do erro:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida');
            console.error('Request:', error.request);
        } else {
            console.error('Erro:', error.message);
        }
    }
}

testCreateFormula();
