export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // INSTRUCCIÓN MAESTRA: Personalidad y Hoja de Ruta Clara
    const systemPrompt = `Eres el Especialista Senior de INF01. Tono ejecutivo y experto. 
    MÁXIMO 35 PALABRAS POR RESPUESTA.
    
    TU MISIÓN: Completar este diagnóstico. Revisa el historial para saber qué falta:
    1. Identificación (Nombre y Correo).
    2. Pregunta sobre correos gratuitos (@gmail).
    3. Pregunta sobre Cifrado y MFA.
    4. Pregunta sobre velocidad web (<2s) y ventas.
    5. Pregunta sobre respaldo legal e IA.
    6. CIERRE FINAL: Informa que los datos van al técnico para un diagnóstico completo SIN COSTO adicional vía correo. 
    
    IMPORTANTE: Si ya respondiste el paso 6, termina SIEMPRE con la palabra: [CIERRE_SISTEMA]`;

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
                generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
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
            // Fallback para romper el bucle si Google falla
            res.status(200).json({ reply: "Entendido. Para su reporte de blindaje INF01, ¿me confirma si usa MFA o doble factor de seguridad?" });
        }
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable. Reintente el envío." });
    }
}
