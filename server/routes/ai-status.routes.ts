
import { Router } from 'express';
import { AIProviderService } from '../services/ai-provider.service.js';

const router = Router();

// Redirect to the main health endpoint in ai-assistant
router.get('/status', async (_req, res) => {
  try {
    const aiService = AIProviderService.getInstance();
    const provider = aiService.getProvider();
    const model = aiService.getModel();
    const isAvailable = await aiService.isAvailable();
    
    res.json({
      isActive: isAvailable,
      provider: provider,
      model: model,
      providerName: provider === 'gemini' ? 'Gemini' : 
                    provider === 'openai' ? 'OpenAI' : 
                    provider === 'ollama' ? 'Ollama' : provider,
      status: isAvailable ? 'healthy' : 'unavailable'
    });
  } catch (error) {
    res.json({
      isActive: false,
      provider: null,
      model: null,
      providerName: 'Devre Dışı',
      status: 'error'
    });
  }
});

export default router;
