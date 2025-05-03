import React, { useState, useEffect } from 'react';
import { parse } from '@babel/parser';
import * as Babel from '@babel/standalone'; // Use Babel standalone for browser-side compilation

const PagePreview = ({ pageName, content }) => {
  const [compiledComponent, setCompiledComponent] = useState(null);

  useEffect(() => {
    if (!content) return;

    // Compile the JSX into a React component
    const transformCode = async () => {
      try {
        const compiledCode = Babel.transform(content, {
          presets: ['env', 'react'],
        }).code;

        // Dynamically create a new function from the compiled JSX code
        const component = new Function('React', compiledCode);
        setCompiledComponent(() => component(React));
      } catch (err) {
        console.error('Error compiling JSX:', err);
      }
    };

    transformCode();
  }, [content]);

  return (
    <div>
      <h4>Previewing {pageName}</h4>
      {compiledComponent ? (
        React.createElement(compiledComponent)
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PagePreview;
