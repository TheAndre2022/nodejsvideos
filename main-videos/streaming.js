const fs = require('fs');

class VideoStream {
  constructor(filePath) {
    this.path = filePath;
    this.startRange = -1;
    this.endRange = -1;
    this.size = 0;
    this.defaultBuffer = 16000; // Tamanho inicial do buffer
  }

  async streamVideo(req, res) {
    try {
      const stat = await fs.promises.stat(this.path);
      if (!stat.isFile()) {
        throw new Error('O arquivo não existe ou não é um arquivo válido.');
      }

      this.size = stat.size;
      this.startRange = 0;
      this.endRange = this.size - 1;

      this.adjustBufferSize();

      const headers = {
        'Content-Type': 'video/mp4',
        'Content-Length': this.size,
        'Accept-Ranges': 'bytes',
      };

      let range = req.headers.range;
      if (range) {
        this.handleRangeRequest(range, headers, res);
      } else {
        this.handleFullRequest(headers, res);
      }
    } catch (err) {
      res.status(500).send(`Erro ao processar o vídeo: ${err.message}`);
    }
  }

  adjustBufferSize() {
    if (this.size < 1048576) { // 1MB
      this.buffer = 8192; // Chunk menor para arquivos pequenos
    } else {
      this.buffer = 65536; // Chunk maior para arquivos grandes
    }
  }

  handleRangeRequest(range, headers, res) {
    const parts = range.replace(/bytes=/, '').split('-');
    const partialStart = parseInt(parts[0], 10);
    const partialEnd = parts[1] ? parseInt(parts[1], 10) : this.size - 1;
    const start = Math.max(0, partialStart);
    const end = Math.min(this.size - 1, partialEnd);

    headers['Content-Range'] = `bytes ${start}-${end}/${this.size}`;
    headers['Content-Length'] = end - start + 1;
    headers['Accept-Ranges'] = 'bytes';

    res.writeHead(206, headers);
    const fileStream = fs.createReadStream(this.path, { start, end, highWaterMark: this.buffer });
    fileStream.pipe(res);
  }

  handleFullRequest(headers, res) {
    res.writeHead(200, headers);
    fs.createReadStream(this.path, { highWaterMark: this.buffer }).pipe(res);
  }
}

module.exports = VideoStream;
