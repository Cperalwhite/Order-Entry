export async function onRequestGet(context) {
  const { env, request } = context; 
  const url = new URL(request.url);

  // 1. URL එකෙන් Parameters කියවා ගැනීම
  const page = parseInt(url.searchParams.get("page")) || 1;
  const date = url.searchParams.get("date");
  const name = url.searchParams.get("name");
  const mobile = url.searchParams.get("mobile");
  const sales = url.searchParams.get("sales");

  const limit = 50;
  const offset = (page - 1) * limit;

  try {
    // 2. Query එක ගොඩනැගීම (Dynamic SQL)
    let query = "SELECT * FROM orders WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as total FROM orders WHERE 1=1";
    let params = [];

    // Filter අගයන් තිබේ නම් ඒවා එකතු කිරීම
    if (date) {
      query += " AND order_date = ?";
      countQuery += " AND order_date = ?";
      params.push(date);
    }
    if (name) {
      query += " AND customer_name LIKE ?";
      countQuery += " AND customer_name LIKE ?";
      params.push(`%${name}%`);
    }
    if (mobile) {
      query += " AND (phone LIKE ? OR phone2 LIKE ?)";
      countQuery += " AND (phone LIKE ? OR phone2 LIKE ?)";
      params.push(`%${mobile}%`, `%${mobile}%`);
    }
    if (sales) {
      query += " AND sales_person = ?";
      countQuery += " AND sales_person = ?";
      params.push(sales);
    }

    // 3. Pagination සහ Sorting එකතු කිරීම
    const finalQuery = query + " ORDER BY id DESC LIMIT ? OFFSET ?";
    const queryParams = [...params, limit, offset];

    // 4. දත්ත Fetch කිරීම
    const { results: orders } = await env.DB.prepare(finalQuery)
      .bind(...queryParams)
      .all();

    // 5. Filter කළ පසු මුළු ගණන (Total Pages ගණනයට)
    const countResult = await env.DB.prepare(countQuery)
      .bind(...params)
      .first();
    
    const totalPages = Math.ceil((countResult.total || 0) / limit);

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
