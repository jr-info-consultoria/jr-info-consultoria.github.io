export default async function handler(req, res) {
  // Permisos para que funcione tanto en Vercel como en GitHub
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Instrucciones de personalidad para INF01
  const systemPrompt = "Eres el Director de INF01. Estilo: audaz, experto en ciberseguridad y marketing. No te gusta el contacto verbal; prefieres chat o email. Convence al cliente de tu autoridad técnica.";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nCliente: ${message}` }] }]
      })
    });

    const data = await response.json();
    const botReply = data.candidates[0].content.parts[0].text;
    
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "Error en el blindaje de IA. Protocolo de seguridad activo." });
  }
}
