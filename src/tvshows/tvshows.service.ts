import { Injectable, Logger } from '@nestjs/common';

export interface TvShowDto {
  id: string;
  name: string;
  type: string;
  coverUrl: string;
  previewUrl: string;
  description: string;
  popularity: number;
  episodes: number;
  rating: string;
}

@Injectable()
export class TvShowsService {
  private readonly logger = new Logger(TvShowsService.name);

  async getTopShows(): Promise<TvShowDto[]> {
    this.logger.log('Fetching top reality TV shows...');
    
    // Mocked data for famous TV shows
    return [
      {
        id: 'tvshow-1',
        name: 'Love Actually 5',
        type: 'Dating Reality Show',
        coverUrl: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=600&auto=format&fit=crop',
        previewUrl: 'https://vip.opstream14.com/share/246cdac40cb7c5852aba40f1f0ce01da', // Placeholder
        description: 'Mùa thứ 5 của chương trình hẹn hò ăn khách nhất, mang đến những cung bậc cảm xúc chân thực và những câu chuyện tình yêu đầy bất ngờ.',
        popularity: 98000,
        episodes: 12,
        rating: '16+'
      },
      {
        id: 'tvshow-2',
        name: 'Single\'s Inferno (Địa Ngục Độc Thân)',
        type: 'Reality / Survival',
        coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
        previewUrl: 'https://vip.opstream14.com/share/246cdac40cb7c5852aba40f1f0ce01da',
        description: 'Những người trẻ độc thân, quyến rũ bị mắc kẹt trên một hòn đảo hoang vắng. Cách duy nhất để thoát khỏi đây là tìm được một nửa của mình.',
        popularity: 154000,
        episodes: 10,
        rating: '16+'
      },
      {
        id: 'tvshow-3',
        name: 'Running Man Vietnam',
        type: 'Variety Show',
        coverUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
        previewUrl: 'https://vip.opstream14.com/share/246cdac40cb7c5852aba40f1f0ce01da',
        description: 'Phiên bản Việt hóa của chương trình tạp kỹ huyền thoại Hàn Quốc. Những cuộc rượt đuổi xé bảng tên đầy kịch tính và hài hước.',
        popularity: 210000,
        episodes: 15,
        rating: '13+'
      },
      {
        id: 'tvshow-4',
        name: '2 Ngày 1 Đêm (2 Days 1 Night)',
        type: 'Travel / Reality',
        coverUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop',
        previewUrl: 'https://vip.opstream14.com/share/246cdac40cb7c5852aba40f1f0ce01da',
        description: 'Hành trình khám phá văn hóa, cảnh đẹp Việt Nam của 6 thành viên với những thử thách "dở khóc dở cười".',
        popularity: 305000,
        episodes: 20,
        rating: 'All'
      },
      {
        id: 'tvshow-5',
        name: 'Anh Trai Vượt Ngàn Chông Gai',
        type: 'Music / Reality',
        coverUrl: 'https://images.unsplash.com/photo-1493225457224-0582ade3c18b?q=80&w=600&auto=format&fit=crop',
        previewUrl: 'https://vip.opstream14.com/share/246cdac40cb7c5852aba40f1f0ce01da',
        description: 'Sự quy tụ của 33 "anh tài" nổi tiếng trong showbiz Việt để cùng nhau vượt qua các thử thách âm nhạc đỉnh cao.',
        popularity: 450000,
        episodes: 15,
        rating: 'All'
      },
      {
        id: 'tvshow-6',
        name: 'Chị Đẹp Đạp Gió Rẽ Sóng',
        type: 'Music / Reality',
        coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
        previewUrl: 'https://vip.opstream14.com/share/246cdac40cb7c5852aba40f1f0ce01da',
        description: 'Chương trình truyền hình thực tế về âm nhạc quy tụ 30 nữ nghệ sĩ nổi tiếng hoạt động trong ngành giải trí.',
        popularity: 420000,
        episodes: 15,
        rating: 'All'
      },
      {
        id: 'tvshow-7',
        name: 'Sao Nhập Ngũ',
        type: 'Military / Reality',
        coverUrl: 'https://images.unsplash.com/photo-1498677231914-50efa696e615?q=80&w=600&auto=format&fit=crop',
        previewUrl: 'https://vip.opstream14.com/share/246cdac40cb7c5852aba40f1f0ce01da',
        description: 'Các nghệ sĩ trải nghiệm môi trường huấn luyện quân đội thực tế, rèn luyện ý chí và kỷ luật.',
        popularity: 180000,
        episodes: 14,
        rating: 'All'
      },
      {
        id: 'tvshow-8',
        name: 'Rap Việt',
        type: 'Music / Competition',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
        previewUrl: 'https://vip.opstream14.com/share/246cdac40cb7c5852aba40f1f0ce01da',
        description: 'Cuộc thi tìm kiếm tài năng âm nhạc Rap số 1 tại Việt Nam, nơi bứt phá của những rapper trẻ.',
        popularity: 560000,
        episodes: 16,
        rating: '13+'
      }
    ];
  }
}
