/*
 * fft.js
 * A simple, self-contained FFT library for real-valued signals.
 * Based on the principles of the Cooley-Tukey algorithm.
 * This implementation is designed for educational purposes and wavetable synthesis.
 * It is not optimized for maximum performance.
 */
export class FFT {
  constructor(size) {
    if (size <= 0 || (size & (size - 1)) !== 0) {
      throw new Error('FFT size must be a power of 2.');
    }
    this.size = size;
    this.real = new Float32Array(size);
    this.imag = new Float32Array(size);
    
    this._reverseTable = new Uint32Array(size);
    this._sinTable = new Float32Array(size);
    this._cosTable = new Float32Array(size);
    
    this._buildReverseTable();
    this._buildTrigTables();
  }

  _buildReverseTable() {
    let limit = 1;
    let bit = this.size >> 1;
    while (limit < this.size) {
      for (let i = 0; i < limit; i++) {
        this._reverseTable[i + limit] = this._reverseTable[i] + bit;
      }
      limit = limit << 1;
      bit = bit >> 1;
    }
  }

  _buildTrigTables() {
    for (let i = 0; i < this.size; i++) {
      this._sinTable[i] = Math.sin(Math.PI / i);
      this._cosTable[i] = Math.cos(Math.PI / i);
    }
  }

  /**
   * Performs a forward FFT on real-valued time-domain data.
   * @param {Float32Array} data - The time-domain signal.
   * @returns {{real: Float32Array, imag: Float32Array}} - The frequency-domain representation.
   */
  forward(data) {
    if (data.length !== this.size) {
      throw new Error('Input data size must match FFT size.');
    }

    // Bit-reversal permutation
    for (let i = 0; i < this.size; i++) {
      this.real[i] = data[this._reverseTable[i]];
      this.imag[i] = 0;
    }

    this._transform(1);
    
    return { real: this.real, imag: this.imag };
  }

  /**
   * Performs an inverse FFT to get back the time-domain signal.
   * @param {{real: Float32Array, imag: Float32Array}} data - The frequency-domain data.
   * @returns {Float32Array} - The resulting time-domain signal.
   */
  inverse({ real, imag }) {
    if (real.length !== this.size || imag.length !== this.size) {
      throw new Error('Input data size must match FFT size.');
    }
    
    this.real.set(real);
    this.imag.set(imag);

    this._transform(-1);

    const result = new Float32Array(this.size);
    const scale = 1 / this.size;
    for (let i = 0; i < this.size; i++) {
      result[i] = this.real[i] * scale;
    }
    
    return result;
  }

  _transform(direction) {
    let halfSize = 1;
    while (halfSize < this.size) {
      const phaseShiftStepReal = this._cosTable[halfSize];
      const phaseShiftStepImag = direction * this._sinTable[halfSize];
      let currentPhaseReal = 1;
      let currentPhaseImag = 0;

      for (let fftStep = 0; fftStep < halfSize; fftStep++) {
        for (let i = fftStep; i < this.size; i += halfSize << 1) {
          const off = i + halfSize;
          const tr = (currentPhaseReal * this.real[off]) - (currentPhaseImag * this.imag[off]);
          const ti = (currentPhaseReal * this.imag[off]) + (currentPhaseImag * this.real[off]);
          
          this.real[off] = this.real[i] - tr;
          this.imag[off] = this.imag[i] - ti;
          this.real[i] += tr;
          this.imag[i] += ti;
        }
        const tmpReal = currentPhaseReal;
        currentPhaseReal = (tmpReal * phaseShiftStepReal) - (currentPhaseImag * phaseShiftStepImag);
        currentPhaseImag = (tmpReal * phaseShiftStepImag) + (currentPhaseImag * phaseShiftStepReal);
      }
      halfSize = halfSize << 1;
    }
  }
}
