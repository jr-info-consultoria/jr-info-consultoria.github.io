export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const questions = [
        "¿Utiliza actualmente correos gratuitos como @gmail o @hotmail para su práctica profesional?",
        "¿Cuenta con sistemas de Cifrado y MFA (Autenticación de Doble Factor) activos en sus accesos críticos?",
        "¿Su sitio web actual carga en menos de 2 segundos y está diseñado para convertir visitantes en clientes?",
        "¿Tiene un protocolo legal y técnico de respaldo para recuperar sus datos ante un posible ataque?",
        "¿Implementa Agentes de IA 24/7 que filtren y califiquen a sus prospectos automáticamente?"
    ];

    const isInitTrigger = message.includes("PROTOCOL_INIT");
    const step = history ? Math.floor(history.length / 2) : 0;
    
    // 🛡️ CIRUGÍA 1: VALIDACIÓN DE HIERRO (Fuera de la IA)
    // Buscamos si ya existe un correo con @ en el historial o en el mensaje actual
    const hasEmailProvided = (history && history.some(h => h.parts[0].text.includes("@"))) || message.includes("@");

    // Si no es el inicio y no tenemos un correo válido aún, bloqueamos el avance
    if (!isInitTrigger && !hasEmailProvided) {
        return res.status(200).json({ 
            reply: "Para asegurar la entrega de su reporte de blindaje 2026, por favor incluya un nombre y un correo electrónico válido con el símbolo @." 
        });
    }

    // 🛡️ CIRUGÍA 2: SEGURO DE CIERRE (Evita el reciclaje)
    const alreadyClosed = history && history.some(h => h.parts[0].text.includes("[CIERRE_AUTO]"));
    if (alreadyClosed) {
        return res.status(200).json({ reply: "Su sesión de diagnóstico ha concluido con éxito. El técnico informático ya ha recibido su solicitud. [CIERRE_AUTO]" });
    }

    const identity = "Eres el Especialista Senior de INF01. Tono profesional y experto. Máximo 35 palabras.";
    const systemPrompt = `${identity} 
    TU MISIÓN: Completar el diagnóstico INF01.
    1. Identificación: Ya validamos el correo. Saluda y agradece los datos.
    2. Preguntas técnicas: Haz una a la vez según el historial.
    3. Cierre: Informa que los datos van al técnico informático para el diagnóstico SIN COSTO. Termina con [CIERRE_AUTO]`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: (history || []).concat([{ role: "user", parts: [{ text: message }] }]),
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
            // Fallback dinámico por si falla la IA
            const fallback = step >= 1 && step <= 5 ? `Entendido. Sigamos: ${questions[step-1]}` : "Bienvenido a INF01. Para iniciar su blindaje, ¿me indica su nombre y correo?";
            res.status(200).json({ reply: fallback });
        }
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Reintente el envío." });
    }
}
