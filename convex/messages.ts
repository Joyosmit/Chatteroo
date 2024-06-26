import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

type MessageType = "text" | "image" | "video" | '';


export const sendTextMessage = mutation({
    args: {
        sender: v.string(),
        content: v.string(),
        conversation: v.id("conversations"),
        // replyMessageType: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("video"), v.literal(""))),
        // replyMessageSenderName: v.optional(v.string()),
        // replyMesssageContent: v.optional(v.string())
        replyMessageId: v.optional(v.id("messages"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // If an unauthorized user tries to get users, throw an error
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_tokenIdentifier", q => q.eq("tokenIdentifier", identity.tokenIdentifier)).first()

        if (!user) {
            throw new ConvexError("User not found");
        }

        // find the corresponding conversation
        const conversation = await ctx.db.query("conversations").filter(q => q.eq(q.field("_id"), args.conversation)).unique();
        if (!conversation) {
            throw new ConvexError("Conversation not found");
        }
        if (!conversation.participants.includes(user._id)) {
            throw new ConvexError("You are not in this conversation");
        }
        if (!args.replyMessageId) {
            await ctx.db.insert("messages", {
                sender: args.sender,
                content: args.content,
                conversation: args.conversation,
                messageType: "text",
            })
        } else {
            await ctx.db.insert("messages", {
                sender: args.sender,
                content: args.content,
                conversation: args.conversation,
                messageType: "text",
                replyMessageId: args.replyMessageId
            })
        }

        if (args.content.startsWith("@gemini")) {
            await ctx.scheduler.runAfter(0, api.gemini.chat, {
                messageBody: args.content,
                conversation: args.conversation,
            })
        }
    }
})

export const sendGeminiMessage = mutation({
    args: {
        content: v.string(),
        conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        let strDb;
        if (args.content.substring(0, 8).trim() === "@gemini") {
            strDb = args.content.slice(8);
        } else {
            strDb = args.content;
        }
        console.log("PRINTING STRDB", strDb)
        await ctx.db.insert("messages", {
            sender: "Gemini",
            content: strDb,
            conversation: args.conversation,
            messageType: "text",
        })
    }
})


export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
        messageType: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
        storageId: v.optional(v.id("_storage"))
        // messageContent: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // If an unauthorized user tries to get users, throw an error
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        await ctx.db.delete(args.messageId)

        if (args.messageType === "image" || args.messageType === "video") {
            await ctx.storage.delete(args.storageId!)
        }
    }
})

export const getMessages = query({
    args: {
        conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // If an unauthorized user tries to get users, throw an error
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", q => q.eq("conversation", args.conversation))
            .collect();

        const userProfileCache = new Map()
        const ball = 3
        // messages has sender's id, we need to get the sender's user details
        const messagesWithSender = await Promise.all(
            messages.map(async message => {
                let replyMessageSenderName = ''
                let replyMessageSenderMessage = ''
                let replyMessageSenderMessageType: string = ''
                if (message.replyMessageId) {
                    const replyMessage = await ctx.db.query("messages").filter(q => q.eq(q.field("_id"), message.replyMessageId)).first()
                    if (userProfileCache.has(replyMessage?.sender)) {
                        replyMessageSenderName = userProfileCache.get(replyMessage?.sender).name
                        replyMessageSenderMessage = replyMessage?.content!
                        replyMessageSenderMessageType = replyMessage?.messageType!
                    }
                    else {
                        const replySender = await ctx.db
                            .query("users")
                            .filter(q => q.eq(q.field("_id"), replyMessage?.sender))
                            .first();
                        replyMessageSenderName = replySender?.name!
                        replyMessageSenderMessage = replyMessage?.content!
                        replyMessageSenderMessageType = replyMessage?.messageType!
                        userProfileCache.set(replyMessage?.sender, replySender)
                    }
                }
                if (message.sender === "Gemini") {
                    return {
                        ...message,
                        sender: {
                            name: "Gemini",
                            image: "/gemini.png"
                        },
                        replyMessageSenderName: "",
                        replyMessageSenderMessage: "",
                        replyMessageSenderMessageType: ""
                    }
                }
                let sender;
                // if we have already fetched the user details, use it from cache
                if (userProfileCache.has(message.sender)) {
                    sender = userProfileCache.get(message.sender)
                }
                else {
                    sender = await ctx.db
                        .query("users")
                        .filter(q => q.eq(q.field("_id"), message.sender))
                        .first();
                    userProfileCache.set(message.sender, sender)
                }
                return {
                    ...message,
                    sender,
                    replyMessageSenderName,
                    replyMessageSenderMessage,
                    replyMessageSenderMessageType
                }
            })
        )

        return messagesWithSender
    }
})

export const sendImage = mutation({
    args: {
        sender: v.id("users"),
        conversation: v.id("conversations"),
        imgId: v.id("_storage"),
        replyMessageId: v.optional(v.id("messages"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }
        const content = await ctx.storage.getUrl(args.imgId) as string;
        if (!args.replyMessageId) {
            await ctx.db.insert("messages", {
                content: content,
                conversation: args.conversation,
                sender: args.sender,
                messageType: "image",
                storageId: args.imgId
            })
        } else {
            await ctx.db.insert("messages", {
                content: content,
                conversation: args.conversation,
                sender: args.sender,
                messageType: "image",
                storageId: args.imgId,
                replyMessageId: args.replyMessageId
            })
        }
    }
})

export const sendVideo = mutation({
    args: {
        videoId: v.id("_storage"),
        sender: v.id("users"),
        conversation: v.id("conversations"),
        replyMessageId: v.optional(v.id("messages"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("Unauthorized");
        }

        const content = (await ctx.storage.getUrl(args.videoId)) as string;
        if (!args.replyMessageId) {
            await ctx.db.insert("messages", {
                content: content,
                sender: args.sender,
                messageType: "video",
                conversation: args.conversation,
                storageId: args.videoId,
            });
        } else {
            await ctx.db.insert("messages", {
                content: content,
                sender: args.sender,
                messageType: "video",
                conversation: args.conversation,
                storageId: args.videoId,
                replyMessageId: args.replyMessageId,
            });
        }
        // await ctx.db.insert("messages", {
        //     content: content,
        //     sender: args.sender,
        //     messageType: "video",
        //     conversation: args.conversation,
        //     storageId: args.videoId,
        // });
    },
});
// This method is unoptimized, it will be slow for large number of messages
// as we are fetching user details for every message
// export const getMessages = query({
//     args: {
//         conversation: v.id("conversations"),
//     },
//     handler: async (ctx, args) => {
//         const identity = await ctx.auth.getUserIdentity();
//         // If an unauthorized user tries to get users, throw an error
//         if (!identity) {
//             throw new ConvexError("Unauthorized");
//         }

//         const messages = await ctx.db
//             .query("messages")
//             .withIndex("by_conversation", q => q.eq("conversation", args.conversation))
//             .collect();

//         // messages has sender's id, we need to get the sender's user details
//         const messagesWithSender = await Promise.all(
//             messages.map(async message => {
//                 const sender = await ctx.db
//                     .query("users")
//                     .filter(q => q.eq(q.field("_id"), message.sender))
//                     .first();
//                 return {
//                     ...message,
//                     sender,
//                 }
//             })
//         )

//         return messagesWithSender
//     }
// })