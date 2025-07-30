import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { view } from '@forge/bridge';
import Config from './Config'; // We will create this next

const render = async () => {
  const context = await view.getContext();
  const rootElement = document.getElementById('root');
  const root = ReactDOM.createRoot(rootElement);

  if (context.extension.entryPoint === 'config') {
    root.render(
      <React.StrictMode>
        <Config />
      </React.StrictMode>
    );
  } else {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

render();
