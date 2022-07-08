import { Worker, isMainThread } from 'worker_threads';
import EventEmitter from 'events';

const eventEmitter = new EventEmitter();
const VIDEO_SIZES = [
    '1024x768', '854x480', '800x600',
    '1600x900', '1440x900',
    '1280x800', '1280x720',
    '640x480', '640x360'
];

export const compressVideoThreads = (inputPath = '/home/labaster/Desktop/TEST/worker_threads/sample_earth.mp4') => {
  if (isMainThread) {
    const compressedVideos = [];
    
    console.time('compressVideoThreads');
    VIDEO_SIZES.forEach((size, indx) => {
      const worker = new Worker('./worker_threads/worker.js', {
        workerData: {
            inputPath,
            size,
            indx
        }
      });
      
      worker.postMessage('compressVideoThreads_start');

      worker.on('message', (outputPath) => {
        compressedVideos.push(outputPath);

        if (compressedVideos.length === VIDEO_SIZES.length) eventEmitter.emit('compressVideoThreads', compressedVideos);
      });
    });
    
    eventEmitter.on('compressVideoThreads', (videoPaths) => {
      console.timeEnd('compressVideoThreads');
      console.log(videoPaths);
      eventEmitter.removeListener('compressVideoThreads', () => console.log('compressVideoThreads listener removed!'));
      process.exit(1);
    });
  }
};

compressVideoThreads();
