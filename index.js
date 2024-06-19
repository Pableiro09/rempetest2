const express = require('express');
const axios = require('axios');
const { URLSearchParams } = require('url');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public1')));

// Ruta para obtener los datos de la API de rempe.es basado en el número de colegiado
app.get('/datos-profesional', async (req, res) => {
    const { profCollegeNumber } = req.query;

    if (!profCollegeNumber) {
        return res.status(400).json({ error: 'El número de colegiado es requerido' });
    }

    try {
        // Obtener access_token
        const accessToken = await obtenerAccessToken();

        // Configurar headers con el token de acceso para la solicitud GET
        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                profCollegeNumber
            }
        };

        // Realizar la solicitud GET a la API de rempe.es con el token de acceso
        const apiResponse = await axios.get('api', config);

        console.log('Datos obtenidos de la API:', apiResponse.data);  // Añadir log para depuración

        // Verificar que hay datos y devolver los primeros resultados relevantes
        const entry = apiResponse.data.entry;  // Obtener la entrada de datos

        if (entry && entry.length > 0) {
            const profesional = entry[0];  // Usar el primer profesional de la lista

            const datos = {
                nombre: profesional.name,
                apellidos: `${profesional.surname1} ${profesional.surname2}`,  // Concatenar los apellidos
                numeroColegiado: profesional.collegeNumber
            };

            res.json(datos);
        } else {
            res.status(404).json({ error: 'Número de colegiado no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener datos de la API de rempe.es:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Hubo un error al obtener los datos de la API de rempe.es' });
    }
});

// Función para obtener access_token
async function obtenerAccessToken() {
    try {
        const postData = new URLSearchParams();
        postData.append('grant_type', 'impersonation');
        postData.append('impersonation_token', 'ZTIxZTM3YzQtMWVjOS00Zjg4LThjZTItZjM3YjcyMTBmNzQy');
        postData.append('system_module_code', 'SERVICES');
        postData.append('unit_code_type', 'UUID');
        postData.append('unit_code_value', '990a455b-185f-4666-a921-3753820fce93');
        postData.append('scope', 'read write');
        postData.append('client_secret', 'FfRDEkfAdffawNybj5j9rVTLbctUAYBe');
        postData.append('client_id', 'rempeapp');

        const authResponse = await axios.post('api', postData, {
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

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
