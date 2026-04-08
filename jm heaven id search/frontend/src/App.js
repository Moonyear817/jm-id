import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [idCode, setIdCode] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedComic, setSelectedComic] = useState(null);
  const [comicDetail, setComicDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 获取所有省份
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('/api/provinces');
        setProvinces(response.data);
      } catch (err) {
        setError('获取省份列表失败: ' + err.message);
      }
    };
    fetchProvinces();
  }, []);

  // 当省份改变时，获取城市列表
  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        try {
          const response = await axios.get(`/api/cities/${selectedProvince}`);
          setCities(response.data);
          setSelectedCity('');
          setDistricts([]);
          setSelectedDistrict('');
          updateIdCode(selectedProvince, '', '');
        } catch (err) {
          setError('获取城市列表失败: ' + err.message);
        }
      };
      fetchCities();
    }
  }, [selectedProvince]);

  // 当城市改变时，获取区县列表
  useEffect(() => {
    if (selectedProvince && selectedCity) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(
            `/api/districts/${selectedProvince}/${selectedCity}`
          );
          setDistricts(response.data);
          setSelectedDistrict('');
          updateIdCode(selectedProvince, selectedCity, '');
        } catch (err) {
          setError('获取区县列表失败: ' + err.message);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince, selectedCity]);

  // 当区县改变时，更新身份证号
  useEffect(() => {
    if (selectedProvince && selectedCity && selectedDistrict) {
      updateIdCode(selectedProvince, selectedCity, selectedDistrict);
    }
  }, [selectedDistrict]);

  // 更新身份证号前6位
  const updateIdCode = (prov, city, dist) => {
    if (prov && city) {
      let code = prov + city;
      if (dist) {
        code += dist;
      } else {
        code += '00';
      }
      setIdCode(code);
    }
  };

  // 搜索漫画
  const handleSearch = async () => {
    if (!idCode) {
      setError('请选择完整的地区信息');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);
    setSelectedComic(null);

    try {
      const response = await axios.get('/api/search', {
        params: {
          idCode: idCode.substring(0, 6)
        }
      });

      if (response.data.success) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 0) {
          setError('未找到相关漫画');
        }
      } else {
        setError('搜索失败: ' + response.data.error);
      }
    } catch (err) {
      setError('搜索出错: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 获取漫画详情
  const handleViewDetail = async (comic) => {
    setSelectedComic(comic);
    setDetailLoading(true);
    setComicDetail(null);

    try {
      const response = await axios.get('/api/comic-detail', {
        params: { url: comic.link }
      });

      if (response.data.success) {
        setComicDetail(response.data.data);
      } else {
        setError('获取详情失败: ' + response.data.error);
      }
    } catch (err) {
      setError('获取详情出错: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🆔 身份证地区识别漫画搜索</h1>
        <p className="subtitle">选择您的地区，自动识别身份证号前6位，搜索相关漫画</p>
      </header>

      <main className="main-content">
        {/* 左侧：地区选择 */}
        <section className="selector-panel">
          <h2>地区选择</h2>

          <div className="form-group">
            <label>省份 / 直辖市</label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="select-input"
            >
              <option value="">-- 请选择省份 --</option>
              {provinces.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {cities.length > 0 && (
            <div className="form-group">
              <label>城市</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="select-input"
              >
                <option value="">-- 请选择城市 --</option>
                {cities.map((city) => (
                  <option key={city.code} value={city.code}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {districts.length > 0 && (
            <div className="form-group">
              <label>区县 / 地区</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="select-input"
              >
                <option value="">-- 请选择区县 --</option>
                {districts.map((dist) => (
                  <option key={dist.code} value={dist.code}>
                    {dist.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 身份证号显示 */}
          <div className="id-code-display">
            <h3>身份证号前6位</h3>
            <div className="code-box">
              {idCode || '---'}
            </div>
          </div>

          {/* 手动输入身份证号 */}
          <div className="form-group">
            <label>或直接输入身份证号前6位</label>
            <input
              type="text"
              maxLength="6"
              value={idCode}
              onChange={(e) => setIdCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="text-input"
              placeholder="330108"
            />
          </div>

          {/* 搜索按钮 */}
          <button
            onClick={handleSearch}
            disabled={loading || !idCode}
            className="search-btn"
          >
            {loading ? '搜索中...' : '🔍 搜索漫画'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </section>

        {/* 右侧：搜索结果 */}
        <section className="results-panel">
          {searchResults.length > 0 && (
            <>
              <h2>搜索结果 ({searchResults.length})</h2>
              <div className="results-grid">
                {searchResults.map((comic, idx) => (
                  <div
                    key={idx}
                    className="comic-card"
                    onClick={() => handleViewDetail(comic)}
                  >
                    {comic.image && (
                      <img
                        src={comic.image}
                        alt={comic.title}
                        className="comic-image"
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="200"%3E%3Crect fill="%23eee" width="150" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    )}
                    <div className="comic-info">
                      <h3>{comic.title}</h3>
                      <p className="author">作者: {comic.author}</p>
                      <button className="view-btn">查看详情</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 漫画详情 */}
          {selectedComic && (
            <div className="comic-detail">
              <button
                className="close-btn"
                onClick={() => {
                  setSelectedComic(null);
                  setComicDetail(null);
                }}
              >
                ✕
              </button>
              <h2>{selectedComic.title}</h2>

              {detailLoading ? (
                <div className="loading">加载中...</div>
              ) : comicDetail ? (
                <>
                  {comicDetail.description && (
                    <div className="detail-section">
                      <h3>简介</h3>
                      <p>{comicDetail.description}</p>
                    </div>
                  )}

                  {comicDetail.author && (
                    <div className="detail-section">
                      <h3>作者</h3>
                      <p>{comicDetail.author}</p>
                    </div>
                  )}

                  {comicDetail.images && comicDetail.images.length > 0 && (
                    <div className="detail-section">
                      <h3>预览图片</h3>
                      <div className="images-grid">
                        {comicDetail.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`预览 ${idx + 1}`}
                            className="preview-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {comicDetail.chapters && comicDetail.chapters.length > 0 && (
                    <div className="detail-section">
                      <h3>章节列表</h3>
                      <ul className="chapters-list">
                        {comicDetail.chapters.slice(0, 10).map((ch, idx) => (
                          <li key={idx}>
                            <a href={ch.url} target="_blank" rel="noopener noreferrer">
                              {ch.title}
                            </a>
                          </li>
                        ))}
                        {comicDetail.chapters.length > 10 && (
                          <li>... 还有 {comicDetail.chapters.length - 10} 章 ...</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <a
                    href={selectedComic.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-full-btn"
                  >
                    查看完整内容
                  </a>
                </>
              ) : null}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>⚠️ 声明：本工具仅供学习研究使用，请遵守相关法律法规</p>
      </footer>
    </div>
  );
}

export default App;
