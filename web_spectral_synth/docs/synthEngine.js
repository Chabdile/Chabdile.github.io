// synthEngine.js: Manages voice creation and sample playback. Decoupled from UI.

export class SynthEngine {
  constructor(ctx, output, params) {
    this.ctx = ctx;
    this.output = output;
    this.voices = new Map(); // key: midi note, value: voice object
    this.sampleBuffer = null;
    this.sampleSource = null;
    this.wavetable = null;

    this.setParams(params);
  }

  setParams(params) {
    this.maxVoices = params.polyphony ?? this.maxVoices;
    this.waveform = params.waveform ?? this.waveform;
    this.attack = params.attack ?? this.attack;
    this.release = params.release ?? this.release;
  }

  setWavetable(wave) {
    this.wavetable = wave;
  }

  noteOn(midiNote, velocity = 1) {
    if (this.voices.size >= this.maxVoices) {
      // Voice stealing: remove the oldest voice.
      const oldestKey = this.voices.keys().next().value;
      this.noteOff(oldestKey);
    }
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    if (this.wavetable) {
      osc.setPeriodicWave(this.wavetable);
    } else {
      osc.type = this.waveform;
    }
    
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);

    osc.connect(g).connect(this.output);
    osc.start();

    const now = this.ctx.currentTime;
    const atk = Math.max(0.001, this.attack / 1000);
    g.gain.linearRampToValueAtTime(velocity, now + atk);

    this.voices.set(midiNote, { osc, g });
  }

  noteOff(midiNote) {
    const v = this.voices.get(midiNote);
    if (!v) return;
    
    this.voices.delete(midiNote);

    const now = this.ctx.currentTime;
    const rel = Math.max(0.001, this.release / 1000);
    v.g.gain.cancelScheduledValues(now);
    v.g.gain.setValueAtTime(v.g.gain.value, now);
    v.g.gain.linearRampToValueAtTime(0.0001, now + rel);
    v.osc.stop(now + rel + 0.05);
    
    setTimeout(()=> {
      try{ v.osc.disconnect(); v.g.disconnect(); }catch(e){}
    }, (rel+0.1)*1000);
  }

  loadSample(arrayBuffer) {
    return this.ctx.decodeAudioData(arrayBuffer).then(buf => {
      this.sampleBuffer = buf;
      return buf;
    }).catch(err => {
        console.error('Sample decode error', err);
        throw err;
    });
  }

  playSample() {
    if (!this.sampleBuffer) {
      console.log('No sample loaded');
      return null;
    }
    if (this.sampleSource) {
      try { this.sampleSource.stop(); } catch (e) {}
      this.sampleSource.disconnect();
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this.sampleBuffer;
    src.connect(this.output);
    src.start();
    this.sampleSource = src;
    src.onended = () => { this.sampleSource = null; };
    return src;
  }

  stopSample() {
    if (this.sampleSource) {
      try { this.sampleSource.stop(); } catch (e) {}
      this.sampleSource.disconnect();
      this.sampleSource = null;
    }
  }
}
