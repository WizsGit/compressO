import crypto from 'crypto';
import express from 'express';
import fs from 'fs-extra';

interface StoredFile {
    filePath: string;
    originalName: string;
    expiresAt: number;
    deleteTimer: NodeJS.Timeout;
}

const fileStore = new Map<string, StoredFile>();

const app = express();

/**
 * Register a compressed file for download.
 * Returns a unique download ID.
 * The file will be automatically deleted after `ttlMs` milliseconds.
 */
export function registerFileForDownload(
    filePath: string,
    originalName: string,
    ttlMs: number = 8 * 60 * 60 * 1000 // 8 hours default
): string {
    const downloadId = crypto.randomUUID();

    const deleteTimer = setTimeout(async () => {
        const entry = fileStore.get(downloadId);
        if (entry) {
            fileStore.delete(downloadId);
            try {
                if (await fs.pathExists(entry.filePath)) {
                    await fs.remove(entry.filePath);
                    console.log(`[Server] Auto-deleted expired file: ${entry.filePath}`);
                }
            } catch (err) {
                console.error(`[Server] Failed to auto-delete file ${entry.filePath}:`, err);
            }
        }
    }, ttlMs);

    fileStore.set(downloadId, {
        filePath,
        originalName,
        expiresAt: Date.now() + ttlMs,
        deleteTimer,
    });

    console.log(`[Server] Registered file for download: ${downloadId} -> ${filePath} (expires in ${ttlMs / 1000 / 60 / 60}h)`);

    return downloadId;
}

/**
 * Build the full download URL for a given download ID.
 */
export function getDownloadUrl(downloadId: string): string {
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.SERVER_PORT || 3000}`;
    return `${serverUrl}/download/${downloadId}`;
}

// Download endpoint
app.get('/download/:id', async (req, res) => {
    const { id } = req.params;
    const entry = fileStore.get(id);

    if (!entry) {
        res.status(404).send('Файл не найден или срок скачивания истёк.');
        return;
    }

    if (Date.now() > entry.expiresAt) {
        fileStore.delete(id);
        res.status(410).send('Срок скачивания файла истёк.');
        return;
    }

    try {
        if (!(await fs.pathExists(entry.filePath))) {
            fileStore.delete(id);
            res.status(404).send('Файл не найден.');
            return;
        }

        const stat = await fs.stat(entry.filePath);

        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(entry.originalName)}"`);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Length', stat.size);

        const stream = fs.createReadStream(entry.filePath);
        stream.pipe(res);

        stream.on('error', (err) => {
            console.error(`[Server] Error streaming file ${entry.filePath}:`, err);
            if (!res.headersSent) {
                res.status(500).send('Ошибка при скачивании файла.');
            }
        });
    } catch (err) {
        console.error(`[Server] Error serving download ${id}:`, err);
        if (!res.headersSent) {
            res.status(500).send('Внутренняя ошибка сервера.');
        }
    }
});

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', files: fileStore.size });
});

/**
 * Start the Express download server.
 */
export function startServer(): void {
    const port = parseInt(process.env.SERVER_PORT || '3000', 10);
    app.listen(port, () => {
        console.log(`[Server] Download server running on port ${port}`);
    });
}
