const express = require('express');
const axios = require('axios');
const { URLSearchParams } = require('url');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public3')));

// Endpoint para la solicitud POST de vinculación
app.post('/vinculacion-profesional', async (req, res) => {
    const { startDate, role, structureUnitReference } = req.body;

    try {
        // Obtener access_token
        const accessToken = await obtenerAccessToken();

        // Construir el cuerpo de la solicitud POST
        const postData = {
            startDate: startDate,
            role: role,
            structureUnitReference: {       
                uuid: structureUnitReference
            }
        };

        // Configurar headers con el token de acceso para la solicitud POST
        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        // Realizar la solicitud POST a la API de rempe.es para vincular el profesional
        const apiResponse = await axios.post(
            'api',
            postData,
            config
        );

        // Devolver los datos obtenidos como respuesta
        res.json(apiResponse.data);
    } catch (error) {
        console.error('Error al vincular el profesional:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Hubo un error al vincular el profesional' });
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

        const authResponse = await axios.post('api', postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const accessToken = authResponse.data.access_token;

        return accessToken;
    } catch (error) {
        console.error('Error al obtener access_token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
