import * as XLSX from 'xlsx';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx';

    try {
       
        const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC").all();

        if (!results || results.length === 0) {
            return new Response("No data found to export", { status: 404 });
        }

        const formattedResults = results.map((order, index) => ({
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
    });
       
    const worksheet = XLSX.utils.json_to_sheet(formattedResults); 
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

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
