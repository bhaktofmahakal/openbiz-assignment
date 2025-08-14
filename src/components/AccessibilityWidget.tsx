import React, { useState } from 'react';
import { Settings, Volume2, Type, AlignLeft, Link, Eye, EyeOff, MousePointer, Sun, Moon, Palette, RotateCcw, Minus } from 'lucide-react';

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    textToSpeech: false,
    biggerText: false,
    textSpacing: false,
    lineHeight: false,
    highlightLinks: false,
    dyslexiaFriendly: false,
    hideImages: false,
    cursor: false,
    darkMode: false,
    invertColors: false,
  });

  const toggleSetting = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const resetAllSettings = () => {
    setSettings({
      textToSpeech: false,
      biggerText: false,
      textSpacing: false,
      lineHeight: false,
      highlightLinks: false,
      dyslexiaFriendly: false,
      hideImages: false,
      cursor: false,
      darkMode: false,
      invertColors: false,
    });
  };

  const accessibilityFeatures = [
    { key: 'textToSpeech', label: 'Text To Speech', icon: Volume2 },
    { key: 'biggerText', label: 'Bigger Text', icon: Type },
    { key: 'textSpacing', label: 'Text Spacing', icon: Minus },
    { key: 'lineHeight', label: 'Line Height', icon: AlignLeft },
    { key: 'highlightLinks', label: 'Highlight Links', icon: Link },
    { key: 'dyslexiaFriendly', label: 'Dyslexia Friendly', icon: Eye },
    { key: 'hideImages', label: 'Hide Images', icon: EyeOff },
    { key: 'cursor', label: 'Cursor', icon: MousePointer },
    { key: 'darkMode', label: 'Light-Dark', icon: settings.darkMode ? Moon : Sun },
    { key: 'invertColors', label: 'Invert Colors', icon: Palette },
  ];

  return (
    <>
      {/* Accessibility Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-blue-600 text-white p-3 rounded-l-lg shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Accessibility Options"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-40 overflow-y-auto border-l">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Accessibility Options</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close accessibility panel"
              >
                ✕
              </button>
            </div>

            {/* Accessibility Features */}
            <div className="space-y-3">
              {accessibilityFeatures.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => toggleSetting(key as keyof typeof settings)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    settings[key as keyof typeof settings]
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                  <div className="ml-auto">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      settings[key as keyof typeof settings]
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {settings[key as keyof typeof settings] && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Reset Button */}
            <button
              onClick={resetAllSettings}
              className="w-full mt-6 flex items-center justify-center space-x-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">Reset All Settings</span>
            </button>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Created by National Informatics Centre
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};