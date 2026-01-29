export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ALERTA]: Falta la llave API en Vercel." });
    }

    // EN 2026 USAMOS GEMINI 3 FLASH (El 1.5 ya fue descontinuado)
    const modelName = "gemini-3-flash"; 
    const payload = {
        contents: [{
            parts: [{
                text: `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico, profesional y cortante. 
                MÁXIMO 15 PALABRAS. 
                PROTOCOLO OBLIGATORIO:
                1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
                2. No avances hasta tener nombre y correo.
                3. Realiza las 5 preguntas de diagnóstico de una en una.
                
                Usuario: ${message}`
            }]
        }]
    };

    async function callGoogleAPI(version) {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    }

    try {
        // Intento 1: Versión estable v1
        let data = await callGoogleAPI('v1');

        // Si v1 da 404 o error, intentamos con v1beta automáticamente
        if (data.error) {
            data = await callGoogleAPI('v1beta');
        }

        if (data.error) throw new Error(data.error.message);

        const botReply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: botReply });

    } catch (error) {
        res.status(200).json({ 
            reply: "🛡️ [SISTEMA]: " + error.message + ". Verifique que el modelo '" + modelName + "' esté habilitado en su región." 
        });
    }
}
