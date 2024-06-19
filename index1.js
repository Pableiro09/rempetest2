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

// Servir archivos estáticos desde la carpeta 'public' para las diferentes interfaces
app.use('/datos-profesional', express.static(path.join(__dirname, 'public1')));
app.use('/alta-profesional', express.static(path.join(__dirname, 'public2')));
app.use('/vinculacion-profesional', express.static(path.join(__dirname, 'public3')));

// ---------------------
// Ruta para obtener los datos de un profesional por número de colegiado
// ---------------------
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

// ---------------------
// Ruta para dar de alta a un profesional
// ---------------------
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

// ---------------------
// Ruta para la solicitud POST de vinculación profesional (ejemplo básico)
// ---------------------
app.post('/vinculacion-profesional', async (req, res) => {
    const { startDate, role, structureUnitReference, colegiado } = req.body; // Agrega colegiado aquí

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
            `api`, // Utiliza colegiado aquí
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
        postData.append('grant_type', 'impersonation');
        postData.append('impersonation_token', 'ZTIxZTM3YzQtMWVjOS00Zjg4LThjZTItZjM3YjcyMTBmNzQy');
        postData.append('system_module_code', 'SERVICES');
        postData.append('unit_code_type', 'UUID');
        postData.append('unit_code_value', '990a455b-185f-4666-a921-3753820fce93');
        postData.append('scope', 'read write');
        postData.append('client_secret', 'FfRDEkfAdffawNybj5j9rVTLbctUAYBe');
        postData.append('client_id', 'rempeapp');

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
const port = process.env.PORT || 3200;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
