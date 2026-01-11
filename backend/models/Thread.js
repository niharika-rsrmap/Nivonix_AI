
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant", "User", "Assistant"],
        required: true,
        set: (value) => value.toLowerCase()
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
const ThreadSchema=new mongoose.Schema(({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    threadId:{
        type:String,
        required:true
    },
    title:{
        type:String,
        default:"New Chat"
    },
    messages:[MessageSchema],
    createdAt:{
         type:Date,
         default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
}));

// Create compound index for userId and threadId
ThreadSchema.index({ userId: 1, threadId: 1 }, { unique: true });

export default mongoose.model("Thread"  ,ThreadSchema);