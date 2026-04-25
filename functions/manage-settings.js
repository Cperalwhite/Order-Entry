export async function onRequest(context) {
    const { env, request } = context;
    const method = request.method;

    if (method === "GET") {
        const settings = await env.DB.prepare("SELECT * FROM app_settings WHERE id = 'main_config'").first();
        return new Response(JSON.stringify(settings), { headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST") {
        const data = await request.json();
        await env.DB.prepare(
            "UPDATE app_settings SET del_charge = ?, sales_persons = ?, products = ? WHERE id = 'main_config'"
        )
        .bind(data.del_charge, data.sales_persons, data.products)
        .run();
        
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
}
