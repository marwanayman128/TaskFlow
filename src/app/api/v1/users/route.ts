import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";

// GET all users
export async function GET() {
  try {
    // const session = await auth();
    // Allow unauthenticated access for demo login page
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        organizationId: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        phone: true,
        language: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: { users },
      meta: { total: users.length },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, password, fullName, phone, language, role, active } = body;

    // Validate required fields
    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Get default organization
    const defaultOrg = await prisma.organization.findFirst();
    if (!defaultOrg) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        organizationId: defaultOrg.id,
        username,
        email,
        passwordHash,
        fullName,
        phone: phone || null,
        language: language || "en",
        role: role || "USER",
        active: active !== undefined ? active : true,
      },
      select: {
        id: true,
        organizationId: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        phone: true,
        language: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
