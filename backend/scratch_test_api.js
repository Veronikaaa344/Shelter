// Using global fetch (Node 22+)

async function testApi() {
    try {
        const res = await fetch('http://localhost:5000/api/diagnostic/questions');
        const data = await res.json();
        console.log("--- API RESPONSE ---");
        console.log(JSON.stringify(data, null, 2));
        console.log("Count:", Array.isArray(data) ? data.length : "not an array");
    } catch (err) {
        console.error("API Error:", err.message);
    }
}

testApi();
