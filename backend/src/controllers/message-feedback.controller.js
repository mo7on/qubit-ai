exports.createFeedback = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { rating, feedback_content } = req.body;
    
    // Create feedback with correct field names
    const feedback = await DatabaseService.messageFeedback.create({
      message_id: messageId,
      rating,
      feedback_content,
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