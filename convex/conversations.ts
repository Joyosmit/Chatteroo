import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { group } from "console";

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
        if(!identity) {
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

        if(existingConversations) {
            return existingConversations._id;
        }

        let groupImage;

        if(args.groupImage){
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

export const generateUploadUrl = mutation(async(ctx) => {
    return await ctx.storage.generateUploadUrl()
})