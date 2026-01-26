export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // CAMBIO CLAVE: Usamos 'gemini-1.5-flash-latest' que es más robusto en 2026
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Actúa como el Director de INF01, experto en blindaje digital: ${message}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        reply: `[INSPECTOR INF01]: Error de frecuencia ${data.error.code}. Detalle: ${data.error.message}` 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ reply: "[INSPECTOR INF01]: El núcleo está en silencio. Intenta de nuevo." });
    }

  } catch (error) {
    res.status(500).json({ reply: "[SISTEMA INF01]: Falla de hardware: " + error.message });
  }
}
