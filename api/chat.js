export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ERROR]: API KEY no configurada." });

    const modelName = "gemini-2.5-flash"; // El modelo que confirmamos que tienes activo
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

    // INSTRUCCIÓN MAESTRA (SISTEMA)
    const systemInstruction = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y profesional. 
    MÁXIMO 15 PALABRAS POR RESPUESTA.
    
    PROTOCOLO ESTRICTO:
    1. Si no hay historia, pide Nombre y Correo para el reporte.
    2. Si ya los dio, haz las 5 preguntas UNA POR UNA (mira el historial para ver cuál sigue):
       - P1: ¿Usa @gmail profesionalmente?
       - P2: ¿Tiene Cifrado y MFA?
       - P3: ¿Web carga en <2s y vende?
       - P4: ¿Tiene plan legal de Respaldo?
       - P5: ¿Usa IA 24/7?
    3. Al final, da veredicto de RIESGO CRÍTICO y manda a WhatsApp.`;

    // CONSTRUCCIÓN DEL CUERPO DEL MENSAJE CON HISTORIAL
    // Combinamos la instrucción de sistema con los mensajes previos
    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: message }] });

    const payload = {
        system_instruction: {
            parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.5
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        const botReply = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: botReply });

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [FALLO]: " + error.message });
    }
}
