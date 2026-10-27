import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());

  useEffect(() => {
    storage.setCurrentUser(currentUser);
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    storage.setCurrentUser(null);
  };

  // Login via Email (Automatic HOD / Faculty Recognition)
  const loginByEmail = ({ email, name, rollNo, studentRole }) => {
    const cleanEmail = email.trim().toLowerCase();
    const verified = storage.verifyEmailRole(cleanEmail);
    let newUser;

    if (verified.isAuthorized) {
      // Recognized via Whitelist as Faculty or HOD!
      newUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: name?.trim() || verified.name,
        role: verified.role,
        roleLabel: verified.roleLabel,
        department: verified.department,
        designation: verified.designation,
        canEliminateGroups: true,
        canEliminateComponents: true,
        canApproveGroups: true,
        authenticatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      };
    } else {
      // Recognized as Student (Group Leader or Team Member)
      const isLeader = studentRole === 'leader';
      newUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: name.trim(),
        role: isLeader ? 'leader' : 'member',
        roleLabel: isLeader ? 'Project Group Leader' : 'Research Team Member',
        rollNo: rollNo?.trim().toUpperCase(),
        department: 'Department of Electronics & Communication Engg.',
        designation: isLeader ? 'Student Project Lead' : 'Research Team Member',
        canEliminateGroups: false,
        canEliminateComponents: false,
        canApproveGroups: false,
        authenticatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      };
    }

    setCurrentUser(newUser);
    return newUser;
  };

  const loginCustom = ({ name, email, rollNo, role, idNumber, department, designation }) => {
    // If an email is provided, check if it matches Faculty / HOD roster
    let resolvedRole = role;
    let canEliminate = role === 'hod' || role === 'faculty';

    if (email) {
      const verified = storage.verifyEmailRole(email);
      if (verified.isAuthorized) {
        resolvedRole = verified.role;
        canEliminate = true;
      }
    }

    const roleLabels = {
      hod: 'Head of Department (HOD)',
      faculty: 'Faculty Project Guide / Supervisor',
      leader: 'Project Group Leader',
      member: 'Research Team Member',
      guest: 'Academic Observer / Viewer'
    };

    const newUser = {
      id: `usr-${Date.now()}`,
      email: email ? email.trim().toLowerCase() : null,
      name: name.trim(),
      role: resolvedRole,
      roleLabel: roleLabels[resolvedRole] || 'Institutional User',
      rollNo: (resolvedRole === 'leader' || resolvedRole === 'member') ? rollNo?.trim().toUpperCase() : null,
      idNumber: (resolvedRole === 'faculty' || resolvedRole === 'hod') ? idNumber?.trim().toUpperCase() : null,
      department: department?.trim() || 'Department of Electronics & Communication Engg.',
      designation: designation?.trim() || (resolvedRole === 'hod' ? 'Head of Department' : resolvedRole === 'faculty' ? 'Associate Professor' : 'Student Researcher'),
      canEliminateGroups: canEliminate,
      canEliminateComponents: canEliminate,
      canApproveGroups: canEliminate,
      authenticatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    setCurrentUser(newUser);
    return newUser;
  };

  const isAuthenticated = !!currentUser;
  const isHOD = currentUser?.role === 'hod';
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.role === 'hod';
  const canEliminate = isFaculty;

  const isLeaderOf = (group) => {
    if (!group || !currentUser) return false;
    if (currentUser.role !== 'leader') return false;
    // Match by Leader Email
    if (currentUser.email && group.leader?.email && currentUser.email.trim().toLowerCase() === group.leader.email.trim().toLowerCase()) {
      return true;
    }
    // Match by Roll Number
    if (currentUser.rollNo && group.leader?.rollNo && currentUser.rollNo.toUpperCase() === group.leader.rollNo.toUpperCase()) {
      return true;
    }
    // Match by Name
    if (currentUser.name && group.leader?.name && currentUser.name.trim().toLowerCase() === group.leader.name.trim().toLowerCase()) {
      return true;
    }
    return false;
  };

  const isMemberOf = (group) => {
    if (!group || !currentUser) return false;
    if (isLeaderOf(group)) return true;
    if (!currentUser.rollNo) return false;
    return (group.members || []).some(
      (m) => m.rollNo && m.rollNo.toUpperCase() === currentUser.rollNo.toUpperCase()
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        logout,
        loginByEmail,
        loginCustom,
        isHOD,
        isFaculty,
        canEliminate,
        isLeaderOf,
        isMemberOf
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
