export default async function handler(req, res) {
  // Permisos de seguridad (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Si no hay llave, el bot te lo dirá directamente
  if (!apiKey) {
    return res.status(200).json({ reply: "Socio, falta configurar la GEMINI_API_KEY en Vercel. El blindaje no puede iniciar sin su llave." });
  }

  const systemPrompt = "Eres el Director de INF01. Estilo: profesional, experto en ciberseguridad y marketing. No te gusta el contacto verbal; prefieres chat o email. Tu misión es convencer al cliente de contratar tus módulos de blindaje digital.";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nCliente: ${message}` }] }]
      })
    });

    const data = await response.json();
    
    // Verificamos si Google respondió bien
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const botReply = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: botReply });
    } else {
      res.status(200).json({ reply: "El núcleo de IA recibió el mensaje pero no pudo procesar la respuesta. Revisa el saldo de tu API KEY." });
    }

  } catch (error) {
    res.status(200).json({ reply: "Protocolo de seguridad activo: Error de conexión con el núcleo de IA." });
  }
}
