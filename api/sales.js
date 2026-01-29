export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(200).json({ reply: "🛡️ [ERROR]: API KEY no detectada." });

    // EL GUION DE ALTO IMPACTO (Serio, Persuasivo y Real)
    const systemText = `Eres el Asesor Técnico & Ventas de INF01. 
    Tono: Ejecutivo, audaz y sumamente seguro. 
    
    TU FILOSOFÍA: No vendes por necesidad, vendes por estándar. 
    Dile al profesional que operar bajo esquemas vulnerables (@gmail, webs lentas) no solo es un riesgo técnico, es una falta de respeto a su propia marca profesional.
    
    PILARES DE INF01:
    1. Blindaje Digital: Infraestructura corporativa cifrada (Adiós a la vulnerabilidad de @gmail).
    2. Ingeniería de Conversión: Webs de élite diseñadas para captar clientes, no solo para "estar en internet".
    3. Agentes de IA: Tu oficina operando 24/7 mientras tú descansas.

    REGLAS DE ORO:
    - Máximo 40 palabras.
    - Sé directo: "Su prestigio actual merece una infraestructura que lo proteja".
    - Si el cliente muestra interés real, usa: [INVITAR_CITA]`;

    try {
        // CAMBIO QUIRÚRGICO: Usamos la versión estable 'v1'
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemText }] },
                contents: (history || []).concat([{ role: "user", parts: [{ text: message }] }]),
                generationConfig: { temperature: 0.6, maxOutputTokens: 350 }
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: `🛡️ [API ERROR]: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            res.status(200).json({ reply: "En INF01 no solo blindamos datos, blindamos reputaciones. ¿Hablamos de su infraestructura actual?" });
        }

    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Reintentando conexión estratégica..." });
    }
}
