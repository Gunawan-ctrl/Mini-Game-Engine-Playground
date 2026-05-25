let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

export function useExplosionSound() {
  const play = () => {
    const ctx = getCtx()
    const now = ctx.currentTime
    const dur = 0.65

    // White noise filtered into a low rumble
    const buf  = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

    const noise       = ctx.createBufferSource()
    noise.buffer      = buf

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type  = 'lowpass'
    noiseFilter.frequency.setValueAtTime(900, now)
    noiseFilter.frequency.exponentialRampToValueAtTime(60, now + dur)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.55, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    // Low-frequency impact thump
    const osc     = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type      = 'sine'
    osc.frequency.setValueAtTime(110, now)
    osc.frequency.exponentialRampToValueAtTime(18, now + 0.4)
    oscGain.gain.setValueAtTime(0.65, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc.connect(oscGain)
    oscGain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + dur)
    osc.start(now)
    osc.stop(now + 0.4)
  }

  return { play }
}
