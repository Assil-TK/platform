import React from 'react';

const PreviewBox = () => (
  <div style={{ border: '1px solid #ccc', margin: '20px 0', height: '400px' }}>
    <iframe
      src="http://localhost:3000/filecontent"
      title="Live Preview"
      width="100%"
      height="100%"
      style={{ border: 'none' }}
    />
  </div>
);

export default PreviewBox;
