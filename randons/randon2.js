const record = require('node-record-lpcm16');
const crypto = require('crypto');

const SAMPLE_RATE = 16000; // Taxa de amostragem em Hz
const CHUNK_SIZE = 1024;    // Tamanho do chunk de áudio em bytes

// Inicia a captura de áudio
const audioStream = record.start({
    sampleRate: SAMPLE_RATE,
    encoding: 'signed-integer',
    endian: 'little',
    channels: 1,
    device: 'default', // Pode ser necessário especificar o dispositivo correto
    debug: false
});

// Função para processar os chunks de áudio e gerar números aleatórios
function processAudioChunk(chunk) {
    const hash = crypto.createHash('sha256');
    hash.update(chunk);
    const randomNumber = parseInt(hash.digest('hex'), 16); // Converte o hash para um número
    console.log('Número aleatório:', randomNumber);
}

// Escuta por chunks de áudio e os processa
audioStream.on('data', processAudioChunk);

// Para a captura de áudio após 30 segundos (exemplo)
setTimeout(() => {
    record.stop();
    console.log('Captura de áudio encerrada.');
}, 30000); // 30 segundos
