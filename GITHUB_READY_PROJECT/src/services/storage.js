import { INITIAL_GROUPS, DEMO_USERS } from '../data/mockData.js';

const STORAGE_KEY_GROUPS = 'dronacharya_rd_groups_v3';
const STORAGE_KEY_USER = 'dronacharya_rd_current_user_v3';
const STORAGE_KEY_FACULTY_ROSTER = 'biet_faculty_roster_v3';

export const DEFAULT_FACULTY_ROSTER = {
  hodEmails: [
    { email: 'dcdhubkarya@bietjhs.ac.in', name: 'Dr. D.C. Dhubkarya', department: 'Department of Electronics & Communication Engg.' },
    { email: 'hod.ece@bietjhs.ac.in', name: 'Dr. D.C. Dhubkarya (HOD ECE)', department: 'Department of Electronics & Communication Engg.' },
    { email: 'hod@bietjhs.ac.in', name: 'Dr. D.C. Dhubkarya (HOD)', department: 'Department of Electronics & Communication Engg.' }
  ],
  facultyEmails: [
    { email: 'shahnajayub@bietjhs.ac.in', name: 'Dr. Shahnaj Ayub', department: 'Department of Electronics & Communication Engg.' },
    { email: 'faculty@bietjhs.ac.in', name: 'Dr. Shahnaj Ayub (Faculty Guide)', department: 'Department of Electronics & Communication Engg.' },
    { email: 'guide@bietjhs.ac.in', name: 'Dr. Shahnaj Ayub', department: 'Central R&D Laboratory' }
  ]
};

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
let memoryStore = {};

// Defensive helper: guarantees every group has valid arrays & required objects
const sanitizeGroup = (g) => {
  if (!g || typeof g !== 'object') return null;
  return {
    ...g,
    id: g.id || `grp-${Date.now()}`,
    groupName: g.groupName || 'Project Group',
    projectTitle: g.projectTitle || 'Hardware Project',
    realLifeProblem: g.realLifeProblem || 'Problem description pending.',
    realLifeApplication: g.realLifeApplication || 'Application details pending.',
    leader: g.leader || { name: 'Student Leader', rollNo: 'N/A' },
    members: Array.isArray(g.members) ? g.members : [],
    components: Array.isArray(g.components) ? g.components : [],
    componentHistory: Array.isArray(g.componentHistory) ? g.componentHistory : [],
    labAttendance: Array.isArray(g.labAttendance) ? g.labAttendance : [],
    status: g.status || 'pending-approval',
    currentlyInLab: !!g.currentlyInLab
  };
};

export const storage = {
  getGroups: () => {
    try {
      if (isBrowser) {
        // Clear legacy storage key with demo data if it exists
        if (localStorage.getItem('dronacharya_rd_groups_v1')) {
          localStorage.removeItem('dronacharya_rd_groups_v1');
        }

        const data = localStorage.getItem(STORAGE_KEY_GROUPS);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            return parsed.map(sanitizeGroup).filter(Boolean);
          }
        }
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(INITIAL_GROUPS));
      } else {
        if (memoryStore[STORAGE_KEY_GROUPS]) {
          const parsed = JSON.parse(memoryStore[STORAGE_KEY_GROUPS]);
          if (Array.isArray(parsed)) return parsed.map(sanitizeGroup).filter(Boolean);
        }
      }
    } catch (e) {
      console.error('Error reading groups from localStorage:', e);
    }
    return INITIAL_GROUPS;
  },

  saveGroups: (groups) => {
    try {
      if (isBrowser) {
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
      } else {
        memoryStore[STORAGE_KEY_GROUPS] = JSON.stringify(groups);
      }
    } catch (e) {
      console.error('Error saving groups to localStorage:', e);
    }
  },

  getGroupById: (id) => {
    const groups = storage.getGroups();
    return groups.find((g) => g.id === id) || null;
  },

  // Check if a student (by Roll Number) is already part of an active/in-progress group
  checkMemberActiveGroup: (rollNo, excludeGroupId = null) => {
    if (!rollNo) return { isEnrolled: false };
    const cleanRoll = rollNo.trim().toUpperCase();
    const groups = storage.getGroups();

    for (const group of groups) {
      // Rule: Check only active groups (in-progress OR pending-approval). Completed, eliminated, or rejected groups do NOT block!
      if (group.status !== 'in-progress' && group.status !== 'pending-approval') continue;
      if (excludeGroupId && group.id === excludeGroupId) continue;

      // Check if student is the Leader
      if (group.leader?.rollNo && group.leader.rollNo.trim().toUpperCase() === cleanRoll) {
        return {
          isEnrolled: true,
          role: 'Group Leader',
          groupName: group.groupName,
          projectTitle: group.projectTitle,
          groupId: group.id,
          studentName: group.leader.name,
          rollNo: cleanRoll
        };
      }

      // Check if student is a Member
      const memberMatch = (group.members || []).find(
        (m) => m.rollNo && m.rollNo.trim().toUpperCase() === cleanRoll
      );
      if (memberMatch) {
        return {
          isEnrolled: true,
          role: 'Group Member',
          groupName: group.groupName,
          projectTitle: group.projectTitle,
          groupId: group.id,
          studentName: memberMatch.name,
          rollNo: cleanRoll
        };
      }
    }

    return { isEnrolled: false };
  },

  createGroup: (groupPayload, leaderUser) => {
    const leaderRoll = leaderUser.rollNo?.trim().toUpperCase();

    // 1. Verify Leader is not active in another incomplete group
    const leaderCheck = storage.checkMemberActiveGroup(leaderRoll);
    if (leaderCheck.isEnrolled) {
      return {
        error: `Group Leader (Roll No: ${leaderRoll}) pehle se hi active group "${leaderCheck.groupName}" me registered hain! Jab tak wo project complete nahi ho jata, tab tak aap naya group nahi bana sakte.`
      };
    }

    // 2. Check for duplicate roll numbers within this submission
    const allRolls = [leaderRoll];
    for (const m of (groupPayload.members || [])) {
      const mRoll = m.rollNo?.trim().toUpperCase();
      if (!mRoll) continue;

      if (allRolls.includes(mRoll)) {
        return {
          error: `Roll Number "${mRoll}" is group me duplicate hai! Leader aur sabhi members ke Roll Numbers alag-alag hone chahiye.`
        };
      }
      allRolls.push(mRoll);

      // 3. Verify each Member is not active in another incomplete group
      const memberCheck = storage.checkMemberActiveGroup(mRoll);
      if (memberCheck.isEnrolled) {
        return {
          error: `Member "${m.name}" (Roll No: ${mRoll}) already active group "${memberCheck.groupName}" ka hissa hai! Jab tak pehla project complete nahi ho jata, tab tak ye kisi dusre group me add nahi ho sakte.`
        };
      }
    }

    const groups = storage.getGroups();
    const newId = `grp-${Date.now().toString(36)}`;
    
    // Components formatting
    const formattedComponents = (groupPayload.components || []).map((comp, idx) => ({
      id: `comp-${Date.now()}-${idx}`,
      name: comp.name,
      qty: parseInt(comp.qty, 10) || 1,
      specs: comp.specs || 'Standard Lab Grade',
      purpose: comp.purpose || 'Project hardware subsystem',
      status: 'active',
      addedBy: `${leaderUser.name} (${leaderUser.rollNo || leaderUser.role})`,
      addedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    }));

    // Component initial history entries
    const initialHistory = formattedComponents.map((comp) => ({
      id: `ch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      action: 'ADDED',
      componentName: `${comp.name} (${comp.qty} Qty)`,
      authorName: leaderUser.name,
      authorRole: `Group Leader (${leaderUser.rollNo})`,
      reason: comp.purpose || 'Initial component registration for project',
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    }));

    const newGroup = {
      id: newId,
      groupName: groupPayload.groupName.trim(),
      projectTitle: groupPayload.projectTitle.trim(),
      realLifeProblem: groupPayload.realLifeProblem.trim(),
      realLifeApplication: groupPayload.realLifeApplication.trim(),
      leader: {
        name: leaderUser.name.trim(),
        rollNo: leaderRoll,
        email: groupPayload.leaderEmail || `${leaderRoll.toLowerCase()}@dronacharya.ac.in`,
        phone: groupPayload.leaderPhone || '+91 XXXXX XXXXX'
      },
      members: (groupPayload.members || []).map((m, idx) => ({
        id: `mem-${Date.now()}-${idx}`,
        name: m.name.trim(),
        rollNo: m.rollNo.trim().toUpperCase(),
        role: m.role ? m.role.trim() : 'Project Team Member'
      })),
      status: 'pending-approval',
      approval: {
        submittedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        submittedByLeader: leaderUser.name.trim(),
        submittedByLeaderRoll: leaderRoll,
        approvedBy: null,
        approvedRole: null,
        approvedAt: null,
        remarks: null,
        rejectedBy: null,
        rejectedRole: null,
        rejectedAt: null,
        rejectionReason: null
      },
      currentlyInLab: false,
      components: formattedComponents,
      componentHistory: initialHistory,
      labAttendance: [],
      video: null,
      elimination: null,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newGroup, ...groups];
    storage.saveGroups(updated);
    return newGroup;
  },

  addMemberToGroup: (groupId, memberData, user) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return { error: 'Group not found.' };

    const group = groups[index];
    const newRoll = memberData.rollNo?.trim().toUpperCase();

    // 1. Check if already in current group
    if (group.leader?.rollNo?.toUpperCase() === newRoll) {
      return { error: `Roll No. "${newRoll}" is group ke Leader ka roll number hai!` };
    }
    if ((group.members || []).some(m => m.rollNo?.toUpperCase() === newRoll)) {
      return { error: `Roll No. "${newRoll}" pehle se hi is group me registered hai!` };
    }

    // 2. Strict Rule: Verify member is not active in another incomplete group
    const activeCheck = storage.checkMemberActiveGroup(newRoll, groupId);
    if (activeCheck.isEnrolled) {
      return {
        error: `Roll No. "${newRoll}" already active group "${activeCheck.groupName}" me enrolled hai! Ek member dusre group me tab tak add nahi ho sakta jab tak unka pehla project complete na ho jaye.`
      };
    }

    const newMember = {
      id: `mem-${Date.now()}`,
      name: memberData.name.trim(),
      rollNo: newRoll,
      role: memberData.role ? memberData.role.trim() : 'Team Member'
    };

    const updatedMembers = [...(group.members || []), newMember];
    group.members = updatedMembers;
    groups[index] = group;
    storage.saveGroups(groups);
    return { success: true, updatedGroup: group };
  },

  updateGroupDetailsByLeader: (groupId, updates, user) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];

    // Only Leader can edit group details, and only allowed fields
    const updated = {
      ...group,
      projectTitle: updates.projectTitle !== undefined ? updates.projectTitle : group.projectTitle,
      realLifeProblem: updates.realLifeProblem !== undefined ? updates.realLifeProblem : group.realLifeProblem,
      realLifeApplication: updates.realLifeApplication !== undefined ? updates.realLifeApplication : group.realLifeApplication,
      members: updates.members !== undefined ? updates.members : group.members
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  addComponent: (groupId, componentData, user) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const newCompId = `comp-${Date.now()}`;
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const newComponent = {
      id: newCompId,
      name: componentData.name.trim(),
      qty: parseInt(componentData.qty, 10) || 1,
      specs: componentData.specs?.trim() || 'Standard Component',
      purpose: componentData.purpose?.trim() || 'Project functional requirement',
      status: 'active',
      addedBy: `${user.name} (${user.rollNo || user.roleLabel || user.role})`,
      addedAt: timestamp
    };

    const historyEntry = {
      id: `ch-${Date.now()}`,
      action: 'ADDED',
      componentName: `${newComponent.name} (${newComponent.qty} Qty)`,
      authorName: user.name,
      authorRole: user.rollNo ? `Student (${user.rollNo})` : user.roleLabel || user.role,
      reason: componentData.purpose || 'Added new requirement to lab project',
      timestamp
    };

    const updated = {
      ...group,
      components: [...group.components, newComponent],
      componentHistory: [historyEntry, ...group.componentHistory]
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  replaceComponent: (groupId, oldComponentId, newComponentData, reason, user) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const oldIndex = group.components.findIndex((c) => c.id === oldComponentId);
    if (oldIndex === -1) return null;

    const oldComp = group.components[oldIndex];
    const newCompId = `comp-${Date.now()}`;
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    // Mark old as replaced
    const updatedComponents = [...group.components];
    updatedComponents[oldIndex] = {
      ...oldComp,
      status: 'replaced',
      replacedBy: newCompId
    };

    // Add replacement component
    const replacementComponent = {
      id: newCompId,
      name: newComponentData.name.trim(),
      qty: parseInt(newComponentData.qty, 10) || oldComp.qty,
      specs: newComponentData.specs?.trim() || oldComp.specs,
      purpose: `Replaces ${oldComp.name}: ${reason}`,
      status: 'active',
      addedBy: `${user.name} (${user.rollNo || user.roleLabel || user.role})`,
      addedAt: timestamp
    };

    updatedComponents.push(replacementComponent);

    const historyEntry = {
      id: `ch-${Date.now()}`,
      action: 'REPLACED',
      componentName: `${replacementComponent.name} (Replaced: ${oldComp.name})`,
      previousComponent: oldComp.name,
      authorName: user.name,
      authorRole: user.rollNo ? `Member (${user.rollNo})` : user.roleLabel || user.role,
      reason: reason || 'Component upgrade or substitution',
      timestamp
    };

    const updated = {
      ...group,
      components: updatedComponents,
      componentHistory: [historyEntry, ...group.componentHistory]
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  // Faculty or HOD ONLY
  eliminateComponent: (groupId, componentId, reason, facultyUser) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const compIndex = group.components.findIndex((c) => c.id === componentId);
    if (compIndex === -1) return null;

    const comp = group.components[compIndex];
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const updatedComponents = [...group.components];
    updatedComponents[compIndex] = {
      ...comp,
      status: 'eliminated',
      eliminatedBy: `${facultyUser.name} (${facultyUser.roleLabel || facultyUser.role})`,
      eliminatedReason: reason
    };

    const historyEntry = {
      id: `ch-${Date.now()}`,
      action: 'ELIMINATED',
      componentName: comp.name,
      authorName: facultyUser.name,
      authorRole: facultyUser.roleLabel || (facultyUser.role === 'hod' ? 'Head of Department (HOD)' : 'Faculty Member'),
      reason: reason || 'Eliminated due to lab compliance or academic review',
      timestamp
    };

    const updated = {
      ...group,
      components: updatedComponents,
      componentHistory: [historyEntry, ...group.componentHistory]
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  // Faculty or HOD ONLY: Eliminate an entire group
  eliminateGroup: (groupId, reason, facultyUser) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const updated = {
      ...group,
      status: 'eliminated',
      currentlyInLab: false,
      elimination: {
        eliminatedBy: facultyUser.name,
        role: facultyUser.roleLabel || facultyUser.role,
        reason: reason || 'Administrative decision by Department Board',
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      }
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  // Faculty or HOD ONLY: Approve group application so it officially forms & enters in-progress status
  approveGroup: (groupId, remarks, facultyUser) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const updated = {
      ...group,
      status: 'in-progress',
      approval: {
        ...(group.approval || {}),
        approvedBy: facultyUser.name,
        approvedRole: facultyUser.roleLabel || (facultyUser.role === 'hod' ? 'Head of Department (HOD)' : 'Faculty Project Guide'),
        approvedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        remarks: remarks || 'Project proposal approved for laboratory prototyping & hardware fabrication.'
      }
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  // Faculty or HOD ONLY: Decline/Reject group application
  rejectGroup: (groupId, reason, facultyUser) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const updated = {
      ...group,
      status: 'rejected',
      currentlyInLab: false,
      approval: {
        ...(group.approval || {}),
        rejectedBy: facultyUser.name,
        rejectedRole: facultyUser.roleLabel || (facultyUser.role === 'hod' ? 'Head of Department (HOD)' : 'Faculty Project Guide'),
        rejectedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        rejectionReason: reason || 'Project proposal does not meet hardware lab research criteria.'
      }
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  restoreGroup: (groupId) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const updated = {
      ...group,
      status: 'in-progress',
      elimination: null
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  // Check In to R&D Lab
  checkInToLab: (groupId, attendedMembers, activityPlan, user) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toISOString().split('T')[0];

    const newAttendance = {
      id: `att-${Date.now()}`,
      date: dateStr,
      checkInTime: timeStr,
      checkOutTime: null, // Active
      hours: null,
      activity: activityPlan || 'Lab hardware assembly & prototyping session',
      attendedMembers: attendedMembers && attendedMembers.length > 0 ? attendedMembers : [user.name],
      verifiedBy: 'Active Session'
    };

    const updated = {
      ...group,
      currentlyInLab: true,
      labAttendance: [newAttendance, ...group.labAttendance]
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  // Check Out from R&D Lab
  checkOutFromLab: (groupId, attendanceId, workDoneNotes) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const attList = [...group.labAttendance];
    const targetIdx = attList.findIndex((a) => a.id === attendanceId || a.checkOutTime === null);
    if (targetIdx === -1) return null;

    const target = attList[targetIdx];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    attList[targetIdx] = {
      ...target,
      checkOutTime: timeStr,
      hours: 3.5,
      activity: workDoneNotes ? `${target.activity} | Work done: ${workDoneNotes}` : target.activity,
      verifiedBy: 'Logged & Stamped'
    };

    const updated = {
      ...group,
      currentlyInLab: false,
      labAttendance: attList
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  // Project Completion & Video submission
  completeProject: (groupId, videoData) => {
    const groups = storage.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);
    if (index === -1) return null;

    const group = groups[index];
    const updated = {
      ...group,
      status: 'completed',
      currentlyInLab: false,
      completedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium' }),
      video: videoData || group.video
    };

    groups[index] = updated;
    storage.saveGroups(groups);
    return updated;
  },

  getCurrentUser: () => {
    try {
      if (isBrowser) {
        // Clear legacy fake persona users
        if (localStorage.getItem('dronacharya_rd_current_user_v1')) {
          localStorage.removeItem('dronacharya_rd_current_user_v1');
        }
        if (localStorage.getItem('dronacharya_rd_current_user_v2')) {
          localStorage.removeItem('dronacharya_rd_current_user_v2');
        }

        const data = localStorage.getItem(STORAGE_KEY_USER);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object' && parsed.name && parsed.role) {
            return parsed;
          }
        }
        return null; // No default fake persona! Must be manually authenticated.
      }
    } catch (e) {
      console.error('Error reading current user:', e);
      return null;
    }
    return null;
  },

  setCurrentUser: (user) => {
    try {
      if (isBrowser) {
        if (user) {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEY_USER);
        }
      } else {
        if (user) {
          memoryStore[STORAGE_KEY_USER] = JSON.stringify(user);
        } else {
          delete memoryStore[STORAGE_KEY_USER];
        }
      }
    } catch (e) {
      console.error(e);
    }
  },

  getFacultyRoster: () => {
    try {
      if (isBrowser) {
        const data = localStorage.getItem(STORAGE_KEY_FACULTY_ROSTER);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed && Array.isArray(parsed.hodEmails) && Array.isArray(parsed.facultyEmails)) {
            return parsed;
          }
        }
        localStorage.setItem(STORAGE_KEY_FACULTY_ROSTER, JSON.stringify(DEFAULT_FACULTY_ROSTER));
      }
    } catch (e) {
      console.error('Error reading faculty roster:', e);
    }
    return DEFAULT_FACULTY_ROSTER;
  },

  saveFacultyRoster: (roster) => {
    try {
      if (isBrowser) {
        localStorage.setItem(STORAGE_KEY_FACULTY_ROSTER, JSON.stringify(roster));
      }
    } catch (e) {
      console.error('Error saving faculty roster:', e);
    }
  },

  verifyEmailRole: (email) => {
    if (!email || typeof email !== 'string') return { isAuthorized: false, role: 'guest' };
    const cleanEmail = email.trim().toLowerCase();
    const roster = storage.getFacultyRoster();

    // 1. Check HOD list
    const hodMatch = (roster.hodEmails || []).find(
      (h) => h.email && h.email.trim().toLowerCase() === cleanEmail
    );
    if (hodMatch) {
      return {
        isAuthorized: true,
        role: 'hod',
        roleLabel: 'Head of Department (HOD) - Dr. D.C. Dhubkarya',
        name: hodMatch.name || 'Dr. D.C. Dhubkarya',
        department: hodMatch.department || 'Department of Electronics & Communication Engg.',
        designation: 'Head of Department & Professor',
        canEliminateGroups: true,
        canEliminateComponents: true,
        canApproveGroups: true
      };
    }

    // 2. Check Faculty list
    const facMatch = (roster.facultyEmails || []).find(
      (f) => f.email && f.email.trim().toLowerCase() === cleanEmail
    );
    if (facMatch) {
      return {
        isAuthorized: true,
        role: 'faculty',
        roleLabel: 'Faculty Project Guide - Dr. Shahnaj Ayub',
        name: facMatch.name || 'Dr. Shahnaj Ayub',
        department: facMatch.department || 'Department of Electronics & Communication Engg.',
        designation: 'Professor & Faculty Project Guide',
        canEliminateGroups: true,
        canEliminateComponents: true,
        canApproveGroups: true
      };
    }

    // Not in Faculty/HOD list -> Regular student (Leader or Member)
    return {
      isAuthorized: false,
      role: 'student'
    };
  },

  resetAllData: () => {
    if (isBrowser) {
      localStorage.removeItem(STORAGE_KEY_GROUPS);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem('dronacharya_rd_groups_v1');
      localStorage.removeItem('dronacharya_rd_groups_v2');
      localStorage.removeItem('dronacharya_rd_current_user_v1');
      localStorage.removeItem('dronacharya_rd_current_user_v2');
    }
    memoryStore = {};
    return storage.getGroups();
  }
};
