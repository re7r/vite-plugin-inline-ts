import type { Plugin } from 'vite';
import InlineTsRollupPlugin, { type RollupInlineTsOptions } from 'rollup-plugin-inline-ts';

export type ViteInlineTsOptions = RollupInlineTsOptions;

export default function InlineTs(options?: ViteInlineTsOptions): Plugin {
  return {
    ...InlineTsRollupPlugin({
      ...(options ?? {}),
    }),
  };
}
