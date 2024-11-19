const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db'); // Import the custom DB connection
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes'); // Import task routes
const jwtMiddleware = require('./middleware/authMiddleware');
const Task = require('./models/Task');  // Import the Task model
const methodOverride = require('method-override');  // Import method-override
const app = express();

// Load environment variables
dotenv.config();

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));  // Allow using _method in forms

// Connect to the database (this is handled by connectDB)
connectDB();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', jwtMiddleware, taskRoutes);  // Use task routes

// Landing Page
app.get('/', (req, res) => {
  res.render('index');
});

// Login and Register Routes (render views)
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.use(methodOverride('_method'));  // Allow _method for PUT/PATCH

// Dashboard Page (requires user authentication)
app.get('/dashboard', jwtMiddleware, (req, res) => {
  // Check if req.user is set
  if (!req.user) {
    return res.status(401).send("User not found, please log in again.");
  }

  // Pass tasks and user to the view
  Task.find({ user: req.user._id })  // Get tasks for the authenticated user
    .then((tasks) => {
      res.render('dashboard', { user: req.user, tasks: tasks });  // Pass user and tasks to the view
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving tasks");
    });
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
