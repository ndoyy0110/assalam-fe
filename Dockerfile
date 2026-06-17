# Gunakan image Node.js versi 18 Alpine
FROM node:18-alpine

# Set folder kerja
WORKDIR /app

# Copy dependency dan install
COPY package*.json ./
RUN npm install

# Copy SEMUA kodingan (Pastikan file .env sudah ada di folder saat di VPS)
COPY . .

# Build Next.js
RUN npm run build

# Buka port 3000
EXPOSE 3000

# Perintah menjalankan frontend
CMD ["npm", "start"]