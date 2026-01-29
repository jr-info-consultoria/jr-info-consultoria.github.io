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

    // INSTRUCCIÓN DE IDENTIDAD: Experto en Blindaje Digital, Ingeniería de Conversión y Agentes IA.
    const identity = "Eres el Consultor Senior de INF01. Tu tono es profesional, experto y empático. No eres un bot de cuestionario, eres un especialista conversando con otro profesional.";

    let prompt = "";
    if (step === 0) {
        prompt = `${identity} Objetivo: Iniciar el diagnóstico gratuito. Valida la importancia de la seguridad y pide amablemente su Nombre Completo y Correo para enviarle el reporte final.`;
    } else if (step <= 5) {
        // Aquí le pedimos a la IA que ANALICE la respuesta anterior antes de lanzar la siguiente pregunta.
        prompt = `${identity} 
        1. Primero, comenta brevemente de forma profesional y experta sobre lo que el usuario acaba de responder (aporta valor).
        2. Luego, introduce con naturalidad y haz la pregunta número ${step}: ${questions[step-1]}.
        No uses códigos como 'P1', que se sienta como una transición fluida entre expertos. Máximo 35 palabras.`;
    } else {
        prompt = `${identity} 
        Diagnóstico concluido. Basado en las respuestas, confirma que has detectado vulnerabilidades que ponen en RIESGO CRÍTICO su reputación. 
        Dile que el reporte detallado está listo y que debe contactar al Director Jose Ruiz García por WhatsApp para el escaneo final de blindaje.`;
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
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace de seguridad temporalmente inestable. Reintente." });
    }
}
