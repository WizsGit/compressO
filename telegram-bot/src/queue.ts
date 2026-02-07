
export class VideoQueue {
    private queue: Array<() => Promise<void>> = [];
    private isProcessing = false;

    enqueue(task: () => Promise<void>) {
        console.log('Task added to queue. Queue length:', this.queue.length + 1);
        this.queue.push(task);
        this.processNext();
    }

    private async processNext() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const task = this.queue.shift();

        if (task) {
            try {
                await task();
            } catch (error) {
                console.error('Error processing task:', error);
            } finally {
                this.isProcessing = false;
                this.processNext();
            }
        }
    }
}
