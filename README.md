# 📊 Sistema de Diagramación UML

Este proyecto permite la generación de proyectos de manera automática (Frontend y Backend), a partir de la creaci+on y edición de diagramas UML

---
## 📁 Repositorios

- 🌐 Frontend: [Graficacion](https://github.com/JesusReyes31/Graficacion)
- 🔧 Backend: [grafbackend](https://github.com/ValdezErnes/grafbackend)

----
## 🚀 Cómo usar este sistema

### 1. **Clona los repositorios:**

```bash
git clone https://github.com/JesusReyes31/Graficacion
git clone https://github.com/ValdezErnes/grafbackend

```

### 2. **Accede a la carpeta del proyecto e instala dependencias:**
#### 2.1 Frontend
```bash
cd Graficacion
npm install --force
```
#### 2.2 Backend
```bash
cd ../grafbackend
npm install --force
```

### 3. **Configura Variables de entorno (en grafbackend):**
Dentro del proyecto grafbackend, crea un archivo .env y agrega lo siguiente:

```bash 
PORT=Puerto_Backend
DB_HOST=Host_DB
DB_USER=Usuario_DB
DB_PASSWORD=Contraseña_DB
DB_NAME=NombreBD
DB_PORT=Puerto_DB
```
Sustituye los valores por los datos reales de tu base de datos y servidor.

### 4. **Ejecuta ambos proyectos:**
#### 4.1 Graficacion:
```bash
cd Graficacion
ng serve -o
```

#### 4.2 Backend (grafbackend):
```bash
cd grafbackend
npm run dev
```

### 🧪 Ejemplo de uso
```bash
1. Crear proyecto (si no existe ninguno).
2. Al seleccionar el proyecto, se mostrarán los diagramas UML que se pueden hacer, al dar clic en cada uno se creará una versión automáticamente en la BD ( se pueden crear nuevas versiones de cada diagrama con el botón Nueva Version).
3. Entrar a cada uno de los diagramas UML, editarlos y al finalizar cada uno, dar clic en Guardar (botón que se encuentra a un lado de Nueva Versión).
    3.1 Diagrama de Casos de Uso. Crear el diagrama arrastrando actores y casos de uso (deben estar dentro de un área de sistema).
    3.2 Diagrama de Secuencias. Editarlo añadiendo las líneas y acciones (las cuales se pueden conectar).
    3.3 Diagrama de Paquetes. Editarlo añadiendo paquetes y nodos.
    3.4 Diagrama de Componentes. Editarlo añadiendo componentes e interfaces (Requerida y ofrecida).
    3.5 Diagrama de Clases. Editarlo añadiendo las clases, relaciones, atributos y métodos (esto 2 últimos se pueden editar dando clic al lapiz que está al lado del nombre de la clase).
        3.5.1 Para crear relaciones de cualquier tipo se deben seleccionar las 2 clases que se quieren unir (primero la Clase padre y luego la clase hija).
        3.5.2 Las relaciones que se crean generan un nuevo espacio en la edición de la clase llamado Relaciones el cual muestra todas las que tiene como clase hija para mapear y vincular los campos.
        Cada una de las relaciones se tiene que mapear para vincular el campo de la clase padre a la clase hija, esto se hace seleccionando el campo (viene un select con todos los campos de la clase padre) el cual se va a vincular, luego se selecciona si el campo en la clase hija (la que se está editando) es nuevo (solo se pedirá el nombre del campo) o si ya existe (se tendrá que elegír en el select el campo con el cual se va a vincular) despues se activará el botón de Mapear campo, damos clic y ya está vinculado el campo de la clase padre en la clase hija.
4. Ya que se editaron todos los diagramas, damos clic en el botón Generar Código (Se encuentra en la parte superior derecha).
5. Seleccionamos las versiones de cada uno de los diagramas y damos clic en siguiente.
6. Agregamos o seleccionamos las credenciales de conexion para el proyecto que se va a crear (Host, Usuario, Contraseña y Nombre de la BD, y el puerto donde se correrá el Backend)
    6.1 En caso de que se cree la credencial al finalizar se da clic en Guardar y aparecerá seleccionada la credencial que se acaba de añadir.
7. Se da clic en Generar y se espera a que se procese en instale todo.
8. Ya que se temrine todo y se muestre que el proyecto se generó con éxito, el proyecto creado lo vamos a encontrar en C:\Users\[TuNombreDeUsuario]\Proyectos\Nombre_Proyecto
      
```