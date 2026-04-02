import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import packageJson from "./package.json";
import dts from "vite-plugin-dts";
import { resolve } from 'path';

// Calculate your version string once
const LSCG_VERSION = (packageJson.version.length > 0 && packageJson.version[0] === 'v') 
    ? packageJson.version 
    : "v" + packageJson.version;

const bannerCode = `// LSCG: Little Sera's Club Games
if (typeof window.ImportBondageCollege !== "function") {
  alert("Club not detected! Please only use this while you have Club open!");
  throw "Dependency not met";
}
if (window.LSCG_Loaded !== undefined) {
  alert("LSCG is already detected in current window. To reload, please refresh the window.");
  throw "Already loaded";
}
window.LSCG_Loaded = false;
console.debug("LSCG: Parse start...");\n`;

//@ts-ignore
export default defineConfig(({ mode: _ }) => {
    // Check if we are running the 'watch' script

    return {
        resolve: {
            alias: {
                "Utilities": resolve(__dirname, "./src/Utilities"),
                "MiniGames": resolve(__dirname, "./src/MiniGames"),
                "Settings": resolve(__dirname, "./src/Settings"),
                "Modules": resolve(__dirname, "./src/Modules"),
                "modules": resolve(__dirname, "./src/modules"),
                "constants": resolve(__dirname, "./src/constants"),
                "utils": resolve(__dirname, "./src/utils"),
                "base": resolve(__dirname, "./src/base"),
            },
        },
        plugins: [
            tsconfigPaths(),
            cssInjectedByJsPlugin(),
            dts(),
        ],
        esbuild: {
            minifyIdentifiers: false, 
            minifySyntax: true,       
            minifyWhitespace: true,   
        },
        build: {
            target: 'esnext',
            emptyOutDir: true, 
            minify: "esbuild", 
            
            // Toggle sourcemap based on the mode!
            sourcemap: true, 
            
            lib: {
                entry: 'src/main.tsx',
                name: 'Vendored_LSCG',
                formats: ['es'],
                fileName: (_, entry) => `${entry}.mjs`,
            },
            rollupOptions: {
                output: {
                    preserveModules: true,
                    preserveModulesRoot: "src",
                    intro: `const LSCG_VERSION="${LSCG_VERSION}";`,
                    sourcemapExcludeSources: false,
                },
                onwarn(warning, warn) {
                    if (warning.code === 'EVAL' || warning.code === 'CIRCULAR_DEPENDENCY') return;
                    warn(warning);
                }
            }
        }
    };
});