import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

// The SVG is the editable, versioned artwork; export a crawler-compatible
// raster asset before Nuxt builds/prerenders. No external image host required.
export const socialPreviewSource = join(process.cwd(), "public/brand/social-preview.svg");
export const socialPreviewOutput = join(process.cwd(), "public/brand/social-preview.png");

export async function generateSocialPreview(source = socialPreviewSource, output = socialPreviewOutput) {
  await mkdir(dirname(output), { recursive: true });
  const { width, height, format } = await sharp(source)
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toFile(output);
  if (width !== 1200 || height !== 630 || format !== "png") {
    throw new Error("Unexpected social preview dimensions or format");
  }
  return output;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replaceAll("\\", "/")}`).href) {
  await generateSocialPreview();
}
