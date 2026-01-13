async function testPut() {
    try {
        console.log('Testing PUT /production/test-id...');
        const response = await fetch('http://localhost:3000/production/123e4567-e89b-12d3-a456-426614174000', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantityPlanned: 100
            })
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response body:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

testPut();
