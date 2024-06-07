import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BackendUrl = 'http://127.0.0.1:10000'; // 你的后端地址

interface Result {
  title: string;
  date: string;
  size: number;
  hash: string; // 添加 hash 字段
}

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Result[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const formatSize = (bytes: number) => {
    const gigabytes = bytes / (1024 ** 3);
    return gigabytes.toFixed(2) + ' GB';
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BackendUrl}/search`, {
        title: searchTerm,
        page: currentPage,
        pageSize: 10,
      });
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResults([]); // 设置为空数组，以防止在渲染时产生错误
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    handleSearch();
  }, [currentPage]); // 当 currentPage 变化时触发搜索

  return (
    <div>
      <input
        type="text"
        placeholder="Search the docs…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Size</th>
            <th>Magnet link</th> {/* 添加 hash 列头 */}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>Loading...</td>
            </tr>
          ) : results !== null && results.length > 0 ? (
            results.map((result, index) => (
              <tr key={index}>
                <td>{result.title}</td>
                <td>{result.date}</td>
                <td>{formatSize(result.size)}</td>
                <td>{`magnet:?xt=urn:btih:${result.hash}`}</td> {/* 添加磁力链接开头 */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>Not found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 翻页控件 */}
      <div>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous Page
        </button>
        <span> Current Page: {currentPage} </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={!results || results.length < 10}>
          Next Page
        </button>
      </div>
    </div>
  );
};

export default SearchPage;
