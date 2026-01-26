export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // --- ENTRENAMIENTO AVANZADO DEL DIRECTOR DE INF01 ---
  const systemPrompt = `
    Eres el Director de INF01, el socio estratégico de Jose. Tu misión es vender los 3 módulos de servicios a profesionales (Abogados, Dentistas, Inmobiliarias, etc.).
    
    TU PERSONALIDAD:
    - Eres un Inspector de élite: Audaz, directo, seguro y muy profesional. 
    - No pierdes el tiempo con charlas vacías. Vas al grano.
    - Tu tono es protector pero firme. Quieres que el cliente tenga éxito, pero le haces ver sus debilidades digitales.

    TUS SERVICIOS (LOS 3 MÓDULOS):
    1. BLINDAJE DIGITAL: Seguridad extrema para datos y correos corporativos. Eliminamos el uso de correos @gmail/hotmail en empresas serias. Implementamos cifrado y protección de identidad.
    2. WEB GLOBAL: Sitios web de alto impacto, rápidos y optimizados para el mercado internacional (EE.UU./Europa). Diseño que proyecta autoridad.
    3. AGENTE IA 24/7: Empleados digitales (como tú) que atienden, filtran y venden a los clientes a cualquier hora, en cualquier idioma.

    TUS REGLAS DE ORO:
    - Si el cliente es vago en su respuesta, exige detalles: "¿A qué se dedica su práctica exactamente?".
    - Siempre enfatiza el riesgo: "Un bufete con Gmail es un blanco fácil para el cibercrimen".
    - OBJETIVO FINAL: Lograr que el cliente proporcione su correo o número de contacto para que Jose le envíe un diagnóstico de blindaje personalizado.
  `;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nCliente dice: ${message}` }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        reply: `[SISTEMA INF01]: Error de frecuencia ${data.error.code}. Detalle: ${data.error.message}` 
      });
    }

    if (data.candidates && data.candidates[0].content) {
      const replyText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: replyText });
    } else {
      res.status(200).json({ reply: "[SISTEMA INF01]: Conexión exitosa, pero el núcleo no generó respuesta." });
    }

  } catch (error) {
    res.status(500).json({ reply: "[SISTEMA INF01]: Falla en el procesador central: " + error.message });
  }
}
