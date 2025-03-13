export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, context } = req.body;

    // In a real implementation, you would call your AI backend here
    // For now, we'll simulate a response
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    // Simple response based on the context
    let response = `I understand you're asking about "${context.topic}". `;
    
    if (lastUserMessage.content.toLowerCase().includes('what is')) {
      response += `This topic covers ${context.overview}`;
    } else if (lastUserMessage.content.toLowerCase().includes('key concept')) {
      const concepts = Object.entries(context.keyConcepts || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join('. ');
      response += `The key concepts include: ${concepts}`;
    } else {
      response += `Feel free to ask specific questions about this topic, and I'll do my best to help!`;
    }
    
    // Simulate a delay to make it feel more natural
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return res.status(200).json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
} 