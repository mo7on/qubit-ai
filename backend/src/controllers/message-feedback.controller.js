exports.createFeedback = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { rating, comment } = req.body;
    
    // Get the message to ensure it exists
    const message = await DatabaseService.message.getById(messageId);
    
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }
    
    // Create feedback
    const feedback = await DatabaseService.messageFeedback.create({
      message_id: messageId,
      rating,
      comment,
      created_at: new Date()
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        feedback
      }
    });
  } catch (error) {
    console.error('Error creating message feedback:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating feedback'
    });
  }
};