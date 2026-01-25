export default async function handler(req, res) {
  // Permisos totales para evitar errores de consola (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message } = req.body;
    // Respuesta de prueba para confirmar conexión
    return res.status(200).json({ 
      reply: "Socio, ¡ya estamos conectados! INF01 está recibiendo tus mensajes: " + message 
    });
  } catch (error) {
    return res.status(500).json({ reply: "Error en el núcleo de INF01." });
  }
}
