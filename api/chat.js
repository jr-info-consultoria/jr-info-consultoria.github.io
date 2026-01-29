import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message, history } = req.body; // Recibimos la historia del chat
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ERROR]: Falta API KEY." });

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `Eres el AGENTE DE SEGURIDAD de INF01. Tono estoico y profesional. 
        MÁXIMO 15 PALABRAS. 
        
        TU MISIÓN PASO A PASO:
        1. Si el chat está vacío o recibes 'PROTOCOL_INIT', di: "Protocolo iniciado. Identifíquese para el reporte: ¿Nombre y Correo?".
        2. Si el usuario ya dio su nombre/correo, empieza con las 5 preguntas una por una:
           - P1: ¿Usa @gmail o @hotmail profesionalmente?
           - P2: ¿Tiene Cifrado y MFA activo?
           - P3: ¿Su web carga en <2s y vende?
           - P4: ¿Tiene plan legal de Respaldo?
           - P5: ¿Usa IA 24/7 para prospectos?
        3. Tras la P5, da veredicto de RIESGO CRÍTICO y pide ir a WhatsApp.
        
        IMPORTANTE: Mira el historial para saber qué pregunta toca. Solo haz UNA pregunta a la vez. No repitas instrucciones internas.`;

        // Enviamos el historial completo para que el bot tenga "memoria"
        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 100 },
        });

        const result = await chat.sendMessage(systemPrompt + "\n\nUsuario dice: " + message);
        const response = await result.response;
        
        res.status(200).json({ reply: response.text() });

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: " + error.message });
    }
}
