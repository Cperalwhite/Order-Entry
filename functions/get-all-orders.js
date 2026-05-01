export async function onRequestGet(context) {
  // 1. Database සම්බන්ධතාවය ලබාගැනීම (DB යනු ඔබ Cloudflare හි දුන් නමයි)
  const { env } = context;

  try {
    // 2. Database එකෙන් සියලුම ඕඩර්ස් ලබාගැනීම
    // මෙහි 'orders' යනු ඔබේ Table එකේ නමයි
    const { results } = await env.DB.prepare(
      "SELECT * FROM orders ORDER BY id DESC"
    ).all();

    // 3. දත්ත JSON ලෙස ආපසු යැවීම
    return new Response(JSON.stringify(results), {
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
