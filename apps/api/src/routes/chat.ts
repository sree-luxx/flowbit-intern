import { Router } from 'express';

export const chatRouter = Router();

const VANNA_SERVICE_URL = process.env.VANNA_SERVICE_URL || 'http://localhost:8000';

// Proxy chat requests to Vanna service
chatRouter.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`📤 Forwarding chat query to Vanna: ${query}`);

    const response = await fetch(`${VANNA_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Vanna service error: ${response.status} ${errorText}`);
      throw new Error(`Vanna service error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Log the response to debug chart generation
    console.log('📊 Vanna response:', {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      hasChart: !!data.chart,
      chartType: data.chart?.type,
      chartConfig: data.chart?.config,
    });
    
    res.json(data);
  } catch (error: any) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat query',
      message: error.message || 'Unknown error occurred',
    });
  }
});
