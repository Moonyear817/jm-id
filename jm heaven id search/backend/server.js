const express = require('express');
const cors = require('cors');
const idCodes = require('./idCodes');
const { searchJMHeaven, getComicDetail } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 获取所有地区编码
app.get('/api/provinces', (req, res) => {
  const provinces = Object.entries(idCodes).map(([code, data]) => ({
    code,
    name: data.name
  }));
  res.json(provinces);
});

// 获取指定省份的城市
app.get('/api/cities/:provinceCode', (req, res) => {
  const { provinceCode } = req.params;
  const province = idCodes[provinceCode];

  if (!province) {
    return res.status(404).json({ error: '省份不存在' });
  }

  const cities = Object.entries(province.cities).map(([code, data]) => ({
    code,
    name: data.name
  }));

  res.json(cities);
});

// 获取指定城市的区县
app.get('/api/districts/:provinceCode/:cityCode', (req, res) => {
  const { provinceCode, cityCode } = req.params;
  const province = idCodes[provinceCode];

  if (!province) {
    return res.status(404).json({ error: '省份不存在' });
  }

  const city = province.cities[cityCode];
  if (!city) {
    return res.status(404).json({ error: '城市不存在' });
  }

  const districts = Object.entries(city.districts).map(([code, name]) => ({
    code,
    name: name
  }));

  res.json(districts);
});

// 获取完整的地区名称和编码
app.get('/api/location/:code', (req, res) => {
  const { code } = req.params;

  if (code.length !== 6) {
    return res.status(400).json({ error: '身份证号前6位应为6个数字' });
  }

  const provinceCode = code.substring(0, 2);
  const cityCode = code.substring(2, 4);
  const districtCode = code.substring(4, 6);

  const province = idCodes[provinceCode];
  if (!province) {
    return res.status(404).json({ error: '未找到对应的省份' });
  }

  const city = province.cities[cityCode];
  if (!city) {
    return res.status(404).json({ error: '未找到对应的城市' });
  }

  let districtName = null;
  const districtObject = city.districts[districtCode];
  let fullName = `${province.name} ${city.name}`;

  if (districtObject) {
    districtName = districtObject;
    fullName = `${province.name} ${city.name} ${districtName}`;
  }

  res.json({
    code,
    fullName,
    province: province.name,
    city: city.name,
    district: districtName
  });
});

// 搜索漫画
app.get('/api/search', async (req, res) => {
  const { keyword, idCode } = req.query;

  if (!keyword && !idCode) {
    return res.status(400).json({ 
      error: '请提供搜索关键词或身份证号前6位' 
    });
  }

  let searchKeyword = keyword;

  // 如果提供了身份证号，尝试查询地区名称进行搜索
  if (idCode) {
    const locationRes = await fetch(`http://localhost:${PORT}/api/location/${idCode}`);
    if (locationRes.ok) {
      const location = await locationRes.json();
      searchKeyword = location.fullName;
    }
  }

  try {
    const result = await searchJMHeaven(searchKeyword);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '搜索失败: ' + error.message
    });
  }
});

// 获取漫画详情
app.get('/api/comic-detail', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: '请提供漫画URL' });
  }

  try {
    const result = await getComicDetail(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取详情失败: ' + error.message
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📍 健康检查: http://localhost:${PORT}/health`);
});
