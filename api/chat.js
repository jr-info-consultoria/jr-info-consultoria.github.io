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
    const identity = "Eres el Consultor Senior de INF01. Tu tono es profesional, experto y humano. Máximo 40 palabras.";

    let prompt = "";
    if (step === 0) {
        prompt = `${identity} Objetivo: Iniciar diagnóstico. Saluda y solicita Nombre y Correo para el reporte confidencial.`;
    } else if (step <= 5) {
        prompt = `${identity} 1. Comenta la respuesta del usuario con criterio experto. 2. Haz la pregunta ${step}: ${questions[step-1]}.`;
    } else {
        prompt = `${identity} Diagnóstico concluido. Informa sobre el RIESGO CRÍTICO y que el informe llegará a su correo pronto.`;
    }

    // PREPARACIÓN DE LA MEMORIA PARA GOOGLE
    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: prompt + "\n\nUsuario dice: " + message }] });

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents, // ENVIAMOS TODA LA MEMORIA
                generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
                // DESACTIVAMOS FILTROS que causan el disco rayado
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
            // Fallback humano para que nunca más salga el mensaje de error de antes
            res.status(200).json({ reply: "🛡️ Entiendo. Continuando con el análisis, ¿podría decirme si usa correos corporativos o gratuitos?" });
        }

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Por favor, reintente." });
    }
}
