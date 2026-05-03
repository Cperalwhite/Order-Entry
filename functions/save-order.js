export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        const data = await request.json();
        
        if (!env.DB) {
            return new Response(JSON.stringify({ error: "Database Binding (DB) සොයාගත නොහැක!" }), { status: 500 });
        }

        // ඔබ ලබාදුන් CREATE TABLE එකට අනුව නිවැරදි කළ SQL එක
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
                sales_person
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.order_date || new Date().toISOString().split('T')[0], // order_date
            data.waybill_no || "PENDING",                             // waybill_no
            data.order_no || "N/A",                                   // order_no
            data.name || "N/A",                                      // customer_name
            data.address || "N/A",                                   // address
            data.items || "No Description",                          // order_description[cite: 2]
            data.phone || "N/A",                                     // phone[cite: 2]
            data.phone2 || ",                                      // phone2[cite: 2]
            data.total || 0,                                         // cod_amount[cite: 2]
            data.city || "N/A",                                      // city[cite: 2]
            data.sales_person || "Admin"                             // sales_person[cite: 2]
        ).run();

        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        // ගැටලුවක් ආවොත් ඒක මොකක්ද කියලා හරියටම බලාගන්න[cite: 2]
        return new Response(JSON.stringify({ 
            error: "SQL Error", 
            details: err.message 
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
