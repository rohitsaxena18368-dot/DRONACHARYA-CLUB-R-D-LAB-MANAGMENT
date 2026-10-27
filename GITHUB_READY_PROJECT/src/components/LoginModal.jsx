import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import logoImg from '../assets/logo.jpg';
import { 
  X, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  UserCheck, 
  AlertCircle, 
  Building2, 
  Briefcase, 
  Lock,
  ChevronRight,
  Mail,
  Sparkles,
  Settings,
  CheckCircle2
} from 'lucide-react';

export const LoginModal = ({ isOpen, onClose, onOpenRoster }) => {
  const { loginByEmail } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentRole, setStudentRole] = useState('leader'); // 'leader' | 'member'
  const [error, setError] = useState('');

  // Email recognition state
  const [recognizedRole, setRecognizedRole] = useState(null);

  useEffect(() => {
    if (email && email.includes('@')) {
      const verified = storage.verifyEmailRole(email);
      if (verified.isAuthorized) {
        setRecognizedRole(verified);
      } else {
        setRecognizedRole(null);
      }
    } else {
      setRecognizedRole(null);
    }
  }, [email]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid institutional email address.');
      return;
    }

    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }

    // If recognized as Faculty or HOD, roll number is NOT needed
    if (!recognizedRole) {
      if (!rollNo.trim()) {
        setError('College Roll Number is strictly COMPULSORY for students/group leaders.');
        return;
      }
    }

    loginByEmail({
      email: cleanEmail,
      name: name.trim(),
      rollNo: recognizedRole ? null : rollNo.trim().toUpperCase(),
      studentRole: studentRole
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Formal Institutional Header Bar */}
        <div className="bg-[#071f3a] text-white p-6 relative border-b-2 border-[#d4af37] rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-blue-400 shadow-md flex-shrink-0">
              <img src={logoImg} alt="Emblem" className="w-full h-full object-cover rounded-full bg-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                Institutional Academic Portal
              </span>
              <h2 className="text-lg font-bold font-display tracking-tight text-white">
                DRONACHARYA R&D LAB MANAGMENT
              </h2>
              <p className="text-xs text-slate-300">
                Email-Based Role Authentication &amp; Access Control
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Notice Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-600 text-[11.5px]">
            Faculty / HOD Email Roster Configure करना चाहते हैं?
          </span>
          {onOpenRoster && (
            <button
              type="button"
              onClick={() => { onClose(); onOpenRoster(); }}
              className="inline-flex items-center space-x-1 font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition"
            >
              <Settings className="w-3.5 h-3.5 text-amber-600" />
              <span>Manage Whitelist Emails</span>
            </button>
          )}
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Email Address Field (Core Authentication Key) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-500">
                Role will be automatically recognized
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="e.g. dcdhubkarya@bietjhs.ac.in or shahnajayub@bietjhs.ac.in or student@bietjhs.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Dynamic Role Recognition Banner */}
          {recognizedRole ? (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-blue-50 border-2 border-amber-400 rounded-2xl flex items-start space-x-3 animate-in fade-in duration-200">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs flex-shrink-0">
                {recognizedRole.role === 'hod' ? <Award className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    Recognized: {recognizedRole.roleLabel}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                    Verified Email
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {recognizedRole.role === 'hod'
                    ? "विभागाध्यक्ष (HOD) - Dr. D.C. Dhubkarya: Group Proposals Approve/Reject करना, Group Eliminate करना, और किसी भी group के Components हटाने का पूर्ण अधिकार।"
                    : "फैकल्टी गाइड (Faculty Guide) - Dr. Shahnaj Ayub: Group Proposals Review & Approve करना, Group Eliminate करना, और Components हटाने का अधिकार।"}
                </p>
              </div>
            </div>
          ) : email.includes('@') ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>विद्यार्थी अकाउंट (Student Portal Access)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Standard Student Permissions
              </span>
            </div>
          ) : null}

          {/* User Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={recognizedRole ? recognizedRole.name : "e.g. Dr. D.C. Dhubkarya / Dr. Shahnaj Ayub / Rohit Kumar"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
              required
            />
          </div>

          {/* Student Specific Fields (Only if not Faculty/HOD) */}
          {!recognizedRole && (
            <div className="space-y-3 pt-1 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Student Responsibility <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStudentRole('leader')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 ${
                      studentRole === 'leader'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs">Group Leader</div>
                      <div className="text-[10px] text-slate-500 font-normal">Can Add / Replace Components</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentRole('member')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 ${
                      studentRole === 'member'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="text-xs">Team Member</div>
                      <div className="text-[10px] text-slate-500 font-normal">Lab Attendance &amp; Prototyping</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    College Roll Number <span className="text-rose-500">* (Compulsory)</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Mandatory Validation
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 21ECE045"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
                  required={!recognizedRole}
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#071f3a] hover:bg-[#0b2d52] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {recognizedRole 
                  ? `Authenticate as ${recognizedRole.roleLabel}`
                  : `Enter Portal as Student (${studentRole === 'leader' ? 'Group Leader' : 'Member'})`}
              </span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500 rounded-b-2xl">
          Official Access Register • Bundelkhand Institute of Engineering and Technology, Jhansi
        </div>
      </div>
    </div>
  );
};
