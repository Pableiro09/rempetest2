document.getElementById('altaProfesionalForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        collegeNumber: document.getElementById('collegeNumber').value,
        name: document.getElementById('name').value,
        surname1: document.getElementById('surname1').value,
        surname2: document.getElementById('surname2').value,
        personalId: document.getElementById('personalId').value,
        email: document.getElementById('email').value,
        mobilePhone: document.getElementById('mobilePhone').value,
        phone: document.getElementById('phone').value
    };

    try {
        const response = await fetch('/alta-profesional', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('response').innerHTML = `<p style="color: green;">Profesional dado de alta correctamente.</p>`;
        } else {
            document.getElementById('response').innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        document.getElementById('response').innerHTML = `<p style="color: red;">Error de conexión: ${error.message}</p>`;
    }
});
