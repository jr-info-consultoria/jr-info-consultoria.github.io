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

    // IDENTIDAD REFORZADA: Experto, humano y con autoridad.
    const identity = "Eres el Especialista Senior de INF01. Tu tono es ejecutivo, seguro y conversacional. Eres un experto en ciberseguridad y marketing de élite. No seas un robot; habla como un consultor de alto nivel.";

    let prompt = "";
    if (step === 0) {
        // INTRODUCCIÓN ÁGIL
        prompt = `${identity} Objetivo: Iniciar el diagnóstico gratuito 2026. Si el usuario saluda, responde con cortesía experta y solicita su Nombre y Correo para enviarle el reporte confidencial de riesgos al finalizar. Máximo 30 palabras.`;
    } else if (step <= 5) {
        // RAPPORT Y PREGUNTA TÉCNICA
        prompt = `${identity} 
        1. Comenta la respuesta del usuario con criterio profesional (aporta un dato de valor o validación). 
        2. Luego, introduce con fluidez la pregunta número ${step}: ${questions[step-1]}.
        Instrucción: Que se sienta como una charla de asesoría técnica. Máximo 45 palabras.`;
    } else {
        // CIERRE ESTRATÉGICO
        prompt = `${identity} 
        Diagnóstico concluido. Informa con autoridad que has detectado brechas de RIESGO CRÍTICO. 
        Dile que el "Informe de Vulnerabilidades INF01" está siendo procesado y lo recibirá en su correo electrónico a la brevedad. 
        Explica que el reporte incluye la hoja de ruta y el contacto del Director para el escaneo final. Máximo 35 palabras.`;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt + "\n\nUsuario dice: " + message }] }],
                generationConfig: {
                    temperature: 0.7, // Subimos la temperatura para que sea más natural
                    maxOutputTokens: 200
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        // VALIDACIÓN FLEXIBLE: Si hay respuesta, la damos. Si no, forzamos una respuesta humana.
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: botReply });
        } else {
            // Eliminamos el mensaje de "disco rayado" y ponemos uno que invite a seguir.
            res.status(200).json({ reply: "🛡️ Entendido. Para completar su perfil de seguridad, ¿podría darme un poco más de detalle sobre ese punto o pasar a la siguiente fase?" });
        }

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Por favor, intente enviar su mensaje de nuevo." });
    }
}
