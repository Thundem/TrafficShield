const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const uri = "mongodb+srv://vovkandrij7:pOt0iVcAvF4NZA7a@cluster0.pkxe5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
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

// Маршрут для обслуговування HTML-форми
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Маршрут для обробки даних форми
app.post('/submit', async (req, res) => {
  const { name, phone, email, message } = req.body;

  // Створюємо новий документ для збереження в MongoDB
  const contact = new Contact({ name, phone, email, message });

  try {
    await contact.save();
    res.send('Дані успішно надіслано!');
  } catch (error) {
    console.error('Помилка збереження даних:', error);
    res.status(500).send('Помилка при збереженні даних.');
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});