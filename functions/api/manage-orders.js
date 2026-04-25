export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  try {
    // GET: ඇණවුම් ලබා ගැනීම (Pagination සමඟ)
    if (method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = 50;
      const offset = (page - 1) * limit;

      const { results } = await env.DB.prepare(
        "SELECT * FROM orders ORDER BY date DESC LIMIT ? OFFSET ?"
      ).bind(limit, offset).all();

      return Response.json(results);
    }

    // POST: අලුත් ඇණවුමක් ඇතුළත් කිරීම
    if (method === "POST") {
      const data = await request.json();
      
      // Validation
      if (!data.p1 || !/^\d{10}$/.test(data.p1.replace(/\s/g, ''))) {
        return Response.json({ error: "වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (ඉලක්කම් 10)" }, { status: 400 });
      }

      await env.DB.prepare(`
        INSERT INTO orders (name, p1, p2, addr, city, items, sp, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.name, data.p1, data.p2 || '', data.addr, 
        data.city, JSON.stringify(data.items), data.sp, data.total
      ).run();

      return Response.json({ success: true });
    }
    
    return new Response("Method not allowed", { status: 405 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}