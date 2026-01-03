import satori from 'satori';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function renderToPng(element: React.ReactNode, width: number, height: number) {
    const fontPath = path.join(process.cwd(), 'public/fonts/Inter.ttf');
    const fontBoldPath = path.join(process.cwd(), 'public/fonts/Inter-Bold.ttf');
    const fontData = fs.readFileSync(fontPath);
    const fontBoldData = fs.readFileSync(fontBoldPath);

    const svg = await satori(element as any, {
        width,
        height,
        fonts: [
            {
                name: 'Inter',
                data: fontData,
                weight: 400,
                style: 'normal',
            },
            {
                name: 'Inter',
                data: fontBoldData,
                weight: 700,
                style: 'normal',
            },
        ],
    });

    const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();

    return pngBuffer;
}
