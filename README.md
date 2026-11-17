# Secure Drop

## Netlify sozlamalari

Netlify saytining **Site configuration → Environment variables** bo‘limida quyidagilarni kiriting:

- `APP_PASSWORD` — kirish uchun kamida 16 belgili maxfiy parol.
- `AUTH_SECRET` — sessiyalarni imzolash uchun kamida 32 belgili tasodifiy qiymat. Uni yaratish uchun `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` buyrug‘idan foydalaning.
- `APP_MESSAGE` — faqat tizimga kirgandan keyin ko‘rsatiladigan matn (ixtiyoriy). Sahifadagi avvalgi maxfiy matnni shu qiymatga ko‘chiring; maxfiy ma’lumotni HTML faylga yozmang.
- `BOT_TOKEN` va `CHAT_ID` — Telegram orqali xabar/fayl yuborish sozlamalari.

Maxfiy qiymatlarni GitHub’ga yoki source code’ga qo‘shmang. Environment variable’larni sozlaganingizdan so‘ng Netlify deploy’ni qayta ishga tushiring.

Kirish muvaffaqiyatli bo‘lgach, server 30 daqiqalik HttpOnly sessiya cookie’sini beradi. Yuborish endpointi ham ushbu sessiyani tekshiradi.
