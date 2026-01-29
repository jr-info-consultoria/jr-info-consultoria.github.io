export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const questions = [
        "¿Utiliza correos gratuitos (@gmail/@hotmail) para su práctica profesional?",
        "¿Tiene implementado Cifrado y MFA (Doble Factor) en todos sus accesos?",
        "¿Su sitio web carga en menos de 2 segundos y está optimizado para ventas?",
        "¿Cuenta con un protocolo legal de respaldo y recuperación ante desastres?",
        "¿Utiliza Agentes de IA 24/7 para calificar prospectos y cerrar citas?"
    ];

    // Contamos cuántas interacciones reales han ocurrido para saber qué pregunta toca
    const step = history ? Math.floor(history.length / 2) : 0;

    let prompt = "";
    if (step === 0) {
        prompt = "Eres el Agente de Seguridad INF01. Protocolo: Pide Nombre y Correo de forma estoica. Máximo 15 palabras.";
    } else if (step <= 5) {
        prompt = `Eres el Agente de Seguridad INF01. El usuario ya se identificó. Haz ÚNICAMENTE la pregunta número ${step}: ${questions[step-1]}. No saludes, ve directo al punto. Máximo 20 palabras.`;
    } else {
        prompt = "Eres el Agente de Seguridad INF01. Diagnóstico terminado. Declara RIESGO CRÍTICO por vulnerabilidades detectadas y ordena contactar al Director por WhatsApp. Máximo 20 palabras.";
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt + "\n\nUsuario dice: " + message }] }]
            })
        });

        const data = await response.json();
        const botReply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: botReply });
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Error de enlace. Reintente." });
    }
}
