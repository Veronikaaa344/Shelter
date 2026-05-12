async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/scenarios/chaos-unloading');
        const data = await res.json();
        console.log('SCENARIO:', data.name);
        console.log('CONTENT ITEMS COUNT:', data.content?.items?.length || 0);
        console.log('FIRST ITEM:', data.content?.items?.[0]?.text);
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

test();
