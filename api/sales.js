export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ERROR]: API KEY no configurada en el servidor." });

    const systemInstruction = `Eres el Asesor Técnico & Ventas Senior de INF01. 
    Tono: Ejecutivo, audaz, sumamente seguro y serio. 
    
    MISIÓN: Eres un consultor estratégico. Debes mostrarle al cliente que operar con @gmail o una web lenta le resta prestigio y le hace perder dinero cada día.
    
    PILARES INF01:
    1. Blindaje: Migración a infraestructura corporativa cifrada.
    2. Ingeniería: Webs de alta velocidad (<1.5s) y conversión.
    3. Agentes IA: Automatización de ventas 24/7.

    REGLAS:
    - No inventes clientes. Enfócate en la CALIDAD técnica de INF01.
    - MÁXIMO 40 PALABRAS POR RESPUESTA.
    - Si el interés es alto, usa la señal: [INVITAR_CITA]`;

    try {
        // Cambiamos a 1.5-flash para asegurar estabilidad total
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: (history || []).concat([{ role: "user", parts: [{ text: message }] }]),
                generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            res.status(200).json({ reply: "Entiendo perfectamente. En INF01 nos enfocamos en que su infraestructura proyecte el éxito de su práctica profesional. ¿Qué área le gustaría blindar primero?" });
        }
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Reintentando conexión con la Dirección Estratégica..." });
    }
}
