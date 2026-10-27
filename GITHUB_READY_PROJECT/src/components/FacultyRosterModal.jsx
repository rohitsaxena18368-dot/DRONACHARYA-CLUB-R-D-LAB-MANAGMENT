import React, { useState } from 'react';
import { storage, DEFAULT_FACULTY_ROSTER } from '../services/storage';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Plus, 
  Trash2, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Building2,
  Lock
} from 'lucide-react';

export const FacultyRosterModal = ({ isOpen, onClose }) => {
  const [roster, setRoster] = useState(() => storage.getFacultyRoster());
  const [activeTab, setActiveTab] = useState('hod'); // 'hod' | 'faculty'
  
  // New entry form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('Department of Electronics & Communication Engg.');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleAddEmail = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('कृपया वैध ईमेल आईडी दर्ज करें (e.g. professor@bietjhs.ac.in)');
      return;
    }

    const currentList = activeTab === 'hod' ? roster.hodEmails : roster.facultyEmails;
    const exists = currentList.some(item => item.email.toLowerCase() === cleanEmail);
    if (exists) {
      setErrorMsg(`यह ईमेल (${cleanEmail}) पहले से ही ${activeTab.toUpperCase()} लिस्ट में मौजूद है!`);
      return;
    }

    const newEntry = {
      email: cleanEmail,
      name: newName.trim() || (activeTab === 'hod' ? 'Dr. D.C. Dhubkarya' : 'Dr. Shahnaj Ayub'),
      department: newDept.trim() || 'Department of Electronics & Communication Engg.'
    };

    const updatedRoster = {
      ...roster,
      [activeTab === 'hod' ? 'hodEmails' : 'facultyEmails']: [
        newEntry,
        ...currentList
      ]
    };

    setRoster(updatedRoster);
    storage.saveFacultyRoster(updatedRoster);
    setNewEmail('');
    setNewName('');
    showFeedback(`✅ ${cleanEmail} को ${activeTab.toUpperCase()} के रूप में सफलतापूर्वक जोड़ दिया गया!`);
  };

  const handleRemoveEmail = (type, emailToRemove) => {
    const listKey = type === 'hod' ? 'hodEmails' : 'facultyEmails';
    const updatedList = roster[listKey].filter(item => item.email.toLowerCase() !== emailToRemove.toLowerCase());
    
    const updatedRoster = {
      ...roster,
      [listKey]: updatedList
    };

    setRoster(updatedRoster);
    storage.saveFacultyRoster(updatedRoster);
    showFeedback(`🗑️ ${emailToRemove} हटा दिया गया।`);
  };

  const handleResetDefaults = () => {
    if (window.confirm("क्या आप अधिकृत फैकल्टी और एचओडी ईमेल लिस्ट को डिफ़ॉल्ट पर रीसेट करना चाहते हैं?")) {
      setRoster(DEFAULT_FACULTY_ROSTER);
      storage.saveFacultyRoster(DEFAULT_FACULTY_ROSTER);
      showFeedback("🔄 लिस्ट को डिफ़ॉल्ट ईमेल पर रीसेट कर दिया गया है।");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#071f3a] text-white p-5 sm:p-6 border-b-2 border-[#d4af37] relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Institutional Access Control Register
              </span>
              <h2 className="text-lg font-bold font-display text-white">
                Authorized Faculty &amp; HOD Email Whitelist
              </h2>
              <p className="text-xs text-slate-300">
                प्राध्यापक एवं विभागाध्यक्ष अधिकृत ईमेल प्रबंधन (BIET Jhansi)
              </p>
            </div>
          </div>
        </div>

        {/* Informational Guidance Box */}
        <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11.5px]">
            <strong>सुरक्षा नियम (Security Protocol):</strong> आप यहाँ जितने भी फैकल्टी या HOD के ईमेल डालेंगे, 
            वेबसाइट केवल <strong>उन्हें ही Group Approval, Group Eliminate</strong> और <strong>Components हटाने</strong> का अधिकार देगी। 
            बाकी अन्य ईमेल वाले विद्यार्थी (Group Leader) केवल अपने प्रोजेक्ट में Component <strong>Add या Replace</strong> कर सकेंगे।
          </div>
        </div>

        {/* Feedback / Error Alerts */}
        {feedbackMsg && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Tabs (HOD vs Faculty) */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => { setActiveTab('hod'); setErrorMsg(''); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'hod'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>HOD Emails ({roster.hodEmails?.length || 0})</span>
            </button>

            <button
              onClick={() => { setActiveTab('faculty'); setErrorMsg(''); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'faculty'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Faculty Guide Emails ({roster.facultyEmails?.length || 0})</span>
            </button>
          </div>

          {/* Add New Email Form */}
          <form onSubmit={handleAddEmail} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Add New Authorized {activeTab === 'hod' ? 'Head of Department (HOD)' : 'Faculty Guide'} Email</span>
              <span className="text-[10px] text-blue-600 font-semibold uppercase">1-Click Whitelist</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder={activeTab === 'hod' ? "e.g. dcdhubkarya@bietjhs.ac.in" : "e.g. shahnajayub@bietjhs.ac.in"}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Designation / Name
                </label>
                <input
                  type="text"
                  placeholder={activeTab === 'hod' ? "e.g. Dr. D.C. Dhubkarya" : "e.g. Dr. Shahnaj Ayub"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                इस ईमेल से लॉग इन करने पर वेबसाइट इन्हें तुरंत {activeTab.toUpperCase()} पहचान लेगी।
              </span>
              <button
                type="submit"
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 ${
                  activeTab === 'hod' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Email</span>
              </button>
            </div>
          </form>

          {/* Current Whitelisted Emails List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Currently Authorized {activeTab.toUpperCase()} Accounts:
              </h4>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(activeTab === 'hod' ? roster.hodEmails : roster.facultyEmails).map((item) => (
                <div
                  key={item.email}
                  className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                      activeTab === 'hod' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {activeTab === 'hod' ? <Award className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>{item.email}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-semibold rounded">
                          Active Whitelist
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.name} • {item.department}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveEmail(activeTab, item.email)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Remove Email from Whitelist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            All updates save automatically to browser storage.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#071f3a] hover:bg-[#0c2e55] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Done &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
