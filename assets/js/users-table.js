$(document).ready(function () {
    mostrarUsuarioLogueado();
    cargarUsuarios();
});

// Función para mostrar el usuario logueado en el header
function mostrarUsuarioLogueado() {
    const emailUsuario = localStorage.getItem('email');
    if (emailUsuario) {
        document.getElementById('usuario-logueado').textContent = `Bienvenido: ${emailUsuario}`;
    }
}

// Función para cargar usuarios desde el backend
async function cargarUsuarios() {
    try {
        // Verificar si el usuario ha iniciado sesión (sin token)
        const emailUsuario = localStorage.getItem('email');
        
        // Si no hay email guardado, significa que no ha iniciado sesión
        if (!emailUsuario) {
            alert('Debe iniciar sesión para ver esta página');
            window.location.href = 'login.html';
            return;
        }

        // Hacer petición simple sin autenticación
        const response = await fetch('https://worksy-backend-production.up.railway.app/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const usuarios = await response.json();
            mostrarUsuarios(usuarios);
        } else {
            throw new Error(`Error del servidor: ${response.status}`);
        }
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarError('Error al cargar los usuarios. Por favor, intente nuevamente.');
    }
}

// Función para mostrar los usuarios en la tabla
function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('users-tbody');
    
    // Limpiar el contenido actual
    tbody.innerHTML = '';

    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <p class="text-muted">No hay usuarios registrados</p>
                </td>
            </tr>
        `;
        return;
    }

    // Generar las filas de usuarios
    usuarios.forEach((usuario, index) => {
        const fila = crearFilaUsuario(usuario, index);
        tbody.appendChild(fila);
    });
}

// Función para crear una fila de usuario
function crearFilaUsuario(usuario, index) {
    const tr = document.createElement('tr');
    
    // Generar username basado en email o usar un campo específico
    const username = usuario.username || usuario.email.split('@')[0];
    
    tr.innerHTML = `
        <td>
            <div class="user-info">
                <div class="user-info__img">
                    <img src="assets/img/usuario.png" alt="User Img">
                </div>
                <div class="user-info__basic">
                    <p class="text-muted mb-0">@${username}</p>
                </div>
            </div>
        </td>
        <td>${usuario.email}</td>
        <td>***********</td>
        <td>
            <div class="dropdown">
                <a href="#!" class="px-2" id="triggerId${index}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-ellipsis-v"></i>
                </a>
                <div class="dropdown-menu" aria-labelledby="triggerId${index}">
                    <a class="dropdown-item" href="#" onclick="editarUsuario(${usuario.id})">
                        <i class="fa fa-pencil mr-1"></i> Edit
                    </a>
                    <a class="dropdown-item text-danger" href="#" onclick="eliminarUsuario(${usuario.id}, '${usuario.email}')">
                        <i class="fa fa-trash mr-1"></i> Delete
                    </a>
                </div>
            </div>
        </td>
    `;
    
    return tr;
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="alert alert-danger" role="alert">
                    ${mensaje}
                </div>
                <button class="btn btn-primary" onclick="cargarUsuarios()">
                    <i class="fa fa-refresh"></i> Reintentar
                </button>
            </td>
        </tr>
    `;
}

// Función para editar usuario
function editarUsuario(userId) {
    // Buscar el usuario en la tabla actual
    const filas = document.querySelectorAll('#users-tbody tr');
    let usuarioActual = null;
    
    filas.forEach(fila => {
        const dropdown = fila.querySelector('.dropdown-item[onclick*="editarUsuario(' + userId + ')"]');
        if (dropdown) {
            const celdas = fila.querySelectorAll('td');
            usuarioActual = {
                id: userId,
                username: celdas[0].querySelector('.text-muted').textContent.replace('@', ''),
                email: celdas[1].textContent.trim()
            };
        }
    });

    if (usuarioActual) {
        mostrarModalEditar(usuarioActual);
    } else {
        alert('No se pudo obtener la información del usuario');
    }
}

// Función para mostrar el modal de editar
function mostrarModalEditar(usuario) {
    // Crear el modal dinámicamente
    const modalHTML = `
        <div class="modal fade" id="editUserModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Usuario</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="editUserForm">
                            <div class="form-group">
                                <label for="editUsername">Nombre de Usuario:</label>
                                <input type="text" class="form-control" id="editUsername" value="${usuario.username}">
                            </div>
                            <div class="form-group">
                                <label for="editEmail">Email:</label>
                                <input type="email" class="form-control" id="editEmail" value="${usuario.email}">
                            </div>
                            <div class="form-group">
                                <label for="editPassword">Nueva Contraseña (opcional):</label>
                                <input type="password" class="form-control" id="editPassword" placeholder="Dejar vacío para mantener la actual">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="guardarCambiosUsuario(${usuario.id})">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById('editUserModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    $('#editUserModal').modal('show');
}

// Función para guardar los cambios del usuario
async function guardarCambiosUsuario(userId) {
    try {
        // Obtener los valores del formulario
        const username = document.getElementById('editUsername').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const password = document.getElementById('editPassword').value.trim();

        // Validaciones básicas
        if (!username) {
            alert('El nombre de usuario es requerido');
            return;
        }
        
        if (!email) {
            alert('El email es requerido');
            return;
        }

        // Crear objeto con solo los campos que tienen valor
        const datosActualizar = {
            username: username
        };

        if (email) datosActualizar.email = email;
        if (password) datosActualizar.password = password;

        // Hacer la petición PUT
        const response = await fetch(`https://worksy-backend-production.up.railway.app/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizar)
        });

        if (response.ok) {
            alert('Usuario actualizado exitosamente');
            $('#editUserModal').modal('hide');
            cargarUsuarios(); // Recargar la tabla
        } else if (response.status === 404) {
            alert('Usuario no encontrado');
        } else if (response.status === 400) {
            const errorMsg = await response.text();
            alert(`Error de validación: ${errorMsg}`);
        } else {
            const errorMsg = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorMsg}`);
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert('Error al actualizar el usuario. Por favor, intente nuevamente.');
    }
}

// Función para eliminar usuario
async function eliminarUsuario(userId, email) {
    if (!confirm(`¿Está seguro que desea eliminar el usuario ${email}?`)) {
        return;
    }

    try {
        const response = await fetch(`https://worksy-backend-production.up.railway.app/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Usuario eliminado exitosamente');
            cargarUsuarios(); // Recargar la tabla
        } else if (response.status === 404) {
            alert('Usuario no encontrado');
        } else {
            const errorMsg = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorMsg}`);
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario. Por favor, intente nuevamente.');
    }
}

// Función para refrescar la tabla
function refrescarTabla() {
    cargarUsuarios();
}

// Función para mostrar el modal de crear usuario
function mostrarModalCrear() {
    const modalHTML = `
        <div class="modal fade" id="createUserModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Crear Nuevo Usuario</h5>
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="createUserForm">
                            <div class="form-group">
                                <label for="createUsername">Nombre de Usuario: *</label>
                                <input type="text" class="form-control" id="createUsername" required>
                            </div>
                            <div class="form-group">
                                <label for="createEmail">Email: *</label>
                                <input type="email" class="form-control" id="createEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="createPassword">Contraseña: *</label>
                                <input type="password" class="form-control" id="createPassword" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-success" onclick="crearNuevoUsuario()">Crear Usuario</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remover modal anterior si existe
    const existingModal = document.getElementById('createUserModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    $('#createUserModal').modal('show');
}

// Función para crear un nuevo usuario
async function crearNuevoUsuario() {
    try {
        // Obtener los valores del formulario
        const username = document.getElementById('createUsername').value.trim();
        const email = document.getElementById('createEmail').value.trim();
        const password = document.getElementById('createPassword').value.trim();

        // Validaciones básicas
        if (!username) {
            alert('El nombre de usuario es requerido');
            return;
        }
        
        if (!email) {
            alert('El email es requerido');
            return;
        }

        if (!password) {
            alert('La contraseña es requerida');
            return;
        }

        // Crear objeto con los datos del usuario
        const nuevoUsuario = {
            username: username,
            email: email,
            password: password
        };

        // Hacer la petición POST
        const response = await fetch('https://worksy-backend-production.up.railway.app/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        });

        if (response.ok) {
            alert('Usuario creado exitosamente');
            $('#createUserModal').modal('hide');
            cargarUsuarios(); // Recargar la tabla
        } else if (response.status === 400) {
            const errorMsg = await response.text();
            alert(`Error de validación: ${errorMsg}`);
        } else {
            const errorMsg = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorMsg}`);
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        alert('Error al crear el usuario. Por favor, intente nuevamente.');
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('email');
    alert('Sesión cerrada exitosamente');
    window.location.href = 'login.html';
}
