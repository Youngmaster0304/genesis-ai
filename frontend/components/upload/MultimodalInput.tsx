"use client";

import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface MultimodalInputProps {
  onIdeaChange: (text: string) => void;
  onFilesChange: (files: File[]) => void;
  ideaText: string;
  files: File[];
}

export default function MultimodalInput({
  onIdeaChange,
  onFilesChange,
  ideaText,
  files
}: MultimodalInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Drag and drop handler
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onFilesChange([...files, ...acceptedFiles]);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    }
  });

  // Audio Recorder functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `voice-pitch-${Date.now()}.wav`, {
          type: 'audio/wav',
        });
        onFilesChange([...files, audioFile]);
        setIsRecording(false);
        setRecordingDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
        // Stop all tracks to release device
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Update duration counter
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      alert("Microphone access denied or not available. Please allow mic access to record a voice pitch.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const removeFile = (index: number) => {
    const nextFiles = [...files];
    nextFiles.splice(index, 1);
    onFilesChange(nextFiles);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
            : 'border-indigo-950/60 hover:border-indigo-500/50 bg-[#0F1421]'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-3xl mb-3">📁</div>
        <p className="text-sm font-semibold text-white">Drag & drop files here, or click to upload</p>
        <p className="text-xs text-slate-500 mt-2">
          Supports: Images (Sketches, whiteboards) · PDFs (Technical descriptions) · Videos · Audio · Text
        </p>
      </div>

      {/* Idea Textarea */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-300 font-display">Innovation Concept description</label>
        <textarea
          value={ideaText}
          onChange={(e) => onIdeaChange(e.target.value)}
          placeholder="Describe your innovation concept here in detail (e.g., 'AI-powered logistics startup that predicts disruptions 72 hours in advance using spatial imagery and news signal vectors...')"
          rows={6}
          className="w-full rounded-xl bg-[#0F1421] border border-indigo-950/60 p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
        />
      </div>

      {/* Voice Recorder CTA */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0F1421]/60 border border-indigo-950/40">
        <div className="flex-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Voice pitch recorder</h4>
          <p className="text-xs text-slate-500 mt-0.5">Record a 30-second audio summary of your idea directly from your mic.</p>
        </div>
        <div>
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white animate-pulse"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white block"></span>
              Stop ({formatDuration(recordingDuration)})
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 rounded-lg bg-indigo-950 border border-indigo-500/20 px-4 py-2.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-900/60 transition"
            >
              <span>🎤</span> Record Pitch
            </button>
          )}
        </div>
      </div>

      {/* File List / Preview */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Staged files ({files.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file, idx) => (
              <div 
                key={file.name + idx}
                className="flex items-center justify-between p-3 rounded-lg bg-[#161D2F] border border-indigo-950/30 text-xs text-white"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">
                    {file.type.startsWith('image/') ? '🖼️' : file.type.includes('pdf') ? '📄' : file.type.startsWith('video/') ? '🎥' : file.type.startsWith('audio/') ? '🎵' : '📁'}
                  </span>
                  <div className="truncate">
                    <p className="font-semibold truncate max-w-[150px]">{file.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-slate-500 hover:text-red-400 font-bold px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
