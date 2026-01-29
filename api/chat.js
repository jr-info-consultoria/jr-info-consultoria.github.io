export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ERROR]: Llave API no detectada en Vercel." });
    }

    // COMANDO ESPECIAL PARA VER LA VERDAD
    if (message.toUpperCase() === "LISTA") {
        try {
            const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const listRes = await fetch(listUrl);
            const listData = await listRes.json();
            
            if (listData.models) {
                const names = listData.models
                    .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                    .map(m => m.name.replace('models/', ''))
                    .join(", ");
                return res.status(200).json({ reply: "🛡️ [MODELOS DISPONIBLES]: " + names });
            } else {
                return res.status(200).json({ reply: "🛡️ [AVISO]: No se encontraron modelos. Revise su facturación en Google Cloud." });
            }
        } catch (e) {
            return res.status(200).json({ reply: "🛡️ [ERROR]: " + e.message });
        }
    }

    // INTENTO CON EL ESTÁNDAR DE ENERO 2026
    const modelName = "gemini-2.5-flash"; // Este es el modelo activo hoy

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico. MÁXIMO 15 PALABRAS. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', pide Nombre y Correo.\n\nUsuario: ${message}` }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ 
                reply: `🛡️ [FALLO]: El modelo ${modelName} dio error 404. Escriba la palabra LISTA para ver sus opciones reales.` 
            });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: botReply });

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [ERROR CRÍTICO]: " + error.message });
    }
}
