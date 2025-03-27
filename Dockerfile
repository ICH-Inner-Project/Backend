# Базовый образ для Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install --production

# Копируем исходный код и .env файл
COPY . .
COPY .env .env

# Указываем порт и команду запуска
EXPOSE 3333
CMD ["npm", "run", "build"]
CMD ["npm", "run", "prod"]

