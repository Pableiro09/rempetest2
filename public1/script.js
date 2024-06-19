document.getElementById('obtenerDatosBtn').addEventListener('click', async () => {
    const numeroColegiado = document.getElementById('numeroColegiado').value.trim();

    if (!numeroColegiado) {
        document.getElementById('response').innerHTML = `
            <p style="color: red;">Por favor, ingrese un número de colegiado válido.</p>
        `;
        return;
    }

    try {
        const response = await fetch(`/datos-profesional?profCollegeNumber=${numeroColegiado}`);
        const data = await response.json();

        if (response.ok) {
            // Mostrar datos obtenidos
            document.getElementById('response').innerHTML = `
                <p style="color: green;">Datos obtenidos correctamente:</p>
                <p>Nombre: ${data.nombre}</p>
                <p>Apellidos: ${data.apellidos}</p>
                <p>Número de Colegiado: ${data.numeroColegiado}</p>
            `;
        } else {
            // Mostrar mensaje de error
            document.getElementById('response').innerHTML = `
                <p style="color: red;">Error: ${data.error}</p>
            `;
        }
    } catch (error) {
        document.getElementById('response').innerHTML = `
            <p style="color: red;">Error de conexión: ${error.message}</p>
        `;
    }
});
