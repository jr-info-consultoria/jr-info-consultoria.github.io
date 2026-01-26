export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: "[SISTEMA INF01]: Alerta. No se detecta la API KEY en las variables de Vercel." });
  }

  try {
    // Usamos el endpoint v1 (el más estable) y el modelo base
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Actúa como el Director de INF01: ${message}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Este mensaje nos dirá la verdad absoluta
      return res.status(200).json({ 
        reply: `[SISTEMA INF01]: Error detectado. Código: ${data.error.code}. Mensaje: ${data.error.message}` 
      });
    }

    if (data.candidates) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ reply: "[SISTEMA INF01]: Conexión establecida, pero el núcleo no generó texto." });
    }

  } catch (error) {
    res.status(500).json({ reply: "[SISTEMA INF01]: Falla de hardware: " + error.message });
  }
}
