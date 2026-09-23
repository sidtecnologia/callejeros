import React from 'react';
import { BUSINESS_CONFIG_DEFAULTS } from '../config/businessConfig';

export const PrivacyContent = ({
  businessConfig = BUSINESS_CONFIG_DEFAULTS,
}) => {
  const name =
    businessConfig?.name ||
    BUSINESS_CONFIG_DEFAULTS.name;

  const address =
    businessConfig?.address ||
    BUSINESS_CONFIG_DEFAULTS.address ||
    'nuestra sede';

  const phone =
    businessConfig?.phone ||
    businessConfig?.phoneRaw ||
    BUSINESS_CONFIG_DEFAULTS.phone ||
    'nuestras líneas de atención';

  const email =
    businessConfig?.email ||
    BUSINESS_CONFIG_DEFAULTS.email ||
    'correo de contacto';

  return (
    <div className="text-gray-700 leading-relaxed space-y-4">
      <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2">
        1. Responsable del Tratamiento de Datos
      </h2>

      <p>
        El responsable del tratamiento de sus datos personales es{' '}
        <strong>{name}</strong>, con domicilio en {address}. Para ejercer
        sus derechos sobre sus datos, puede contactarnos al teléfono{' '}
        <span className="text-blue-600">{phone}</span> o al correo
        electrónico{' '}
        <span className="text-blue-600">{email}</span>.
      </p>

      <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2">
        2. Datos Recopilados, Finalidad y Transferencia
      </h2>

      <p>
        Recopilamos nombre, teléfono, dirección y detalles de transacción
        para:
      </p>

      <ul className="list-disc pl-5 space-y-1">
        <li>Procesar, despachar y entregar sus pedidos.</li>
        <li>Gestionar cobros e informar el estado del domicilio.</li>
        <li>
          Compartir con domiciliarios encargados del despacho de la orden.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2">
        3. Autorización y Registro
      </h2>

      <p>
        Al marcar la casilla de aceptación en la PWA y confirmar el pedido,
        usted otorga su{' '}
        <strong>
          consentimiento previo, expreso e informado
        </strong>{' '}
        para el tratamiento de sus datos según esta política.
      </p>

      <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2">
        4. Derechos del Titular (Derechos ARCO)
      </h2>

      <p className="text-sm mb-2">
        Conforme a la Ley 1581 de 2012, usted tiene derecho a:
      </p>

      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>
          Conocer, actualizar y rectificar sus datos personales en cualquier
          momento.
        </li>

        <li>
          Solicitar la supresión de sus datos o revocar la autorización
          enviando una solicitud a {email}.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-green-700 border-b-2 border-gray-100 pb-2">
        5. Seguridad de la Información
      </h2>

      <p>
        Implementamos medidas tecnológicas de seguridad y almacenamiento
        local seguro en la PWA para evitar el acceso no autorizado a su
        información.
      </p>
    </div>
  );
};

export default PrivacyContent;