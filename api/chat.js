import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ reply: "🛡️ [ERROR]: Llave API no configurada en Vercel." });
    }

    // Lista de modelos a intentar (del más rápido al más potente)
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const systemPrompt = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y profesional. 
            MÁXIMO 20 PALABRAS. 
            PROTOCOLO:
            1. Si recibes 'PROTOCOL_INIT: DIAGNOSTIC_START', di: "Protocolo iniciado. Identifíquese: ¿Nombre y Correo?".
            2. Luego haz las 5 preguntas de diagnóstico una por una.`;

            const result = await model.generateContent(systemPrompt + "\n\nUsuario: " + message);
            const response = await result.response;
            const text = response.text();

            // Si llegamos aquí, el modelo funcionó. Cortamos el bucle.
            return res.status(200).json({ reply: text });

        } catch (error) {
            console.error(`Fallo con ${modelName}:`, error.message);
            // Si es el último modelo de la lista y falla, reportamos el error final
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
                return res.status(200).json({ 
                    reply: "🛡️ [FALLO TOTAL]: Google rechaza la conexión. Detalle: " + error.message + 
                    ". Jose, verifique en Google AI Studio si su API KEY tiene habilitado el 'Billing' o si tiene restricciones de región." 
                });
            }
            // Si no es el último, el bucle sigue al siguiente modelo...
        }
    }
}
