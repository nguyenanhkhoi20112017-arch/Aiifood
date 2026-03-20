const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Default food menu organized by category
const DEFAULT_MENU = {
  "Rice": [
    { name: "Fried Rice", emoji: "\ud83c\udf5a" },
    { name: "Steamed Rice", emoji: "\ud83c\udf5a" },
    { name: "Chicken Rice", emoji: "\ud83c\udf57" },
    { name: "Curry Rice", emoji: "\ud83c\udf5b" },
    { name: "Egg Fried Rice", emoji: "\ud83e\udd5a" },
    { name: "Bibimbap", emoji: "\ud83c\udf72" }
  ],
  "Noodles": [
    { name: "Pho", emoji: "\ud83c\udf5c" },
    { name: "Ramen", emoji: "\ud83c\udf5c" },
    { name: "Spaghetti", emoji: "\ud83c\udf5d" },
    { name: "Pad Thai", emoji: "\ud83c\udf5c" },
    { name: "Udon", emoji: "\ud83c\udf5c" },
    { name: "Mac & Cheese", emoji: "\ud83e\uddc0" },
    { name: "Stir Fry Noodles", emoji: "\ud83c\udf5d" }
  ],
  "Soup": [
    { name: "Chicken Soup", emoji: "\ud83c\udf72" },
    { name: "Tomato Soup", emoji: "\ud83c\udf45" },
    { name: "Mushroom Soup", emoji: "\ud83c\udf44" },
    { name: "Corn Soup", emoji: "\ud83c\udf3d" },
    { name: "Miso Soup", emoji: "\ud83c\udf72" },
    { name: "Vegetable Soup", emoji: "\ud83e\udd66" }
  ],
  "Meat & Protein": [
    { name: "Grilled Chicken", emoji: "\ud83c\udf57" },
    { name: "Fried Chicken", emoji: "\ud83c\udf57" },
    { name: "Fish Fillet", emoji: "\ud83d\udc1f" },
    { name: "Meatballs", emoji: "\ud83e\uddc6" },
    { name: "Beef Steak", emoji: "\ud83e\udd69" },
    { name: "Shrimp", emoji: "\ud83e\udd90" },
    { name: "Pork Chop", emoji: "\ud83e\udd69" },
    { name: "Chicken Nuggets", emoji: "\ud83c\udf57" },
    { name: "Fish Sticks", emoji: "\ud83d\udc1f" },
    { name: "Tofu", emoji: "\ud83e\uddc6" }
  ],
  "Bread & Sandwiches": [
    { name: "Sandwich", emoji: "\ud83e\udd6a" },
    { name: "Hamburger", emoji: "\ud83c\udf54" },
    { name: "Hot Dog", emoji: "\ud83c\udf2d" },
    { name: "Pizza", emoji: "\ud83c\udf55" },
    { name: "Garlic Bread", emoji: "\ud83e\udd56" },
    { name: "Toast", emoji: "\ud83c\udf5e" },
    { name: "Taco", emoji: "\ud83c\udf2e" },
    { name: "Burrito", emoji: "\ud83c\udf2f" },
    { name: "Croissant", emoji: "\ud83e\udd50" }
  ],
  "Sides & Vegetables": [
    { name: "French Fries", emoji: "\ud83c\udf5f" },
    { name: "Salad", emoji: "\ud83e\udd57" },
    { name: "Corn", emoji: "\ud83c\udf3d" },
    { name: "Broccoli", emoji: "\ud83e\udd66" },
    { name: "Mashed Potato", emoji: "\ud83e\udd54" },
    { name: "Coleslaw", emoji: "\ud83e\udd57" },
    { name: "Spring Rolls", emoji: "\ud83e\udd5f" },
    { name: "Dumplings", emoji: "\ud83e\udd5f" },
    { name: "Edamame", emoji: "\ud83e\uded1" }
  ],
  "Desserts": [
    { name: "Ice Cream", emoji: "\ud83c\udf68" },
    { name: "Cake", emoji: "\ud83c\udf70" },
    { name: "Cookies", emoji: "\ud83c\udf6a" },
    { name: "Pudding", emoji: "\ud83c\udf6e" },
    { name: "Fruit Cup", emoji: "\ud83c\udf53" },
    { name: "Jelly", emoji: "\ud83c\udf6e" },
    { name: "Brownie", emoji: "\ud83c\udf6b" },
    { name: "Donut", emoji: "\ud83c\udf69" },
    { name: "Muffin", emoji: "\ud83e\uddc1" }
  ],
  "Drinks": [
    { name: "Water", emoji: "\ud83d\udca7" },
    { name: "Milk", emoji: "\ud83e\udd5b" },
    { name: "Orange Juice", emoji: "\ud83e\uddc3" },
    { name: "Apple Juice", emoji: "\ud83c\udf4e" },
    { name: "Chocolate Milk", emoji: "\ud83e\udd5b" },
    { name: "Smoothie", emoji: "\ud83e\udd64" },
    { name: "Lemonade", emoji: "\ud83c\udf4b" },
    { name: "Tea", emoji: "\ud83c\udf75" }
  ]
};

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { classes: [], menu: DEFAULT_MENU, orders: [], enabledCategories: null };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  saveData({ classes: [], menu: DEFAULT_MENU, orders: [], enabledCategories: null });
}

// Migrate old data format if needed
const currentData = loadData();
if (Array.isArray(currentData.menu)) {
  currentData.menu = DEFAULT_MENU;
  currentData.enabledCategories = null;
  saveData(currentData);
}

// --- Classes API ---
app.get('/api/classes', (req, res) => {
  res.json(loadData().classes);
});

app.post('/api/classes', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Class name required' });
  const data = loadData();
  const trimmed = name.trim();
  if (data.classes.includes(trimmed)) return res.status(400).json({ error: 'Class already exists' });
  data.classes.push(trimmed);
  saveData(data);
  res.json(data.classes);
});

app.delete('/api/classes/:name', (req, res) => {
  const data = loadData();
  data.classes = data.classes.filter(c => c !== req.params.name);
  saveData(data);
  res.json(data.classes);
});

// --- Menu API ---
app.get('/api/menu', (req, res) => {
  res.json(loadData().menu);
});

// Add a food item to a category
app.post('/api/menu/:category', (req, res) => {
  const { name, emoji } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Food name required' });
  const data = loadData();
  const cat = req.params.category;
  if (!data.menu[cat]) data.menu[cat] = [];
  data.menu[cat].push({ name: name.trim(), emoji: emoji || '\ud83c\udf7d\ufe0f' });
  saveData(data);
  res.json(data.menu);
});

// Remove a food item from a category
app.delete('/api/menu/:category/:index', (req, res) => {
  const data = loadData();
  const cat = req.params.category;
  const index = parseInt(req.params.index);
  if (data.menu[cat] && index >= 0 && index < data.menu[cat].length) {
    data.menu[cat].splice(index, 1);
    if (data.menu[cat].length === 0) delete data.menu[cat];
  }
  saveData(data);
  res.json(data.menu);
});

// Add a new category
app.post('/api/category', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Category name required' });
  const data = loadData();
  if (!data.menu[name.trim()]) data.menu[name.trim()] = [];
  saveData(data);
  res.json(data.menu);
});

// Delete an entire category
app.delete('/api/category/:name', (req, res) => {
  const data = loadData();
  delete data.menu[req.params.name];
  saveData(data);
  res.json(data.menu);
});

// --- Enabled categories (which sections show for students today) ---
app.get('/api/enabled-categories', (req, res) => {
  const data = loadData();
  // null means all enabled
  res.json(data.enabledCategories || Object.keys(data.menu));
});

app.post('/api/enabled-categories', (req, res) => {
  const { categories } = req.body;
  const data = loadData();
  data.enabledCategories = categories;
  saveData(data);
  res.json(data.enabledCategories);
});

// --- Orders API (now supports multiple foods) ---
app.get('/api/orders', (req, res) => {
  res.json(loadData().orders);
});

app.post('/api/orders', (req, res) => {
  const { studentName, foods } = req.body;
  if (!studentName || !foods || !foods.length) {
    return res.status(400).json({ error: 'Name and at least one food required' });
  }
  const data = loadData();
  data.orders.push({
    studentName: studentName.trim(),
    foods,
    time: new Date().toLocaleTimeString()
  });
  saveData(data);
  res.json({ success: true });
});

app.post('/api/reset', (req, res) => {
  const data = loadData();
  data.orders = [];
  saveData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n  School Lunch Order System is running!\n`);
  console.log(`  Student page:  http://localhost:${PORT}`);
  console.log(`  Admin page:    http://localhost:${PORT}/admin.html`);
  console.log(`  Teacher page:  http://localhost:${PORT}/teacher.html\n`);
});
