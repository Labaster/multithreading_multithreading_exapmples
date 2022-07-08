
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import EventEmitter from 'events';
ffmpeg.setFfmpegPath(ffmpegPath.path);

const eventEmitter = new EventEmitter();
const VIDEO_SIZES = [
    '1024x768', '854x480', '800x600',
    '1600x900', '1440x900',
    '1280x800', '1280x720',
    '640x480', '640x360'
];

export const compressVideoSingleThread = (inputPath = '/home/labaster/Desktop/TEST/worker_threads/sample_earth.mp4') => {
  const compressedVideos = [];
  
  console.time('compressVideoSingleThread');
  VIDEO_SIZES.forEach((size) => {
    const outputPath = `${inputPath.split('.')[0]}_${size}.mp4`;

    ffmpeg(inputPath)
      .audioCodec('libmp3lame')
      .videoCodec('libx264')
      .size(size)
    .on('error', (err) => console.log(`An error occurred: ${err.message}`))
    .on('end', () => {
      compressedVideos.push(outputPath);
      if (compressedVideos.length === VIDEO_SIZES.length) eventEmitter.emit('compressVideoSingleThread', compressedVideos);
    })
    .save(outputPath);
  });

  eventEmitter.on('compressVideoSingleThread', (videoPaths) => {
    console.timeEnd('compressVideoSingleThread');
    console.log(videoPaths);
    eventEmitter.removeListener('compressVideoSingleThread', () => console.log('compressVideoSingleThread listener removed!'));
    process.exit(1);
  });
};

compressVideoSingleThread();
