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

    // Cálculo dinámico para evitar el error 'undefined'
    const step = history ? Math.floor(history.length / 2) : 0;
    const identity = "Eres el Especialista Senior de INF01. Tu tono es profesional, experto y humano. Máximo 40 palabras.";

    let prompt = "";
    if (step === 0) {
        prompt = `${identity} Saluda cordialmente y solicita Nombre y Correo para iniciar el diagnóstico y enviarle el reporte confidencial final.`;
    } else if (step <= 5) {
        const currentQ = questions[step - 1];
        prompt = `${identity} 1. Comenta brevemente la respuesta anterior con autoridad. 2. Haz la pregunta: ${currentQ}. No uses códigos como P1 o P2.`;
    } else {
        // CIERRE ESTRATÉGICO SOLICITADO
        prompt = `${identity} Diagnóstico concluido. Informa que ya tenemos los datos necesarios y serán enviados al técnico informático, quien contactará al usuario vía correo para evaluar el diagnóstico completo SIN COSTO adicional. Finaliza con la etiqueta: [CIERRE_SISTEMA]`;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: (history || []).concat([{ role: "user", parts: [{ text: prompt + "\n\nUsuario dice: " + message }] }]),
                generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
                // BLINDAJE CONTRA CENSURA: Evita el bucle de "amplíe su respuesta"
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
            // Fallback para evitar el disco rayado si Google falla
            res.status(200).json({ reply: "Entendido. Para su seguridad, ¿podría confirmarme si cuenta con MFA o doble factor activo?" });
        }
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Reintente el envío." });
    }
}
