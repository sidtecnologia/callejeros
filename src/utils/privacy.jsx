import React from 'react';

export const PrivacyContent = () => {
    return (
        <div className="text-gray-700 leading-relaxed">
        <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2 mb-4">
        1. Responsable del Tratamiento de Datos
        </h2>
        <p className="mb-4">
        El responsable del tratamiento de sus datos personales es <strong>El Fogón Socorrano</strong>, con domicilio en El Socorro, Santander, Colombia. Para cualquier consulta, contáctenos en: <span className="text-blue-600 underline">tu_correo@ejemplo.com</span>.
        </p>

        <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2 mb-4">
        2. Datos Recopilados y Finalidad
        </h2>
        <p className="mb-2">Recopilamos los siguientes datos:</p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
        <li><strong>Nombre:</strong> Para identificar su pedido.</li>
        <li><strong>Dirección:</strong> Para el envío de su pedido.</li>
        <li><strong>Detalles del pedido:</strong> Productos, cantidades y precios.</li>
        <li><strong>Método de pago:</strong> Para la gestión de la transacción.</li>
        </ul>

        <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2 mb-4">
        3. Aceptación de la Política de Datos
        </h2>
        <p className="mb-4">
        Al marcar la casilla y finalizar su pedido, usted otorga su <strong>consentimiento inequívoco</strong> para el tratamiento de sus datos.
        </p>

        <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2 mb-4">
        4. Derechos del Titular de los Datos
        </h2>
        <ul className="list-disc pl-5 mb-4 space-y-1 text-sm">
        <li>Conocer, actualizar y rectificar sus datos personales.</li>
        <li>Solicitar prueba de la autorización otorgada.</li>
        <li>Revocar la autorización o solicitar la supresión de los datos.</li>
        </ul>

        <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2 mb-4">
        5. Seguridad de la Información
        </h2>
        <p>
        Adoptamos medidas técnicas y administrativas para garantizar la seguridad de sus datos, evitando su uso no autorizado.
        </p>
        </div>
    );
};

export default PrivacyContent;
