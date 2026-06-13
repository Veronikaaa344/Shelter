const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scenarioName: "Impostor Syndrome",
                scenarioDescription: "A training scenario",
                userOption: "",
                history: []
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) {
        console.error(e);
    }
}
test();
