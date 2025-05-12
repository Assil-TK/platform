import React from 'react';

const PreviewBox = () => (
  <div style={{ border: '1px solid #ccc', margin: '20px 0', height: '400px' }}>
    <iframe
      src={`${process.env.REACT_APP_API_URL}/api/filecontent`}
      title="Live Preview"
      width="100%"
      height="100%"
      style={{ border: 'none' }}
      sandbox="allow-scripts allow-same-origin allow-modals"
    />
  </div>
);

export default PreviewBox;
