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
    // Contamos cuántas respuestas ha dado el usuario realmente
    const userMessages = history ? history.filter(h => h.role === "user").length : 0;
    const step = isInitTrigger ? 0 : userMessages;

    // 🛡️ VALIDACIÓN DE CORREO (Paso 1 real)
    const hasEmailInHistory = history && history.some(h => h.parts[0].text.includes("@"));
    const hasEmailInMessage = message.includes("@");

    if (!isInitTrigger && step === 1 && !hasEmailInHistory && !hasEmailInMessage) {
        return res.status(200).json({ 
            reply: "Para asegurar su reporte de blindaje 2026, por favor incluya un nombre y un correo electrónico válido con el símbolo @." 
        });
    }

    // 🛡️ LÓGICA DE CIERRE (Paso final)
    if (step > 5) {
        return res.status(200).json({ 
            reply: "Perfecto, Jose. Ya tenemos los datos necesarios. Estos serán enviados a nuestro técnico informático, quien se pondrá en contacto con usted vía correo electrónico para evaluar el diagnóstico completo SIN COSTO adicional. Muchas gracias por confiar en INF01. [CIERRE_AUTO]" 
        });
    }

    const identity = "Eres el Especialista Senior de INF01. Tono profesional, ejecutivo y experto. Máximo 40 palabras.";
    const systemPrompt = `${identity} 
    Sigue este orden:
    - Si el usuario dio su nombre/correo, agradécele y lanza la Pregunta 1: ${questions[0]}
    - Si ya respondió preguntas, lanza la siguiente según el historial: ${questions[step-1] || questions[4]}
    - Si es la última respuesta, despídete formalmente mencionando al técnico y el diagnóstico gratuito.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: (history || []).concat([{ role: "user", parts: [{ text: message }] }]),
                generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            // Fallback manual si Gemini se queda mudo
            if (step === 0) reply = "Bienvenido a INF01. Para iniciar su blindaje, ¿me indica su nombre y correo?";
            else if (step <= 5) reply = `Entendido. Sigamos: ${questions[step-1]}`;
            else reply = "Diagnóstico concluido. Nuestro técnico le contactará pronto vía correo. [CIERRE_AUTO]";
        }

        res.status(200).json({ reply });
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Reintente." });
    }
}
