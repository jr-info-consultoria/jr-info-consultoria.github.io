export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // INSTRUCCIÓN MAESTRA: Identidad, Tono y Temas a cubrir.
    const systemPrompt = `Eres el Especialista Senior de INF01. Tu tono es profesional, experto y humano.
    MÁXIMO 35 PALABRAS POR RESPUESTA.
    
    TU MISIÓN: Completar este diagnóstico conversando naturalmente. No seas un robot.
    
    TEMAS A CUBRIR (Analiza la charla para ver qué falta):
    1. Identificación (Nombre y Correo).
    2. Riesgo de usar correos gratuitos (@gmail).
    3. Cifrado y MFA.
    4. Velocidad y conversión web.
    5. Respaldo legal e IA operativa.
    6. CIERRE: Dile que hay RIESGO CRÍTICO y que el informe llegará a su correo pronto.
    
    REGLA DE ORO: Si el usuario saluda o dice algo corto, responde como un humano experto y sigue adelante.`;

    // Preparamos los mensajes: Ponemos la instrucción al puro inicio del historial
    const contents = [];
    
    // Si no hay historia, iniciamos con la instrucción
    if (!history || history.length === 0) {
        contents.push({ role: "user", parts: [{ text: systemPrompt + "\n\nUsuario dice: " + message }] });
    } else {
        // Si ya hay historia, la respetamos y añadimos el mensaje nuevo
        contents.push(...history);
        contents.push({ role: "user", parts: [{ text: message }] });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
                // BLINDAJE CONTRA CENSURA: Evitamos que Google bloquee palabras técnicas
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        // Si la IA responde bien
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: botReply });
        } else {
            // FALLBACK ESTRATÉGICO: Si Google bloquea la respuesta, el bot sigue la charla solo.
            res.status(200).json({ reply: "🛡️ Entiendo. Para avanzar con el diagnóstico de blindaje para su negocio, ¿podría decirme si actualmente usa correos corporativos o gratuitos?" });
        }

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Jose, por favor reintente el envío." });
    }
}
