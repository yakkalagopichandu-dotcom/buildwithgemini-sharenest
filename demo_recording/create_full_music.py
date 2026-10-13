import numpy as np
import wave

sample_rate = 44100
bpm = 100
beat_dur = 60.0 / bpm
duration = 50.0  # slightly longer than 48s video
total_samples = int(sample_rate * duration)
audio = np.zeros(total_samples, dtype=np.float32)

chord_progressions = [
    [261.63, 329.63, 392.00, 493.88, 587.33],  # Cmaj9
    [220.00, 261.63, 329.63, 392.00, 493.88],  # Am9
    [174.61, 220.00, 261.63, 329.63, 392.00],  # Fmaj7
    [196.00, 261.63, 293.66, 392.00, 493.88],  # Gsus4 -> G
]

melody_notes = [
    523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88,
    440.00, 523.25, 659.25, 587.33, 523.25, 440.00, 392.00, 440.00,
    349.23, 440.00, 523.25, 659.25, 587.33, 523.25, 440.00, 392.00,
    392.00, 493.88, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25,
]

bars = int(np.ceil(duration / (4 * beat_dur)))
total_beats = bars * 4

# 1. Warm Ambient Pad chords
for bar_idx in range(bars):
    chord = chord_progressions[bar_idx % len(chord_progressions)]
    start_time = bar_idx * 4 * beat_dur
    end_time = (bar_idx + 1) * 4 * beat_dur
    start_sample = int(start_time * sample_rate)
    end_sample = min(total_samples, int(end_time * sample_rate))
    chord_len = end_sample - start_sample
    if chord_len <= 0:
        break
    
    t_chord = np.linspace(0, (end_sample - start_sample) / sample_rate, chord_len, endpoint=False)
    env = np.sin(np.pi * (t_chord / (4 * beat_dur))) ** 0.5
    
    chord_signal = np.zeros(chord_len, dtype=np.float32)
    for freq in chord:
        s = np.sin(2 * np.pi * freq * t_chord) + 0.3 * np.sin(2 * np.pi * freq * 2 * t_chord)
        chord_signal += s
    
    audio[start_sample:end_sample] += 0.12 * chord_signal * env

# 2. Gentle Marimba Melody
melody_step_dur = beat_dur / 2.0
total_steps = int(duration / melody_step_dur)
for step_idx in range(total_steps):
    note_freq = melody_notes[step_idx % len(melody_notes)]
    start_time = step_idx * melody_step_dur
    start_sample = int(start_time * sample_rate)
    note_dur = melody_step_dur * 1.5
    note_samples = int(note_dur * sample_rate)
    end_sample = min(total_samples, start_sample + note_samples)
    actual_len = end_sample - start_sample
    if actual_len <= 0:
        break
    
    t_note = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
    note_env = np.exp(-t_note * 4.5)
    bell_wave = (
        np.sin(2 * np.pi * note_freq * t_note) +
        0.4 * np.sin(2 * np.pi * note_freq * 2.01 * t_note) +
        0.15 * np.sin(2 * np.pi * note_freq * 3.02 * t_note)
    )
    audio[start_sample:end_sample] += 0.18 * bell_wave * note_env

# 3. Soft Bassline
for beat_idx in range(total_beats):
    bar_idx = beat_idx // 4
    chord = chord_progressions[bar_idx % len(chord_progressions)]
    root_freq = chord[0] / 2.0
    if beat_idx % 2 == 0:
        start_time = beat_idx * beat_dur
        start_sample = int(start_time * sample_rate)
        bass_samples = int(beat_dur * 1.8 * sample_rate)
        end_sample = min(total_samples, start_sample + bass_samples)
        actual_len = end_sample - start_sample
        if actual_len <= 0:
            break
        t_bass = np.linspace(0, actual_len / sample_rate, actual_len, endpoint=False)
        bass_env = np.exp(-t_bass * 2.2)
        bass_wave = np.sin(2 * np.pi * root_freq * t_bass) + 0.25 * np.sin(2 * np.pi * root_freq * 2 * t_bass)
        audio[start_sample:end_sample] += 0.22 * bass_wave * bass_env

max_val = np.max(np.abs(audio))
if max_val > 0:
    audio = audio / max_val * 0.85

fade_len = int(sample_rate * 3.0)
fade_env = np.linspace(1.0, 0.0, fade_len)
audio[-fade_len:] *= fade_env

audio_int16 = (audio * 32767).astype(np.int16)

with wave.open('/config/Desktop/BuildWithGemini/demo_recording/background_music_full.wav', 'wb') as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    wav_file.writeframes(audio_int16.tobytes())

print(f"Generated 50s soothing background music")
