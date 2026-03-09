# Solar Plants Manager

Aplicación web desarrollada con **Angular y Supabase** para la gestión de plantas solares, usuarios y registros de generación y consumo energético.

El proyecto permite visualizar plantas solares, registrar datos energéticos, gestionar usuarios y mostrar estadísticas mediante gráficos interactivos.

---

# Demo

Aplicación desplegada en internet:

https://proyecto-solar.vercel.app

Repositorio GitHub:

https://github.com/CarlosSDT1/ProyectoSolar

---

# Características

## Autenticación

- Registro de usuarios con Supabase
- Inicio y cierre de sesión
- Gestión de perfil de usuario
- Configuración de **username**
- Subida de **avatar**
- Persistencia de sesión

---

## Gestión de plantas solares

- Crear plantas solares
- Editar plantas
- Eliminar plantas
- Subir imágenes de plantas
- Marcar plantas como favoritas
- Visualización en lista y tarjetas
- Vista detalle de cada planta

### Control de propietarios

- Los **usuarios normales** solo pueden crear plantas para ellos mismos
- Los **administradores** pueden asignar una planta a cualquier usuario

---

## Registros de energía

Cada planta puede almacenar registros energéticos.

- Crear registros de generación y consumo
- Editar registros
- Eliminar registros
- Visualizar registros históricos

---

## Gráficos de datos

Visualización de los datos energéticos mediante gráficos.

- Generación energética
- Consumo energético
- Evolución temporal

Implementado con **Chart.js**.

---

## Búsqueda y paginación

- Filtrado de plantas por nombre
- Búsqueda reactiva
- Paginación de resultados
- Navegación mediante parámetros de ruta

---

## Personalización de interfaz

La aplicación permite cambiar el tema visual.

- Cambio de tema **Dark / Light**
- Implementado con **DaisyUI**
- El tema se guarda en **localStorage**

---

## Seguridad

El sistema utiliza **Row Level Security (RLS)** en Supabase.

- Solo el propietario puede modificar su planta
- Los administradores pueden gestionar cualquier planta
- Control de acceso a registros energéticos
- Protección de datos mediante políticas de base de datos

---

## Roles de usuario

Existen dos tipos de usuarios:

### Usuario normal

Puede:

- Crear plantas propias
- Gestionar sus registros
- Editar su perfil

### Administrador

Puede:

- Gestionar todas las plantas
- Gestionar registros de cualquier planta
- Cambiar el propietario de una planta

---

# Tecnologías utilizadas

## Frontend

- Angular
- Angular Signals
- TypeScript
- Chart.js
- TailwindCSS
- DaisyUI

---

## Backend

- Supabase
- PostgreSQL
- Supabase Storage
- Supabase Auth

---

## Control de versiones

- Git
- GitHub

---

# Base de datos

## Tabla `plantes`

Contiene la información de las plantas solares.

| Campo      | Tipo      |
|------------|-----------|
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
|------------|-----------|
| id         | integer   |
| planta     | integer   |
| generacio  | number    |
| consum     | number    |
| created_at | timestamp |

---

## Tabla `profiles`

Información adicional de los usuarios.

| Campo      | Tipo |
|------------|------|
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
git clone https://github.com/CarlosSDT1/ProyectoSolar.git
2. Instalar dependencias
npm install
3. Configurar variables de entorno

Crear el archivo:

src/environments/environment.ts

Ejemplo:

export const environment = {
  production: false,
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_KEY: 'public-anon-key'
};
4. Ejecutar el proyecto
ng serve

La aplicación estará disponible en:

http://localhost:4200
Almacenamiento de imágenes

Las imágenes de plantas y avatares se almacenan en Supabase Storage.

Actualmente:

Los avatares de usuario se almacenan en Supabase

Las imágenes de plantas nuevas también se almacenan en Supabase

Algunas imágenes antiguas pueden estar almacenadas mediante URL externas porque esta funcionalidad se implementó posteriormente.

Funcionalidades principales
Usuario

Crear cuenta

Iniciar sesión

Editar perfil

Subir avatar

Crear y gestionar plantas propias

Añadir registros energéticos

Administrador

Gestionar todas las plantas

Gestionar registros de cualquier planta

Cambiar el propietario de plantas

Asignar plantas a otros usuarios

Autor

Proyecto desarrollado por Carlos S.D.T como aplicación de gestión de plantas solares utilizando Angular y Supabase.
