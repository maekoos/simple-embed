import * as base64 from "https://deno.land/std@0.202.0/encoding/base64.ts";
import * as path from "https://deno.land/std@0.204.0/path/mod.ts";

type RunOptions = {
  // Input files and directories
  inputs: { src: string; dest: string }[];
  // File path for output file (e.g. 'embedded.ts')
  out: string;
};

// Run, then rerun on file change.
export async function runWatching(opts: RunOptions) {
  await run(opts);

  const watcher = Deno.watchFs(opts.inputs.map((x) => x.src));
  for await (const _event of watcher) {
    await run(opts);
  }
}

// Run the embedding process
export async function run(opts: RunOptions) {
  const out: { [key: string]: string } = {};

  async function processDir(dirPath: string, destPath: string) {
    for await (const sub of Deno.readDir(dirPath)) {
      if (sub.isFile) {
        out[path.join(destPath, sub.name)] = base64.encode(
          await Deno.readFile(path.join(dirPath, sub.name)),
        );
      } else {
        await processDir(
          path.join(dirPath, sub.name),
          path.join(destPath, sub.name),
        );
      }
    }
  }

  for (const dir of opts.inputs) {
    if ((await Deno.stat(dir.src)).isFile) {
      out[dir.dest] = base64.encode(await Deno.readFile(dir.src));
    } else {
      await processDir(dir.src, dir.dest);
    }
  }

  const outTs = `
// Generated ${new Date().toLocaleString()}
import * as base64 from "https://deno.land/std@0.202.0/encoding/base64.ts";

const textFromB64 = (s: string) => atob(s);
const bytesFromB64 = (s: string) => base64.decode(s);

export const files: Record<string, {_v: string, text: () => string, bytes: () => ArrayBuffer, }> = {
${
    Object.entries(out).map(([k, v]) => {
      return `${JSON.stringify(k)}: { _v: ${
        JSON.stringify(v)
      }, text: function() {return textFromB64(this._v)}, bytes: function () {return bytesFromB64(this._v) }, },`;
    }).map((x) => `\t${x}`).join("\n")
  }
};

export function getFile(p: string) {
  return files[p];
}

export default files;
  `.trim();

  await Deno.writeTextFile(opts.out, outTs);
  console.log("Generated %s", opts.out);
}
