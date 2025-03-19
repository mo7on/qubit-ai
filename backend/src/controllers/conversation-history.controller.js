exports.createHistoryEntry = async (req, res) => {
  try {
    const { userId } = req.params;
    const { conversation_id, summary } = req.body;
    
    // Create history entry with correct field names
    const historyEntry = await DatabaseService.conversationHistory.create({
      user_id: userId,
      conversation_id,
      summary,
      created_at: new Date()
    });
    
    // ... rest of the function ...
  } catch (error) {
    // ... error handling ...
  }
};