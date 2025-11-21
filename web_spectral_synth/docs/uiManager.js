// uiManager.js: Handles all DOM interactions and events.

export class UIManager {
    constructor(controller) {
        this.controller = controller;
        this.elements = {
            btnStart: document.getElementById('btnStart'),
            log: document.getElementById('log'),
            canvas: document.getElementById('canvas'),
            midiStatus: document.getElementById('midiStatus'),
            
            // Preset controls
            presetList: document.getElementById('presetList'),
            savePreset: document.getElementById('savePreset'),
            deletePreset: document.getElementById('deletePreset'),
            exportPreset: document.getElementById('exportPreset'),
            importPresetFile: document.getElementById('importPresetFile'),

            // Synth params
            waveform: document.getElementById('waveform'),
            poly: document.getElementById('poly'),
            attack: document.getElementById('attack'),
            release: document.getElementById('release'),
            
            // Delay FX
            delayTime: document.getElementById('delayTime'),
            delayFeedback: document.getElementById('delayFeedback'),
            delayMix: document.getElementById('delayMix'),

            // Wavetable Editor
            btnGenerateWavetable: document.getElementById('btnGenerateWavetable'),
            wt_baseWave: document.getElementById('wt_baseWave'),
            wt_gate: document.getElementById('wt_gate'),
            wt_scramble: document.getElementById('wt_scramble'),
            wt_tilt: document.getElementById('wt_tilt'),
            wt_magnet_freq: document.getElementById('wt_magnet_freq'),
            wt_magnet_force: document.getElementById('wt_magnet_force'),
            wt_quantize_scale: document.getElementById('wt_quantize_scale'),

            // Sample Loader (for completeness, though not primary focus)
            sampleFile: document.getElementById('sampleFile'),
            playSample: document.getElementById('playSample'),
            stopSample: document.getElementById('stopSample'),
        };
        this.canvasCtx = this.elements.canvas.getContext('2d');
        this._bindEvents();
    }

    _bindEvents() {
        this.elements.btnStart.addEventListener('click', () => this.controller.start());

        // Synth params
        this.elements.waveform.addEventListener('change', () => this.controller.updateSynthParams({ waveform: this.elements.waveform.value }));
        this.elements.poly.addEventListener('change', () => this.controller.updateSynthParams({ polyphony: parseInt(this.elements.poly.value, 10) }));
        this.elements.attack.addEventListener('input', () => this.controller.updateSynthParams({ attack: parseFloat(this.elements.attack.value) }));
        this.elements.release.addEventListener('input', () => this.controller.updateSynthParams({ release: parseFloat(this.elements.release.value) }));

        // Delay FX params
        this.elements.delayTime.addEventListener('input', () => this.controller.updateDelayParams({ time: parseFloat(this.elements.delayTime.value) / 1000 }));
        this.elements.delayFeedback.addEventListener('input', () => this.controller.updateDelayParams({ feedback: parseFloat(this.elements.delayFeedback.value) }));
        this.elements.delayMix.addEventListener('input', () => this.controller.updateDelayParams({ mix: parseFloat(this.elements.delayMix.value) }));

        // Wavetable Editor events
        this.elements.btnGenerateWavetable.addEventListener('click', () => this.controller.generateWavetable());
        const wtParamUpdater = () => this.controller.updateWavetableParams(this.getWavetableParams());
        this.elements.wt_baseWave.addEventListener('change', wtParamUpdater);
        this.elements.wt_gate.addEventListener('input', wtParamUpdater);
        this.elements.wt_scramble.addEventListener('input', wtParamUpdater);
        this.elements.wt_tilt.addEventListener('input', wtParamUpdater);
        this.elements.wt_magnet_freq.addEventListener('change', wtParamUpdater);
        this.elements.wt_magnet_force.addEventListener('input', wtParamUpdater);
        this.elements.wt_quantize_scale.addEventListener('change', wtParamUpdater);

        // Sample controls
        this.elements.playSample.addEventListener('click', () => this.controller.playSample());
        this.elements.stopSample.addEventListener('click', () => this.controller.stopSample());
        this.elements.sampleFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.controller.loadSample(file);
        });

        // Preset controls
        this.elements.savePreset.addEventListener('click', () => this.controller.savePreset());
        this.elements.deletePreset.addEventListener('click', () => this.controller.deletePreset());
        this.elements.exportPreset.addEventListener('click', () => this.controller.exportPreset());
        this.elements.importPresetFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(file) this.controller.importPreset(file);
        });
        this.elements.presetList.addEventListener('change', () => this.controller.applyPreset(this.elements.presetList.value));
    }

    getWavetableParams() {
        return {
            baseWave: this.elements.wt_baseWave.value,
            gate: parseFloat(this.elements.wt_gate.value),
            scramble: parseFloat(this.elements.wt_scramble.value),
            tilt: parseFloat(this.elements.wt_tilt.value),
            magnetFreq: parseFloat(this.elements.wt_magnet_freq.value),
            magnetForce: parseFloat(this.elements.wt_magnet_force.value),
            quantizeScale: this.elements.wt_quantize_scale.value,
        };
    }

    log(...args) {
        this.elements.log.textContent += args.join(' ') + '\n';
        this.elements.log.scrollTop = this.elements.log.scrollHeight;
    }
    
    setMidiStatus(text) {
        this.elements.midiStatus.textContent = text;
    }

    updatePresetList(presets, selectedName) {
        this.elements.presetList.innerHTML = '';
        presets.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = p.name;
            this.elements.presetList.appendChild(opt);
        });
        if (selectedName) {
            this.elements.presetList.value = selectedName;
        }
    }
    
    getSelectedPresetName() {
        return this.elements.presetList.value;
    }

    applyPreset(preset) {
        const { synth, delay, wavetable } = preset;
        if (synth) {
            this.elements.waveform.value = synth.waveform;
            this.elements.poly.value = synth.polyphony;
            this.elements.attack.value = synth.attack;
            this.elements.release.value = synth.release;
        }
        if (delay) {
            this.elements.delayTime.value = delay.time * 1000;
            this.elements.delayFeedback.value = delay.feedback;
            this.elements.delayMix.value = delay.mix;
        }
        if (wavetable) {
            this.elements.wt_baseWave.value = wavetable.baseWave;
            this.elements.wt_gate.value = wavetable.gate;
            this.elements.wt_scramble.value = wavetable.scramble;
            this.elements.wt_tilt.value = wavetable.tilt;
            this.elements.wt_magnet_freq.value = wavetable.magnetFreq;
            this.elements.wt_magnet_force.value = wavetable.magnetForce;
            this.elements.wt_quantize_scale.value = wavetable.quantizeScale;
        }
    }

    // Generic method to draw frequency data to the canvas
    drawSpectrum(freqData) {
        const w = this.elements.canvas.width;
        const h = this.elements.canvas.height;
        this.canvasCtx.clearRect(0, 0, w, h);
        this.canvasCtx.fillStyle = '#021';
        this.canvasCtx.fillRect(0, 0, w, h);

        if (!freqData) return;

        const len = freqData.length;
        const barW = w / len;
        for (let i = 0; i < len; i++) {
            const val = freqData[i]; // expects normalized 0-1 value
            const barH = val * h;
            const hue = 200 + val * 100;
            this.canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            this.canvasCtx.fillRect(i * barW, h - barH, barW, barH);
        }
    }
}