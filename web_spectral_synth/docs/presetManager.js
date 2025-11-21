// presetManager.js - simple localStorage-backed preset manager
export class PresetManager {
  constructor(){
    this.key = 'spectral_synth_presets_v1';
    this._cache = null;
    this._load();
  }
  _load(){
    try{
      const raw = localStorage.getItem(this.key);
      this._cache = raw ? JSON.parse(raw) : [];
    }catch(e){ this._cache = []; }
  }
  _save(){
    localStorage.setItem(this.key, JSON.stringify(this._cache));
  }
  list(){ return this._cache.slice(); }
  get(name){ return this._cache.find(p=>p.name===name); }
  savePreset(preset){
    const idx = this._cache.findIndex(x=>x.name===preset.name);
    if (idx>=0) this._cache[idx]=preset;
    else this._cache.push(preset);
    this._save();
  }
  delete(name){
    this._cache = this._cache.filter(p=>p.name!==name);
    this._save();
  }
}
