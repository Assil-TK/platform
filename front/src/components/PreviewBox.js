import React, { useEffect, useRef } from 'react';

const PreviewBox = () => {
  const iframeRef = useRef(null);

  const refreshPreview = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.src = `${process.env.REACT_APP_API_URL}/api/filecontent?t=${new Date().getTime()}`;
    }
  };

  useEffect(() => {
    // Initial load
    refreshPreview();

    // Set up an interval to check for updates
    const interval = setInterval(refreshPreview, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', margin: '20px 0', height: '400px' }}>
      <iframe
        ref={iframeRef}
        title="Live Preview"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-modals"
      />
    </div>
  );
};

export default PreviewBox;
