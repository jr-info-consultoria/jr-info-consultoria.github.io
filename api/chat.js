export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // HOJA DE RUTA PARA LA IA
    const systemPrompt = `Eres el Especialista Senior de INF01. Tono profesional, experto y humano.
    MÁXIMO 35 PALABRAS POR RESPUESTA.
    
    TU MISIÓN: Completar el diagnóstico INF01 analizando el historial:
    1. Identificación: Solicita Nombre y Correo para el reporte.
    2. Pregunta: Uso de correos gratuitos (@gmail).
    3. Pregunta: Cifrado y MFA (Doble Factor).
    4. Pregunta: Velocidad web y conversión.
    5. Pregunta: Protocolo legal de respaldo e IA.
    6. CIERRE: Ya tenemos los datos. Serán enviados al técnico informático quien le contactará vía correo para el diagnóstico completo SIN COSTO adicional.
    
    REGLA DE ORO: Si terminas, añade SIEMPRE al final: [CIERRE_AUTO]`;

    const isStart = !history || history.length === 0;
    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: message }] });

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            // FALLBACK INTELIGENTE: Si la IA falla, el código responde según el momento
            const fallback = isStart 
                ? "Bienvenido a INF01. Iniciaremos su diagnóstico de blindaje 2026. Para el reporte confidencial, ¿me indica su nombre y correo?" 
                : "Entendido. Para avanzar, ¿podría confirmarme si actualmente utiliza correos corporativos o gratuitos para su práctica?";
            res.status(200).json({ reply: fallback });
        }
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Jose, reintente el envío." });
    }
}
