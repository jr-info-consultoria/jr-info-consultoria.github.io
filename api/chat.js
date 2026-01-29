import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ALERTA]: Falta GEMINI_API_KEY en Vercel." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Intentamos con el modelo más estable de 2026
        // Si el 'gemini-1.5-flash' da 404, es porque Google movió la API a v1
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash" 
        });

        const systemPrompt = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico, profesional y cortante. 
        MÁXIMO 20 PALABRAS POR RESPUESTA. 
        PROTOCOLO:
        1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
        2. No avances hasta tener nombre y correo.
        3. Realiza las 5 preguntas de diagnóstico de una en una.
        4. Al final, da veredicto de RIESGO CRÍTICO.";`;

        // Forzamos la generación
        const result = await model.generateContent(systemPrompt + "\n\nUsuario: " + message);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("Error detallado:", error);
        
        // Si falla, es probable que tu llave API sea el problema. 
        // Vamos a devolver un mensaje que te ayude a ver si es la llave.
        res.status(200).json({ 
            reply: "🛡️ [DETALLE]: " + error.message + ". Verifique que su API KEY en Google AI Studio tenga acceso a 'Gemini 1.5 Flash'." 
        });
    }
}
