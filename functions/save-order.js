export async function onRequestPost(context) {
    const { env, request } = context;
    try {
        const data = await request.json();
        
        if (!env.DB) {
            return new Response(JSON.stringify({ error: "Database Binding එක සොයාගත නොහැක!" }), { status: 500 });
        }

        // ඔබ අලුතින් එවූ CREATE TABLE එකට අනුව සකස් කළ SQL එක
        await env.DB.prepare(`
            INSERT INTO orders (
                name, phone, phone2, address, city, 
                items, total, sales_person, order_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.name,           // Frontend එකෙන් එන name
            data.phone,          // Frontend එකෙන් එන phone
            data.phone2,         // Frontend එකෙන් එන phone2
            data.address,        // Frontend එකෙන් එන address
            data.city,           // Frontend එකෙන් එන city
            data.items_description, // Frontend එකෙන් එන items (items_description ලෙස යැවූ නිසා)
            data.total_cod,      // Frontend එකෙන් එන total (total_cod ලෙස යැවූ නිසා)
            data.sales_person,   // Frontend එකෙන් එන sales_person
            new Date().toISOString() // දැනට තිබෙන දිනය (order_date සඳහා)
        ).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: "SQL Error: " + err.message }), { status: 500 });
    }
}
