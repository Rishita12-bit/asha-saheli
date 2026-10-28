import React from 'react';
import {
  HeartHandshake,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Languages,
  CheckCircle2,
  Info,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { ASHAProfile } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  profile: ASHAProfile;
  lang: 'hi' | 'en';
  onToggleLang: () => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulateOffline: () => void;
  pendingSyncCount: number;
  isSyncing: boolean;
  onSyncNow: () => void;
  onOpenPersona: () => void;
  onOpenDemoVideo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  lang,
  onToggleLang,
  isOnline,
  isSimulatedOffline,
  onToggleSimulateOffline,
  pendingSyncCount,
  isSyncing,
  onSyncNow,
  onOpenPersona,
  onOpenDemoVideo,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md border-b border-stone-800">
      {/* Top Banner with Field Persona Info */}
      <div className="bg-rose-950/70 border-b border-rose-900/50 px-3 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-rose-700 text-white text-[11px]">
              {profile.idNumber}
            </span>
            <span className="font-semibold text-rose-200">
              {lang === 'hi' ? 'कार्यकत्री: ' : 'ASHA: '}
              <button
                onClick={onOpenPersona}
                className="underline hover:text-white transition font-medium"
                title="View persona pitch and village profile"
              >
                {profile.name}
              </button>
            </span>
            <span className="hidden sm:inline text-rose-300/80">•</span>
            <span className="hidden sm:inline text-rose-200/90">
              {profile.village} ({profile.subCentre})
            </span>
            <span className="hidden md:inline text-rose-300/80">•</span>
            <span className="hidden md:inline text-rose-200/80">
              {lang === 'hi'
                ? `जनसंख्या: ${profile.populationCovered} (182 परिवार)`
                : `Pop: ${profile.populationCovered} (182 HH)`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo Video Button */}
            <button
              onClick={onOpenDemoVideo}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-[11px] font-black shadow-xs transition animate-pulse"
              title="Watch full 3-minute judge demo video and presentation walkthrough"
            >
              <span>🎬</span>
              <span>{lang === 'hi' ? 'डेमो वीडियो (3-Min Pitch)' : 'Watch Demo Video'}</span>
            </button>

            {/* Persona Quick Pitch Button */}
            <button
              onClick={onOpenPersona}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-900/90 hover:bg-rose-800 text-rose-100 text-[11px] font-medium border border-rose-700/60 transition"
            >
              <Info className="w-3 h-3 text-rose-300" />
              <span>{lang === 'hi' ? 'सुनीता दीदी का परिचय' : 'About Sunita & Case'}</span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={onToggleSimulateOffline}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition ${
                isSimulatedOffline
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:text-white'
              }`}
              title="Test offline behavior: saves records locally in IndexedDB/Storage and queues for sync"
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span>{lang === 'hi' ? 'ऑफ़लाइन सिमुलेशन चालू' : 'Simulating Offline'}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>{lang === 'hi' ? 'नेटवर्क: ऑनलाइन' : 'Network: Online'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* App Title & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center shadow-lg shadow-rose-950/50 border border-rose-500/40 text-white shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{lang === 'hi' ? 'आशा सहेली' : 'ASHA Saheli'}</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-600/30 text-rose-300 border border-rose-500/30">
                  {lang === 'hi' ? 'ग्रामीण स्वास्थ्य साथी' : 'Rural Health Companion'}
                </span>
              </h1>
            </div>
            <p className="text-xs text-stone-400 leading-tight">
              {lang === 'hi'
                ? 'आवाज से विजिट रिकॉर्डिंग • नैदानिक जोखिम चेतावनी • देय सूची व फॉर्म 6'
                : 'Hindi Voice Logging • Clinical Risk Flagging • Due Lists & Paperwork'}
            </p>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold shadow transition"
              title="Install ASHA Saheli as an offline-first app on device"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install PWA'}</span>
            </button>
          )}

          {/* Sync Status Button */}
          <button
            onClick={onSyncNow}
            disabled={isSyncing || pendingSyncCount === 0 || !isOnline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              pendingSyncCount > 0
                ? isOnline
                  ? 'bg-amber-950/80 border-amber-600/70 text-amber-200 hover:bg-amber-900 cursor-pointer shadow-sm'
                  : 'bg-stone-800 border-amber-800 text-amber-400 opacity-90 cursor-not-allowed'
                : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:text-white'
            }`}
            title={
              pendingSyncCount > 0
                ? isOnline
                  ? `Sync ${pendingSyncCount} unsynced records to Gorakhpur District RCH Portal`
                  : `${pendingSyncCount} visits saved safely offline on phone. Connect to sync.`
                : 'All visits synced with Sub-Centre & PHC portal'
            }
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : pendingSyncCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}
            />
            <span className="hidden sm:inline">
              {isSyncing
                ? lang === 'hi'
                  ? 'सिंक हो रहा है...'
                  : 'Syncing...'
                : pendingSyncCount > 0
                ? lang === 'hi'
                  ? `${pendingSyncCount} रिकॉर्ड सिंक करें`
                  : `Sync ${pendingSyncCount} Records`
                : lang === 'hi'
                ? 'सिंक पूरा'
                : 'Synced'}
            </span>
            {pendingSyncCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold">
                {pendingSyncCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-rose-400" />
            <span>{lang === 'hi' ? 'EN' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
