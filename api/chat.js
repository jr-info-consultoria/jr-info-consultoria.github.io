export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `Eres el Especialista Senior de INF01. Tono profesional y experto.
    MÁXIMO 35 PALABRAS POR RESPUESTA.
    
    TU MISIÓN: Completar el diagnóstico INF01 en este orden:
    1. Identificación: Solicita Nombre y Correo. No avances si el correo no tiene "@".
    2. Pregunta: Uso de correos gratuitos (@gmail).
    3. Pregunta: Cifrado y MFA (Doble Factor).
    4. Pregunta: Velocidad web y conversión.
    5. Pregunta: Protocolo legal de respaldo e IA.
    6. CIERRE: Confirma que el técnico informático contactará al usuario para el diagnóstico completo SIN COSTO adicional.
    
    Al finalizar el punto 6, añade SIEMPRE: [CIERRE_AUTO]`;

    const isStart = !history || history.length === 0;
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
            // --- CIRUGÍA DE DESBLOQUEO: Si la IA falla pero hay un correo, forzamos el avance ---
            if (message.includes("@")) {
                res.status(200).json({ reply: "Excelente, correo registrado. Iniciemos el análisis técnico: ¿Utiliza actualmente correos gratuitos como @gmail o @hotmail para su práctica profesional?" });
            } else {
                const fallback = isStart 
                    ? "Bienvenido a INF01. Para su reporte confidencial 2026, ¿me indica su nombre y correo electrónico válido?" 
                    : "Para continuar, asegúrese de ingresar un correo electrónico válido (con @) para que nuestro sistema pueda procesar su diagnóstico.";
                res.status(200).json({ reply: fallback });
            }
        }
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Jose, reintente el envío." });
    }
}
