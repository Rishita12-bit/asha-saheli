import React, { useState, useEffect } from 'react';
import {
  Mic,
  Calendar,
  FileText,
  Sparkles,
  Users,
  Search,
  Filter,
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Building,
  HeartHandshake,
  RotateCcw,
} from 'lucide-react';
import { VisitRecord, DueListItem, BeneficiaryCategory, RiskLevel } from './types';
import {
  SUNITA_PROFILE,
  loadVisits,
  saveVisit,
  deleteVisit,
  loadDueList,
  updateDueItemStatus,
  addDueItem,
  getSyncQueue,
  clearFromSyncQueue,
  resetAllData,
} from './utils/storage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Header } from './components/Header';
import { VisitCard } from './components/VisitCard';
import { VoiceLoggingModal } from './components/VoiceLoggingModal';
import { DueListView } from './components/DueListView';
import { PaperworkReportsView } from './components/PaperworkReportsView';
import { AdolescentModuleView } from './components/AdolescentModuleView';
import { SupervisorView } from './components/SupervisorView';
import { PersonaPitchModal } from './components/PersonaPitchModal';
import { DemoVideoView } from './components/DemoVideoView';

export default function App() {
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [activeTab, setActiveTab] = useState<'VISITS' | 'DUE' | 'REPORTS' | 'ADOLESCENT' | 'SUPERVISOR' | 'DEMO_VIDEO'>('VISITS');

  // Online / Offline State
  const { isOnline, isSimulated, toggleSimulateOffline } = useOnlineStatus();
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  // App Data
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [dueList, setDueList] = useState<DueListItem[]>([]);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [voicePrefillName, setVoicePrefillName] = useState<string>('');
  const [voicePrefillCategory, setVoicePrefillCategory] = useState<BeneficiaryCategory>('ANC');

  // Filters for Visits tab
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | BeneficiaryCategory>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');

  // Load initial data
  useEffect(() => {
    const loadedVisits = loadVisits();
    const loadedDue = loadDueList();
    setVisits(loadedVisits);
    setDueList(loadedDue);

    const unsynced = loadedVisits.filter((v) => !v.synced).length;
    setPendingSyncCount(unsynced);
  }, []);

  // Update sync count when visits change
  const refreshSyncCount = () => {
    const loaded = loadVisits();
    const unsynced = loaded.filter((v) => !v.synced).length;
    setPendingSyncCount(unsynced);
  };

  // Save new visit
  const handleSaveVisit = (newVisit: VisitRecord) => {
    saveVisit(newVisit);
    const updated = loadVisits();
    setVisits(updated);
    refreshSyncCount();

    // If online, auto-sync immediately in background
    if (isOnline) {
      handleSyncNow();
    }
  };

  // Delete visit
  const handleDeleteVisit = (id: string) => {
    if (window.confirm(lang === 'hi' ? 'क्या आप इस रिकॉर्ड को हटाना चाहते हैं?' : 'Delete this visit record?')) {
      deleteVisit(id);
      setVisits(loadVisits());
      refreshSyncCount();
    }
  };

  // Due List handlers
  const handleToggleDueStatus = (id: string, newStatus: 'PENDING' | 'OVERDUE' | 'COMPLETED') => {
    updateDueItemStatus(id, newStatus);
    setDueList(loadDueList());
  };

  const handleAddDueItem = (item: DueListItem) => {
    addDueItem(item);
    setDueList(loadDueList());
  };

  const handleOpenVoiceForDueItem = (name: string, cat: BeneficiaryCategory) => {
    setVoicePrefillName(name);
    setVoicePrefillCategory(cat);
    setIsVoiceModalOpen(true);
  };

  // Sync to backend / PHC server
  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const currentVisits = loadVisits();
      const unsyncedVisits = currentVisits.filter((v) => !v.synced);

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visits: unsyncedVisits,
          workerId: SUNITA_PROFILE.idNumber,
          villageName: SUNITA_PROFILE.village,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Mark all as synced in local storage
        const markedVisits = currentVisits.map((v) => ({ ...v, synced: true }));
        localStorage.setItem('asha_saheli_visits_v1', JSON.stringify(markedVisits));
        setVisits(markedVisits);
        setPendingSyncCount(0);
        clearFromSyncQueue(unsyncedVisits.map((v) => v.id));

        setSyncSuccessToast(
          lang === 'hi'
            ? 'गोरखपुर RCH पोर्टल पर सभी रिकॉर्ड सफलतापूर्वक सिंक हो गए!'
            : 'All records synchronized to Gorakhpur District RCH Portal!'
        );
        setTimeout(() => setSyncSuccessToast(null), 4000);
      }
    } catch (err) {
      console.warn('Sync failed (offline):', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm(lang === 'hi' ? 'डेटा रीसेट करें और डिफ़ॉल्ट रिकॉर्ड लोड करें?' : 'Reset to default village data?')) {
      resetAllData();
      setVisits(loadVisits());
      setDueList(loadDueList());
      setPendingSyncCount(0);
    }
  };

  // Filtered visits
  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      v.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.villageArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.husbandOrGuardianName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
    const matchesRisk = riskFilter === 'ALL' || v.risk.level === riskFilter;

    return matchesSearch && matchesCategory && matchesRisk;
  });

  const highRiskCount = visits.filter((v) => v.risk.level === 'RED').length;
  const amberCount = visits.filter((v) => v.risk.level === 'AMBER').length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans pb-24 sm:pb-12 text-stone-900">
      {/* Top Header */}
      <Header
        profile={SUNITA_PROFILE}
        lang={lang}
        onToggleLang={() => setLang(lang === 'hi' ? 'en' : 'hi')}
        isOnline={isOnline}
        isSimulatedOffline={isSimulated}
        onToggleSimulateOffline={toggleSimulateOffline}
        pendingSyncCount={pendingSyncCount}
        isSyncing={isSyncing}
        onSyncNow={handleSyncNow}
        onOpenPersona={() => setIsPersonaModalOpen(true)}
        onOpenDemoVideo={() => setActiveTab('DEMO_VIDEO')}
      />

      {/* Connectivity Alert Banner when Offline */}
      {!isOnline && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            {lang === 'hi'
              ? 'ऑफ़लाइन मोड सक्रिय: सभी आवाज रिकॉर्डिंग और जांच आपके फोन में सुरक्षित सहेजी जा रही हैं। नेटवर्क आने पर सिंक होगा।'
              : 'Offline Mode Active: All voice logs & clinical risk checks are safely saved locally on your device.'}
          </span>
          {isSimulated && (
            <button
              onClick={toggleSimulateOffline}
              className="ml-2 underline hover:text-black font-extrabold"
            >
              ({lang === 'hi' ? 'सिमुलेशन बंद करें' : 'Turn off simulation'})
            </button>
          )}
        </div>
      )}

      {/* Sync Success Toast */}
      {syncSuccessToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{syncSuccessToast}</span>
        </div>
      )}

      {/* Navigation Sub-Bar (Tabs) */}
      <nav className="bg-white border-b border-stone-200 shadow-xs sticky top-[57px] z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('VISITS')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'VISITS'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{lang === 'hi' ? 'दैनिक गृह भ्रमण' : 'Visits Register'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'VISITS' ? 'bg-rose-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                {visits.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('DUE')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'DUE'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{lang === 'hi' ? 'आगामी देय सूची' : 'Due List'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'DUE' ? 'bg-rose-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                {dueList.filter((i) => i.status !== 'COMPLETED').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'REPORTS'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'hi' ? 'मासिक फॉर्म 6' : 'Form 6 Reports'}</span>
            </button>

            <button
              onClick={() => setActiveTab('ADOLESCENT')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'ADOLESCENT'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{lang === 'hi' ? 'किशोरी स्वास्थ्य (RKSK)' : 'Adolescent'}</span>
            </button>

            <button
              onClick={() => setActiveTab('SUPERVISOR')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === 'SUPERVISOR'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Building className="w-4 h-4 text-stone-400" />
              <span>{lang === 'hi' ? 'पर्यवेक्षक ANM' : 'Supervisor'}</span>
            </button>

            <button
              onClick={() => setActiveTab('DEMO_VIDEO')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition whitespace-nowrap border ${
                activeTab === 'DEMO_VIDEO'
                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md ring-2 ring-amber-400'
                  : 'bg-amber-100/80 text-amber-950 border-amber-300 hover:bg-amber-200'
              }`}
            >
              <span>🎬</span>
              <span>{lang === 'hi' ? 'डेमो वीडियो (जज प्रेजेंटेशन)' : 'Demo Video (Pitch)'}</span>
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            </button>
          </div>

          {/* Quick Voice Log Launch Button in Navbar */}
          <button
            onClick={() => {
              setVoicePrefillName('');
              setVoicePrefillCategory('ANC');
              setIsVoiceModalOpen(true);
            }}
            className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-800 hover:to-red-900 text-white text-xs font-bold shadow-md hover:shadow-lg transition"
          >
            <Mic className="w-4 h-4 text-rose-200" />
            <span>{lang === 'hi' ? 'विजिट बोलें (Hindi Mic)' : 'Speak Visit (Mic)'}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-5 flex-1 w-full space-y-4">
        {/* TAB 1: VISITS REGISTER */}
        {activeTab === 'VISITS' && (
          <div className="space-y-4">
            {/* Quick Triage Summary Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Red Alert Pill */}
              <button
                onClick={() => setRiskFilter(riskFilter === 'RED' ? 'ALL' : 'RED')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  riskFilter === 'RED'
                    ? 'bg-rose-100 border-rose-500 ring-2 ring-rose-500'
                    : 'bg-white hover:bg-rose-50/60 border-rose-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                      {lang === 'hi' ? 'उच्च जोखिम (रेफरल)' : 'High Risk (RED)'}
                    </span>
                    <span className="text-lg font-black text-rose-950">
                      {highRiskCount} {lang === 'hi' ? 'गर्भवती / शिशु' : 'Cases'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-full">
                  {lang === 'hi' ? '108 कॉल' : 'Urgent'}
                </span>
              </button>

              {/* Amber Alert Pill */}
              <button
                onClick={() => setRiskFilter(riskFilter === 'AMBER' ? 'ALL' : 'AMBER')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  riskFilter === 'AMBER'
                    ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-500'
                    : 'bg-white hover:bg-amber-50/60 border-amber-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                      {lang === 'hi' ? 'मध्यम जोखिम (निगरानी)' : 'Moderate (AMBER)'}
                    </span>
                    <span className="text-lg font-black text-amber-950">
                      {amberCount} {lang === 'hi' ? 'मामले' : 'Cases'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  {lang === 'hi' ? 'ANM फॉलोअप' : 'Monitor'}
                </span>
              </button>

              {/* Green / Total Pill */}
              <button
                onClick={() => {
                  setRiskFilter('ALL');
                  setCategoryFilter('ALL');
                }}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  riskFilter === 'ALL' && categoryFilter === 'ALL'
                    ? 'bg-stone-100 border-stone-400'
                    : 'bg-white hover:bg-stone-50 border-stone-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      {lang === 'hi' ? 'कुल पंजीकृत लाभार्थी' : 'Total Beneficiaries'}
                    </span>
                    <span className="text-lg font-black text-stone-900">
                      {visits.length} {lang === 'hi' ? 'रिकॉर्ड' : 'Records'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                  {lang === 'hi' ? 'सभी देखें' : 'View All'}
                </span>
              </button>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Box */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'hi'
                        ? 'लाभार्थी का नाम, पति/अभिभावक, या टोला खोजें...'
                        : 'Search by beneficiary name, husband, or tola area...'
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* New Visit Speak Button (Mobile & Desktop) */}
                <button
                  onClick={() => {
                    setVoicePrefillName('');
                    setVoicePrefillCategory('ANC');
                    setIsVoiceModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-800 hover:to-red-900 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 shrink-0"
                >
                  <Mic className="w-4 h-4 text-rose-200" />
                  <span>{lang === 'hi' ? '+ आवाज से नई विजिट दर्ज करें' : '+ Record Voice Visit'}</span>
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-stone-400 font-bold mr-1">
                    {lang === 'hi' ? 'श्रेणी:' : 'Category:'}
                  </span>
                  {(['ALL', 'ANC', 'PNC', 'NEWBORN', 'ADOLESCENT'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${
                        categoryFilter === cat
                          ? 'bg-rose-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {cat === 'ALL'
                        ? lang === 'hi'
                          ? 'सभी'
                          : 'All'
                        : cat === 'ANC'
                        ? lang === 'hi'
                          ? 'गर्भवती (ANC)'
                          : 'ANC'
                        : cat === 'PNC'
                        ? lang === 'hi'
                          ? 'प्रसूता (PNC)'
                          : 'PNC'
                        : cat === 'NEWBORN'
                        ? lang === 'hi'
                          ? 'नवजात (HBNC)'
                          : 'Newborn'
                        : lang === 'hi'
                        ? 'किशोरी (RKSK)'
                        : 'Adolescent'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Reset demo data */}
                  <button
                    onClick={handleResetData}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-700"
                    title="Reload village default demo records"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === 'hi' ? 'डिफ़ॉल्ट डेटा' : 'Reset Demo'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visit Cards List */}
            <div className="space-y-3">
              {filteredVisits.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-500">
                  <HeartHandshake className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="font-bold text-base text-stone-700">
                    {lang === 'hi' ? 'कोई रिकॉर्ड नहीं मिला' : 'No visit records found'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === 'hi'
                      ? 'कृपया खोज फिल्टर बदलें या नया विजिट दर्ज करने के लिए ऊपर माइक पर टैप करें।'
                      : 'Try changing search filters or tap the voice recorder button above.'}
                  </p>
                </div>
              ) : (
                filteredVisits.map((visit) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    profile={SUNITA_PROFILE}
                    lang={lang}
                    onDelete={handleDeleteVisit}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DUE LIST */}
        {activeTab === 'DUE' && (
          <DueListView
            dueList={dueList}
            onToggleStatus={handleToggleDueStatus}
            onOpenVoiceForBeneficiary={handleOpenVoiceForDueItem}
            onAddDueItem={handleAddDueItem}
            profile={SUNITA_PROFILE}
            lang={lang}
          />
        )}

        {/* TAB 3: MONTHLY FORM 6 & PAPERWORK */}
        {activeTab === 'REPORTS' && (
          <PaperworkReportsView
            visits={visits}
            profile={SUNITA_PROFILE}
            lang={lang}
          />
        )}

        {/* TAB 4: ADOLESCENT MODULE (RKSK) */}
        {activeTab === 'ADOLESCENT' && (
          <AdolescentModuleView
            visits={visits}
            profile={SUNITA_PROFILE}
            lang={lang}
            onOpenVoiceLog={(prefillName) => {
              setVoicePrefillName(prefillName || '');
              setVoicePrefillCategory('ADOLESCENT');
              setIsVoiceModalOpen(true);
            }}
          />
        )}

        {/* TAB 5: SUPERVISOR & ANM VIEW */}
        {activeTab === 'SUPERVISOR' && (
          <SupervisorView
            visits={visits}
            profile={SUNITA_PROFILE}
            lang={lang}
          />
        )}

        {/* TAB 6: DEMO VIDEO FOR JUDGES */}
        {activeTab === 'DEMO_VIDEO' && (
          <DemoVideoView
            profile={SUNITA_PROFILE}
            lang={lang}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) for Instant Field Voice Logging */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            setVoicePrefillName('');
            setVoicePrefillCategory('ANC');
            setIsVoiceModalOpen(true);
          }}
          className="group relative flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-rose-700 via-red-700 to-rose-900 text-white font-black text-sm shadow-2xl hover:shadow-rose-900/50 hover:scale-105 active:scale-95 transition border-2 border-rose-400/40"
          title="Tap to speak home visit in Hindi / Hinglish"
        >
          <span className="w-3 h-3 rounded-full bg-rose-200 animate-ping absolute -top-1 -right-1" />
          <Mic className="w-5 h-5 text-rose-100 group-hover:animate-bounce" />
          <span>{lang === 'hi' ? 'विजिट बोलें (Mic)' : 'Voice Log'}</span>
        </button>
      </div>

      {/* Voice Visit Modal */}
      <VoiceLoggingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveVisit={handleSaveVisit}
        profile={SUNITA_PROFILE}
        lang={lang}
        isOnline={isOnline}
        prefillBeneficiaryName={voicePrefillName}
        prefillCategory={voicePrefillCategory}
      />

      {/* Persona & Problem Case Study Modal */}
      <PersonaPitchModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        profile={SUNITA_PROFILE}
        lang={lang}
      />
    </div>
  );
}
