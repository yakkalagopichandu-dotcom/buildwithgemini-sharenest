import numpy as np
import wave

sample_rate = 44100
bpm = 108
beat_dur = 60.0 / bpm
duration = 30.5
total_samples = int(sample_rate * duration)
audio = np.zeros(total_samples, dtype=np.float32)

# Warm Neo-Soul / Tech Lofi Chord Progression
# Ebmaj7 (Eb3, G3, Bb3, D4) -> Cm7 (C3, Eb3, G3, Bb3) -> Fm7 (F3, Ab3, C4, Eb4) -> Bb7sus (Bb2, Ab3, C4, Eb4)
chords = [
    [155.56, 196.00, 233.08, 293.66],
    [130.81, 155.56, 196.00, 233.08],
    [174.61, 207.65, 261.63, 311.13],
    [116.54, 207.65, 261.63, 311.13],
]

# Melody motifs (Rhodes bell notes)
rhodes_notes = [
    587.33, 622.25, 466.16, 523.25, 392.00, 466.16, 587.33, 523.25,
    622.25, 587.33, 466.16, 392.00, 349.23, 392.00, 466.16, 523.25
]

# 1. Warm Rhodes chords
bars = int(np.ceil(duration / (4 * beat_dur)))
for bar in range(bars):
    chord = chords[bar % len(chords)]
    bar_start = bar * 4 * beat_dur
    for beat_off in [0, 2]:
        t_start = bar_start + beat_off * beat_dur
        samp_start = int(t_start * sample_rate)
        if samp_start >= total_samples:
            break
        note_dur = 2.0 * beat_dur
        nsamps = int(note_dur * sample_rate)
        end_samp = min(total_samples, samp_start + nsamps)
        actual_len = end_samp - samp_start
        t = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
        env = np.exp(-t * 1.8) * (1 - np.exp(-t * 80))
        for f in chord:
            sig = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t) + 0.1 * np.sin(2 * np.pi * f * 3 * t)
            audio[samp_start:end_samp] += 0.08 * sig * env

# 2. Gentle Rhodes chime melody (8th notes)
step_dur = beat_dur / 2.0
total_steps = int(duration / step_dur)
for s in range(total_steps):
    f = rhodes_notes[s % len(rhodes_notes)]
    start_t = s * step_dur
    samp_start = int(start_t * sample_rate)
    if samp_start >= total_samples:
        break
    nsamps = int(step_dur * 1.6 * sample_rate)
    end_samp = min(total_samples, samp_start + nsamps)
    actual_len = end_samp - samp_start
    t = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
    env = np.exp(-t * 4.2)
    sig = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.01 * t)
    audio[samp_start:end_samp] += 0.11 * sig * env

# 3. Soft Lo-fi Beat (Subtle warm thud + crisp shaker)
for beat in range(int(duration / beat_dur)):
    t_beat = beat * beat_dur
    samp = int(t_beat * sample_rate)
    if samp >= total_samples:
        break
    if beat % 2 == 0:
        klen = int(0.15 * sample_rate)
        end_k = min(total_samples, samp + klen)
        tk = np.linspace(0, (end_k - samp) / sample_rate, end_k - samp, endpoint=False)
        ksig = np.sin(2 * np.pi * (100 * np.exp(-tk * 25) + 40) * tk) * np.exp(-tk * 12)
        audio[samp:end_k] += 0.32 * ksig
    
    off_samp = int((t_beat + beat_dur / 2) * sample_rate)
    if off_samp < total_samples:
        hhlen = int(0.04 * sample_rate)
        end_hh = min(total_samples, off_samp + hhlen)
        thh = np.linspace(0, (end_hh - off_samp) / sample_rate, end_hh - off_samp, endpoint=False)
        audio[off_samp:end_hh] += 0.08 * (np.random.rand(len(thh)) * 2 - 1) * np.exp(-thh * 60)

max_val = np.max(np.abs(audio))
if max_val > 0:
    audio = audio / max_val * 0.85

fade_len = int(sample_rate * 2.2)
fade_env = np.linspace(1.0, 0.0, fade_len)
audio[-fade_len:] *= fade_env

audio_int16 = (audio * 32767).astype(np.int16)

with wave.open('/config/Desktop/BuildWithGemini/demo_recording/smooth_chill_bgm.wav', 'wb') as f:
    f.setnchannels(1)
    f.setsampwidth(2)
    f.setframerate(sample_rate)
    f.writeframes(audio_int16.tobytes())

print("Generated smooth lo-fi BGM: 30.5s")
