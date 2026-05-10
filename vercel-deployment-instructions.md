# Vercel Deployment Instructions

## 🚀 Unified Deployment (Frontend + Backend)

### 1. Vercel Dashboard Settings

**Framework Preset:** Other

**Root Directory:** (оставить пустым)

**Build Command:** 
```
cd my-app && npm install && CI=false npm run build
```

**Output Directory:** 
```
my-app/build
```

**Install Command:** (оставить пустым или `npm install`)

### 2. Environment Variables (обязательно!)

Добавьте в Settings → Environment Variables:

**MONGO_URI**
```
mongodb+srv://useruser:IlfXW3TQLASjLZv8@clustern.reruo2j.mongodb.net/shelter_db?retryWrites=true&w=majority
```

**NODE_ENV**
```
production
```

**JWT_SECRET**
```
shelter-super-secret-jwt-key-2024
```

### 3. Как это работает

- `/api/*` запросы → `backend/server.js` (Node.js функции)
- Все остальные запросы → `my-app/*` (React приложение)
- Единый домен для frontend и backend

### 4. Чек-лист перед деплоем

✅ `backend/server.js` - убран `app.listen()`, добавлен `export default app`
✅ `vercel.json` создан в корне с правильными rewrites
✅ Все изменения закоммичены в GitHub
✅ Переменные окружения добавлены в Vercel

### 5. После деплоя проверьте

1. **Health endpoint:** `your-domain.vercel.app/api/health`
2. **Frontend:** `your-domain.vercel.app/`
3. **API запросы:** должны работать без CORS ошибок
