import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user details' });
  }
};

export const updateIncome = async (req: AuthRequest, res: Response) => {
  try {
    const { income } = req.body;
    if (income === undefined || typeof income !== 'number') {
      return res.status(400).json({ message: 'Valid income amount is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { income },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Income updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating income' });
  }
};

export const updateTheme = async (req: AuthRequest, res: Response) => {
  try {
    const { theme } = req.body;
    if (!theme || (theme !== 'light' && theme !== 'dark')) {
      return res.status(400).json({ message: 'Valid theme is required ("light" or "dark")' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { theme },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Theme updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating theme' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error changing password' });
  }
};
