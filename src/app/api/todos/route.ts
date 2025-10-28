import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession()

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const todos = await prisma.todo.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(todos)
    } catch (error) {
        console.error("Error fetching todos:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession()

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 } 
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if(!user) {
             return NextResponse.json(
                { error: "User not found" },
                { status: 404 } 
             )
        }

        const { title, description } = await request.json()

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            )
        }

        const todo = await prisma.todo.create({
            data: {
                title,
                description: description || null,
                userId: user.id
            }
        })

        return NextResponse.json(todo, { status: 201 })
    } catch (error) {
        console.error("Error creating todo:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}