export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ERROR]: API KEY no detectada." });

    // 1. DEFINICIÓN DE LA HOJA DE RUTA (La IA la usará para guiarse)
    const systemInstruction = `Eres el Especialista Senior de INF01. Tu tono es profesional, experto y humano. No eres un bot de cuestionario.
    
    TU MISIÓN: Completar este diagnóstico conversando. Analiza el historial para saber qué paso sigue:
    PASO 1: Identificación (Nombre y Correo).
    PASO 2: Pregunta sobre correos gratuitos (@gmail/@hotmail).
    PASO 3: Pregunta sobre Cifrado y MFA (Doble Factor).
    PASO 4: Pregunta sobre velocidad web (<2s) y ventas.
    PASO 5: Pregunta sobre respaldo legal e IA operativa.
    CIERRE: Informa RIESGO CRÍTICO y que el informe llegará a su correo.

    REGLAS:
    - Comenta brevemente la respuesta del usuario antes de pasar a la siguiente pregunta.
    - MÁXIMO 35 PALABRAS por respuesta.
    - Si el usuario se desvía, retoma el diagnóstico con elegancia.`;

    // 2. PREPARACIÓN DEL HISTORIAL (Sin cálculos matemáticos que se rayen)
    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: message }] });

    try {
        // Usamos v1beta para activar la instrucción de sistema real
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 250
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: botReply });
        } else {
            // Fallback si Google se bloquea
            res.status(200).json({ reply: "🛡️ Entiendo su punto. Para continuar con el blindaje de su práctica, ¿podría confirmarme si usa correos corporativos o gratuitos?" });
        }

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Jose, por favor reintente el envío." });
    }
}
