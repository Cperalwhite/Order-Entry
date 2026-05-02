export async function onRequestDelete(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return new Response("ID missing", { status: 400 });

    try {
        await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}
