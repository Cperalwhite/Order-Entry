export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { rawText, systemPrompt } = await request.json();

    if (!rawText) {
      return Response.json({ error: 'rawText is required' }, { status: 400 });
    }

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1500,
        temperature: 0,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: rawText }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || 'Groq API error' }, { status: res.status });
    }

    const rawJson = (data.choices?.[0]?.message?.content || '')
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(rawJson);

    // Normalize
    const result = {
      name:     parsed.name     || '',
      p1:       (parsed.p1      || '').replace(/\s/g, '').slice(0, 10),
      p2:       (parsed.p2      || '').replace(/\s/g, '').slice(0, 10),
      addr:     parsed.addr     || '',
      city:     parsed.city     || '',
      rawItems: Array.isArray(parsed.rawItems) ? parsed.rawItems : [],
      cod:      parseFloat(parsed.cod)      || 0,
      delivery: parseFloat(parsed.delivery) || 0,
      rmk:      parsed.rmk      || ''
    };

    return Response.json(result);

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
