# Usa una imagen base con Node.js
FROM node:14 as builder

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todos los archivos del proyecto al directorio de trabajo
COPY . .

# Compila la aplicación Angular para producción
RUN npm run build --prod

# Configura la imagen de producción
FROM nginx:alpine

# Copia los archivos de compilación de la aplicación Angular al directorio de despliegue de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 4200

# Inicia Nginx en segundo plano al ejecutar el contenedor
CMD ["nginx", "-g", "daemon off;"]
