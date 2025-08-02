$(document).ready(function () {});

async function registrarUsuario() {
  let datos = {};
  datos.username = document.getElementById("txtNombres").value;
  datos.email = document.getElementById("txtEmail").value;
  datos.password = document.getElementById("txtPassword").value;

  //registrar usuario
  const request = await fetch("https://worksy-backend-production.up.railway.app/auth/register", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const respuesta = await request.text();
  if (respuesta !== "ERROR") {
    alert("Usuario registrado correctamente");
    document.location.href = "login.html";
  }
}

//Validaciones de campos
function validateEmail() {
  const emailInput = document.getElementById("txtEmail");
  const emailValidationMsg = document.getElementById("email-validation-msg");

  // Regular expression to check for a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailInput.value === "") {
    emailValidationMsg.textContent = "Ingrese un correo electrónico.";
  } else if (!emailRegex.test(emailInput.value)) {
    emailValidationMsg.textContent =
      'Correo electrónico inválido. Falta "@" o el formato es incorrecto.';
  } else {
    emailValidationMsg.textContent = "";
  }
}

function validatePassword() {
  const passwordInput = document.getElementById("txtPassword");
  const confirmPasswordInput = document.getElementById("txtRepetirPassword");
  const passwordValidationMsg = document.getElementById(
    "password-validation-msg"
  );
  const confirmPasswordValidationMsg = document.getElementById(
    "confirm-password-validation-msg"
  );

  // Regular expressions to check for at least one uppercase letter, one lowercase letter, and one number
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /\d/;

  if (passwordInput.value === "") {
    passwordValidationMsg.textContent = "Ingrese una contraseña.";
  } else if (passwordInput.value.length < 8) {
    passwordValidationMsg.textContent =
      "La contraseña debe contener al menos 8 caracteres.";
  } else if (!uppercaseRegex.test(passwordInput.value)) {
    passwordValidationMsg.textContent =
      "La contraseña debe contener al menos una letra mayúscula.";
  } else if (!lowercaseRegex.test(passwordInput.value)) {
    passwordValidationMsg.textContent =
      "La contraseña debe contener al menos una letra minúscula.";
  } else if (!numberRegex.test(passwordInput.value)) {
    passwordValidationMsg.textContent =
      "La contraseña debe contener al menos un número.";
  } else {
    passwordValidationMsg.textContent = "";
  }

  // Verificar si las contraseñas coinciden
  if (
    confirmPasswordInput.value !== "" &&
    passwordInput.value !== confirmPasswordInput.value
  ) {
    confirmPasswordValidationMsg.textContent = "Las contraseñas no coinciden.";
  } else {
    confirmPasswordValidationMsg.textContent = "";
  }

  // Habilitar o deshabilitar el botón según si las contraseñas coinciden y no hay mensajes de validación
  const registerButton = document.getElementById("btnRegistrar");
  const emailValidationMsg = document.getElementById("email-validation-msg");

  if (
    passwordInput.value === confirmPasswordInput.value &&
    passwordInput.value.length >= 8 &&
    passwordValidationMsg.textContent === "" &&
    confirmPasswordValidationMsg.textContent === "" &&
    emailValidationMsg.textContent === ""
  ) {
    registerButton.disabled = false;
  } else {
    registerButton.disabled = true;
  }
}
