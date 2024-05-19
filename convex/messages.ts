import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const sendTextMessage = mutation({
    args: {
        sender: v.string(),
        content: v.string(),
        conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // If an unauthorized user tries to get users, throw an error
        if(!identity){
            throw new ConvexError("Unauthorized");
        }

        const user = await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).first()

        if(!user){
            throw new ConvexError("User not found");
        }

        // find the corresponding conversation
        const conversation = await ctx.db.query("conversations").filter(q => q.eq(q.field("_id"), args.conversation)).unique();
        if(!conversation){
            throw new ConvexError("Conversation not found");
        }
        if(!conversation.participants.includes(user._id)){
            throw new ConvexError("You are not in this conversation");
        }

        await ctx.db.insert("messages", {
            sender: args.sender,
            content: args.content,
            conversation: args.conversation,
            messageType: "text",
        })
    }
})