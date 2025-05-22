import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { build, type Plugin } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import inlineTs from '../dist/index.js';

const outputDir = path.resolve(__dirname, 'output');
const fixturesDir = path.resolve(__dirname, 'fixtures');

const captureAssets: Record<string, string> = {};
const captureHtmlPlugin: Plugin = {
  name: 'capture-html',

  transform(code: string, id: string) {
    if (id.endsWith('.html') || id.endsWith('.xht')) {
      captureAssets[path.basename(id)] = code;
      return '';
    }
  },

  generateBundle() {
    for (const [fileName, source] of Object.entries(captureAssets)) {
      this.emitFile({
        type: 'asset',
        fileName,
        source,
      });
    }
  },
};

const engines = ['oxc', 'swc', 'esbuild', 'typescript'] as const;

describe.each(engines)('inlineTs engine: %s', (engine) => {
  beforeEach(() => {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(outputDir, { recursive: true, force: true });
  });

  it(`processes HTML with engine=${engine}`, async () => {
    const inputFile = path.join(fixturesDir, 'main.mjs');
    await build({
      logLevel: 'silent',
      build: {
        rollupOptions: {
          input: inputFile,
        },
        outDir: outputDir,
      },
      plugins: [
        inlineTs({
          engine,
          extensions: ['.html', '.xht'],
          debug: true,
        }),
        captureHtmlPlugin,
      ],
    });

    fs.rmSync(path.join(outputDir, 'tests'), { recursive: true, force: true });
    fs.rmSync(path.join(outputDir, 'assets'), { recursive: true, force: true });

    const contents: Record<string, string> = {};
    const files = fs.readdirSync(outputDir).sort();
    expect(files).toMatchSnapshot(`${engine} file list`);

    for (const file of files) {
      const fullPath = path.join(outputDir, file);
      contents[file] = fs.readFileSync(fullPath, 'utf8');
    }

    expect(contents).toMatchSnapshot(`${engine} file contents`);
  });
});
