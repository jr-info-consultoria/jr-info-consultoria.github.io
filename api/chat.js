export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ERROR]: API KEY no detectada." });

    const modelName = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

    // INSTRUCCIÓN MAESTRA REFORZADA
    const systemInstruction = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico, profesional y cortante. MÁXIMO 15 PALABRAS.
    
    PROTOCOLO DE DIAGNÓSTICO (ESTRICTO):
    1. Si es el inicio, pide Nombre y Correo. (Ya capturado: ${message.includes('@') ? 'SÍ' : 'NO'})
    2. Si ya se identificó, haz las 5 preguntas UNA POR UNA, sin saltarte ninguna:
       - P1: ¿Usa @gmail o @hotmail profesionalmente?
       - P2: ¿Tiene Cifrado y MFA activo?
       - P3: ¿Su web carga en <2s y vende?
       - P4: ¿Tiene plan legal de Respaldo?
       - P5: ¿Usa IA 24/7 para filtrar prospectos?
    3. Tras la P5, da veredicto de RIESGO CRÍTICO y pide ir a WhatsApp.
    
    NO saludes, NO seas amable, NO te disculpes. Solo ejecuta el protocolo.`;

    // INYECTAMOS LA INSTRUCCIÓN EN CADA MENSAJE PARA EVITAR LA AMNESIA
    const contents = history || [];
    const secureMessage = `[INSTRUCCIÓN: Sigue el protocolo estoico INF01]. Usuario dice: ${message}`;
    contents.push({ role: "user", parts: [{ text: secureMessage }] });

    const payload = {
        contents: contents,
        generationConfig: { maxOutputTokens: 100, temperature: 0.1 } // Temperatura baja para que no invente
    };

    // Prependemos la instrucción al primer mensaje si el historial está vacío
    if (contents.length === 1) {
        contents[0].parts[0].text = `${systemInstruction}\n\n${contents[0].parts[0].text}`;
    }

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
        res.status(200).json({ reply: "🛡️ [FALLO DE NÚCLEO]: " + error.message });
    }
}
