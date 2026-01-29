export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // INSTRUCCIÓN MAESTRA: Identidad y Hoja de Ruta.
    const systemInstruction = `Eres el Especialista Senior de INF01. Tu tono es profesional, experto y humano.
    MÁXIMO 35 PALABRAS POR RESPUESTA.
    
    TU MISIÓN: Completar este diagnóstico conversando naturalmente.
    
    HOJA DE RUTA (Analiza el historial para saber qué sigue):
    1. Identificación: Si no tienes Nombre y Correo, pídalos profesionalmente.
    2. Pregunta 1: Sobre el uso de correos gratuitos (@gmail/@hotmail).
    3. Pregunta 2: Sobre Cifrado y MFA (Doble Factor).
    4. Pregunta 3: Sobre velocidad web (<2s) y ventas.
    5. Pregunta 4: Sobre protocolo legal de respaldo y recuperación.
    6. Pregunta 5: Sobre el uso de IA 24/7 para prospectos.
    7. Cierre: Declara RIESGO CRÍTICO y avisa que el informe llegará a su correo.
    
    REGLA DE ORO: Si el usuario dice algo corto o un saludo, responde como un humano experto y sigue con el diagnóstico. No uses códigos como 'P1'.`;

    // Combinamos la instrucción con el historial para que la IA tenga contexto total
    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: message }] });

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                system_instruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
                // APAGAMOS LOS FILTROS que causan el bloqueo del disco rayado
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
            // Fallback humano por si Google tiene un hipo
            res.status(200).json({ reply: "🛡️ Entiendo. Para seguir con el blindaje de su práctica, ¿podría confirmarme si usa correos corporativos o gratuitos?" });
        }

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Reintente el envío." });
    }
}
