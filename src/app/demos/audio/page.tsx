'use client';
import { useCallback, useEffect, useRef } from 'react';
import { Noise } from './Noise';
import { Vec2 } from './engine/linear';

export default function SimpleCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function getLocalStream() {
    try {
      // use focusrite for audio input
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: {
            exact:
              'c8af0d2300c3675bef1fb7923c894dc153e1babf82b07605672c8117d61bccbd',
          },
        },
        video: false,
      });

      return stream;
    } catch (err) {
      console.log('navigator.getUserMedia error: ', err);
      return null;
    }
  }

  const drawNoise = useCallback((noise: Noise, nextNoise: Noise, t: number) => {
    const canvas = canvasRef.current!;
    const canvasCtx = canvas.getContext('2d')!;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const value = noise.getLerpNoise(new Vec2(x, y), nextNoise, t);
        canvasCtx.fillStyle = `rgb(${value * 255},${value * 255},${
          value * 255
        })`;
        canvasCtx.fillRect(x, y, 1, 1);
      }
    }
  }, []);

  function calculateOctaves(frequencyData: Uint8Array, sampleRate: number) {
    const octaveBands = [
      { minFreq: 20, maxFreq: 40 }, // Octave 1: 20 Hz - 40 Hz
      { minFreq: 40, maxFreq: 80 }, // Octave 2: 40 Hz - 80 Hz
      { minFreq: 80, maxFreq: 160 }, // Octave 3: 80 Hz - 160 Hz
      { minFreq: 160, maxFreq: 320 }, // Octave 4: 160 Hz - 320 Hz
      { minFreq: 320, maxFreq: 640 }, // Octave 5: 320 Hz - 640 Hz
      { minFreq: 640, maxFreq: 1280 }, // Octave 6: 640 Hz - 1280 Hz
      { minFreq: 1280, maxFreq: 2560 }, // Octave 7: 1280 Hz - 2560 Hz
      { minFreq: 2560, maxFreq: 5120 }, // Octave 8: 2560 Hz - 5120 Hz
      { minFreq: 5120, maxFreq: 10240 }, // Octave 9: 5120 Hz - 10240 Hz
      { minFreq: 10240, maxFreq: 20480 }, // Octave 10: 10240 Hz - 20480 Hz
    ];

    const octaveValues: number[] = [];

    octaveBands.forEach((octave) => {
      let sum = 0;
      // Sum up the values within the octave band
      for (
        let i = Math.round(
          (octave.minFreq / (sampleRate / 2)) * frequencyData.length
        );
        i <
        Math.round((octave.maxFreq / (sampleRate / 2)) * frequencyData.length);
        i++
      ) {
        sum += frequencyData[i];
      }
      octaveValues.push(sum);
    });
    return octaveValues;
  }

  function getOverallLoudness(dataArray: Uint8Array) {
    const sum = dataArray.reduce((a, b) => a + b, 0);
    return sum / dataArray.length;
  }

  function getFrequencyBands(dataArray: Uint8Array, bands = 5) {
    const bandSize = Math.floor(dataArray.length / bands);
    const bandValues = [];

    for (let i = 0; i < bands; i++) {
      const start = i * bandSize;
      const end = start + bandSize;
      const bandData = dataArray.slice(start, end);
      const bandSum = bandData.reduce((a, b) => a + b, 0);
      bandValues.push(bandSum / bandSize);
    }

    return bandValues;
  }

  function getDynamicRange(dataArray: Uint8Array) {
    const max = Math.max(...Array.from(dataArray));
    const min = Math.min(...Array.from(dataArray));
    return max - min;
  }

  const generateWorldParameters = useCallback((frequencyData: Uint8Array) => {
    const loudness = getOverallLoudness(frequencyData);
    const frequencyBands = getFrequencyBands(frequencyData);
    const dynamicRange = getDynamicRange(frequencyData);

    console.log(frequencyBands);

    const energy = frequencyBands.reduce((a, b) => a + b, 0);

    // Example mappings (adjust as needed for your specific use case)
    const seed = Math.floor(loudness * 10000); // Map loudness to seed
    const octaves = 8; // Map first frequency band to octaves
    const amplitude = energy * 15; // Map second frequency band to amplitude
    const smoothness = energy * 10; // Map third frequency band to smoothness
    const roughness = energy * 5; // Map fourth frequency band to roughness
    const offset = energy; // Map fifth frequency band to offset

    return { seed, octaves, amplitude, smoothness, roughness, offset };
  }, []);

  const initAudio = useCallback(async () => {
    const stream = await getLocalStream();

    if (!stream) {
      return;
    }

    // get available audio inputs
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);

    // get focusrite id c8af0d2300c3675bef1fb7923c894dc153e1babf82b07605672c8117d61bccbd
    const focusrite = devices.find(
      (device) =>
        device.deviceId ===
        'c8af0d2300c3675bef1fb7923c894dc153e1babf82b07605672c8117d61bccbd'
    );

    console.log(focusrite);

    // live microphone playback
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser.connect(audioCtx.destination);
    // set volume
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);
    source.connect(analyser);
    source.connect(gainNode);

    // frequency data
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let dt = 0;
    let lastTime = Date.now();

    const NOISE_PARAMS: [number, number, number, number, number] = [
      8, 1, 64, 0.5, 0,
    ];

    let currentNoise = new Noise(0.5, ...NOISE_PARAMS);
    let nextNoise = new Noise(Math.random(), ...NOISE_PARAMS);

    let progress = 0;
    const DURATION = 0.5; // seconds

    function normalizeArray(array: Uint8Array) {
      return Array.from(array).map((val) => val / 255);
    }

    function draw() {
      const currentTime = Date.now();
      dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      progress += dt / DURATION;

      analyser.getByteFrequencyData(dataArray);

      if (progress >= 1) {
        const normalizedData = normalizeArray(dataArray);
        const params = generateWorldParameters(new Uint8Array(dataArray));
        console.log(params);

        progress -= 1;
        currentNoise = nextNoise;
        nextNoise = new Noise(
          999999,
          params.octaves,
          params.amplitude,
          params.smoothness,
          params.roughness,
          params.offset
        );
      }

      drawNoise(currentNoise, nextNoise, progress);

      requestAnimationFrame(draw);
    }

    draw();
  }, [drawNoise, generateWorldParameters]);

  let hasInitialized = false;

  useEffect(() => {
    if (hasInitialized) {
      return;
    }

    hasInitialized = true;
    initAudio();
  }, [initAudio]);

  return (
    <div className="h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
