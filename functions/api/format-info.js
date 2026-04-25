export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS Headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
        const { rawText } = await request.json();

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.GROQ_API_KEY}` 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "Extract customer Name, Address, Phone, Phone2, and City from the message. Return ONLY JSON object."
                    },
                    { role: "user", content: rawText }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
            headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: corsHeaders 
        });
    }
}

// OPTIONS request එකට ප්‍රතිචාර දැක්වීම (CORS සඳහා අත්‍යවශ්‍යයි)
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}