const handleSubmit = async (event) => {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let contraseña = document.getElementById("pass").value;
    let data = { email, contraseña };

    // enviar datos al backend
    try {
        const response = await axios.post('http://localhost:5000/api/login', data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        window.location.href = 'index.html';
    } catch (error) {
        console.error(error);
        alert('Error al iniciar sesión: ' + (error.response ? error.response.data.error : error.message));
    }
};

// me quede en el minuto 32:32

document.getElementById("form-principal").addEventListener("submit", handleSubmit);