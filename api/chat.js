import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ALERTA]: Llave API no detectada en Vercel." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Usamos el ID más compatible para 2026
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y profesional. 
        MÁXIMO 20 PALABRAS. 
        PROTOCOLO:
        1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
        2. No avances hasta tener nombre y correo.
        3. Realiza las 5 preguntas de diagnóstico de una en una.
        4. Al final, da veredicto de RIESGO CRÍTICO y envía a WhatsApp.";`;

        // Generamos el contenido con un timeout de seguridad
        const result = await model.generateContent(systemPrompt + " Usuario dice: " + message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        // Si vuelve a fallar, este código nos dirá si es el nombre del modelo
        console.error(error);
        res.status(200).json({ reply: "🛡️ [FALLO DE NÚCLEO]: " + error.message });
    }
}
