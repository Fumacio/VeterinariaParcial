document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-registro');
    
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const contraseña = document.getElementById('contraseña').value;
            
            try {
                const response = await axios.post('http://localhost:5000/api/register', {
                    nombre,
                    email,
                    contraseña
                });
                
                console.log('Registro exitoso:', response.data);
                alert('¡Registro exitoso! Redirigiendo a login...');
                
                // Redirigir a login después de 1.5 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                
            } catch (error) {
                console.error('Error en registro:', error);
                alert(error.response?.data?.error || 'Error al registrarse');
            }
        });
    }
});
