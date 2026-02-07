
import axios from 'axios';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export async function downloadVideo(url: string, destPath: string): Promise<void> {
    const writer = fs.createWriteStream(destPath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

export async function compressVideo(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec('libx264')
            .size('?x720') // Resize to 720p height, auto width
            .outputOptions('-preset fast')
            .outputOptions('-crf 28') // Compression quality
            .on('end', () => {
                console.log('Compression finished');
                resolve();
            })
            .on('error', (err: any) => {
                console.error('Compression error:', err);
                reject(err);
            })
            .run();
    });
}

export async function cleanupFiles(paths: string[]): Promise<void> {
    for (const p of paths) {
        try {
            if (await fs.pathExists(p)) {
                await fs.remove(p);
                console.log(`Deleted file: ${p}`);
            }
        } catch (err) {
            console.error(`Error deleting file ${p}:`, err);
        }
    }
}
