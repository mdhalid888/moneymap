import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import * as authController from './controllers/authController';
import * as userController from './controllers/userController';
import * as expenseController from './controllers/expenseController';
import { auth } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' })); // Allow all cross-origins for development/testing ease
app.use(express.json());

// Routes
// 1. Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/forgot-password', authController.forgotPassword);

// 2. User configurations (all protected)
app.get('/api/users/me', auth, userController.getMe);
app.put('/api/users/income', auth, userController.updateIncome);
app.put('/api/users/theme', auth, userController.updateTheme);
app.put('/api/users/password', auth, userController.updatePassword);

// 3. Expense management routes (all protected)
app.get('/api/expenses', auth, expenseController.getExpenses);
app.post('/api/expenses', auth, expenseController.createExpense);
app.put('/api/expenses/:id', auth, expenseController.updateExpense);
app.delete('/api/expenses/:id', auth, expenseController.deleteExpense);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MoneyMap server is running' });
});

// Database connection & start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
