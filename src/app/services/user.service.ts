import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createUser(username: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
      },
    });
    return user;
  }

  async authenticateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    } else {
      return null;
    }
  }
}