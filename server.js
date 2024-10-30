const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const app = express();
const port = 3000;

// Підключення до MongoDB
const uri = "mongodb+srv://vovkandrij7:pOt0iVcAvF4NZA7a@cluster0.pkxe5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
  .then(() => console.log('Підключено до MongoDB Atlas'))
  .catch(err => console.error('Помилка підключення до MongoDB Atlas:', err));

// Створюємо схему для контактної форми
const contactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

// Створюємо модель на основі схеми
const Contact = mongoose.model('Contact', contactSchema);

// Обробка даних форми у форматі JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Визначення заблокованих IP-адрес
const blockedIPs = ['192.168.1.1', '10.0.0.1']; // Додайте IP, які потрібно заблокувати

// Мідлвара для блокування IP-адрес
app.use((req, res, next) => {
  if (blockedIPs.includes(req.ip)) {
    return res.status(403).send('Доступ заборонено');
  }
  next();
});

// Налаштування тайм-ауту для запитів
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    res.status(408).send('Запит перевищив ліміт часу');
  });
  next();
});

// Обмеження швидкості запитів (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 100, // Максимум 100 запитів з одного IP
  message: 'Занадто багато запитів з цієї IP-адреси, спробуйте пізніше'
});

// Використання обмеження швидкості для всіх запитів
app.use(limiter);

// Плавне зниження швидкості обробки запитів
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  delayAfter: 100, // Після 100 запитів
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500; // Old behavior
  }
});

// Використання зниження швидкості для всіх запитів
app.use(speedLimiter);

// Маршрут для обслуговування HTML-форми
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Маршрут для обробки даних форми
app.post('/submit', async (req, res) => {
  const { name, phone, email, message } = req.body;

  const contact = new Contact({ name, phone, email, message });

  try {
    await contact.save();
    return res.send('Дані успішно надіслано!');
  } catch (error) {
    console.error('Помилка збереження даних:', error);
    return res.status(500).send('Помилка при збереженні даних.');
  }
});

// Маршрут для отримання всіх контактів з бази даних
app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    return res.json(contacts);
  } catch (error) {
    console.error('Помилка отримання даних:', error);
    return res.status(500).send('Помилка при отриманні даних.');
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});