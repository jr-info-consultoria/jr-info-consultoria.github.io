export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Personalidad de "Inspector Jefe de INF01"
  const systemPrompt = "Eres el Director de INF01. Experto en blindaje digital y marketing de alta conversión en Costa Rica. Tu misión es asesorar a profesionales como abogados y dentistas. Tu tono es audaz, seguro, profesional y directo. No saludas de forma genérica, vas al grano con autoridad.";

  try {
    // CAMBIO MAESTRO: Usamos el modelo gemini-2.5-flash verificado en tu lista
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nConsulta del cliente: ${message}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        reply: `[SISTEMA INF01]: Error de frecuencia ${data.error.code}. Detalle: ${data.error.message}` 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      const replyText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: replyText });
    } else {
      res.status(200).json({ reply: "[SISTEMA INF01]: Conexión exitosa, pero el núcleo no generó respuesta." });
    }

  } catch (error) {
    res.status(500).json({ reply: "[SISTEMA INF01]: Falla en el procesador central: " + error.message });
  }
}
