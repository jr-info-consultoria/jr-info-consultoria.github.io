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

    // IDENTIDAD: Consultor Senior INF01 - Profesional, empático y experto.
    const identity = "Eres el Especialista Senior de INF01. Tu tono es ejecutivo, seguro y conversacional. No eres un bot; eres un experto en ciberseguridad y marketing de élite hablando con un cliente potencial.";

    let prompt = "";
    if (step === 0) {
        prompt = `${identity} Objetivo: Iniciar el diagnóstico gratuito 2026 de forma ágil. Instrucción: Saluda brevemente, valida que la seguridad es el pilar del éxito y solicita Nombre y Correo para enviarle su reporte confidencial de riesgos al finalizar. Sé directo pero elegante. Máximo 30 palabras.`;
    } else if (step <= 5) {
        prompt = `${identity} 1. Primero, analiza la respuesta del usuario y haz un comentario breve (máximo 10 palabras) que demuestre tu autoridad y empatía sobre el tema. 2. Luego, introduce con fluidez la pregunta número ${step}: ${questions[step-1]}. Instrucción: Que se sienta como una charla de asesoría, no como un interrogatorio. Máximo 40 palabras en total.`;
    } else {
        prompt = `${identity} Diagnóstico concluido. Informa con autoridad que has detectado brechas de RIESGO CRÍTICO que comprometen su seguridad. Dile que el "Informe de Vulnerabilidades INF01" está siendo procesado y lo recibirá en su correo electrónico a la brevedad. Menciona que el reporte incluye la hoja de ruta técnica y el contacto directo del Director para coordinar el escaneo final. Máximo 35 palabras.`;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt + "\n\nUsuario dice: " + message }] }],
                // INYECCIÓN DE SEGURIDAD: Evita que Google bloquee términos técnicos de ciberseguridad
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        // VALIDACIÓN QUIRÚRGICA: Verificamos que la respuesta exista antes de enviarla
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: botReply });
        } else {
            // Si Google bloquea la respuesta o viene vacía, lanzamos un mensaje controlado
            res.status(200).json({ reply: "🛡️ [AVISO]: Protocolo de seguridad INF01 activo. Por favor, amplíe un poco más su respuesta técnica para continuar." });
        }

    } catch (error) {
        // Reporte de error detallado para saber qué cable se soltó
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Detalle técnico: " + error.message });
    }
}
