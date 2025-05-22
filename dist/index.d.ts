import { RollupInlineTsOptions } from "rollup-plugin-inline-ts";
import { Plugin } from "vite";

type ViteInlineTsOptions = RollupInlineTsOptions;
declare function InlineTs(options?: ViteInlineTsOptions): Plugin;

export { ViteInlineTsOptions, InlineTs as default };