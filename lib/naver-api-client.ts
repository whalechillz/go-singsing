interface NaverLocalItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

interface NaverBlogItem {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postdate: string;
}

interface NaverImageItem {
  title: string;
  link: string;
  thumbnail: string;
  sizeheight: string;
  sizewidth: string;
}

export class NaverApiClient {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    // Vercel에서는 NEXT_PUBLIC_ 없이 사용
    this.clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || '';
    this.clientSecret = process.env.NAVER_CLIENT_SECRET || '';
    
    console.log('Naver API initialized:', {
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret,
      clientIdLength: this.clientId.length
    });
    
    if (!this.clientId || !this.clientSecret) {
      console.error('Naver API credentials missing:', {
        clientId: this.clientId ? 'exists' : 'missing',
        clientSecret: this.clientSecret ? 'exists' : 'missing'
      });
      throw new Error('네이버 API 인증 정보가 없습니다.');
    }
  }

  private get headers() {
    return {
      'X-Naver-Client-Id': this.clientId,
      'X-Naver-Client-Secret': this.clientSecret,
    };
  }

  // 지역 검색 (주소, 전화번호, 카테고리 정보)
  async searchLocal(query: string, display: number = 5) {
    try {
      const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
      )}&display=${display}&sort=random`;

      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`Naver API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseLocalResults(data.items || []);
    } catch (error) {
      console.error('Naver local search error:', error);
      return [];
    }
  }

  // 블로그 검색 (리뷰, 상세 정보)
  async searchBlog(query: string, display: number = 10) {
    try {
      const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(
        query
      )}&display=${display}&sort=sim`;

      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`Naver API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parseBlogResults(data.items || []);
    } catch (error) {
      console.error('Naver blog search error:', error);
      return [];
    }
  }

  // 이미지 검색
  async searchImage(query: string, display: number = 10) {
    try {
      const url = `https://openapi.naver.com/v1/search/image.json?query=${encodeURIComponent(
        query
      )}&display=${display}&sort=sim&filter=large`;

      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`Naver API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Naver image search error:', error);
      return [];
    }
  }

  // 통합 검색 (모든 정보 한번에)
  async searchComprehensive(query: string) {
    try {
      const [localData, blogData, imageData] = await Promise.all([
        this.searchLocal(query),
        this.searchBlog(query),
        this.searchImage(query),
      ]);

      return {
        local: localData,
        blogs: blogData,
        images: imageData,
        extractedInfo: this.extractDetailedInfo(localData, blogData),
      };
    } catch (error) {
      console.error('Naver comprehensive search error:', error);
      return {
        local: [],
        blogs: [],
        images: [],
        extractedInfo: {},
      };
    }
  }

  // 로컬 검색 결과 파싱
  private parseLocalResults(items: NaverLocalItem[]) {
    return items.map(item => ({
      name: this.cleanHtml(item.title),
      link: item.link,
      category: item.category,
      description: item.description,
      phone: item.telephone,
      address: item.address,
      roadAddress: item.roadAddress,
      coordinates: {
        x: item.mapx,
        y: item.mapy,
      },
    }));
  }

  // 블로그 결과에서 추가 정보 추출
  private parseBlogResults(items: NaverBlogItem[]) {
    return items.map(item => ({
      title: this.cleanHtml(item.title),
      link: item.link,
      description: this.cleanHtml(item.description),
      blogger: item.bloggername,
      date: item.postdate,
      extractedInfo: this.extractInfoFromBlog(item.description),
    }));
  }

  // 블로그 설명에서 정보 추출
  private extractInfoFromBlog(description: string): any {
    const info: any = {};

    // 영업시간 추출
    const timePattern = /(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/;
    const timeMatch = description.match(timePattern);
    if (timeMatch) {
      info.operatingHours = `${timeMatch[1]} - ${timeMatch[2]}`;
    }

    // 가격 정보 추출
    const pricePattern = /(\d{1,3},?\d{3})원/;
    const priceMatch = description.match(pricePattern);
    if (priceMatch) {
      info.price = priceMatch[0];
    }

    // 휴무일 추출
    const closedPattern = /(매주|격주)?\s*(월|화|수|목|금|토|일)요일\s*휴무/;
    const closedMatch = description.match(closedPattern);
    if (closedMatch) {
      info.closedDays = closedMatch[0];
    }

    return info;
  }

  // 상세 정보 추출 및 통합
  private extractDetailedInfo(localData: any[], blogData: any[]) {
    const info: any = {
      address: null,
      phone: null,
      category: null,
      operatingHours: null,
      price: null,
      closedDays: null,
    };

    // 로컬 데이터에서 기본 정보
    if (localData.length > 0) {
      const first = localData[0];
      info.address = first.roadAddress || first.address;
      info.phone = first.phone;
      info.category = first.category;
      info.coordinates = first.coordinates;
    }

    // 블로그 데이터에서 추가 정보
    blogData.forEach(blog => {
      if (!info.operatingHours && blog.extractedInfo.operatingHours) {
        info.operatingHours = blog.extractedInfo.operatingHours;
      }
      if (!info.price && blog.extractedInfo.price) {
        info.price = blog.extractedInfo.price;
      }
      if (!info.closedDays && blog.extractedInfo.closedDays) {
        info.closedDays = blog.extractedInfo.closedDays;
      }
    });

    return info;
  }

  // HTML 태그 제거
  private cleanHtml(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }
}