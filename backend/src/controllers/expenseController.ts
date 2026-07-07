import { Response } from 'express';
import { Expense } from '../models/Expense';
import { AuthRequest } from '../middleware/auth';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving expenses' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, category, currency, date } = req.body;

    if (!title || amount === undefined || !category) {
      return res.status(400).json({ message: 'Title, amount and category are required' });
    }

    const newExpense = new Expense({
      title,
      amount,
      category,
      currency: currency || '$',
      date: date ? new Date(date) : new Date(),
      userId: req.userId,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, amount, category, currency, date } = req.body;

    // Check if expense exists and belongs to user
    const expense = await Expense.findOne({ _id: id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (currency !== undefined) expense.currency = currency;
    if (date !== undefined) expense.date = new Date(date);

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating expense' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};
