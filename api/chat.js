export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: "[SISTEMA INF01]: Alerta. No hay API KEY cargada." });
  }

  try {
    // CAMBIO TÉCNICO: Usamos v1beta y el modelo base sin extensiones
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Eres el Director de INF01: ${message}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si falla, el Inspector nos dirá si es la llave o la dirección
      return res.status(200).json({ 
        reply: `[INSPECTOR]: Fallo en el punto ${data.error.code}. Detalle: ${data.error.message}` 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ reply: "[INSPECTOR]: Conexión exitosa, pero el núcleo está en silencio." });
    }

  } catch (error) {
    res.status(500).json({ reply: "[SISTEMA INF01]: Error de hardware: " + error.message });
  }
}
