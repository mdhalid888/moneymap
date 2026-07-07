import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendEmail } from '../utils/sendEmail';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      income: 0,
      theme: 'light',
    });

    await newUser.save();

    // Construct greeting email
    const emailHtml = `
      <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #edf2f7; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 1px solid #edf2f7; padding-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.025em;">MoneyMap</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Your Path to Financial Freedom</p>
        </div>
        
        <div style="padding: 30px 20px; color: #1e293b;">
          <h3 style="margin-top: 0; font-size: 20px; font-weight: 700; color: #0f172a;">Welcome to MoneyMap, ${name}! 🎉</h3>
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            We are absolutely thrilled to welcome you to the MoneyMap community. You have taken a vital step toward managing your expenditures, tracking your savings, and securing your financial future.
          </p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Here is how to get started on your dashboard:
          </p>
          
          <ul style="padding-left: 20px; font-size: 14px; line-height: 1.8; color: #475569;">
            <li><strong>Set Your Income:</strong> Click the edit icon on the Income Card to configure your baseline salary.</li>
            <li><strong>Add Expenses:</strong> Log transactions dynamically to keep your balance cards updated in real-time.</li>
            <li><strong>View Analytics:</strong> Check out the Statistics view to explore category distributions and daily spending trends.</li>
          </ul>

          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 10px; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);">
              Go to Dashboard
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; 2026 MoneyMap. Secure Data Vault Encryption Active.
        </div>
      </div>
    `;

    // Dispatch welcome email asynchronously
    sendEmail({
      to: email,
      subject: `Welcome to MoneyMap, ${name}! 💰`,
      html: emailHtml
    }).catch(err => console.error('Welcome email background delivery error:', err));

    res.status(201).json({ message: 'Registration successful. Please log in.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'moneymapsecretkey2026',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        income: user.income,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Simulate lookup
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Return a mock reset success message per requirements
    res.json({
      message: 'Password reset link simulated. (For demo purposes: You can update your password in Settings after logging in!)'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};
