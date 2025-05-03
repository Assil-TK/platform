// src/components/PageList.js
import React, { useState, useEffect } from 'react';
import { fetchFiles, fetchFileContent } from '../api/githubApi';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const PageList = ({ user, selectedRepo, onPageSelect }) => {
  const [pages, setPages] = useState([]);
  const owner = user?.login || user?.username;

  const isLikelyPage = (path) =>
    /\.(js|jsx)$/.test(path) &&
    (path.toLowerCase().includes('/pages/') ||
     path.toLowerCase().includes('/views/') ||
     path.toLowerCase().includes('/screens/') ||
     /(page|screen)\.(js|jsx)$/.test(path));

  const getAllJs = async (repo, dir = '') => {
    const entries = await fetchFiles(repo, dir);
    let all = [];
    for (const e of entries) {
      const full = dir ? `${dir}/${e.name}` : e.name;
      if (e.type === 'dir') {
        all = all.concat(await getAllJs(repo, full));
      } else if (/\.(js|jsx)$/.test(e.name)) {
        all.push(full);
      }
    }
    return all;
  };

  useEffect(() => {
    if (!owner || !selectedRepo) return setPages([]);
    (async () => {
      const all = await getAllJs(selectedRepo);
      const candidates = all.filter(isLikelyPage);
      const detected = [];
      await Promise.all(candidates.map(async (path) => {
        try {
          const { content, encoding } = await fetchFileContent(selectedRepo, path);
          const code = encoding === 'base64' ? atob(content) : content;
          const ast = parse(code, { sourceType: 'module', plugins: ['jsx','classProperties'] });
          let hasJSX=false, hasDef=false;
          traverse(ast, {
            JSXElement() { hasJSX = true; },
            ExportDefaultDeclaration() { hasDef = true; }
          });
          if (hasJSX && hasDef) detected.push(path);
        } catch {}
      }));
      setPages(detected);
    })();
  }, [owner, selectedRepo]);

// src/components/PageList.js
const handleClick = async (path) => {
  const { content, encoding } = await fetchFileContent(selectedRepo, path);
  const raw = encoding === 'base64' ? atob(content) : content;
  onPageSelect(path, raw);  // Pass the raw content along with the path
};


  return (
    <div>
      <h3>Detected React Pages</h3>
      {pages.length
        ? pages.map(p => (
            <button key={p} onClick={() => handleClick(p)} style={{margin:4}}>
              {p.split('/').pop()}
            </button>
          ))
        : <p>{selectedRepo ? 'Scanning…' : 'Select a repo'}</p>}
    </div>
  );
};

export default PageList;
