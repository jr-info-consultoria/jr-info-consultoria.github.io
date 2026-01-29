export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ERROR]: API KEY no detectada en el servidor." });

    const systemText = `Eres el Asesor Técnico & Ventas de INF01. Tono: Ejecutivo, audaz y sumamente seguro. 
    Tu misión es mostrar que el @gmail y las webs lentas son un riesgo reputacional. 
    PILARES: 1. Blindaje Digital. 2. Ingeniería de Conversión. 3. Agentes de IA.
    REGLA: Máximo 40 palabras. Si hay interés real usa: [INVITAR_CITA]`;

    try {
        // --- CIRUGÍA DE RUTA ESTABLE V1 ---
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemText }] },
                contents: (history || []).concat([{ role: "user", parts: [{ text: message }] }]),
                generationConfig: { 
                    temperature: 0.7, 
                    maxOutputTokens: 350 
                }
            })
        });

        const data = await response.json();

        // Escáner de errores de Google
        if (data.error) {
            return res.status(200).json({ 
                reply: `🛡️ [DEBUG]: Intentando conectar vía V1. Error de Google: ${data.error.message}` 
            });
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            res.status(200).json({ reply: "En INF01 blindamos su prestigio con estándares de élite. ¿Qué área de su práctica desea asegurar hoy?" });
        }

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Error de red. Jose, verifica que el despliegue en Vercel haya terminado." });
    }
}
