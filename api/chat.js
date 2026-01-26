export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Personalidad de Inspector Jefe de INF01 (Estilo KITT)
  const systemPrompt = "Eres el Inspector Jefe de INF01. Tu misión es auditar y certificar la seguridad y el marketing de negocios de alto nivel. Responde con autoridad y precisión técnica. Tu tono es profesional, audaz y protector, como un sistema de inteligencia avanzada.";

  try {
    // CAMBIO DE RUTA: Usamos v1beta y el modelo '-latest' para evitar el 404
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nConsulta: ${message}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        reply: `[SISTEMA INF01]: Error de frecuencia. Código ${data.error.code}: ${data.error.message}` 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      const botReply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: botReply });
    } else {
      res.status(200).json({ reply: "[SISTEMA INF01]: La señal es débil. No se pudo generar una respuesta." });
    }

  } catch (error) {
    res.status(500).json({ reply: "[SISTEMA INF01]: Falla en el procesador central: " + error.message });
  }
}
