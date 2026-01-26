export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Personalidad del Director de INF01
  const systemPrompt = "Eres el Director de INF01. Experto en blindaje digital y marketing profesional. Tu tono es audaz, directo y altamente confiable. No usas lenguaje genérico; vas al grano con soluciones de ciberseguridad y conversión de ventas.";

  try {
    // CAMBIO TÁCTICO: Usamos v1beta y el modelo específico 'latest'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nCliente: ${message}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        reply: `[SISTEMA INF01]: Error de frecuencia ${data.error.code}. Verifica la API KEY en Vercel.` 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ reply: "[SISTEMA INF01]: Señal recibida pero sin respuesta del núcleo." });
    }

  } catch (error) {
    res.status(500).json({ reply: "[SISTEMA INF01]: Falla crítica: " + error.message });
  }
}
