export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Eres el Director de INF01. Responde: ${message}` }] }]
      })
    });

    const data = await response.json();

    // ESTO ES LO NUEVO: Si Google nos da un error, lo mostramos en el chat
    if (data.error) {
      return res.status(200).json({ reply: "Error técnico de Google: " + data.error.message });
    }

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(200).json({ reply: "Google no devolvió respuesta. Revisa la configuración del modelo." });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Falla crítica en el servidor: " + error.message });
  }
}
