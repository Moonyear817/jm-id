const axios = require('axios');
const cheerio = require('cheerio');

// 禁漫天堂搜索函数
async function searchJMHeaven(keyword) {
  try {
    // 注意：禁漫天堂的实际URL可能需要根据时间调整
    // 这里使用一个通用的搜索方式
    const searchUrl = `https://jmcomic.me/search?q=${encodeURIComponent(keyword)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // 解析搜索结果 (这个选择器可能需要根据实际网站结构调整)
    $('.comic-item, .comic-card, [class*="comic"]').each((index, element) => {
      const title = $(element).find('h2, h3, .title, [class*="title"]').text().trim();
      const link = $(element).find('a').attr('href');
      const image = $(element).find('img').attr('src') || $(element).find('img').attr('data-src');
      const author = $(element).find('.author, [class*="author"]').text().trim();

      if (title && link) {
        results.push({
          title,
          link: normalizeUrl(link),
          image,
          author: author || '未知'
        });
      }
    });

    return {
      success: true,
      count: results.length,
      data: results.slice(0, 10) // 返回前10个结果
    };
  } catch (error) {
    console.error('Scraper error:', error.message);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// 获取漫画详情页面
async function getComicDetail(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const detail = {
      title: $('h1, .comic-title, [class*="title"]').first().text().trim(),
      description: $('.description, .intro, [class*="intro"]').text().trim(),
      author: $('.author, [class*="author"]').text().trim(),
      chapters: [],
      images: []
    };

    // 获取章节列表
    $('a[href*="chapter"], .chapter-item, [class*="chapter"]').each((index, element) => {
      const chapterTitle = $(element).text().trim();
      const chapterUrl = $(element).attr('href');
      if (chapterTitle && chapterUrl) {
        detail.chapters.push({
          title: chapterTitle,
          url: normalizeUrl(chapterUrl)
        });
      }
    });

    // 获取展示图片
    $('img[src*="image"], .comic-image, [class*="image"]').each((index, element) => {
      const imgUrl = $(element).attr('src') || $(element).attr('data-src');
      if (imgUrl && index < 5) { // 只取前5张
        detail.images.push(normalizeUrl(imgUrl));
      }
    });

    return {
      success: true,
      data: detail
    };
  } catch (error) {
    console.error('Detail scraper error:', error.message);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
}

// 规范化URL
function normalizeUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return 'https://jmcomic.me' + url;
  return 'https://jmcomic.me/' + url;
}

module.exports = {
  searchJMHeaven,
  getComicDetail
};
