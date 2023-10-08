import PromisePool from "@supercharge/promise-pool";
import { getFiles } from "./file-utils";
import ImageCompressor from "./image-compressor";
import fs from "fs";

process.setMaxListeners(0);

async function bootstrap() {
  if (process.argv.length != 3) {
    throw new Error(
      `Input path is required, try running with command: npm start <INPUT_PATH>`
    );
  }

  const inputDir = process.argv[2];

  if (!inputDir || !fs.existsSync(inputDir)) {
    throw new Error(`${inputDir} path not found`);
  }
  const ic = new ImageCompressor();

  const files = getFiles(inputDir);
  const notCompressedFiles = files.filter(
    (file: string) =>
      file.endsWith(".jpg") && !files.includes(file.replace(".jpg", ".webp"))
  );
  console.log(
    `Processing ${notCompressedFiles.length} not processed files out of ${files.length}`
  );
  await PromisePool.withConcurrency(5)
    .for(notCompressedFiles)
    .process(async (file) => {
      await ic.compress(file);
    });

  await ic.close();
}

bootstrap();
