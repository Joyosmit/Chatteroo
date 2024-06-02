import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const { GoogleGenerativeAI } = require("@google/generative-ai");
// import dotenv from "dotenv";
// dotenv.config({path:"../.env.local"});
require('dotenv').config({ path: '../.env.local' });


// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ...

// The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ...

export const chat = action({
    args: {
        messageBody: v.string(),
        conversation: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const strInp = args.messageBody.slice(8);
        const prompt = `You are a terse bot in a group chat responding to questions within 200 characters. Answer this- ${strInp}.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);

        await ctx.runMutation(api.messages.sendGeminiMessage, {
            content: text ? text : "I'm sorry, I don't have an answer for that.",
            conversation: args.conversation,
        })
    }
})