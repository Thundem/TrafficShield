const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Check if contact-data.json exists, if not create it with an empty array and counter
const dataFilePath = path.join(__dirname, 'contact-data.json');
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify({ counter: 0, records: [] }));
}

// Обробка даних форми у форматі JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this line to parse URL-encoded data

// Маршрут для обслуговування HTML-форми
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Маршрут для обробки даних форми та запису у JSON
app.post('/submit', (req, res) => {
  const { name, phone, email, message } = req.body;

  // Запис даних у JSON-файл
  const data = { name, phone, email, message };
  let fileData = { counter: 0, records: [] };
  try {
    fileData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8')) || { counter: 0, records: [] };
  } catch (err) {
    console.error('Error reading file:', err);
  }
  
  // Increment the counter and add the new record
  fileData.counter += 1;
  fileData.records.push(data);
  
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(fileData, null, 2));
    res.send(`Дані успішно надіслано! Загальна кількість записів: ${fileData.counter}`);
  } catch (err) {
    console.error('Error writing file:', err);
    res.status(500).send('Помилка при записі даних.');
  }
});

app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});