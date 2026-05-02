import * as XLSX from 'xlsx';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx';

    try {
        // ඔබේ D1 Database එකෙන් දත්ත ලබා ගැනීම
        // මෙහි "DB" යනු ඔබ Pages Settings වල ලබා දුන් Binding name එකයි
        const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY id DESC").all();

        // දත්ත Sheet එකකට හැරවීම
        const worksheet = XLSX.utils.json_to_sheet(results);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        // Format එක අනුව output එක සැකසීම
        const bookType = format === 'csv' ? 'csv' : 'xlsx';
        const buf = XLSX.write(workbook, { type: 'buffer', bookType: bookType });

        const contentType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const fileName = `C_Pearl_Orders.${format}`;

        return new Response(buf, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            }
        });
    } catch (err) {
        return new Response("Export failed: " + err.message, { status: 500 });
    }
}
