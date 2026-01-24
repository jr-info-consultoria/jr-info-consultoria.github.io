export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Metodo no permitido');

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = "Eres el Director de INF01. Estilo: audaz, experto en ciberseguridad y marketing. " +
                       "No te gusta el contacto verbal; prefieres chat o email. Convence al cliente de tu autoridad técnica.";

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
    res.status(500).json({ error: "Error en el blindaje de IA" });
  }
}
