export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Personalidad de "Inspector de Blindaje"
  const systemPrompt = "Eres el Inspector Jefe de INF01. Tu misión es auditar y certificar la seguridad y el marketing de negocios de alto nivel. Responde con autoridad, basándote en estándares internacionales de ciberseguridad. Tu tono es serio, profesional y altamente confiable.";

  try {
    // Usamos el endpoint estable v1
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nConsulta del cliente: ${message}` }] }]
      })
    });

    const data = await response.json();

    // Diagnóstico de Error en tiempo real
    if (data.error) {
      console.error("Error de Google:", data.error);
      return res.status(200).json({ 
        reply: `[INSPECTOR INF01]: Alerta de conexión. Código: ${data.error.code}. Mensaje: ${data.error.message}` 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      const botReply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: botReply });
    } else {
      res.status(200).json({ reply: "[INSPECTOR INF01]: El núcleo de IA no generó una respuesta válida. Revisa la configuración del modelo." });
    }

  } catch (error) {
    res.status(500).json({ reply: "[INSPECTOR INF01]: Falla crítica de infraestructura: " + error.message });
  }
}
