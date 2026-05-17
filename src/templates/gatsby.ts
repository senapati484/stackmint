import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('gatsby', {

  id: 'gatsby',
  files: (): AdapterFile[] => [
    {
      path: 'src/pages/index.js',
      content: `import React from 'react';
import { Link } from 'gatsby';

export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Welcome to stackmint + Gatsby</h1>
      <p>Your static site generator is ready to go.</p>
      <Link to="/about/">About</Link>
    </main>
  );
}
`,
    },
    {
      path: 'src/pages/about.js',
      content: `import React from 'react';
import { Link } from 'gatsby';

export default function About() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>About</h1>
      <p>This site was scaffolded with stackmint.</p>
      <Link to="/">Home</Link>
    </main>
  );
}
`,
    },
    {
      path: 'gatsby-config.ts',
      content: `import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: 'stackmint Gatsby',
    description: 'Built with stackmint',
  },
  plugins: [],
};

export default config;
`,
    },
  ],
  scripts: { dev: 'gatsby develop', build: 'gatsby build' },
});