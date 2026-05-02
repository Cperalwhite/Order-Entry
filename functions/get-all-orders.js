export async function onRequestGet(context) {
  // 1. Database සම්බන්ධතාවය ලබාගැනීම (DB යනු ඔබ Cloudflare හි දුන් නමයි)
  const { env } = context;
  const url = new URL(request.url);

  // URL එකෙන් page එක ලබාගැනීම (නැතිනම් 1 ලෙස ගනී)
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = 50; // පිටුවකට ඇණවුම් 50 කි
  const offset = (page - 1) * limit;

  try {
        
    const { results } = await env.DB.prepare(
      "SELECT * FROM orders ORDER BY id DESC LIMIT ? OFFSET ?"
    ).bind (limit, offset).all();

    const countResult = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM orders"
    ).first();

    const totalPages = Math.ceil(countResult.total / limit);

    // 3. දත්ත JSON ලෙස ආපසු යැවීම
    return new Response(JSON.stringify({ orders, totalPages }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
