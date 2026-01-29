export default async function handler(req, res) {
    // Respuesta directa sin pasar por Google para evitar errores
    const mensajeMantenimiento = "Hola, bienvenido a nuestro departamento de asesoría y ventas. En este momento no le puedo atender debido a actualizaciones en mi memoria estratégica para brindarle un mejor servicio. Estaré disponible tan pronto como sea posible. Saludos cordiales y gracias por preferirnos.";
    
    res.status(200).json({ reply: mensajeMantenimiento });
}
