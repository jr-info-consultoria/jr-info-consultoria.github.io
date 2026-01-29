export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ERROR]: API KEY no configurada." });

    const modelName = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

    // INSTRUCCIÓN MAESTRA (SISTEMA)
    const systemInstruction = `Instrucción de Sistema: Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y profesional. MÁXIMO 15 PALABRAS. 
    PROTOCOLO:
    1. Si es el inicio, pide Nombre y Correo.
    2. Si ya los dio, haz las 5 preguntas una a una (P1: @gmail, P2: Cifrado/MFA, P3: Web <2s, P4: Respaldo, P5: IA 24/7).
    3. Al final, da veredicto de RIESGO CRÍTICO.`;

    // Si es la primera interacción, inyectamos la instrucción al inicio
    let currentMessage = message;
    if (!history || history.length === 0) {
        currentMessage = `${systemInstruction}\n\nMENSAJE INICIAL DEL USUARIO: ${message}`;
    }

    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: currentMessage }] });

    const payload = {
        contents: contents,
        generationConfig: {
            maxOutputTokens: 150,
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
        res.status(200).json({ reply: "🛡️ [DETALLE]: " + error.message });
    }
}
