export default async function handler(req, res) {
  // Configuración de cabeceras para evitar bloqueos (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "Protocolo INF01: Solo se aceptan mensajes POST." });
  }

  try {
    const { message } = req.body;
    // Respuesta de prueba rápida para verificar conexión
    return res.status(200).json({ 
      reply: "Sistema INF01 en línea. Recibí tu mensaje: " + message 
    });
  } catch (error) {
    return res.status(500).json({ reply: "Error interno en el núcleo de INF01." });
  }
}
