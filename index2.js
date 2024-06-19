const express = require('express');
const axios = require('axios');
const { URLSearchParams } = require('url');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Configurar morgan para registrar detalles de las solicitudes HTTP en la consola
app.use(morgan('dev'));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public2')));

// Ruta para dar de alta a un profesional
app.post('/alta-profesional', async (req, res) => {
    const { collegeNumber, name, surname1, surname2, personalId, email, mobilePhone, phone } = req.body;

    // Crear datos con valores predeterminados y los proporcionados por el usuario
    const newData = {
        createUser: true,
        notifyUser: true,
        collegeNumber,
        name,
        surname1,
        surname2,
        professionalType: 'PRESCRIPTOR', // Valor predeterminado
        personalId,
        email,
        gender: 'NO_ESPECIFICADO', // Valor predeterminado
        mobilePhone,
        phone,
        specialties: ['40'], // Valor predeterminado
        parentUnitReference: {
            prescriberType: 'MEDICO' // Valor predeterminado
        }
    };

    try {
        // Obtener access_token
        const accessToken = await obtenerAccessToken();

        // Configuración para la solicitud POST
        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        // Realizar la solicitud POST para dar de alta al profesional
        const apiResponse = await axios.post('api', newData, config);

        // Imprimir la respuesta de la API
        console.log('Respuesta de la API al dar de alta al profesional:', apiResponse.data);

        // Devolver los datos obtenidos como respuesta al cliente
        res.json(apiResponse.data);
    } catch (error) {
        // Manejo detallado de errores
        console.error('Error al hacer la solicitud:', error.message);

        if (error.response) {
            console.error('Respuesta de error de la API:', error.response.data);

            // Detalles específicos de error de la API
            let errorMessage = 'Hubo un error al dar de alta al profesional';
            if (error.response.data && error.response.data.description) {
                errorMessage += `: ${error.response.data.description}`;
            }
            if (error.response.data && error.response.data.fieldErrors) {
                errorMessage += `: ${JSON.stringify(error.response.data.fieldErrors)}`;
            }
            res.status(error.response.status).json({
                error: errorMessage
            });
        } else if (error.request) {
            console.error('Error en la solicitud:', error.request);
            res.status(500).json({
                error: 'Error en la solicitud al dar de alta al profesional',
                message: 'No se recibió respuesta de la API'
            });
        } else {
            console.error('Error desconocido:', error.message);
            res.status(500).json({
                error: 'Error desconocido al dar de alta al profesional',
                message: error.message
            });
        }
    }
});

// Función para obtener access_token
async function obtenerAccessToken() {
    try {
        const postData = new URLSearchParams();
        postData.append('grant_type', 'x');
        postData.append('impersonation_token', 'x');
        postData.append('system_module_code', 'x');
        postData.append('unit_code_type', 'x');
        postData.append('unit_code_value', 'x');
        postData.append('scope', 'x');
        postData.append('client_secret', 'x');
        postData.append('client_id', 'x');

        const authResponse = await axios.post('api', postData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return authResponse.data.access_token;
    } catch (error) {
        console.error('Error al obtener access_token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Puerto para escuchar las solicitudes
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
