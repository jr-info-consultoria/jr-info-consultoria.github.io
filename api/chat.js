import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: "ERROR: Falta la llave de seguridad (API KEY) en el servidor." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemPrompt = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico, profesional y cortante. 
    MÁXIMO 20 PALABRAS. 
    PROTOCOLOS:
    1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
    2. Luego haz las 5 preguntas de diagnóstico una por una.
    3. Al final da veredicto de RIESGO CRÍTICO y pide contactar al Director.";`

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([systemPrompt, message]);
        const response = await result.response;
        res.status(200).json({ reply: response.text() });
    } catch (error) {
        res.status(500).json({ reply: "Error de conexión con el núcleo de IA." });
    }
}
