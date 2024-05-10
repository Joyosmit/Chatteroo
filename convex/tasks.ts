import { v } from 'convex/values'
import {query, mutation} from './_generated/server'

export const getTasks = query({
    args: {},
    handler: async (ctx, args) => {
        const tasks = await ctx.db.query("tasks").collect()
        return tasks
    }
})

export const addTask = mutation({
    args: {
        text: v.string()
    },
    handler: async(ctx, args) => {
        const taskId = await ctx.db.insert("tasks", {text: args.text, completed: false})
        return taskId
    },
})

export const completeTask = mutation({
    args: {
        // id is of type id and for table tasks
        id: v.id("tasks"),
    },
    handler: async(ctx, args) => {
        // no need to specify that its for tasks table as file name is tasks.ts
        await ctx.db.patch( args.id, {completed: true})
    }
})

export const deleteTask = mutation({
    args: {
        id: v.id("tasks"),
    },
    handler: async(ctx, args) => {
        await ctx.db.delete(args.id)
    }
})