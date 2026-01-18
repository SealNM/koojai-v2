'use client';

import { useState } from 'react';
import { Character } from '@/types';
import { saveCharacter } from '@/utils/indexedDb';

interface Props {
  studentId: string;
  onCreated: (character: Character) => void;
  onClose: () => void;
}

export default function CharacterCreator({ studentId, onCreated, onClose }: Props) {
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('ร่าเริงและใจดี');
  const [description, setDescription] = useState('เพื่อนที่พร้อมรับฟังและให้กำลังใจเสมอ');
  const [avatar, setAvatar] = useState('🐰');
  const [voiceName, setVoiceName] = useState('Aoede');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');

  const avatars = ['🐰', '🐻', '🐱', '🐶', '🦊', '🦁', '🐼', '🐨', '🤖', '👽'];
  const voices = [
    { name: 'Aoede', gender: 'female', label: 'สดใส (หญิง)' },
    { name: 'Charon', gender: 'male', label: 'นิ่งขรึม (ชาย)' },
    { name: 'Kore', gender: 'female', label: 'อ่อนโยน (หญิง)' },
    { name: 'Puck', gender: 'male', label: 'ขี้เล่น (ชาย)' },
  ];

  const handleCreate = async () => {
    if (!name) return alert('กรุณาตั้งชื่อให้เพื่อนใหม่ด้วยนะ');

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      studentId,
      name,
      avatar,
      personality,
      description,
      voiceGender,
      voiceName,
      systemPrompt: '', // จะถูกสร้างใน GeminiService
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveCharacter(newCharacter);
    onCreated(newCharacter);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="text-6xl mb-2">{avatar}</div>
          <h2 className="text-2xl font-bold">สร้างเพื่อนคนใหม่</h2>
          <p className="text-indigo-100 opacity-80 text-sm">ออกแบบ AI ในแบบที่เธออยากคุยด้วย</p>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Avatar Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เลือกสัญลักษณ์</label>
            <div className="flex flex-wrap gap-2 justify-center">
              {avatars.map(a => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`text-2xl p-2 rounded-xl transition-all ${avatar === a ? 'bg-indigo-100 scale-125 border-2 border-indigo-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเพื่อน</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น พี่กระต่าย, น้องหมีใจดี"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Personality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">บุคลิก</label>
            <input
              type="text"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="เช่น ร่าเริง, ขี้อาย, ตรงไปตรงมา"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายเพิ่มเติม</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เขาเป็นใคร และคุยเรื่องอะไรเก่งบ้าง?"
              rows={2}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Voice selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เลือกน้ำเสียง</label>
            <div className="grid grid-cols-2 gap-2">
              {voices.map(v => (
                <button
                  key={v.name}
                  onClick={() => {
                    setVoiceName(v.name);
                    setVoiceGender(v.gender as 'male' | 'female');
                  }}
                  className={`px-3 py-2 rounded-xl border text-sm transition-all ${voiceName === v.name ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            สร้างเลย!
          </button>
        </div>
      </div>
    </div>
  );
}
