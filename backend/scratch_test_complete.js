async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/complete-scenario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenarioId: 'chaos-unloading', score: 100 })
        });
        const data = await res.json();
        console.log('RESPONSE:', data);
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

test();
