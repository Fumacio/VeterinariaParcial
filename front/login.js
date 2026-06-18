const handleSubmit = async (event) => {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("pass").value;
    let data = { email, password };

    // enviar datos al backend
    try {
        const response = await axios.post('http://localhost:' + process.env.PORT + '/login', data);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
};

// me quede en el minuto 32:32


e.preventDefault();

document.getElementById("btn-iniciarsesion").addEventListener("click", handleSubmit);