import bcrypt from "bcryptjs";

// Function to hash a password
export async function hashPassword(password: string) {
  const saltRounds = 10; // You can adjust the number of salt rounds as needed
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// Function to compare a password with a hashed password
export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}
