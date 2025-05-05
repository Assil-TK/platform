import React from 'react';

const AIPromptBox = ({ prompt, setPrompt, handleAIUpdate, loadingAI }) => (
  <div>
    <label>
      Your Prompt (Modification Request):{' '}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        cols={100}
        placeholder="Describe what you want to change in the code"
      />
    </label>

    <br />
    <button onClick={handleAIUpdate} disabled={loadingAI}>
      {loadingAI ? 'Processing...' : 'Send to AI'}
    </button>

    {loadingAI && (
      <div>
        <p>Loading AI response...</p>
        <div className="spinner"></div>
      </div>
    )}
  </div>
);

export default AIPromptBox;
