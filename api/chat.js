import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "DEBUG: No se detecta la API KEY en Vercel." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = "Eres el AGENTE DE SEGURIDAD de INF01. Responde de forma estoica y corta.";
        
        const result = await model.generateContent([systemPrompt, message]);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        // Esto enviará el error real al log de Vercel
        console.error("DETALLE DEL ERROR:", error);
        res.status(200).json({ reply: "Error de núcleo. Verifique logs en Vercel. Detalle: " + error.message });
    }
}
