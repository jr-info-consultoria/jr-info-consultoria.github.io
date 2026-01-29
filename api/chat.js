import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;

    // INSTRUCCIÓN MAESTRA ESTOICA
    const systemPrompt = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y de élite. 
    REGLAS: 
    1. Máximo 20 palabras. 
    2. Si el mensaje es 'PROTOCOL_INIT', pide Nombre y Correo para el reporte.
    3. Si ya se identificó, haz las 5 preguntas de diagnóstico una por una.
    4. Al final, da veredicto de RIESGO CRÍTICO y manda a WhatsApp o blindaje@inf01.com.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([systemPrompt, message]);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Error de protocolo. Reintente." });
    }
}
