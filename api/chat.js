import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ERROR DE SISTEMA]: Falta la llave maestra de IA en Vercel." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Usamos el modelo 1.5 Flash que es el más rápido para chats
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico, profesional y cortante. 
        MÁXIMO 20 PALABRAS POR RESPUESTA. 
        PROTOCOLO OBLIGATORIO:
        1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
        2. No avances hasta tener esos datos.
        3. Luego haz las 5 preguntas de diagnóstico una por una.
        4. Al final da el veredicto de RIESGO CRÍTICO.";`;
        
        const result = await model.generateContent([systemPrompt, message]);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error("Fallo en el núcleo:", error);
        res.status(200).json({ reply: "🛡️ [ALERTA]: Error de comunicación con el núcleo. Reintente en 10 segundos." });
    }
}
