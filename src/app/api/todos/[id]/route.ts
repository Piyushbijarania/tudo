import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
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

        const { id } = await context.params
        const { title, description, completed } = await request.json()

        const existingTodo = await prisma.todo.findUnique({
            where: { id }
        })

        if (!existingTodo || existingTodo.userId !== user.id) {
            return NextResponse.json(
                { error: "todo not found" },
                { status: 404 }
            )
        }

        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(completed !== undefined && { completed })
            }
        })

        return NextResponse.json(updatedTodo)
    } catch (error) {
        console.error("Error updating todo:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
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

        const { id } = await context.params

        const existingTodo = await prisma.todo.findUnique({
            where: { id }
        })

        if (!existingTodo || existingTodo.userId !== user.id) {
            return NextResponse.json(
                { error: "Todo not found" },
                { status: 404 }
            )
        }

        await prisma.todo.delete({
            where: { id }
        })

        return NextResponse.json(
            { message: "Todo deleted successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error deleting todo:", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}