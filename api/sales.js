export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ERROR]: La API KEY no está configurada en Vercel." });
    }

    const systemText = `Eres el Asesor Técnico & Ventas de INF01. Tono: Ejecutivo y serio.
    MISIÓN: Mostrar el costo de oportunidad de no tener blindaje digital.
    PILARES: 1. Blindaje de correos. 2. Ingeniería Web. 3. Agentes de IA.
    REGLA: Máximo 40 palabras. No inventes datos. Si hay interés real usa: [INVITAR_CITA]`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemText }] },
                contents: (history || []).concat([{ role: "user", parts: [{ text: message }] }]),
                generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
            })
        });

        const data = await response.json();

        // Si Google nos devuelve un error específico, lo mostramos para saber qué pasa
        if (data.error) {
            return res.status(200).json({ reply: `🛡️ [API ERROR]: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: botReply });
        } else {
            res.status(200).json({ reply: "Entiendo su consulta. En INF01 protegemos su prestigio profesional con tecnología de élite. ¿Qué área le gustaría optimizar hoy?" });
        }

    } catch (error) {
        // Este es el último recurso si todo falla
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Error de conexión interna. Jose, por favor revisa que el archivo se llame sales.js y esté en /api." });
    }
}
