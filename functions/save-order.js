export async function onRequestPost(context) {
    const { env, request } = context;
    try {
        const data = await request.json();
        
        // 1. Database එක සම්බන්ධද බලන්න
        if (!env.DB) {
            return new Response(JSON.stringify({ error: "Database එක පේන්න නෑ (Binding error)" }), { status: 500 });
        }

        // 2. දත්ත Database එකට දාන්න
        await env.DB.prepare(`
            INSERT INTO orders (waybill, order_id, customer_name, address, city, phone1, phone2, items, total_cod, sales_person)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.waybill, data.order_id, data.name, data.address, data.city, 
            data.phone, data.phone2, data.items_description, data.total_cod, data.sales_person
        ).run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        // වැරැද්ද මොකක්ද කියලා මෙතනින් බලාගන්න පුළුවන්
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
