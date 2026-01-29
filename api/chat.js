export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // INSTRUCCIÓN MAESTRA: Personalidad, Objetivos y Hoja de Ruta.
    const systemInstruction = `Eres el Consultor Senior de INF01. Tu tono es ejecutivo, experto y empático.
    MÁXIMO 40 PALABRAS POR RESPUESTA.
    
    TU MISIÓN: Completar este diagnóstico conversando con el cliente.
    
    HOJA DE RUTA (Síguela analizando el historial):
    1. Identificación: Si no tienes el Nombre y Correo, pídalos profesionalmente.
    2. Pregunta 1: Sobre el uso de correos @gmail/@hotmail profesionales.
    3. Pregunta 2: Sobre Cifrado y MFA (Doble Factor).
    4. Pregunta 3: Sobre velocidad web (<2s) y conversión de ventas.
    5. Pregunta 4: Sobre protocolo legal de respaldo y recuperación.
    6. Pregunta 5: Sobre el uso de IA 24/7 para prospectos.
    7. Cierre: Informa RIESGO CRÍTICO y que el reporte llegará a su correo pronto.
    
    REGLA DE ORO: Si el usuario saluda o dice algo fuera de tema, responde como un humano experto y retoma el diagnóstico con suavidad. No seas un robot de cuestionario.`;

    // Preparamos el flujo de mensajes
    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: message }] });

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: contents,
                generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: botReply });
        } else {
            // Fallback humano por si Google se bloquea
            res.status(200).json({ reply: "🛡️ Entiendo ese punto. Para avanzar con su blindaje profesional, ¿podría decirme si actualmente usa correos gratuitos para su negocio?" });
        }

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Jose, por favor reintente el envío." });
    }
}
