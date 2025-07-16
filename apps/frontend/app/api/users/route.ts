import { NextResponse } from "next/server"
import * as z from "zod"

// --- Mock Database ---
// In a real app, you'd import your database client here.
const mockUsers: any[] = []
// ---

// Zod schema for server-side validation
const userCreationSchema = z.object({
  merchantId: z.string().uuid({ message: "Invalid merchant ID." }),
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["Cashier", "Manager", "Viewer"]),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const data = userCreationSchema.parse(json)

    // Simulate checking for a duplicate email in the database
    if (mockUsers.some((user) => user.email === data.email)) {
      return NextResponse.json({ message: "A user with this email already exists." }, { status: 409 }) // 409 Conflict
    }

    // Simulate creating the user in the database
    const newUser = {
      id: `U${String(mockUsers.length + 1).padStart(3, "0")}`,
      ...data,
      status: "active",
      createdAt: new Date().toISOString(),
    }
    // Don't store the plain password
    delete (newUser as any).password
    mockUsers.push(newUser)

    console.log("New user created:", newUser)
    console.log("All users:", mockUsers)

    // In a real app, you would also trigger an email to be sent here if `sendCredentials` was true.

    return NextResponse.json(newUser, { status: 201 }) // 201 Created
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.flatten().fieldErrors }, { status: 400 }) // 400 Bad Request
    }
    // Generic server error
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 })
  }
}
