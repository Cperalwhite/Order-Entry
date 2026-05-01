export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        const data = await request.json();
        
        if (!env.DB) {
            return new Response(JSON.stringify({ error: "Database Binding (DB) සොයාගත නොහැක!" }), { status: 500 });
        }

        // ඔබේ අලුත්ම CREATE TABLE එකට 100% ක් ගැලපෙන SQL එක
        await env.DB.prepare(`
            INSERT INTO orders (
                name, 
                phone, 
                phone2, 
                address, 
                city, 
                items, 
                total, 
                discount, 
                delivery, 
                sales_person, 
                order_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.name || "N/A",
            data.phone || "N/A",
            data.phone2 || "-",
            data.address || "N/A",
            data.city || "N/A",
            data.items_description || "N/A",
            data.total_cod || 0,     // Table එකේ 'total' Column එකට යයි
            data.discount || 0,      // අලුත් Column එක
            data.delivery || 0,      // අලුත් Column එක
            data.sales_person || "Admin",
            new Date().toISOString() // order_date සඳහා
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
