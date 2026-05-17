import { StackConfig } from '../cli/types.js';
import { AdapterFile, AdapterDependency } from '../adapters/index.js';
import { TEMPLATE_REGISTRY } from './registry.js';
import { getFrontendGlobalStyles, getFrontendAppStyles } from './shared/styles.js';
import { getStaticFrontendMarkup, getStaticFrontendHTML } from './shared/markup.js';
import { getStackmintLogoFile } from './shared/logo.js';

TEMPLATE_REGISTRY.set('eleventy', {

  id: 'eleventy',
  files: (): AdapterFile[] => [
    {
      path: 'src/index.md',
      content: `---
layout: 'layouts/base.njk'
title: 'Home'
---

# Welcome to Stackmint with Eleventy

This is your Eleventy static site generator, powered by stackmint.

## Getting Started

- Edit files in the \`src/\` directory
- Run \`npm run dev\` to start the local development server
- Run \`npm run build\` to generate your static site

## Learn More

- [Eleventy Documentation](https://www.11ty.dev/)
- [Nunjucks Templates](https://mozilla.github.io/nunjucks/)
`,
    },
    {
      path: 'src/_includes/layouts/base.njk',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }} | stackmint</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
    <header>
      <h1>stackmint</h1>
      <p>Built with Eleventy</p>
    </header>
    <main>
      {{ content | safe }}
    </main>
    <footer>
      <p>© 2024 Built with stackmint</p>
    </footer>
  </body>
</html>
`,
    },
    {
      path: '.eleventy.js',
      content: `module.exports = function(eleventyConfig) {
  // Copy assets
  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/js');

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      layouts: '_includes/layouts',
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
};
`,
    },
    {
      path: 'src/css/style.css',
      content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
}

header {
  background: #2c3e50;
  color: white;
  padding: 2rem;
  text-align: center;
}

main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

footer {
  text-align: center;
  padding: 2rem;
  background: #2c3e50;
  color: white;
  margin-top: 2rem;
}
`,
    },
  ],
  scripts: { dev: 'eleventy --serve', build: 'eleventy' },
});