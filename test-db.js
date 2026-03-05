const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany();
  console.log(
    "All users:",
    users.map((u) => u.email),
  );

  const user = await prisma.user.findUnique({
    where: { email: "admin@gems.com" },
  });
  console.log("Admin user found:", !!user);

  if (user) {
    const valid = await bcrypt.compare("admin123", user.password);
    console.log("Password valid:", valid);
  }

  await prisma.$disconnect();
}

test().catch(console.error);
