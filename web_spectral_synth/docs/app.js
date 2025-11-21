// app.js: Main application class. Orchestrates UI, audio, and state management.

import { UIManager } from './uiManager.js';
import { SynthEngine } from './synthEngine.js';
import { PresetManager } from './presetManager.js';
import { FFT } from './fft.js';

const KEYBOARD_MAP = {
  'KeyZ': 48, 'KeyS':49, 'KeyX':50, 'KeyD':51, 'KeyC':52, 'KeyV':53, 'KeyG':54, 'KeyB':55, 'KeyH':56, 'KeyN':57, 'KeyJ':58, 'KeyM':59,
  'KeyQ':60, 'Digit2':61, 'KeyW':62, 'Digit3':63, 'KeyE':64, 'KeyR':65, 'Digit5':66, 'KeyT':67, 'Digit6':68, 'KeyY':69, 'KeyU':70, 'Digit7':71, 'KeyI':72, 'Digit9':73, 'KeyO':74, 'Digit0':75, 'KeyP':76
};

const FFT_SIZE = 2048;

export class App {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.analyser = null;
        this.synth = null;
        this.fft = new FFT(FFT_SIZE);
        this.currentWavetable = null;
        
        this.synthOutput = null;
        this.delayNode = null;
        this.delayFeedback = null;
        this.wetGain = null;
        this.dryGain = null;

        this.presetManager = new PresetManager();
        this.ui = new UIManager(this);
        this.activeKeys = new Set();

        this.state = JSON.parse(JSON.stringify(App.prototype.state)); // Initial deep copy
        
        this._init();
    }

    _init() {
        this.ui.updatePresetList(this.presetManager.list(), this.state.name);
        this.ui.applyPreset(this.state);
        this._setupKeyboard();
        this._loadInitialPreset();
    }

    async start() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.audioCtx.destination);

            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = FFT_SIZE;
            this.analyser.smoothingTimeConstant = 0.85;
            this.masterGain.connect(this.analyser);

            this.synthOutput = this.audioCtx.createGain();
            this._setupDelayEffect();

            this.synth = new SynthEngine(this.audioCtx, this.synthOutput, this.state.synth);
            
            await this.generateWavetable();

            this._setupMIDI();
            this._startAnalyzer();
            this.ui.log('Audio started. Wavetable generated.');
        }
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
            this.ui.log('Audio resumed');
        }
    }

    _setupDelayEffect() {
        this.delayNode = this.audioCtx.createDelay(1.0);
        this.delayFeedback = this.audioCtx.createGain();
        this.wetGain = this.audioCtx.createGain();
        this.dryGain = this.audioCtx.createGain();

        this.synthOutput.connect(this.dryGain);
        this.synthOutput.connect(this.delayNode);
        this.delayNode.connect(this.delayFeedback).connect(this.delayNode);
        this.delayNode.connect(this.wetGain);
        this.dryGain.connect(this.masterGain);
        this.wetGain.connect(this.masterGain);

        this.updateDelayParams(this.state.delay);
    }

    _loadInitialPreset() {
        const presets = this.presetManager.list();
        if (presets.length === 0) {
            const defaultPreset = { name: 'Default', ...this.state };
            this.presetManager.savePreset(defaultPreset);
            this.applyPreset('Default');
        } else {
            this.applyPreset(presets[0].name);
        }
    }

    // --- Parameter & State Management ---
    updateSynthParams(params) {
        Object.assign(this.state.synth, params);
        if (this.synth) this.synth.setParams(this.state.synth);
    }

    updateDelayParams(params) {
        Object.assign(this.state.delay, params);
        if (!this.audioCtx) return;
        const { time, feedback, mix } = this.state.delay;
        this.delayNode.delayTime.setTargetAtTime(time, this.audioCtx.currentTime, 0.01);
        this.delayFeedback.gain.setTargetAtTime(feedback, this.audioCtx.currentTime, 0.01);
        this.wetGain.gain.setTargetAtTime(mix, this.audioCtx.currentTime, 0.01);
        this.dryGain.gain.setTargetAtTime(1 - mix, this.audioCtx.currentTime, 0.01);
    }

    updateWavetableParams(params) {
        Object.assign(this.state.wavetable, params);
    }

    // --- Wavetable Generation ---
    async generateWavetable() {
        if (!this.audioCtx) return;
        this.ui.log('Generating wavetable...');

        // 1. Create base waveform
        const baseWave = new Float32Array(FFT_SIZE);
        for (let i = 0; i < FFT_SIZE; i++) {
            const phase = i / FFT_SIZE;
            switch (this.state.wavetable.baseWave) {
                case 'sawtooth': baseWave[i] = (phase * 2) - 1; break;
                case 'square': baseWave[i] = phase < 0.5 ? 1 : -1; break;
                case 'sine': baseWave[i] = Math.sin(phase * 2 * Math.PI); break;
            }
        }

        // 2. FFT
        const { real, imag } = this.fft.forward(baseWave);
        const magnitudes = new Array(FFT_SIZE / 2);
        const phases = new Array(FFT_SIZE / 2);
        for (let i = 0; i < FFT_SIZE / 2; i++) {
            magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
            phases[i] = Math.atan2(imag[i], real[i]);
        }

        // 3. Apply Spectral Effects
        const params = this.state.wavetable;
        const maxMag = magnitudes.reduce((a, b) => Math.max(a, b), 0) || 1;

        // Gate
        const threshold = params.gate * maxMag;
        for (let i = 0; i < magnitudes.length; i++) {
            if (magnitudes[i] < threshold) magnitudes[i] = 0;
        }
        
        // Tilt
        for (let i = 1; i < magnitudes.length; i++) {
            const tiltFactor = Math.pow(i / (magnitudes.length -1), params.tilt);
            magnitudes[i] *= tiltFactor;
        }

        // Scramble
        if (params.scramble > 0) {
            for (let i = 1; i < magnitudes.length; i++) {
                if (Math.random() < params.scramble) {
                    const j = 1 + Math.floor(Math.random() * (magnitudes.length - 1));
                    [magnitudes[i], magnitudes[j]] = [magnitudes[j], magnitudes[i]];
                }
            }
        }
        
        // Magnet
        if (params.magnetForce !== 0) {
            const warpedMagnitudes = new Float32Array(magnitudes.length).fill(0);
            const magnetBin = params.magnetFreq / (this.audioCtx.sampleRate / FFT_SIZE);

            for (let i = 1; i < magnitudes.length; i++) {
                if (magnitudes[i] === 0) continue;
                
                const distance = i - magnetBin;
                // A simple non-linear mapping
                const warpFactor = Math.pow(Math.abs(distance) / magnitudes.length, 2.0);
                const newIndex = i - distance * params.magnetForce * warpFactor;

                if (newIndex >= 1 && newIndex < magnitudes.length -1) {
                    const lowerIndex = Math.floor(newIndex);
                    const upperIndex = lowerIndex + 1;
                    const weight = newIndex - lowerIndex;
                    
                    // Distribute energy
                    warpedMagnitudes[lowerIndex] += magnitudes[i] * (1 - weight);
                    warpedMagnitudes[upperIndex] += magnitudes[i] * weight;
                }
            }
            for(let i=0; i<magnitudes.length; i++) magnitudes[i] = warpedMagnitudes[i];
        }

        // Quantize
        if (params.quantizeScale !== 'none') {
            const SCALES = {
                major: [0, 2, 4, 5, 7, 9, 11],
                minor: [0, 2, 3, 5, 7, 8, 10],
                pentatonic: [0, 2, 4, 7, 9],
            };
            const scale = SCALES[params.quantizeScale];
            const quantizedMagnitudes = new Float32Array(magnitudes.length).fill(0);
            
            for (let i = 1; i < magnitudes.length; i++) {
                if (magnitudes[i] === 0) continue;

                const freq = i * this.audioCtx.sampleRate / FFT_SIZE;
                const midi = 69 + 12 * Math.log2(freq / 440);

                const octave = Math.floor(midi / 12);
                const noteInOctave = midi % 12;

                const closestNote = scale.reduce((prev, curr) => 
                    (Math.abs(curr - noteInOctave) < Math.abs(prev - noteInOctave) ? curr : prev)
                );
                
                const newMidi = octave * 12 + closestNote;
                const newFreq = 440 * Math.pow(2, (newMidi - 69) / 12);
                const newIndex = Math.round(newFreq / (this.audioCtx.sampleRate / FFT_SIZE));

                if (newIndex >= 1 && newIndex < magnitudes.length) {
                    quantizedMagnitudes[newIndex] += magnitudes[i];
                }
            }
            for(let i=0; i<magnitudes.length; i++) magnitudes[i] = quantizedMagnitudes[i];
        }
        
        // 4. Reconstruct spectrum and IFFT
        for (let i = 0; i < FFT_SIZE / 2; i++) {
            real[i] = magnitudes[i] * Math.cos(phases[i]);
            imag[i] = magnitudes[i] * Math.sin(phases[i]);
            if (i > 0 && i < FFT_SIZE / 2) {
                real[FFT_SIZE - i] = real[i];
                imag[FFT_SIZE - i] = -imag[i];
            }
        }
        
        let finalWave = this.fft.inverse({ real, imag });

        // 5. Normalize and create PeriodicWave
        const maxVal = finalWave.reduce((a, b) => Math.max(a, Math.abs(b)), 0) || 1;
        for (let i = 0; i < finalWave.length; i++) finalWave[i] /= maxVal;
        
        this.currentWavetable = this.audioCtx.createPeriodicWave(finalWave, new Float32Array(finalWave.length));
        if (this.synth) this.synth.setWavetable(this.currentWavetable);

        // 6. Visualize
        // The live analyzer will now show the spectrum of the playing sound.
        // We don't need to draw a static spectrum here anymore.
        this.ui.log('Wavetable generated.');
    }


    // --- MIDI and Keyboard ---
    _setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat || this.activeKeys.has(e.code)) return;
            const note = KEYBOARD_MAP[e.code];
            if (note !== undefined) {
                this.activeKeys.add(e.code);
                if (this.synth) this.synth.noteOn(note, 0.9);
            }
        });
        window.addEventListener('keyup', (e) => {
            const note = KEYBOARD_MAP[e.code];
            if (note !== undefined) {
                this.activeKeys.delete(e.code);
                if (this.synth) this.synth.noteOff(note);
            }
        });
    }

    async _setupMIDI() {
        if (!navigator.requestMIDIAccess) {
            this.ui.setMidiStatus('MIDI: Not supported'); return;
        }
        try {
            const access = await navigator.requestMIDIAccess();
            const updateDevices = () => {
                const inputs = Array.from(access.inputs.values()).map(i => i.name).join(', ') || 'none';
                this.ui.setMidiStatus(`MIDI inputs: ${inputs}`);
            };
            access.onstatechange = updateDevices;
            for (const input of access.inputs.values()) {
                input.onmidimessage = (msg) => this._handleMidiMessage(msg);
            }
            updateDevices();
            this.ui.log('MIDI ready');
        } catch (err) {
            this.ui.setMidiStatus('MIDI: Error'); this.ui.log('MIDI init error', err);
        }
    }

    _handleMidiMessage(msg) {
        const [status, data1, data2] = msg.data;
        const cmd = status & 0xf0;
        if (cmd === 0x90 && data2 > 0) {
            if (this.synth) this.synth.noteOn(data1, data2 / 127);
        } else if ((cmd === 0x80) || (cmd === 0x90 && data2 === 0)) {
            if (this.synth) this.synth.noteOff(data1);
        }
    }

    // --- Analyzer ---
    _startAnalyzer() {
        const liveAnalyzerData = new Uint8Array(this.analyser.frequencyBinCount);
        const draw = () => {
            if (this.analyser) {
                 this.analyser.getByteFrequencyData(liveAnalyzerData);
                 // Normalize for visualization
                 const normalizedData = new Float32Array(liveAnalyzerData.length);
                 for(let i=0; i<normalizedData.length; i++) {
                    normalizedData[i] = liveAnalyzerData[i] / 255;
                 }
                 this.ui.drawSpectrum(normalizedData);
            }
            requestAnimationFrame(draw);
        };
        draw(); 
    }

    // --- Preset Management ---
    savePreset() {
        const name = prompt('Preset name?', this.state.name || 'NewPreset');
        if (!name) return;
        this.state.name = name;
        const preset = { ...JSON.parse(JSON.stringify(this.state)) };
        this.presetManager.savePreset(preset);
        this.ui.updatePresetList(this.presetManager.list(), name);
        this.ui.log(`Preset saved: ${name}`);
    }
    
    deletePreset() {
        const name = this.ui.getSelectedPresetName();
        if (!name) return alert('Select a preset to delete.');
        if (!confirm(`Delete preset "${name}"?`)) return;
        this.presetManager.delete(name);
        this.ui.updatePresetList(this.presetManager.list());
        this.ui.log(`Preset deleted: ${name}`);
        this._loadInitialPreset();
    }

    applyPreset(name) {
        const preset = this.presetManager.get(name);
        if (!preset) return;
        
        const defaultState = JSON.parse(JSON.stringify(App.prototype.state));
        this.state = {
            ...defaultState,
            ...JSON.parse(JSON.stringify(preset)),
            synth: { ...defaultState.synth, ...preset.synth },
            delay: { ...defaultState.delay, ...preset.delay },
            wavetable: { ...defaultState.wavetable, ...preset.wavetable },
        };

        this.ui.applyPreset(this.state);
        if (this.synth) this.synth.setParams(this.state.synth);
        if (this.audioCtx) {
            this.updateDelayParams(this.state.delay);
            this.generateWavetable();
        }
        this.ui.log(`Preset applied: ${preset.name}`);
    }
}

// Default state attached to prototype for easy cloning and resetting
App.prototype.state = {
    name: 'Default',
    synth: { waveform: 'sawtooth', polyphony: 6, attack: 10, release: 300 },
    delay: { time: 0.0, feedback: 0.0, mix: 0.0 },
    wavetable: {
        baseWave: 'sawtooth',
        gate: 0.0,
        scramble: 0.0,
        tilt: 0.0,
        magnetFreq: 440,
        magnetForce: 0.0,
        quantizeScale: 'none',
    }
};
