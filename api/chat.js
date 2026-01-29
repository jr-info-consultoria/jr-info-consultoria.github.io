export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ERROR]: API KEY no detectada en Vercel." });
    }

    // Usamos el endpoint estable v1 (saltando el v1beta que da error 404)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y profesional. 
                MÁXIMO 20 PALABRAS. 
                PROTOCOLO:
                1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
                2. No avances hasta tener nombre y correo.
                3. Realiza las 5 preguntas de diagnóstico una a una.
                4. Al final, da veredicto de RIESGO CRÍTICO y envía a WhatsApp.
                
                Usuario dice: ${message}`
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const botReply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error("Fallo de conexión:", error.message);
        res.status(200).json({ 
            reply: "🛡️ [DETALLE FINAL]: " + error.message + ". Jose, si este error persiste, la API KEY no tiene permisos para el modelo Flash en esta región." 
        });
    }
}
