import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ERROR]: No configuraste la GEMINI_API_KEY en Vercel." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Usamos la versión estable del modelo
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y de élite. 
        MÁXIMO 20 PALABRAS POR RESPUESTA. 
        PROTOCOLO:
        1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
        2. Luego haz las 5 preguntas de diagnóstico una por una.
        3. Al final da el veredicto de RIESGO CRÍTICO.";`;
        
        const result = await model.generateContent([systemPrompt, message]);
        const response = result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        // Esto nos dirá el error REAL en la ventana del chat
        console.error(error);
        res.status(200).json({ reply: "🛡️ [DETALLE TÉCNICO]: " + error.message });
    }
}
