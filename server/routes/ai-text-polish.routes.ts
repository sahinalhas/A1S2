import { Router } from 'express';
import { z } from 'zod';
import { AIProviderService } from '../services/ai-provider.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

const polishTextSchema = z.object({
  text: z.string().min(1, 'Metin boş olamaz').max(10000, 'Metin çok uzun'),
  context: z.enum(['academic', 'counseling', 'notes', 'general']).optional(),
});

router.post('/polish', async (req, res) => {
  try {
    const { text, context = 'general' } = polishTextSchema.parse(req.body);

    const contextPrompts: Record<string, string> = {
      academic: 'akademik ve eğitimsel bir bağlamda',
      counseling: 'psikolojik danışmanlık ve rehberlik bağlamında',
      notes: 'not ve gözlem kayıtları bağlamında',
      general: 'genel bir bağlamda',
    };

    const systemPrompt = `Sen bir Türkçe metin düzenleme asistanısın. Verilen metni ${contextPrompts[context]} profesyonel ve anlaşılır hale getir.

Görevin:
1. Yazım hatalarını düzelt
2. Noktalama işaretlerini ekle ve düzenle
3. Cümle yapısını iyileştir (ama anlamı değiştirme)
4. Gereksiz tekrarları kaldır
5. Daha akıcı ve profesyonel bir ton kullan
6. Türkçe dil kurallarına uy

SADECE düzeltilmiş metni döndür, ek açıklama yapma.`;

    const response = await AIProviderService.getInstance().chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    });

    res.json({
      success: true,
      originalText: text,
      polishedText: response.trim(),
    });
  } catch (error) {
    logger.error('Text polish error', 'AITextPolishRoutes', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veri formatı',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Metin temizlenirken bir hata oluştu',
    });
  }
});

export default router;
