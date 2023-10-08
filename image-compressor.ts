import { ImagePool } from "@squoosh/lib";
import fs from "fs/promises";
import Path from "path";
import path from "path";

export default class ImageCompressor {
  imagePool: ImagePool;

  constructor() {
    this.imagePool = new ImagePool(5);
  }

  async compress(inputPath: string, outputPath?: string) {
    console.log(`Started ${inputPath}`);
    const file = await fs.readFile(inputPath);
    const filePath = Path.parse(inputPath);
    const image = this.imagePool.ingestImage(file);

    const preprocessOptions = {
      //When both width and height are specified, the image resized to specified size.
      resize: {
        width: 4472,
      },
    };
    await image.preprocess(preprocessOptions);

    const encodeOptions = {
      webp: {},
    };
    const result = await image.encode(encodeOptions);

    for (const encodedImage of Object.values(image.encodedWith)) {
      fs.writeFile(
        path.join(
          outputPath ?? filePath.dir,
          filePath.name + "." + encodedImage.extension
        ),
        encodedImage.binary
      );
    }
    console.log(`Completed ${inputPath}`);
  }

  async close() {
    await this.imagePool.close();
  }
}
