/**
 * Run with: npx tsx scripts/seed-students.ts
 *
 * Seeds: School, AcademicYear, Super Admin, School Admin, Teachers (wali kelas +
 * asisten wali kelas), ClassRooms, Parents, and Students — sourced from
 * scripts/data/students-seed-data.json (derived from DATA_SISWA_20262027.xlsx).
 *
 * Safe to re-run:
 *  - School: skipped if a document with the same `name` exists
 *  - AcademicYear: skipped if `label + semester` exists (unique index)
 *  - Users (admin/superadmin/teacher/parent): skipped if a user with the same
 *    `name` + `role` already exists (email is regenerated only on first creation)
 *  - ClassRoom: skipped if `name + academicYearId` exists
 *  - Student: skipped if `nisn` already exists
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { UserModel } from "@/models/User";
import { ClassRoomModel } from "@/models/ClassRoom";
import { StudentModel } from "@/models/Student";
import { AcademicYearModel } from "@/models/AcademicYear";
import { SchoolModel } from "@/models/School";
import { ROLES } from "@/constants/roles";
import { Types } from "mongoose";

// ---------------------------------------------------------------------------
// Types matching scripts/data/students-seed-data.json
// ---------------------------------------------------------------------------
interface SeedSiswa {
  no: number;
  fullName: string;
  nisn: string;
  gender: "male" | "female";
  tempatLahir: string | null;
  dateOfBirth: string | null; // "YYYY-MM-DD"
  parentName: string;
}

interface SeedKelas {
  kelas: string; // e.g. "1A"
  grade: number;
  waliKelas: string;
  asistenWaliKelas: string | null;
  siswa: SeedSiswa[];
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DEFAULT_PASSWORD = "nurulhasan2026";
const EMAIL_DOMAIN = "nurulhasan.id";
const ACADEMIC_YEAR_LABEL = "2026/2027";
const ACADEMIC_YEAR_SEMESTER = "ganjil" as const;
// NOTE: exact semester dates were not provided by the user; adjust if the
// real school calendar differs.
const ACADEMIC_YEAR_START = new Date("2026-07-13");
const ACADEMIC_YEAR_END = new Date("2027-01-31");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomDigits4(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function uniqueEmail(base: string, withSuffix: boolean): Promise<string> {
  const slug = slugify(base);
  if (!withSuffix) {
    const email = `${slug}@${EMAIL_DOMAIN}`;
    const exists = await UserModel.findOne({ email });
    if (!exists) return email;
    // fall back to a numeric suffix on collision
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const email = `${slug}_${randomDigits4()}@${EMAIL_DOMAIN}`;
    const exists = await UserModel.findOne({ email });
    if (!exists) return email;
  }
}

/** Find-or-create a User by exact name + role (idempotent across re-runs). */
async function findOrCreateUser(params: {
  name: string;
  role: string;
  passwordHash: string;
  schoolId: unknown;
  emailWithSuffix: boolean;
}) {
  const existing = await UserModel.findOne({ name: params.name, role: params.role });
  if (existing) return { user: existing, created: false };

  const email = await uniqueEmail(params.name, params.emailWithSuffix);
  const user = await UserModel.create({
    name: params.name,
    email,
    passwordHash: params.passwordHash,
    role: params.role,
    schoolId: params.schoolId,
  });
  return { user, created: true };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  await connectDB();

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // 1. School --------------------------------------------------------------
  let school = await SchoolModel.findOne({ name: "Sekolah Islam Terpadu Nurul Hasan" });
  if (!school) {
    school = await SchoolModel.create({
      name: "Sekolah Islam Terpadu Nurul Hasan",
      npsn: "60101234", // dummy — replace with the real NPSN when available
      address: "Tabona, Ternate Selatan, Kota Ternate, Maluku Utara",
      phone: "+6282313173055",
      principalName: "Yulli Apriani, S.Pd", // dummy — replace with the real principal's name
    });
    console.log(`created: School ${school.name}`);
  } else {
    console.log(`skip (exists): School ${school.name}`);
  }

  // 2. Academic Year ---------------------------------------------------------
  let academicYear = await AcademicYearModel.findOne({
    label: ACADEMIC_YEAR_LABEL,
    semester: ACADEMIC_YEAR_SEMESTER,
  });
  if (!academicYear) {
    academicYear = await AcademicYearModel.create({
      label: ACADEMIC_YEAR_LABEL,
      semester: ACADEMIC_YEAR_SEMESTER,
      startDate: ACADEMIC_YEAR_START,
      endDate: ACADEMIC_YEAR_END,
      isActive: true,
    });
    console.log(`created: AcademicYear ${academicYear.label} - ${academicYear.semester}`);
  } else {
    console.log(`skip (exists): AcademicYear ${academicYear.label} - ${academicYear.semester}`);
  }

  if (String(school.activeAcademicYearId) !== String(academicYear._id)) {
    school.activeAcademicYearId = academicYear._id;
    await school.save();
    console.log(`updated: School.activeAcademicYearId -> ${academicYear._id}`);
  }

  // 3. Super Admin & School Admin -------------------------------------------
  const adminSeeds = [
    { name: "Super Admin", role: ROLES.SUPER_ADMIN, schoolId: null },
    { name: "Admin", role: ROLES.SCHOOL_ADMIN, schoolId: school._id },
  ];
  for (const a of adminSeeds) {
    const { user, created } = await findOrCreateUser({
      name: a.name,
      role: a.role,
      passwordHash,
      schoolId: a.schoolId,
      emailWithSuffix: false,
    });
    console.log(`${created ? "created" : "skip (exists)"}: ${a.role} ${user.email}`);
  }

  // 4. Load class + student data --------------------------------------------
  const dataPath = path.join(process.cwd(), "scripts", "data", "students-seed-data.json");
  const classes: SeedKelas[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // Cache of parent users already resolved in this run, keyed by normalized name
  const parentCache = new Map<string, Types.ObjectId>();

  let totalStudentsCreated = 0;
  let totalStudentsSkipped = 0;
  let totalParentsCreated = 0;
  let totalTeachersCreated = 0;

  for (const kelas of classes) {
    // 4a. Homeroom teacher (wali kelas)
    const { user: waliKelas, created: waliCreated } = await findOrCreateUser({
      name: kelas.waliKelas,
      role: ROLES.TEACHER,
      passwordHash,
      schoolId: school._id,
      emailWithSuffix: false,
    });
    if (waliCreated) totalTeachersCreated++;

    // 4b. Assistant teacher (asisten wali kelas), if present
    let asisten: typeof waliKelas | null = null;
    if (kelas.asistenWaliKelas) {
      const { user, created } = await findOrCreateUser({
        name: kelas.asistenWaliKelas,
        role: ROLES.TEACHER,
        passwordHash,
        schoolId: school._id,
        emailWithSuffix: false,
      });
      asisten = user;
      if (created) totalTeachersCreated++;
    }

    // 4c. ClassRoom
    let classRoom = await ClassRoomModel.findOne({
      name: kelas.kelas,
      academicYearId: academicYear._id,
    });
    if (!classRoom) {
      classRoom = await ClassRoomModel.create({
        name: kelas.kelas,
        grade: kelas.grade,
        academicYearId: academicYear._id,
        homeroomTeacherId: waliKelas._id,
        teacherIds: asisten ? [asisten._id] : [],
        isActive: true,
      });
      console.log(`created: ClassRoom ${classRoom.name}`);
    } else {
      console.log(`skip (exists): ClassRoom ${classRoom.name}`);
    }

    // 4d. Link teachers -> classIds
    await UserModel.updateOne(
      { _id: waliKelas._id },
      { $addToSet: { classIds: classRoom._id } },
    );
    if (asisten) {
      await UserModel.updateOne(
        { _id: asisten._id },
        { $addToSet: { classIds: classRoom._id } },
      );
    }

    // 4e. Students + Parents
    for (const s of kelas.siswa) {
      const existingStudent = await StudentModel.findOne({ nisn: s.nisn });
      if (existingStudent) {
        totalStudentsSkipped++;
        continue;
      }

      const parentKey = s.parentName.trim().toLowerCase();
      let parentId = parentCache.get(parentKey);

      if (!parentId) {
        const { user: parentUser, created } = await findOrCreateUser({
          name: s.parentName,
          role: ROLES.PARENT,
          passwordHash,
          schoolId: school._id,
          emailWithSuffix: true,
        });
        parentId = parentUser._id;
        parentCache.set(parentKey, parentId);
        if (created) totalParentsCreated++;
      }

      const student = await StudentModel.create({
        fullName: s.fullName,
        nisn: s.nisn,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth ? new Date(s.dateOfBirth) : undefined,
        classId: classRoom._id,
        parentIds: [parentId],
        isActive: true,
      });
      totalStudentsCreated++;

      await UserModel.updateOne(
        { _id: parentId },
        { $addToSet: { studentIds: student._id } },
      );
    }

    // 4f. Refresh denormalized studentCount
    const studentCount = await StudentModel.countDocuments({
      classId: classRoom._id,
      isActive: true,
    });
    if (classRoom.studentCount !== studentCount) {
      classRoom.studentCount = studentCount;
      await classRoom.save();
    }
  }

  console.log("\n----- Summary -----");
  console.log(`Teachers created : ${totalTeachersCreated}`);
  console.log(`Parents created  : ${totalParentsCreated}`);
  console.log(`Students created : ${totalStudentsCreated}`);
  console.log(`Students skipped : ${totalStudentsSkipped} (already existed by NISN)`);
  console.log(`Default password : ${DEFAULT_PASSWORD}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});