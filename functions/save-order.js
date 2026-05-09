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
            data.order_date || new Date().toISOString().split('T')[0], 
            data.waybill_no || "PENDING",                             
            data.order_no || "N/A",                                   
            data.name || "N/A",                                      
            data.address || "N/A",                                   
            data.items || "No Description",                          
            data.phone || "N/A",                                     
            data.phone2 || "",                                     
            data.total || 0,                                         
            data.city || "N/A",                                     
            data.sales_person || "Admin"                             
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
