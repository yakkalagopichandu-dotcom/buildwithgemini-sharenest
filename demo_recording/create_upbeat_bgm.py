import numpy as np
import wave

sample_rate = 44100
bpm = 112
beat_dur = 60.0 / bpm
duration = 32.0  # Exactly 32 seconds for a 30s video
total_samples = int(sample_rate * duration)
audio = np.zeros(total_samples, dtype=np.float32)

# Uplifting, warm chord progression: D - G - Bm - A
# Dmaj: D4 (293.66), F#4 (369.99), A4 (440.00), D5 (587.33)
# Gmaj: G3 (196.00), B3 (246.94), D4 (293.66), G4 (392.00)
# Bm:   B3 (246.94), D4 (293.66), F#4 (369.99), B4 (493.88)
# Amaj: A3 (220.00), C#4 (277.18), E4 (329.63), A4 (440.00)
chords = [
    [293.66, 369.99, 440.00, 587.33],
    [196.00, 246.94, 293.66, 392.00],
    [246.94, 293.66, 369.99, 493.88],
    [220.00, 277.18, 329.63, 440.00],
]

# 1. Warm Acoustic Pluck / Electric Piano chords (plucked on beat 1 & 3, sustained)
bars = int(np.ceil(duration / (4 * beat_dur)))
for bar in range(bars):
    chord = chords[bar % len(chords)]
    bar_start = bar * 4 * beat_dur
    for beat_offset in [0, 2]:
        t_start = bar_start + beat_offset * beat_dur
        start_samp = int(t_start * sample_rate)
        if start_samp >= total_samples:
            break
        note_dur = 2.0 * beat_dur
        nsamps = int(note_dur * sample_rate)
        end_samp = min(total_samples, start_samp + nsamps)
        actual_len = end_samp - start_samp
        t = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
        # Pluck decay envelope
        env = np.exp(-t * 2.5) * (1 - np.exp(-t * 50))
        for f in chord:
            sig = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2 * t) + 0.1 * np.sin(2 * np.pi * f * 3 * t)
            audio[start_samp:end_samp] += 0.08 * sig * env

# 2. Modern Upbeat Kalimba / Synth Pluck Arpeggio (8th notes)
arp_freqs = [
    587.33, 739.99, 880.00, 739.99,  # D, F#, A, F#
    392.00, 493.88, 587.33, 493.88,  # G, B, D, B
    493.88, 587.33, 739.99, 587.33,  # B, D, F#, D
    440.00, 554.37, 659.25, 554.37,  # A, C#, E, C#
]
step_dur = beat_dur / 2.0
total_steps = int(duration / step_dur)
for s in range(total_steps):
    f = arp_freqs[s % len(arp_freqs)]
    start_t = s * step_dur
    start_samp = int(start_t * sample_rate)
    if start_samp >= total_samples:
        break
    nsamps = int(step_dur * 1.8 * sample_rate)
    end_samp = min(total_samples, start_samp + nsamps)
    actual_len = end_samp - start_samp
    t = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
    env = np.exp(-t * 5.0)
    sig = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)
    audio[start_samp:end_samp] += 0.12 * sig * env

# 3. Punchy Soft Kick & Hi-hat (Gentle Lo-Fi Tech Beat)
for beat in range(int(duration / beat_dur)):
    t_beat = beat * beat_dur
    samp = int(t_beat * sample_rate)
    if samp >= total_samples:
        break
    
    # Soft Kick on beat 1 & 3 of every 4-beat bar
    if beat % 2 == 0:
        kick_len = int(0.18 * sample_rate)
        end_k = min(total_samples, samp + kick_len)
        tk = np.linspace(0, (end_k - samp) / sample_rate, end_k - samp, endpoint=False)
        kick_freq = 110 * np.exp(-tk * 30) + 45
        kick_sig = np.sin(2 * np.pi * kick_freq * tk) * np.exp(-tk * 15)
        audio[samp:end_k] += 0.35 * kick_sig
    
    # Subtle crisp shaker / hi-hat on every off-beat (8th note)
    off_samp = int((t_beat + beat_dur / 2) * sample_rate)
    if off_samp < total_samples:
        hh_len = int(0.04 * sample_rate)
        end_hh = min(total_samples, off_samp + hh_len)
        thh = np.linspace(0, (end_hh - off_samp) / sample_rate, end_hh - off_samp, endpoint=False)
        noise = (np.random.rand(len(thh)) * 2 - 1) * np.exp(-thh * 70)
        audio[off_samp:end_hh] += 0.09 * noise

# Normalize and fade out over last 2 seconds
max_val = np.max(np.abs(audio))
if max_val > 0:
    audio = audio / max_val * 0.82

fade_len = int(sample_rate * 2.0)
fade_env = np.linspace(1.0, 0.0, fade_len)
audio[-fade_len:] *= fade_env

audio_int16 = (audio * 32767).astype(np.int16)

with wave.open('/config/Desktop/BuildWithGemini/demo_recording/upbeat_tech_bgm.wav', 'wb') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    wav_file.writeframes(audio_int16.tobytes())

print("Generated vibrant modern tech background music: 32s")
