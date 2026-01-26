export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // Primero, le pedimos a Google que nos diga qué modelos tiene disponibles para Jose
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    // Si el bot falla, nos va a mostrar esta lista en el chat para que escojamos el nombre correcto
    if (listData.models) {
      const modelNames = listData.models.map(m => m.name).join(", ");
      return res.status(200).json({ 
        reply: `[INSPECTOR INF01]: Conexión exitosa. Los modelos que podés usar son: ${modelNames}. Avisame cuál ves en la lista.` 
      });
    }

    return res.status(200).json({ reply: "[INSPECTOR INF01]: No pude recuperar la lista de modelos. Revisá tu API KEY." });

  } catch (error) {
    res.status(500).json({ reply: "[SISTEMA INF01]: Falla de hardware: " + error.message });
  }
}
