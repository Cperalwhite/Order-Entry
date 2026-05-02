export async function onRequestGet(context) {
  // 1. Context එකෙන් env සහ request ලබා ගැනීම
  const { env, request } = context; 
  const url = new URL(request.url);

  // 2. URL එකෙන් page අංකය ලබා ගැනීම (නැතිනම් 1 ලෙස ගනී)
  const page = parseInt(url.searchParams.get("page")) || 1;
  const limit = 50; // ඔබ ඉල්ලූ පරිදි පිටුවකට 50 බැගින්
  const offset = (page - 1) * limit;

  try {
    // 3. Database එකෙන් අදාළ පිටුවට අවශ්‍ය දත්ත 50 පමණක් ලබා ගැනීම
    const { results: orders } = await env.DB.prepare(
      "SELECT * FROM orders ORDER BY id DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();

    // 4. මුළු ඇණවුම් ගණන ලබා ගැනීම (Total Pages සෑදීමට)
    const countResult = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM orders"
    ).first();
    
    const totalPages = Math.ceil(countResult.total / limit);

    // 5. දත්ත සහ මුළු පිටු ගණන JSON ලෙස ආපසු යැවීම
    return new Response(JSON.stringify({ orders, totalPages }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    });

  } catch (error) {
    // දෝෂයක් ඇති වුවහොත් එය මෙතැනින් පෙන්වයි
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
