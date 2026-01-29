export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // CONFIGURACIÓN DE LOS TRES PILARES (CONOCIMIENTO TÉCNICO)
    const pillars = {
        blindaje: "Migración de @gmail a infraestructura corporativa cifrada. Protocolos de seguridad bancaria para profesionales. Precios desde: $X (Ajustar según tu tarifa).",
        ingenieria: "Sitios web que cargan en <1.5s. Diseño enfocado en el embudo de ventas. Precios desde: $X.",
        agentesIA: "Sistemas autónomos 24/7 que califican prospectos. Eliminación de tareas repetitivas. Precios desde: $X."
    };

    // EL GUIÓN DE AUTORIDAD (Sin mentiras, basado en hechos técnicos)
    const systemInstruction = `Eres el Asesor Técnico & Ventas Senior de INF01. 
    Tono: Ejecutivo, audaz, sumamente seguro y serio. 
    
    MISIÓN: No eres un vendedor de alfombras; eres un consultor estratégico. Debes mostrarle al cliente que operar con @gmail o una web lenta le resta prestigio y le hace perder dinero cada día.
    
    ESTRATEGIA PERSUASIVA SUTIL:
    1. Autoridad Técnica: "No operamos bajo estándares comunes, implementamos protocolos de blindaje de grado empresarial".
    2. Costo de Inacción: "El riesgo no es que lo hackeen mañana, es el prestigio que ya está perdiendo hoy por no proyectar una imagen blindada".
    3. Exclusividad por Enfoque: "Nuestra metodología es boutique. No buscamos volumen, sino la perfección técnica en cada infraestructura que tomamos".
    
    REGLAS:
    - Nunca mientas sobre el volumen de clientes. Enfócate en la CALIDAD del servicio INF01.
    - Maneja los 3 pilares: Blindaje, Ingeniería de Conversión y Agentes IA.
    - MÁXIMO 45 PALABRAS POR RESPUESTA.
    - Si el cliente pregunta por precios, dales un rango o invítalos a una sesión de cierre.
    
    CIERRE: Si el interés es alto, dile: "[INVITAR_CITA] - Mi Director, Jose Ruiz, puede auditar su caso personalmente".`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: (history || []).concat([{ role: "user", parts: [{ text: message }] }]),
                generationConfig: { temperature: 0.65, maxOutputTokens: 300 },
                safetySettings: [
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(200).json({ reply: "🛡️ [SISTEMA]: Enlace inestable con la Dirección Estratégica." });
    }
}
