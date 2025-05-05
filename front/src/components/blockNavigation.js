if (window.top !== window.self) {
    // We're inside an iframe (e.g., in PreviewBox)
    document.addEventListener(
      'click',
      function (e) {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'a' || tag === 'button') {
          e.preventDefault();
          e.stopPropagation();
          console.log('Navigation blocked in iframe.');
        }
      },
      true
    );
  }
  