$(document).ready(function () {

});

async function iniciarSesion() {
    let datos = {};
    datos.email = document.getElementById("txtEmailIniciar").value;
    datos.password = document.getElementById("txtPasswordIniciar").value;

    const request = await fetch("https://worksy-backend-production.up.railway.app/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)

    });

    const respuesta = await request.text();
    console.log(respuesta.toString())
    if (respuesta !== "Credenciales incorrectas") {
        // Solo guardar el email del usuario logueado
        localStorage.setItem('email', datos.email);
        alert("Bienvenido");
        document.location.href = "users-table.html";
    } else {
        alert("Usuario o contraseña incorrectos, intente de nuevo");
    }
}

