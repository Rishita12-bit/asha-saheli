import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Phone,
  Mic,
  Plus,
  Filter,
  Syringe,
  Baby,
  HeartHandshake,
  Pill,
  User,
  MapPin,
} from 'lucide-react';
import { DueListItem, BeneficiaryCategory, ASHAProfile } from '../types';

interface DueListViewProps {
  dueList: DueListItem[];
  onToggleStatus: (id: string, newStatus: 'PENDING' | 'OVERDUE' | 'COMPLETED') => void;
  onOpenVoiceForBeneficiary: (name: string, category: BeneficiaryCategory) => void;
  onAddDueItem: (item: DueListItem) => void;
  profile: ASHAProfile;
  lang: 'hi' | 'en';
}

export const DueListView: React.FC<DueListViewProps> = ({
  dueList,
  onToggleStatus,
  onOpenVoiceForBeneficiary,
  onAddDueItem,
  profile,
  lang,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'TODAY' | 'WEEK' | 'OVERDUE'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newCategory, setNewCategory] = useState<BeneficiaryCategory>('ANC');
  const [newTaskType, setNewTaskType] = useState<DueListItem['taskType']>('ANC_CHECKUP');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'NORMAL'>('HIGH');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newArea, setNewArea] = useState('Rampur Tola 2');

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 86400 * 1000).toISOString().split('T')[0];

  const filteredList = dueList.filter((item) => {
    if (filterTab === 'TODAY') {
      return item.dueDate === todayStr;
    }
    if (filterTab === 'WEEK') {
      return item.dueDate >= todayStr && item.dueDate <= nextWeekStr;
    }
    if (filterTab === 'OVERDUE') {
      return item.status === 'OVERDUE' || (item.dueDate < todayStr && item.status !== 'COMPLETED');
    }
    return true;
  });

  const overdueCount = dueList.filter(
    (i) => i.status === 'OVERDUE' || (i.dueDate < todayStr && i.status !== 'COMPLETED')
  ).length;
  const todayCount = dueList.filter((i) => i.dueDate === todayStr && i.status !== 'COMPLETED').length;

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeneficiary.trim() || !newTitle.trim()) return;

    const newItem: DueListItem = {
      id: `due-${Date.now().toString().slice(-5)}`,
      beneficiaryId: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      beneficiaryName: newBeneficiary.trim(),
      category: newCategory,
      taskType: newTaskType,
      taskTitle: newTitle.trim(),
      taskTitleHindi: newTitle.trim(),
      dueDate: newDueDate,
      status: 'PENDING',
      priority: newPriority,
      contactNumber: newPhone.trim(),
      villageArea: newArea.trim(),
    };

    onAddDueItem(newItem);
    setShowAddModal(false);
    setNewBeneficiary('');
    setNewTitle('');
  };

  const getTaskIcon = (taskType: DueListItem['taskType']) => {
    switch (taskType) {
      case 'ANC_CHECKUP':
        return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      case 'TT_INJECTION':
      case 'IMMUNIZATION':
        return <Syringe className="w-4 h-4 text-blue-600" />;
      case 'HBNC_VISIT':
        return <Baby className="w-4 h-4 text-emerald-600" />;
      case 'WIFS_SUPPLY':
        return <Pill className="w-4 h-4 text-purple-600" />;
      default:
        return <Calendar className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {lang === 'hi' ? 'आगामी देय सूची (Due List)' : 'Village Health Due List'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              {dueList.filter((i) => i.status !== 'COMPLETED').length} {lang === 'hi' ? 'लंबित' : 'Pending'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {lang === 'hi'
              ? 'टीकाकरण, एएनसी जांच, प्रसव पश्चात व नवजात गृह भ्रमण की तय तिथियां'
              : 'Upcoming ANC checkups, TT, newborn HBNC visits, and immunizations'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4 text-rose-400" />
          <span>{lang === 'hi' ? 'नया कार्य जोड़ें' : 'Add Due Item'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            filterTab === 'ALL'
              ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
          }`}
        >
          {lang === 'hi' ? 'सभी कार्य' : 'All Tasks'} ({dueList.length})
        </button>

        <button
          onClick={() => setFilterTab('TODAY')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            filterTab === 'TODAY'
              ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
          }`}
        >
          {lang === 'hi' ? 'आज देय' : 'Due Today'} ({todayCount})
        </button>

        <button
          onClick={() => setFilterTab('WEEK')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            filterTab === 'WEEK'
              ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
          }`}
        >
          {lang === 'hi' ? 'इस हफ्ते' : 'This Week'}
        </button>

        <button
          onClick={() => setFilterTab('OVERDUE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            filterTab === 'OVERDUE'
              ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
          }`}
        >
          <span className="flex items-center gap-1">
            {overdueCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
            <span>{lang === 'hi' ? 'छूटे हुए (Overdue)' : 'Overdue'} ({overdueCount})</span>
          </span>
        </button>
      </div>

      {/* Due List Items */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold">{lang === 'hi' ? 'इस श्रेणी में कोई देय कार्य नहीं है!' : 'No tasks in this view!'}</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            const isOverdue =
              item.status === 'OVERDUE' || (item.dueDate < todayStr && !isCompleted);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-stone-100/70 border-stone-200 opacity-75'
                    : isOverdue
                    ? 'bg-rose-50/70 border-rose-300 hover:border-rose-400'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() =>
                      onToggleStatus(item.id, isCompleted ? 'PENDING' : 'COMPLETED')
                    }
                    className="mt-0.5 p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
                    title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-rose-600" />
                    )}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-stone-900">
                        {item.beneficiaryName}
                      </span>
                      <span className="p-1 rounded bg-stone-100 border border-stone-200">
                        {getTaskIcon(item.taskType)}
                      </span>
                      {item.priority === 'HIGH' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700">
                          {lang === 'hi' ? 'उच्च प्राथमिकता' : 'HIGH PRIORITY'}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-red-600 text-white animate-pulse">
                          {lang === 'hi' ? 'छूट गया' : 'OVERDUE'}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs font-semibold mt-0.5 ${isCompleted ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {lang === 'hi' ? item.taskTitleHindi : item.taskTitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>
                          {lang === 'hi' ? 'नियत तारीख: ' : 'Due: '}
                          <strong>{item.dueDate}</strong>
                        </span>
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{item.villageArea}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                  {item.contactNumber && (
                    <a
                      href={`tel:${item.contactNumber}`}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs font-medium shadow-xs"
                      title={lang === 'hi' ? 'कॉल करें' : 'Call'}
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </a>
                  )}

                  {/* Launch Voice Visit Logger directly with pre-fill */}
                  <button
                    onClick={() =>
                      onOpenVoiceForBeneficiary(item.beneficiaryName, item.category)
                    }
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                    title="Open voice logger prefilled for this mother/child"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'विजिट दर्ज करें' : 'Log Visit'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Due Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-300 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-stone-900">
                {lang === 'hi' ? 'नया देय कार्य जोड़ें' : 'Add Scheduled Due Task'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'लाभार्थी का नाम *' : 'Beneficiary Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newBeneficiary}
                  onChange={(e) => setNewBeneficiary(e.target.value)}
                  placeholder="उदा: सुमन वर्मा"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'श्रेणी' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as BeneficiaryCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="ANC">गर्भवती (ANC)</option>
                    <option value="PNC">प्रसूता (PNC)</option>
                    <option value="NEWBORN">नवजात (HBNC)</option>
                    <option value="ADOLESCENT">किशोरी (RKSK)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'कार्य का प्रकार' : 'Task Type'}
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="ANC_CHECKUP">ANC Checkup (जांच)</option>
                    <option value="TT_INJECTION">TT/Td टीका (Injection)</option>
                    <option value="HBNC_VISIT">HBNC गृह भ्रमण (Newborn)</option>
                    <option value="IMMUNIZATION">बाल टीकाकरण (Vaccine)</option>
                    <option value="WIFS_SUPPLY">WIFS नीली गोली (IFA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'कार्य विवरण (Task Title) *' : 'Task Description *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="उदा: ANC 3 चेकअप एवं वजन माप"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'नियत तारीख (Due Date)' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'प्राथमिकता' : 'Priority'}
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="HIGH">उच्च (High)</option>
                    <option value="MEDIUM">मध्यम (Medium)</option>
                    <option value="NORMAL">सामान्य (Normal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'मोबाइल नंबर' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'टोला / मोहल्ला' : 'Area'}
                  </label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="उदा: पूरब टोला"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold"
                >
                  {lang === 'hi' ? 'सहेजें' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
