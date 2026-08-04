/**
 * Run with: npx tsx scripts/seed.ts
 * Creates one user per role for local testing. Safe to re-run (skips existing emails).
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { ROLES } from "@/constants/roles";

async function main() {
  await connectDB();

  const seedUsers = [
    { name: "Super Admin", email: "superadmin@mutabaah.dev", role: ROLES.SUPER_ADMIN },
    { name: "Admin SDIT", email: "admin@mutabaah.dev", role: ROLES.SCHOOL_ADMIN },
    { name: "Ustadz Fulan", email: "guru@mutabaah.dev", role: ROLES.TEACHER },
    { name: "Bapak Ahmad", email: "ortu@mutabaah.dev", role: ROLES.PARENT },
  ];

  const passwordHash = await bcrypt.hash("Password123!", 12);

  for (const u of seedUsers) {
    const exists = await UserModel.findOne({ email: u.email });
    if (exists) {
      console.log(`skip (exists): ${u.email}`);
      continue;
    }
    await UserModel.create({ ...u, passwordHash });
    console.log(`created: ${u.email} / Password123!`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
