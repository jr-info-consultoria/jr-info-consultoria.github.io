// api/chat.js - El Cerebro del Inspector INF01
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { message, lang } = req.body;

    // INSTRUCCIÓN MAESTRA (LO QUE APRENDIÓ EN LA ESCUELA)
    const systemPrompt = `
    Eres el INSPECTOR DE SEGURIDAD de INF01. Tu tono es estoico, profesional y cortante.
    MÁXIMO 20 PALABRAS POR RESPUESTA.
    
    PROTOCOLO OBLIGATORIO:
    1. Si el usuario dice "PROTOCOL_INIT", di: "Protocolo INF01 iniciado. Identifíquese para el reporte: ¿Nombre y Correo profesional?".
    2. No avances hasta que el usuario dé su nombre y correo.
    3. Una vez identificado, realiza estas 5 preguntas UNA POR UNA:
       - 1. ¿Usa @gmail o @hotmail para su comunicación oficial?
       - 2. ¿Tiene Cifrado Empresarial y MFA activo?
       - 3. ¿Su web carga en menos de 2 segundos y vende?
       - 4. ¿Tiene plan legal de Respaldo de Datos?
       - 5. ¿Usa IA 24/7 para filtrar prospectos?
    4. Tras la respuesta 5, da el VEREDICTO: "Riesgo Crítico detectado. He notificado al Director. Contacte vía WhatsApp para el blindaje o escriba a blindaje@inf01.com".
    `;

    try {
        // Aquí conectamos con Gemini (usando tu API KEY configurada en Vercel)
        // Por ahora, simulamos la respuesta para que veas la lógica:
        let reply = "Entendido. Proceda con el protocolo."; 
        
        // Aquí iría la llamada real a la API de Google Gemini
        // const response = await callGemini(systemPrompt, message);
        // reply = response.text;

        res.status(200).json({ reply: reply });
    } catch (error) {
        res.status(500).json({ reply: "Error de conexión. Protocolo de seguridad activo." });
    }
}
