import * as XLSX from 'xlsx';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx';

    try {
        // D1 Database එකෙන් දත්ත ලබා ගැනීම
        const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC").all();

        // Database එකෙන් එන results එක අලුත් අනුක අංකයක් සහිතව සකස් කිරීම
        const formattedResults = results.map((order, index) => {
            return {
        "No": index + 1, // 1, 2, 3 ලෙස පිළිවෙළට අංක ලබා දෙයි
        "Date": order.order_date,
        "Waybill No": order.waybill_no,
        "Order No": order.order_no,
        "Customer Name": order.customer_name,
        "Address": order.address,
        "Description": order.order_description,
        "Phone": order.phone,
        "COD (Rs.)": order.cod_amount,
        "City": order.city,
        "Sales Person": order.sales_person
    };
});

// දැන් "results" වෙනුවට "formattedResults" පාවිච්චි කරන්න
const worksheet = XLSX.utils.json_to_sheet(formattedResults); 
    
        if (!results || results.length === 0) {
            return new Response("No data to export", { status: 400 });
        }

        // දත්ත Sheet එකකට හැරවීම
        const worksheet = XLSX.utils.json_to_sheet(results);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        // 'buffer' වෙනුවට 'array' පාවිච්චි කරන්න
        const bookType = format === 'csv' ? 'csv' : 'xlsx';
        const out = XLSX.write(workbook, { type: 'array', bookType: bookType });

        const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const fileName = `C_Pearl_Orders.${format}`;

        return new Response(out, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Cache-Control': 'no-cache'
            }
        });
    } catch (err) {
        return new Response("Export failed: " + err.message, { status: 500 });
    }
}
