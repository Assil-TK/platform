// src/components/SitePreview.jsx
import React from 'react';

const SitePreview = ({ user, repo }) => {
  if (!user || !repo) return null;

  // Embed via StackBlitz to run full React app with assets/styles
  const src = `https://stackblitz.com/edit/github/${user}/${repo}?embed=1&file=public/index.html`;

  return (
    <iframe
      src={src}
      title="Full React App Preview"
      style={{
        width: '100%',
        height: '800px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    />
  );
};

export default SitePreview;