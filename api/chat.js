export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ALERTA]: Error de llave." });

    const modelName = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

    // INSTRUCCIÓN MAESTRA REFINADA (EVITA EL ERROR "P1")
    const systemInstruction = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y directo. 
    MÁXIMO 25 PALABRAS. 

    TU MISIÓN: Completar este diagnóstico sin desviarte:
    1. Si no hay datos previos, di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
    2. Si ya se identificó, haz UNA de estas preguntas según el historial:
       - ¿Usa cuentas de @gmail o @hotmail para su práctica profesional?
       - ¿Cuenta con sistemas de Cifrado y MFA (Autenticación de dos pasos) activos?
       - ¿Su sitio web carga en menos de 2 segundos y genera ventas reales?
       - ¿Tiene un protocolo legal de respaldo y recuperación de datos ante ataques?
       - ¿Implementa Agentes de IA 24/7 para filtrar y calificar sus prospectos?
    3. Al finalizar, declara "RIESGO CRÍTICO DETECTADO" y solicita contacto vía WhatsApp.

    REGLA DE ORO: No digas "P1" o "P2". Haz la pregunta completa y clara. No saludes.`;

    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: `[Sigue el protocolo INF01]. Usuario dice: ${message}` }] });

    const payload = {
        contents: contents,
        generationConfig: { maxOutputTokens: 150, temperature: 0.1 }
    };

    // Inyectamos la instrucción maestra siempre al inicio del flujo
    if (contents.length > 0) {
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
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Reintente en 5 segundos." });
    }
}
