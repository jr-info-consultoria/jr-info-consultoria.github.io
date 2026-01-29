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
    const identity = "Eres el Especialista de INF01. Tono ejecutivo y directo.";

    let prompt = "";
    if (step === 0) {
        prompt = `${identity} Saluda y solicita Nombre y Correo para el reporte confidencial.`;
    } else if (step <= 5) {
        // Blindaje contra 'undefined': buscamos la pregunta exacta
        const currentQ = questions[step - 1];
        prompt = `${identity} 1. Valida brevemente la respuesta anterior. 2. Haz la pregunta: ${currentQ}.`;
    } else {
        // CIERRE SOLICITADO POR EL DIRECTOR
        prompt = `${identity} Diagnóstico concluido. Informa que los datos han sido recolectados y enviados al técnico informático. Dile que el técnico le contactará vía correo para el diagnóstico completo SIN COSTO adicional. Finaliza con: [SISTEMA_CIERRE]`;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: (history || []).concat([{ role: "user", parts: [{ text: prompt + "\n\nUsuario: " + message }] }]),
                generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        let botReply = data.candidates[0].content.parts[0].text;
        
        res.status(200).json({ reply: botReply });

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Reintente." });
    }
}
