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

    const step = history ? Math.floor(history.length / 2) : 0;
    const identity = "Eres el Especialista Senior de INF01. Tono profesional y experto. Máximo 35 palabras.";

    const systemPrompt = `${identity} 
    TU MISIÓN: Completar el diagnóstico INF01 en este orden:
    1. Identificación: Solicita Nombre y Correo (Validar que el correo tenga @).
    2. Pregunta: Uso de correos gratuitos.
    3. Pregunta: Cifrado y MFA.
    4. Pregunta: Velocidad web.
    5. Pregunta: Respaldo e IA.
    6. CIERRE: Datos enviados al técnico. Contacto vía correo SIN COSTO. [CIERRE_AUTO]`;

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
            // --- CIRUGÍA DE DESBLOQUEO GPS REFINADA ---
            const isInitTrigger = message.includes("PROTOCOL_INIT");
            
            if (step === 0) {
                if (isInitTrigger) {
                    // Si es el inicio, saludamos SIEMPRE
                    res.status(200).json({ reply: "Bienvenido a INF01. Iniciaremos su diagnóstico de blindaje 2026. Para generar su reporte confidencial, ¿me indica su nombre y correo electrónico?" });
                } else if (!message.includes("@")) {
                    // Si el usuario escribe algo pero no es un correo válido
                    res.status(200).json({ reply: "Para asegurar la entrega de su reporte de blindaje 2026, por favor incluya un nombre y un correo electrónico válido con el símbolo @." });
                } else {
                    // Si puso el correo pero la IA falló, pasamos a la Q1
                    res.status(200).json({ reply: `Excelente. Iniciemos el análisis técnico: ${questions[0]}` });
                }
            } else if (step >= 1 && step <= 5) {
                res.status(200).json({ reply: `Entendido. Sigamos con el diagnóstico: ${questions[step-1]}` });
            } else {
                res.status(200).json({ reply: "Diagnóstico procesado. Los datos han sido enviados al técnico informático para su evaluación gratuita vía correo electrónico. [CIERRE_AUTO]" });
            }
        }
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Reintente el envío." });
    }
}
