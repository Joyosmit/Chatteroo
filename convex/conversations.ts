import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
    args: {
        participants: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.id("_storage")),
        admin: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        // reverse is also used to check as [user_1, user_2] and [user_2, user_1] are same
        const existingConversations = await ctx.db
            .query("conversations")
            .filter(q =>
                q.or(
                    q.eq(q.field("participants"), args.participants),
                    q.eq(q.field("participants"), args.participants.reverse())
                )
            )
            .first()

        if (existingConversations) {
            return existingConversations._id;
        }

        let groupImage;

        if (args.groupImage) {
            // Later do this part
            groupImage = await ctx.storage.getUrl(args.groupImage) as string;
        }

        // insert anyways return a promise which resolves to the id of the inserted document
        const conversationId = await ctx.db.insert("conversations", {
            participants: args.participants,
            isGroup: args.isGroup,
            groupName: args.groupName,
            groupImage,
            admin: args.admin,
        })

        return conversationId;
    }
})

// get all of my conversations from the database
export const getMyConversations = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique()

        if (!user) throw new ConvexError("User not found");

        // get all convos
        const conversations = await ctx.db.query("conversations").collect();

        // get only MY convos
        const myConversations = conversations.filter((conversation) => {
            return conversation.participants.includes(user._id)
        })

        // we now need other details of the participants
        const conversationsWithDetails = await Promise.all(
            myConversations.map(async (conversation) => {
                let userDetails = {};
                if (!conversation.isGroup) {
                    const otherUser = conversation.participants.find((id) => id !== user._id);
                    const userProfile = await ctx.db
                        .query("users")
                        .filter(q => q.eq(q.field("_id"), otherUser))
                        .take(1)

                    userDetails = userProfile[0];
                }

                const lastMessage = await ctx.db
                    .query("messages")
                    .filter(q => q.eq(q.field("conversation"), conversation._id))
                    .order("desc")
                    .take(1)

                return {
                    ...userDetails,
                    ...conversation,
                    lastMessage: lastMessage[0] || null,
                }
            })
        )

        return conversationsWithDetails;
    }
})

export const kickUser = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthorized")
        }
        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_id", q => q.eq("_id", args.conversationId))
            .unique()

        if (!conversation) {
            throw new ConvexError("Conversation not found")
        }

        await ctx.db
        .patch(args.conversationId, {
            participants: conversation.participants.filter((id) => id !== args.userId)
        })
    }
})
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl()
})