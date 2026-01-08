FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencia
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Asegurar que el directorio de base de datos exista
RUN mkdir -p database

# Exponer el puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
