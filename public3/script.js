document.getElementById('vinculacionForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const startDate = document.getElementById('startDate').value;
    const role = document.getElementById('role').value;
    const structureUnitReference = document.getElementById('structureUnitReference').value;
    const colegiado = document.getElementById('colegiado').value; // Nuevo campo para el número de colegiado

    const postData = {
        startDate: startDate,
        role: role,
        structureUnitReference: structureUnitReference,
        colegiado: colegiado // Incluir el número de colegiado en los datos a enviar
    };

    try {
        const response = await fetch('/vinculacion-profesional', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (response.ok) {
            // Mostrar mensaje de éxito
            document.getElementById('response').innerHTML = `
                <p style="color: green;">¡El profesional ha sido vinculado correctamente!</p>
            `;
        } else {
            // Mostrar mensaje de error
            document.getElementById('response').innerHTML = `
                <p style="color: red;">No se ha podido vincular al profesional. Error: ${data.error}</p>
            `;
        }
    } catch (error) {
        document.getElementById('response').innerHTML = `
            <p style="color: red;">Error de conexión: ${error.message}</p>
        `;
    }
});
