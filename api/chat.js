export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ALERTA]: Falta la llave API en Vercel." });
    }

    // MODELO CONFIRMADO EN TU LISTA DE 2026
    const modelName = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico, profesional y cortante. 
                MÁXIMO 15 PALABRAS POR RESPUESTA. 
                PROTOCOLO OBLIGATORIO:
                1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
                2. NO AVANCES hasta tener el nombre y el correo.
                3. Una vez identificado, realiza las 5 preguntas de diagnóstico una por una:
                   - ¿Usa @gmail o @hotmail?
                   - ¿Tiene Cifrado y MFA?
                   - ¿Web carga en <2s y vende?
                   - ¿Plan legal de Respaldo?
                   - ¿Usa IA 24/7?
                4. Tras la respuesta 5, da veredicto de RIESGO CRÍTICO y manda a WhatsApp.
                
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
        res.status(200).json({ 
            reply: "🛡️ [SISTEMA]: " + error.message 
        });
    }
}
