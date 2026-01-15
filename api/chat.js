import Thread from '../backend/models/Thread.js';
import getOpenAIResponse from '../backend/utils/openai.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('No token provided');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const userId = verifyToken(req);
    const { action } = req.query;

    if (action === 'send' && req.method === 'POST') {
      return handleSendMessage(req, res, userId);
    } else if (action === 'generate' && req.method === 'POST') {
      return handleGenerate(req, res, userId);
    } else if (action === 'threads' && req.method === 'GET') {
      return handleGetThreads(req, res, userId);
    } else if (action === 'thread' && req.method === 'GET') {
      return handleGetThread(req, res, userId);
    } else if (action === 'delete' && req.method === 'DELETE') {
      return handleDeleteThread(req, res, userId);
    } else {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(401).json({ error: err.message });
  }
}

async function handleSendMessage(req, res, userId) {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  try {
    let thread = await Thread.findOne({ userId, threadId });
    if (!thread) {
      thread = new Thread({
        userId,
        threadId,
        title: message.substring(0, 50),
        messages: [{ role: 'user', content: message }],
      });
      await thread.save();
    } else {
      thread.messages.push({ role: 'user', content: message });
    }

    const assistantReply = await getOpenAIResponse(message);
    thread.messages.push({ role: 'assistant', content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

async function handleGenerate(req, res, userId) {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  try {
    let thread = await Thread.findOne({ userId, threadId });
    if (!thread) {
      thread = new Thread({
        userId,
        threadId,
        title: message.substring(0, 50),
        messages: [{ role: 'user', content: message }],
      });
      await thread.save();
    } else {
      thread.messages.push({ role: 'user', content: message });
    }

    const assistantReply = await getOpenAIResponse(message);
    thread.messages.push({ role: 'assistant', content: assistantReply });
    thread.updatedAt = new Date();
    await thread.save();

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error('Error generating:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

async function handleGetThreads(req, res, userId) {
  try {
    const threads = await Thread.find({ userId }).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    console.error('Error fetching threads:', err);
    res.status(500).json({ error: 'Error fetching threads' });
  }
}

async function handleGetThread(req, res, userId) {
  const { threadId } = req.query;

  try {
    const thread = await Thread.findOne({ userId, threadId });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.json(thread.messages);
  } catch (err) {
    console.error('Error fetching thread:', err);
    res.status(500).json({ error: 'Error fetching thread' });
  }
}

async function handleDeleteThread(req, res, userId) {
  const { threadId } = req.query;

  try {
    const deletedThread = await Thread.findOneAndDelete({ userId, threadId });
    if (!deletedThread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.json({ message: 'Thread deleted successfully' });
  } catch (err) {
    console.error('Error deleting thread:', err);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
}
