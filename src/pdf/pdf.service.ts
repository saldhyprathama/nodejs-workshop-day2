import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Worker, isMainThread, threadId } from 'worker_threads';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import * as os from 'os';
import * as PDFDocument from 'pdfkit';

/**
 * 🧵 WORKER THREADS & CPU CORES — Workshop Explanation
 * ─────────────────────────────────────────────────────
 *
 * YOUR MACHINE RIGHT NOW:
 *   CPU cores available: os.cpus().length  (e.g. 8 cores on M1)
 *
 * HOW NODE.JS NORMALLY WORKS:
 *   • Node.js runs on a SINGLE thread → uses 1 core
 *   • JS is single-threaded by design (V8 engine)
 *   • Heavy CPU task (build PDF, resize image, encrypt file)
 *     BLOCKS the event loop → no other requests served until done
 *
 *   Timeline without Worker:
 *   Core 1 (main): ──[req A]──[BUILD PDF 😰]──────────────[req B]──►
 *   Core 2-8:       (idle, wasted)
 *
 * HOW WORKER THREADS HELP:
 *   • Spawns a NEW thread → OS assigns it to an available core
 *   • Main thread stays FREE to handle other requests
 *   • Worker thread runs on a SEPARATE V8 isolate (own memory, own stack)
 *   • They communicate via postMessage (structured clone / transferable)
 *
 *   Timeline with Worker:
 *   Core 1 (main):   ──[req A]──[spawn]──[req B]──[req C]──►  (never blocked)
 *   Core 2 (worker):            ──[BUILD PDF]──[done → buffer]──►
 *
 * KEY POINT FOR AUDIENCE:
 *   Worker threads ≠ unlimited parallelism
 *   Creating too many workers (more than cpu cores) causes context switching overhead.
 *   Best practice: use a Worker Pool (e.g. piscina) to reuse threads.
 *
 * WHAT GETS SHARED:
 *   ✅ SharedArrayBuffer  — shared memory (explicit)
 *   ❌ Regular variables  — NOT shared, each worker has its own copy
 *   ❌ DB connections     — NOT shared, that's why we fetch in main thread
 */

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private prisma: PrismaService) {}

  async generatePostPdf(postId: number): Promise<Buffer> {
    const totalCores = os.cpus().length;
    const cpuModel = os.cpus()[0].model;

    // ── Show audience the machine's CPU info ──────────────────────
    this.logger.log(`💻 CPU: ${cpuModel}`);
    this.logger.log(`💻 Total cores available: ${totalCores}`);
    this.logger.log(`🟢 Main thread ID: ${threadId} (always 0 = main)`);
    this.logger.log(`🟢 Is main thread: ${isMainThread}`);
    this.logger.log(`🟢 Event loop is FREE — fetching post from DB...`);

    // 1. DB access stays on the MAIN thread
    //    (Prisma/SQLite connection is not shareable with workers)
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { name: true } } },
    });

    if (!post) throw new NotFoundException(`Post #${postId} not found`);

    const workerPath = join(__dirname, 'pdf.worker.js');

    return new Promise((resolve, reject) => {
      this.logger.log(`─────────────────────────────────────────`);
      this.logger.log(`🧵 Spawning Worker Thread for PDF generation`);
      this.logger.log(`🧵 Main thread (Core ?)  → stays free for new requests`);
      this.logger.log(`🧵 Worker thread (Core?) → will build the PDF`);
      this.logger.log(`🧵 OS decides which core — we just spawn & forget`);
      this.logger.log(`─────────────────────────────────────────`);

      const startTime = Date.now();

      // 2. Spawn worker — pass data via workerData (structured clone, not shared memory)
      const worker = new Worker(workerPath, {
        workerData: {
          post,
          // Pass CPU info so the worker can log from its side too
          workerMeta: { totalCores },
        },
      });

      // 3. Worker finished — receive PDF buffer via postMessage
      worker.on(
        'message',
        ({
          pdfBuffer,
          workerThreadId,
        }: {
          pdfBuffer: Buffer;
          workerThreadId: number;
        }) => {
          const elapsed = Date.now() - startTime;
          this.logger.log(`─────────────────────────────────────────`);
          this.logger.log(
            `✅ PDF done! Built on Worker Thread ID: ${workerThreadId}`,
          );
          this.logger.log(`✅ Size: ${pdfBuffer.length} bytes`);
          this.logger.log(`✅ Time: ${elapsed}ms`);
          this.logger.log(
            `✅ Main thread was NEVER blocked during those ${elapsed}ms`,
          );
          this.logger.log(`─────────────────────────────────────────`);
          resolve(Buffer.from(pdfBuffer));
        },
      );

      worker.on('error', (err) => {
        this.logger.error(`❌ Worker error: ${err.message}`);
        reject(err);
      });

      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
      });
    });
  }

  /**
   * ❌ BLOCKING VERSION — no Worker Thread
   *
   * DEMO STEPS FOR AUDIENCE:
   *  1. Hit GET /pdf/post/:id/blocking  → will hang for 10 seconds
   *  2. While waiting, open a NEW tab and hit GET /posts
   *  3. Watch: GET /posts will NOT respond until the PDF is done
   *  4. That's the event loop being BLOCKED
   *
   * Then repeat with GET /pdf/post/:id (worker version):
   *  1. Hit the worker endpoint
   *  2. Immediately hit GET /posts in another tab
   *  3. GET /posts responds instantly — event loop is FREE
   */
  async generatePostPdfBlocking(postId: number): Promise<Buffer> {
    this.logger.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.logger.warn(`⛔ BLOCKING mode — running on Main Thread`);
    this.logger.warn(`⛔ Thread ID: ${threadId} (0 = main thread)`);
    this.logger.warn(`⛔ Is main thread: ${isMainThread}`);
    this.logger.warn(`⛔ Event loop will be BLOCKED for 10 seconds`);
    this.logger.warn(`⛔ Try calling GET /posts right now — it will hang!`);
    this.logger.warn(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { name: true } } },
    });

    if (!post) throw new NotFoundException(`Post #${postId} not found`);

    // ⛔ Simulate heavy CPU work — BLOCKS the event loop
    this.logger.warn(
      `⛔ Starting 10s CPU block... (other requests are frozen)`,
    );
    this.blockEventLoop(10_000);
    this.logger.warn(`⛔ Block done. Event loop is alive again.`);
    this.logger.warn(
      `⛔ Any requests that came in during those 10s were QUEUED`,
    );

    // Build PDF synchronously — still on main thread
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const buf = Buffer.concat(chunks);
        this.logger.warn(
          `⛔ PDF size: ${buf.length} bytes — built on MAIN thread`,
        );
        resolve(buf);
      });
      doc.on('error', reject);

      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(post.title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Author: ${post.author.name}`);
      doc.moveDown();
      doc.fontSize(14).text(post.body);
      doc.moveDown(2);
      doc
        .fontSize(10)
        .fillColor('red')
        .text(`⛔ Generated BLOCKING on Main Thread (no worker)`, {
          align: 'right',
        });
      doc.end();
    });
  }

  /**
   * Simulates heavy CPU work by spinning for `ms` milliseconds.
   * This is intentionally synchronous to block the event loop.
   *
   * Real world equivalent: large image resize, crypto, huge JSON.parse
   */
  private blockEventLoop(ms: number): void {
    const end = Date.now() + ms;
    // eslint-disable-next-line no-empty
    while (Date.now() < end) {
      // 🔥 Burning CPU — event loop is stuck here
    }
  }
}
