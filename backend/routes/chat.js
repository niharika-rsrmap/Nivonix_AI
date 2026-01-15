import express from 'express';
import Thread from "../models/Thread.js";
import getOpenAIResponse from '../utils/openai.js';
import jwt from 'jsonwebtoken';

const router=express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/", verifyToken, async(req, res) => {
   console.log("🔵 POST /chat - processing request");
   console.log("Raw body:", req.body);
   console.log("Body type:", typeof req.body);
   console.log("Body keys:", Object.keys(req.body || {}));
   
   const threadId = req.body?.threadId;
   const message = req.body?.message;
   const userId = req.userId;
   
   console.log("Extracted values:", { threadId, message, userId });
   
   if (!threadId || !message) {
    return res.status(400).json({ 
      error: "missing required fields", 
      received: { threadId, message, userId }
    });
   }
   try {
    let thread = await Thread.findOne({ userId, threadId });
    if (!thread) {
        thread = new Thread({
            userId,
            threadId,
            title: message.substring(0, 50),
            messages: [{ role: "user", content: message }]
        });
        await thread.save();
    } else {
        thread.messages.push({ role: "user", content: message });
    }
    
    const assistantReply = await getOpenAIResponse(message);
    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();    
    res.json({ reply: assistantReply });
   } catch(err) {
    console.log("Error in POST / route:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
   }
});

router.post("/generate", verifyToken, async(req, res) => {
   const { threadId, message } = req.body;
   const userId = req.userId;
   
   if (!threadId || !message) {
    return res.status(400).json({ error: "missing required fields" });
   }
   try {
    let thread = await Thread.findOne({ userId, threadId });
    if (!thread) {
        thread = new Thread({
            userId,
            threadId,
            title: message.substring(0, 50),
            messages: [{ role: "user", content: message }]
        });
        await thread.save();
    } else {
        thread.messages.push({ role: "user", content: message });
    }
    
    const assistantReply = await getOpenAIResponse(message);
    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();    
    res.json({ reply: assistantReply });
   } catch(err) {
    console.log("Error in /generate route:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
   }
});

router.get("/thread", verifyToken, async(req,res)=>{
    const userId = req.userId;
    try{
       const threads = await Thread.find({ userId }).sort({updatedAt:-1});
       res.json(threads);
    }
    catch(err){
        res.status(500).json({error: "Error fetching threads"});
    }
})

router.get("/thread/:threadId", verifyToken, async(req, res) => {
    const { threadId } = req.params;
    const userId = req.userId;

    try {
    const thread = await Thread.findOne({ userId, threadId });
       if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
       }    
       res.json(thread.messages);
    }
    catch(err) {
        console.log("Error fetching thread:", err);
        res.status(500).json({ error: "Error fetching thread" });
    }
});

router.delete("/thread/:threadId", verifyToken, async(req,res)=>{
         const{ threadId } = req.params;
         const userId = req.userId;
         try{
           const deletedThread = await Thread.findOneAndDelete({ userId, threadId })
           if(!deletedThread){
            return res.status(404).json({error:"Thread not found"});
           }
              res.json({message:"Thread deleted successfully"});
        }
         catch(err){
            console.log(err);
            res.status(500).json({error:"Failed to delete thread"});
         }
});

export default router;