export async function onRequestPost(context) {
    const { env } = context;
    const db = env.DB; // මෙතන 'DB' යනු ඔබේ wrangler.toml හි ඇති binding name එකයි

    try {
        const data = await context.request.json();

        // Database එකට දත්ත ඇතුළත් කිරීමේ Query එක
        const info = await db.prepare(`
            INSERT INTO orders (waybill, order_id, customer_name, address, city, phone1, phone2, items, total_cod, sales_person)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.waybill,
            data.order_id,
            data.name,
            data.address,
            data.city,
            data.phone,
            data.phone2,
            data.items_description,
            data.total_cod,
            data.sales_person
        ).run();

        return new Response(JSON.stringify({ success: true, info }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
