
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { Pool } from 'pg';
import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { cleanupFiles, compressVideo, downloadVideo } from './compress';
import { VideoQueue } from './queue';

dotenv.config();

const apiRoot = process.env.TELEGRAM_API_ROOT || 'http://localhost:8081';
console.log(`Initializing bot with API Root: ${apiRoot}`);

const bot = new Telegraf(process.env.BOT_TOKEN as string, {
    telegram: {
        apiRoot: apiRoot
    }
});
// Pass datasourceUrl explicitely as required by new Prisma version
// Configure Prisma with PostgreSQL adapter
const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const queue = new VideoQueue();

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const USAGE_LIMIT = 3;

// Middleware to track user and check limits
bot.use(async (ctx, next) => {
    if (!ctx.from) return next();

    const telegramId = BigInt(ctx.from.id);

    try {
        let user = await prisma.user.findUnique({
            where: { telegramId },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegramId,
                    fullName: `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim(),
                    nickname: ctx.from.username,
                },
            });
            console.log(`New user registered: ${user.id}`);
        } else {
            // Update info if changed
            const fullName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
             if (user.fullName !== fullName || user.nickname !== ctx.from.username) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        fullName,
                        nickname: ctx.from.username
                    }
                });
             }
        }

        // Attach user to context for easier access if needed
        (ctx as any).dbUser = user;
        
    } catch (error) {
        console.error('Database error in middleware:', error);
    }

    return next();
});

bot.command('start', (ctx) => {
    ctx.reply('Привет! Отправь мне видео, и я сожму его для тебя. (Лимит: 500 Мб, 3 видео).');
});

bot.on(message('video'), async (ctx) => {
    handleVideo(ctx);
});

bot.on(message('document'), async (ctx) => {
    const mime = ctx.message.document.mime_type;
    if (mime && mime.startsWith('video/')) {
        handleVideo(ctx as any);
    } else {
        ctx.reply('Пожалуйста, отправьте видеофайл.');
    }
});

async function handleVideo(ctx: Context) {
    const user = (ctx as any).dbUser;
    
    // Check usage limit
    if (user.usageCount >= USAGE_LIMIT) {
        await ctx.reply('Достигнут лимит в 3 видеофайла.');
        return;
    }

    const msg = (ctx.message as any);
    const video = msg.video || msg.document;
    
    if (!video) return;

    // Check file size limit
    if (video.file_size && video.file_size > MAX_FILE_SIZE) {
        await ctx.reply('Превышен лимит в 500 Мб для видеофайла.');
        return;
    }

    await ctx.reply('Видео добавлено в очередь на обработку...');

    queue.enqueue(async () => {
        try {
            await processVideo(ctx, video.file_id, user.telegramId);
        } catch (error) {
            console.error('Error processing video:', error);
            await ctx.reply('Произошла ошибка при обработке видео.');
        }
    });
}

async function processVideo(ctx: Context, fileId: string, telegramId: bigint) {
    const tempDir = path.resolve(__dirname, '../temp');
    await fs.ensureDir(tempDir);

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const url = fileLink.href;
    const ext = path.extname(fileLink.pathname) || '.mp4';
    const originalPath = path.join(tempDir, `${fileId}_original${ext}`);
    const compressedPath = path.join(tempDir, `${fileId}_compressed.mp4`); // Always convert to mp4/h264 for compat

    try {
        if (url.startsWith('file://')) {
            // Translate container path to host path
            // URL might look like: file://localhost/var/lib/telegram-bot-api/<token>/videos/file_x.mp4
            // Or: file:///var/lib/telegram-bot-api/<token>/videos/file_x.mp4
            
            // We want to extract everything starting from the token ID.
            // The token is part of the path.
            const token = bot.telegram.token;
            const tokenId = token.split(':')[0]; // e.g. "8264372981"

            let decodedUrl = decodeURIComponent(url.replace('file://', ''));
            
            // Find where the token ID starts in the path
            const tokenIndex = decodedUrl.indexOf(tokenId);
            
            if (tokenIndex === -1) {
                console.error(`Could not find token ID ${tokenId} in path: ${decodedUrl}`);
                throw new Error('Path extraction failed');
            }

            // Extract relative path from token onwards: "8264372981:AAF.../videos/file_x.mp4"
            // Note: The colon in the path from URL might be a normal colon.
            let relativePath = decodedUrl.substring(tokenIndex);

            const hostDataDir = path.resolve(__dirname, '../telegram-bot-api-data');
            
            // Parse the relative path into parts
            const parts = relativePath.split('/');
            const tokenDirNameFromUrl = parts[0]; 
            
            // Find the actual directory name on disk
            // Windows/Docker might mangle the colon.
            const allFiles = await fs.readdir(hostDataDir);
            const actualTokenDirName = allFiles.find(name => name.startsWith(tokenId)) || tokenDirNameFromUrl;

            console.log(`Matched token dir: ${tokenDirNameFromUrl} -> ${actualTokenDirName}`);

            // Reconstruct path with actual directory name
            parts[0] = actualTokenDirName;
            const absoluteSourcePath = path.join(hostDataDir, ...parts);
            
            console.log(`Local file detected. Source: ${absoluteSourcePath}`);
            
            // Check if file exists
            if (await fs.pathExists(absoluteSourcePath)) {
                await fs.copy(absoluteSourcePath, originalPath);
            } else {
                 console.error(`File not found at host path: ${absoluteSourcePath}`);
                 console.log(`Directory listing of ${hostDataDir}:`, allFiles);
                 await ctx.reply(`Ошибка: файл не найден. Искал: ${absoluteSourcePath}`);
                 throw new Error(`File not found: ${absoluteSourcePath}`);
            }

        } else {
            await ctx.reply('Скачиваю видео...');
            await downloadVideo(url, originalPath);
        }

        await ctx.reply('Сжимаю видео... Это может занять некоторое время.');
        await compressVideo(originalPath, compressedPath);

        await ctx.reply('Видео сжато. Отправляю...');
        
        // Get initial file stats to maybe compare size? Optional.
        // const stats = await fs.stat(compressedPath);
        
        await ctx.replyWithVideo({ source: compressedPath }, { caption: '' });

        // Increment usage count
        await prisma.user.update({
            where: { telegramId },
            data: {
                usageCount: {
                    increment: 1
                }
            }
        });

        // Clean up old files from telegram-bot-api-data directory after successful processing
        await cleanupOldTelegramFiles();

        // Also delete the original file from telegram-bot-api-data if it exists
        if (url.startsWith('file://')) {
            const token = bot.telegram.token;
            const tokenId = token.split(':')[0];
            let decodedUrl = decodeURIComponent(url.replace('file://', ''));
            const tokenIndex = decodedUrl.indexOf(tokenId);
            
            if (tokenIndex !== -1) {
                let relativePath = decodedUrl.substring(tokenIndex);
                const hostDataDir = path.resolve(__dirname, '../telegram-bot-api-data');
                const parts = relativePath.split('/');
                const tokenDirNameFromUrl = parts[0];
                const allFiles = await fs.readdir(hostDataDir);
                const actualTokenDirName = allFiles.find(name => name.startsWith(tokenId)) || tokenDirNameFromUrl;
                parts[0] = actualTokenDirName;
                const originalTelegramFilePath = path.join(hostDataDir, ...parts);
                
                try {
                    if (await fs.pathExists(originalTelegramFilePath)) {
                        await fs.remove(originalTelegramFilePath);
                        console.log(`Deleted original file from telegram-bot-api-data: ${originalTelegramFilePath}`);
                    }
                } catch (deleteErr) {
                    console.error(`Failed to delete original telegram file ${originalTelegramFilePath}:`, deleteErr);
                }
            }
        }

    } catch (error) {
        console.error('Compression pipeline failed:', error);
        await ctx.reply('Не удалось сжать видео.');
        throw error;
    } finally {
        // Cleanup
        await cleanupFiles([originalPath, compressedPath]);
    }
}

async function cleanupOldTelegramFiles(): Promise<void> {
    try {
        const telegramDataDir = path.resolve(__dirname, '../telegram-bot-api-data');
        
        // Check if directory exists
        if (!(await fs.pathExists(telegramDataDir))) {
            console.log('Telegram bot API data directory does not exist, skipping cleanup');
            return;
        }
        
        // Calculate cutoff time (files older than 24 hours will be deleted)
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        
        // Walk through the directory recursively
        const walkDir = async (dirPath: string): Promise<void> => {
            const items = await fs.readdir(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const fileStat = await fs.stat(fullPath);
                
                if (fileStat.isDirectory()) {
                    await walkDir(fullPath); // Recursive call for subdirectories
                } else {
                    // Check if file is older than cutoff time
                    if (fileStat.mtimeMs < cutoffTime) {
                        try {
                            await fs.remove(fullPath);
                            console.log(`Deleted old file: ${fullPath}`);
                        } catch (unlinkErr) {
                            console.error(`Failed to delete file ${fullPath}:`, unlinkErr);
                        }
                    }
                }
            }
        };
        
        await walkDir(telegramDataDir);
        console.log('Completed cleanup of old telegram bot API files');
    } catch (error) {
        console.error('Error during telegram files cleanup:', error);
    }
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch().then(() => {
    console.log('Bot started');
}).catch(err => {
    console.error('Bot launch error:', err);
});
