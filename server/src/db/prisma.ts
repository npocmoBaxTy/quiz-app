import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
import { PrismaClient } from "../../generated/prisma/client.js"

dotenv.config()

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export const prisma = new PrismaClient({ adapter })
