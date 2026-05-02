export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        const data = await request.json();
        
        if (!env.DB) {
            return new Response(JSON.stringify({ error: "Database Binding (DB) සොයාගත නොහැක!" }), { status: 500 });
        }

        // SQL Query එකේ Headers 12 ක් ඇත (id ස්වයංක්‍රීයව සෑදේ)
        await env.DB.prepare(`
            INSERT INTO orders (
                order_date,
                waybill_no,
                order_no,
                customer_name,
                address,
                order_description,
                phone,
                phone2,
                cod_amount,
                city,
                sales_person,
                discount,
                delivery
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.order_date || new Date().toISOString().split('T')[0], // Date
            data.waybill || "PENDING",                                // Waybill No
            data.order_no || "N/A",                                   // Order No
            data.name || "N/A",                                      // Customer Name
            data.address || "N/A",                                   // Address[cite: 2]
            data.items || "No Description",                          // Order Description[cite: 2]
            data.phone || "N/A",                                     // Phone[cite: 2]
            data.phone2 || "-",                                      // Phone 2[cite: 2]
            data.total || 0,                                         // COD (Rs.)[cite: 2]
            data.city || "N/A",                                      // City[cite: 2]
            data.sales_person || "Admin",                            // Sales Person[cite: 2]
            data.discount || 0,                                      // Discount
            data.delivery || 0                                       // Delivery
        ).run();

        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "SQL Error: " + err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
