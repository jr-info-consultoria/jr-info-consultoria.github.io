export default async function handler(req, res) {
    // MENSAJE DE MANTENIMIENTO DE ÉLITE
    const maintenanceMessage = "Bienvenido a INF01. En este momento, nuestra Dirección Estratégica está realizando una actualización de seguridad en los protocolos del Asesor IA para garantizar nuestro estándar de élite. Estaremos operativos nuevamente en 3 horas. Gracias por su comprensión.";
    
    res.status(200).json({ reply: maintenanceMessage });
}
