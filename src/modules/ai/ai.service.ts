import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateChatResponse(message: string, history: any[] = []): Promise<string> {
    if (!this.genAI) {
      throw new HttpException(
        'Chatbox đang bảo trì (chưa thiết lập GEMINI_API_KEY).',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: "Bạn là trợ lý AI ảo của trang web xem phim EZMOVIE. Bạn đóng vai trò là một chuyên gia tư vấn phim thân thiện, am hiểu sâu rộng về điện ảnh. Hãy gọi người dùng là 'bạn' và xưng là 'mình'. Luôn gợi ý phim một cách nhiệt tình và đưa ra câu trả lời ngắn gọn, dễ đọc. Bạn chỉ nên trả lời các câu hỏi liên quan đến phim ảnh, diễn viên, đạo diễn, và hệ thống EZMOVIE. Nếu người dùng hỏi ngoài lề, hãy khéo léo từ chối và hướng họ về chủ đề phim ảnh.",
      });

      // Convert history format to Gemini format
      // Gemini expects: { role: 'user' | 'model', parts: [{ text: string }] }
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new HttpException(
        'Xin lỗi, mình đang gặp chút sự cố khi kết nối. Bạn thử lại sau nhé!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
