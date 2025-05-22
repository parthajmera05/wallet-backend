import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

// POST /admin/register
export async function adminRegister(req, res) {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) return res.status(409).json({ message: 'Admin already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: { email, passwordHash }
    });

    res.status(201).json({ message: 'Admin registered successfully', admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// POST /admin/login
export async function adminLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(admin.id, 'admin');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
