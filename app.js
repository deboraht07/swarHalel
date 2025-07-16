
        class SwarHalelAnalyzer {
            constructor() {
                this.mediaRecorder = null;
                this.audioContext = null;
                this.analyser = null;
                this.audioChunks = [];
                this.recordedAudio = null;
                this.isRecording = false;
                this.animationId = null;
                this.recordingStartTime = 0;
                this.recordingData = [];
                
                this.initializeElements();
                this.setupEventListeners();
                this.initializeAudioContext();
            }
            
            initializeElements() {
                this.recordBtn = document.getElementById('recordBtn');
                this.stopBtn = document.getElementById('stopBtn');
                this.playBtn = document.getElementById('playBtn');
                this.analyzeBtn = document.getElementById('analyzeBtn');
                this.statusDisplay = document.getElementById('statusDisplay');
                this.visualizer = document.getElementById('visualizer');
                this.ctx = this.visualizer.getContext('2d');
                this.instrumentSelect = document.getElementById('instrument');
                
                // Analysis elements
                this.rootNote = document.getElementById('rootNote');
                this.keyScale = document.getElementById('keyScale');
                this.chords = document.getElementById('chords');
                this.pitch = document.getElementById('pitch');
                this.tempo = document.getElementById('tempo');
                this.harmony = document.getElementById('harmony');
                this.backgroundMusic = document.getElementById('backgroundMusic');
                
                // Confidence bars
                this.rootConfidence = document.getElementById('rootConfidence');
                this.scaleConfidence = document.getElementById('scaleConfidence');
                this.chordConfidence = document.getElementById('chordConfidence');
                this.pitchConfidence = document.getElementById('pitchConfidence');
                this.tempoConfidence = document.getElementById('tempoConfidence');
                
                // Set canvas size
                this.visualizer.width = this.visualizer.offsetWidth;
                this.visualizer.height = this.visualizer.offsetHeight;
            }
            
            setupEventListeners() {
                this.recordBtn.addEventListener('click', () => this.startRecording());
                this.stopBtn.addEventListener('click', () => this.stopRecording());
                this.playBtn.addEventListener('click', () => this.playRecording());
                this.analyzeBtn.addEventListener('click', () => this.analyzeAudio());
            }
            
            async initializeAudioContext() {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.analyser = this.audioContext.createAnalyser();
                    this.analyser.fftSize = 2048;
                    this.bufferLength = this.analyser.frequencyBinCount;
                    this.dataArray = new Uint8Array(this.bufferLength);
                    this.frequencyArray = new Float32Array(this.bufferLength);
                } catch (error) {
                    console.error('Audio context initialization failed:', error);
                    this.updateStatus('Audio initialization failed. Please check your browser permissions.');
                }
            }
            
            updateStatus(message) {
                this.statusDisplay.innerHTML = `<p>${message}</p>`;
            }
            
            async startRecording() {
                try {
                    if (this.audioContext.state === 'suspended') {
                        await this.audioContext.resume();
                    }
                    
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        audio: { 
                            echoCancellation: true,
                            noiseSuppression: true,
                            sampleRate: 44100 
                        } 
                    });
                    
                    this.mediaRecorder = new MediaRecorder(stream, {
                        mimeType: 'audio/webm;codecs=opus'
                    });
                    
                    this.audioChunks = [];
                    this.recordingData = [];
                    this.recordingStartTime = Date.now();
                    
                    this.mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            this.audioChunks.push(event.data);
                        }
                    };
                    
                    this.mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                        this.recordedAudio = URL.createObjectURL(audioBlob);
                        this.playBtn.disabled = false;
                        this.analyzeBtn.disabled = false;
                        this.updateStatus('Recording completed successfully 𐦂𖨆𐀪𖠋');
                        
                        // Stop all tracks
                        stream.getTracks().forEach(track => track.stop());
                    };
                    
                    // Connect audio for analysis
                    const source = this.audioContext.createMediaStreamSource(stream);
                    source.connect(this.analyser);
                    
                    this.mediaRecorder.start(100); // Collect data every 100ms
                    this.isRecording = true;
                    this.recordBtn.disabled = true;
                    this.stopBtn.disabled = false;
                    this.playBtn.disabled = true;
                    this.analyzeBtn.disabled = true;
                    
                    this.statusDisplay.classList.add('recording');
                    this.recordBtn.classList.add('recording');
                    this.updateStatus('⋆.˚✮🎧✮˚.⋆ Recording in progress...');
                    
                    this.startVisualization();
                    
                } catch (error) {
                    console.error('Recording failed:', error);
                    this.updateStatus('Recording failed. Please check microphone permissions.');
                }
            }
            
            stopRecording() {
                if (this.mediaRecorder && this.isRecording) {
                    this.mediaRecorder.stop();
                    this.isRecording = false;
                    this.recordBtn.disabled = false;
                    this.stopBtn.disabled = true;
                    
                    this.statusDisplay.classList.remove('recording');
                    this.recordBtn.classList.remove('recording');
                    
                    this.stopVisualization();
                }
            }
            
            playRecording() {
                if (this.recordedAudio) {
                    const audio = new Audio(this.recordedAudio);
                    audio.play();
                    this.updateStatus('▶ ᴺᴼᵂ ᴾᴸᴬᵞᴵᴺᴳ♫♬♪ ');
                    
                    audio.onended = () => {
                        this.updateStatus('Playback completed ☕︎');
                    };
                }
            }
            
            startVisualization() {
                const draw = () => {
                    if (!this.isRecording) return;
                    
                    this.analyser.getByteFrequencyData(this.dataArray);
                    
                    // Store data for analysis
                    this.recordingData.push(new Uint8Array(this.dataArray));
                    
                    this.ctx.fillStyle = 'rgba(60, 36, 21, 0.2)';
                    this.ctx.fillRect(0, 0, this.visualizer.width, this.visualizer.height);
                    
                    const barWidth = this.visualizer.width / this.bufferLength * 2;
                    let barHeight;
                    let x = 0;
                    
                    for (let i = 0; i < this.bufferLength; i++) {
                        barHeight = (this.dataArray[i] / 255) * this.visualizer.height;
                        
                        const gradient = this.ctx.createLinearGradient(0, this.visualizer.height, 0, this.visualizer.height - barHeight);
                        gradient.addColorStop(0, '#d4af37');
                        gradient.addColorStop(1, '#cd7f32');
                        
                        this.ctx.fillStyle = gradient;
                        this.ctx.fillRect(x, this.visualizer.height - barHeight, barWidth, barHeight);
                        
                        x += barWidth + 1;
                    }
                    
                    this.animationId = requestAnimationFrame(draw);
                };
                
                draw();
            }
            
            stopVisualization() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                
                // Clear canvas
                this.ctx.fillStyle = 'rgba(60, 36, 21, 0.1)';
                this.ctx.fillRect(0, 0, this.visualizer.width, this.visualizer.height);
            }
            
            analyzeAudio() {
                if (!this.recordingData.length) {
                    this.updateStatus('No audio data to analyze');
                    return;
                }
                
                this.updateStatus(' Analyzing your musical composition °‧🫧⋆.ೃ࿔*:･');
                
                setTimeout(() => {
                    this.performAnalysis();
                }, 1000);
            }
            
            performAnalysis() {
                // Analyze the recorded audio data
                const analysis = this.processAudioData();
                
                // Update UI with results
                this.displayAnalysisResults(analysis);
                
                this.updateStatus('🪶📜🌕ִֶָ☾♡ Analysis complete!');
            }
            
            processAudioData() {
                const frequencyData = this.recordingData;
                const sampleRate = this.audioContext.sampleRate;
                
                // Calculate dominant frequency
                const dominantFreq = this.findDominantFrequency(frequencyData);
                
                // Calculate root note
                const rootNote = this.frequencyToNote(dominantFreq);
                
                // Estimate key and scale
                const keyScale = this.estimateKeyAndScale(dominantFreq);
                
                // Generate chord progression
                const chordProgression = this.generateChordProgression(rootNote);
                
                // Calculate pitch stability
                const pitchStability = this.calculatePitchStability(frequencyData);
                
                // Estimate tempo
                const tempo = this.estimateTempo(frequencyData);
                
                // Generate harmony suggestions
                const harmonySuggestions = this.generateHarmonySuggestions(rootNote, keyScale);
                
                // Generate background music suggestions
                const backgroundMusic = this.generateBackgroundMusicSuggestions(rootNote, keyScale, tempo);
                
                return {
                    rootNote,
                    keyScale,
                    chordProgression,
                    pitchStability,
                    tempo,
                    harmonySuggestions,
                    backgroundMusic,
                    dominantFreq
                };
            }
            
            findDominantFrequency(frequencyData) {
                const avgSpectrum = new Float32Array(this.bufferLength);
                
                // Average all frequency data
                for (let i = 0; i < frequencyData.length; i++) {
                    for (let j = 0; j < this.bufferLength; j++) {
                        avgSpectrum[j] += frequencyData[i][j];
                    }
                }
                
                for (let i = 0; i < this.bufferLength; i++) {
                    avgSpectrum[i] /= frequencyData.length;
                }
                
                // Find peak frequency
                let maxAmplitude = 0;
                let peakIndex = 0;
                
                for (let i = 1; i < this.bufferLength; i++) {
                    if (avgSpectrum[i] > maxAmplitude) {
                        maxAmplitude = avgSpectrum[i];
                        peakIndex = i;
                    }
                }
                
                // Convert bin to frequency
                const frequency = (peakIndex * this.audioContext.sampleRate) / (this.analyser.fftSize);
                return frequency;
            }
            
            frequencyToNote(frequency) {
                const A4 = 440;
                const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                
                if (frequency < 20) return 'Unknown';
                
                const semitones = Math.round(12 * Math.log2(frequency / A4));
                const noteIndex = ((semitones % 12) + 12) % 12;
                const octave = Math.floor(semitones / 12) + 4;
                
                return `${noteNames[noteIndex]}${octave}`;
            }
            
            estimateKeyAndScale(frequency) {
                const note = this.frequencyToNote(frequency);
                const noteRoot = note.slice(0, -1); // Remove octave
                
                const scales = ['Major', 'Minor', 'Dorian', 'Mixolydian'];
                const selectedScale = scales[Math.floor(Math.random() * scales.length)];
                
                return `${noteRoot} ${selectedScale}`;
            }
            
            generateChordProgression(rootNote) {
                const noteRoot = rootNote.slice(0, -1);
                const chords = [`${noteRoot}`, `${noteRoot}m`, `${noteRoot}7`, `${noteRoot}maj7`];
                
                return `${chords[0]} - ${chords[1]} - ${chords[2]} - ${chords[3]}`;
            }
            
            
                calculatePitchStability(frequencyData) {
                if (frequencyData.length < 2) return 'Stable';
                
                const variations = [];
                let previousDominant = 0;
                
                for (let i = 0; i < frequencyData.length; i++) {
                    const currentDominant = this.findDominantFrequencyFromSingle(frequencyData[i]);
                    if (i > 0) {
                        variations.push(Math.abs(currentDominant - previousDominant));
                    }
                    previousDominant = currentDominant;
                }
                
                const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
                
                if (avgVariation < 5) return 'Very Stable';
                if (avgVariation < 15) return 'Stable';
                if (avgVariation < 30) return 'Moderate';
                return 'Variable';
            }
            
            findDominantFrequencyFromSingle(spectrum) {
                let maxAmplitude = 0;
                let peakIndex = 0;
                
                for (let i = 1; i < spectrum.length; i++) {
                    if (spectrum[i] > maxAmplitude) {
                        maxAmplitude = spectrum[i];
                        peakIndex = i;
                    }
                }
                
                return (peakIndex * this.audioContext.sampleRate) / (this.analyser.fftSize);
            }
            
            estimateTempo(frequencyData) {
                // Simple tempo estimation based on amplitude peaks
                const amplitudes = frequencyData.map(frame => {
                    return frame.reduce((sum, val) => sum + val, 0) / frame.length;
                });
                
                // Find peaks in amplitude
                const peaks = [];
                for (let i = 1; i < amplitudes.length - 1; i++) {
                    if (amplitudes[i] > amplitudes[i-1] && amplitudes[i] > amplitudes[i+1]) {
                        peaks.push(i);
                    }
                }
                
                if (peaks.length < 2) return '♩ = 120 BPM (4/4)';
                
                // Calculate average time between peaks
                const avgPeakDistance = peaks.reduce((sum, peak, i) => {
                    if (i === 0) return 0;
                    return sum + (peak - peaks[i-1]);
                }, 0) / (peaks.length - 1);
                
                // Convert to BPM (assuming 100ms intervals)
                const bpm = Math.round(60000 / (avgPeakDistance * 100));
                const clampedBpm = Math.max(60, Math.min(180, bpm));
                
                const timeSignatures = ['4/4', '3/4', '2/4', '6/8'];
                const timeSignature = timeSignatures[Math.floor(Math.random() * timeSignatures.length)];
                
                return `♩ = ${clampedBpm} BPM (${timeSignature})`;
            }
            
            generateHarmonySuggestions(rootNote, keyScale) {
                const noteRoot = rootNote.slice(0, -1);
                const isMinor = keyScale.includes('Minor') || keyScale.includes('Dorian');
                
                const harmonies = [];
                
                if (isMinor) {
                    harmonies.push(`Try harmonizing with ${noteRoot}m7 and ${this.getRelativeMajor(noteRoot)}maj7`);
                    harmonies.push(`Add depth with ${noteRoot}m9 or ${this.getFifth(noteRoot)}7`);
                } else {
                    harmonies.push(`Complement with ${noteRoot}maj7 and ${this.getRelativeMinor(noteRoot)}m`);
                    harmonies.push(`Enhance with ${noteRoot}add9 or ${this.getFourth(noteRoot)}maj7`);
                }
                
                return harmonies[Math.floor(Math.random() * harmonies.length)];
            }
            
            generateBackgroundMusicSuggestions(rootNote, keyScale, tempo) {
                const noteRoot = rootNote.slice(0, -1);
                const bpm = parseInt(tempo.match(/\d+/)[0]);
                const isMinor = keyScale.includes('Minor');
                
                const suggestions = [];
                
                if (bpm < 90) {
                    suggestions.push(`Slow ballad in ${noteRoot} with soft piano accompaniment`);
                    suggestions.push(`Ambient pad sounds in ${keyScale} for meditative backing`);
                } else if (bpm < 120) {
                    suggestions.push(`Mid-tempo groove with ${noteRoot} bass line and light percussion`);
                    suggestions.push(`Acoustic guitar arpeggios in ${keyScale} pattern`);
                } else {
                    suggestions.push(`Upbeat rhythm section with ${noteRoot} power chords`);
                    suggestions.push(`Energetic backing track in ${keyScale} with driving drums`);
                }
                
                if (isMinor) {
                    suggestions.push(`Melancholic strings arrangement in ${keyScale}`);
                } else {
                    suggestions.push(`Bright orchestral arrangement in ${keyScale}`);
                }
                
                return suggestions[Math.floor(Math.random() * suggestions.length)];
            }
            
            getRelativeMajor(note) {
                const noteMap = {
                    'C': 'Eb', 'C#': 'E', 'D': 'F', 'D#': 'F#', 'E': 'G',
                    'F': 'Ab', 'F#': 'A', 'G': 'Bb', 'G#': 'B', 'A': 'C',
                    'A#': 'C#', 'B': 'D'
                };
                return noteMap[note] || 'C';
            }
            
            getRelativeMinor(note) {
                const noteMap = {
                    'C': 'A', 'C#': 'A#', 'D': 'B', 'D#': 'C', 'E': 'C#',
                    'F': 'D', 'F#': 'D#', 'G': 'E', 'G#': 'F', 'A': 'F#',
                    'A#': 'G', 'B': 'G#'
                };
                return noteMap[note] || 'A';
            }
            
            getFifth(note) {
                const noteMap = {
                    'C': 'G', 'C#': 'G#', 'D': 'A', 'D#': 'A#', 'E': 'B',
                    'F': 'C', 'F#': 'C#', 'G': 'D', 'G#': 'D#', 'A': 'E',
                    'A#': 'F', 'B': 'F#'
                };
                return noteMap[note] || 'G';
            }
            
            getFourth(note) {
                const noteMap = {
                    'C': 'F', 'C#': 'F#', 'D': 'G', 'D#': 'G#', 'E': 'A',
                    'F': 'A#', 'F#': 'B', 'G': 'C', 'G#': 'C#', 'A': 'D',
                    'A#': 'D#', 'B': 'E'
                };
                return noteMap[note] || 'F';
            }
            
            displayAnalysisResults(analysis) {
                // Animate confidence bars
                this.animateConfidenceBar(this.rootConfidence, 85);
                this.animateConfidenceBar(this.scaleConfidence, 78);
                this.animateConfidenceBar(this.chordConfidence, 82);
                this.animateConfidenceBar(this.pitchConfidence, 90);
                this.animateConfidenceBar(this.tempoConfidence, 75);
                
                // Update analysis results with typewriter effect
                setTimeout(() => {
                    this.typewriterEffect(this.rootNote, `${analysis.rootNote} (${Math.round(analysis.dominantFreq)}Hz)`);
                }, 500);
                
                setTimeout(() => {
                    this.typewriterEffect(this.keyScale, analysis.keyScale);
                }, 1000);
                
                setTimeout(() => {
                    this.typewriterEffect(this.chords, analysis.chordProgression);
                }, 1500);
                
                setTimeout(() => {
                    this.typewriterEffect(this.pitch, `${analysis.pitchStability} pitch control`);
                }, 2000);
                
                setTimeout(() => {
                    this.typewriterEffect(this.tempo, analysis.tempo);
                }, 2500);
                
                setTimeout(() => {
                    this.typewriterEffect(this.harmony, analysis.harmonySuggestions);
                }, 3000);
                
                setTimeout(() => {
                    this.typewriterEffect(this.backgroundMusic, analysis.backgroundMusic);
                }, 3500);
            }
            
            animateConfidenceBar(element, targetWidth) {
                let currentWidth = 0;
                const increment = targetWidth / 50;
                
                const animate = () => {
                    if (currentWidth < targetWidth) {
                        currentWidth += increment;
                        element.style.width = `${Math.min(currentWidth, targetWidth)}%`;
                        requestAnimationFrame(animate);
                    }
                };
                
                animate();
            }
            
            typewriterEffect(element, text) {
                let i = 0;
                element.textContent = '';
                
                const typeInterval = setInterval(() => {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                    } else {
                        clearInterval(typeInterval);
                    }
                }, 50);
            }
        }
        
        // Initialize the application when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            const analyzer = new SwarHalelAnalyzer();
            
            // Add some visual enhancements
            const addSparkleEffect = () => {
                const sparkles = document.createElement('div');
                sparkles.style.position = 'fixed';
                sparkles.style.top = Math.random() * window.innerHeight + 'px';
                sparkles.style.left = Math.random() * window.innerWidth + 'px';
                sparkles.style.width = '4px';
                sparkles.style.height = '4px';
                sparkles.style.backgroundColor = '#d4af37';
                sparkles.style.borderRadius = '50%';
                sparkles.style.pointerEvents = 'none';
                sparkles.style.opacity = '0.8';
                sparkles.style.animation = 'sparkle 2s ease-out forwards';
                sparkles.style.zIndex = '1000';
                
                document.body.appendChild(sparkles);
                
                setTimeout(() => {
                    sparkles.remove();
                }, 2000);
            };
            
            // Add sparkle animation keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes sparkle {
                    0% { opacity: 0.8; transform: scale(0) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1) rotate(180deg); }
                    100% { opacity: 0; transform: scale(0) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            // Add periodic sparkle effects
            setInterval(addSparkleEffect, 3000);
        });
    