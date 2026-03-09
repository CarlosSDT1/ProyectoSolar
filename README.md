# Solar Plants Manager

Aplicación web desarrollada con **Angular y Supabase** para la gestión de plantas solares, usuarios y registros de generación y consumo energético.

El proyecto permite visualizar plantas solares, registrar datos energéticos, gestionar usuarios y mostrar estadísticas mediante gráficos.

---

# Características

## Autenticación

* Registro de usuarios
* Inicio y cierre de sesión
* Gestión de perfil
* Configuración de username y avatar

## Gestión de plantas

* Crear plantas solares
* Editar plantas
* Eliminar plantas
* Subir imágenes de plantas
* Marcar plantas como favoritas

## Registros de energía

* Crear registros de generación y consumo
* Editar registros
* Eliminar registros
* Visualización de datos históricos

## Gráficos

* Visualización de generación y consumo
* Implementado con Chart.js

## Búsqueda

* Filtrar plantas por nombre
* Búsqueda reactiva en la lista de plantas

## Seguridad

* Row Level Security (RLS) en Supabase
* Solo el propietario o un administrador puede modificar plantas
* Control de acceso para registros

## Roles de usuario

* Usuario normal
* Administrador

---

# Tecnologías utilizadas

## Frontend

* Angular
* Angular Signals
* TypeScript
* Chart.js
* Tailwind / DaisyUI

## Backend

* Supabase
* PostgreSQL
* Supabase Storage

## Control de versiones

* Git
* GitHub

---

# Base de datos

## Tabla `plantes`

Contiene la información de las plantas solares.

| Campo      | Tipo      |
| ---------- | --------- |
| id         | integer   |
| nom        | text      |
| ubicacion  | json      |
| capacitat  | number    |
| user       | uuid      |
| foto       | text      |
| favorite   | boolean   |
| created_at | timestamp |

---

## Tabla `registres`

Contiene los registros de producción energética.

| Campo      | Tipo      |
| ---------- | --------- |
| id         | integer   |
| planta     | integer   |
| generacio  | number    |
| consum     | number    |
| created_at | timestamp |

---

## Tabla `profiles`

Información adicional de los usuarios.

| Campo      | Tipo |
| ---------- | ---- |
| id         | uuid |
| username   | text |
| avatar_url | text |
| full_name  | text |
| website    | text |
| role       | text |

---

# Instalación del proyecto

## 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/solar-plants-manager.git
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Configurar variables de entorno

Crear el archivo:

```
src/environments/environment.ts
```

Ejemplo:

```ts
export const environment = {
  production: false,
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_KEY: 'public-anon-key'
};
```

## 4. Ejecutar el proyecto

```bash
ng serve
```

La aplicación estará disponible en:

```
http://localhost:4200
```

---

# Funcionalidades principales

## Usuario

* Crear cuenta
* Iniciar sesión
* Editar perfil
* Subir avatar
* Crear y gestionar plantas propias

## Administrador

* Gestionar todas las plantas
* Gestionar registros de cualquier planta

---

# Almacenamiento de imágenes

Las imágenes de plantas y avatares se almacenan en supabase(Algunas de ellas no todas porque esto lo implemente mas tarde y no me he puesto a descargarlas y cambiarlas a supabase)
