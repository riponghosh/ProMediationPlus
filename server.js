import express from 'express';
import fetch from 'node-fetch'; // node-fetch v3+ supports ESM
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.BACKEND_PORT || 3001; // Use a different port than Vite

app.use(cors()); // Enable CORS for requests from the frontend
app.use(express.json()); // Middleware to parse JSON bodies

// Define the /api/chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body; // Extract context
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OpenAI API key not configured in .env file');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    if (!messages || !Array.isArray(messages)) { // Validate messages format
        return res.status(400).json({ error: 'Missing or invalid messages in request body' });
    }

    // --- OpenAI API Call Logic ---
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Or your preferred model
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for a mediation dashboard. Answer questions based ONLY on the provided context.
Current Date: ${new Date().toLocaleDateString()}

AVAILABLE CONTEXT:
--- START CONTACTS ---
${context?.contacts?.length > 0 ? JSON.stringify(context.contacts, null, 2) : 'No contacts data provided.'}
--- END CONTACTS ---

--- START NOTES ---
${context?.notes?.length > 0 ? JSON.stringify(context.notes, null, 2) : 'No notes data provided.'}
--- END NOTES ---
--- START TASKS ---
${context?.tasks?.length > 0 ? JSON.stringify(context.tasks, null, 2) : 'No tasks data provided.'}
--- END TASKS ---

--- START CASE FILES (Metadata) ---
${context?.caseFiles?.length > 0 ? JSON.stringify(context.caseFiles, null, 2) : 'No case files data provided.'}
--- END CASE FILES (Metadata) ---

--- START DOCUMENTS ---
${context?.documents?.length > 0 ? JSON.stringify(context.documents, null, 2) : 'No documents data provided.'}
--- END DOCUMENTS ---

--- START INTAKE FORMS (Placeholder) ---
${context?.intakeForms ? JSON.stringify(context.intakeForms, null, 2) : 'No intake form data provided.'}
--- END INTAKE FORMS ---

Answer the user's question based ONLY on the provided context above.` // Correctly closed template literal
          },
          ...messages // Include the conversation history
        ],
        temperature: 0.7,
      })
    });

    if (!openAIResponse.ok) {
        const errorData = await openAIResponse.text(); // Get error details if possible
        console.error(`OpenAI API Error (${openAIResponse.status}): ${errorData}`);
        throw new Error(`OpenAI API request failed with status ${openAIResponse.status}`);
    }

    const data = await openAIResponse.json();
    // --- End OpenAI API Call Logic ---

    const responseContent = data.choices?.[0]?.message?.content;

    if (!responseContent) {
        console.error('Invalid response structure from OpenAI:', data);
        throw new Error("Failed to extract content from OpenAI response");
    }

    res.status(200).json({
      content: responseContent
    });

  } catch (error) {
    console.error('Error in /api/chat endpoint:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error processing your request'
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});