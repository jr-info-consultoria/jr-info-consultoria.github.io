export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Personalidad del Director de INF01
  const systemPrompt = "Eres el Director de INF01. Experto en blindaje digital y marketing pro. Tu tono es profesional, audaz y directo. Prefieres el chat y email antes que hablar por teléfono. Tu objetivo es vender los 3 bloques de servicios de INF01.";

  try {
    // CAMBIO CLAVE: Usamos /v1/ en lugar de /v1beta/
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nCliente: ${message}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: "Error de Google: " + data.error.message });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "El blindaje detectó una falla: " + error.message });
  }
}
