import axios from 'axios';

const payload = {
    "barcode": "7899109102615",
    "createdAt": "2025-11-27T12:34:19.478Z",
    "currentCost": 0,
    "density": 1,
    "description": "",
    "dumCode": null,
    "id": "7870e00a-f4a8-4a0a-a4b0-4f5a1d29fa80",
    "minStock": 20,
    "name": "Gelatina Biovegetais Uva - 500g",
    "netWeight": 500,
    "ph": "",
    "sku": "GUVA1",
    "supplierCode": "",
    "type": "finished",
    "unit": "un",
    "updatedAt": "2025-11-27T12:34:19.478Z"
};

async function run() {
    try {
        console.log('Sending request...');
        const response = await axios.put('http://localhost:3000/products/7870e00a-f4a8-4a0a-a4b0-4f5a1d29fa80', payload);
        console.log('Success:', response.data);
    } catch (error: any) {
        console.error('Error:', error.response?.status, error.response?.data);
    }
}

run();
