import * as XLSX from 'xlsx';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx';

    try {
        // 1. Database එකෙන් දත්ත ලබා ගැනීම
        const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC").all();

        // 2. දත්ත තිබේදැයි පරීක්ෂා කිරීම
        if (!results || results.length === 0) {
            return new Response("No data to export", { status: 404 });
        }

        // 3. දත්ත සකස් කිරීම (Formatted Results)
        const formattedResults = results.map(function(order, index) {
            return {
                "No": index + 1,
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

        // 4. Excel/CSV සෑදීම
        const worksheet = XLSX.utils.json_to_sheet(formattedResults);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        // 5. Output එක ලබා ගැනීම
        const bookType = format === 'csv' ? 'csv' : 'xlsx';
        const out = XLSX.write(workbook, { type: 'array', bookType: bookType });

        // 6. Response එක යැවීම
        const contentType = format === 'csv' 
            ? 'text/csv' 
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        
        const fileName = `C_Pearl_Orders_${new Date().toISOString().split('T')[0]}.${format}`;

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
