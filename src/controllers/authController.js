import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export async function register(req, res) {
  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if(existing && existing.isDeleted){
      const user = await prisma.user.update({
        where: { id: existing.id },
        data: { isDeleted: false }
      });
      return res.status(200).json({ message: 'User restored', user });
    }
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { isDeleted: false, email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await comparePassword(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
