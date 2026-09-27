/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SchoolInfo, PostItem, PostCategory, AdminUser, PersonnelMember, FacilityItem, HLISettings, HLIFile } from './types';
import { DEFAULT_SCHOOL_INFO, INITIAL_POSTS, DEFAULT_PERSONNEL_LIST, DEFAULT_FACILITIES } from './data/initialData';
import { DEFAULT_HLI_DATA } from './data/hliData';
import { SchoolHeader } from './components/SchoolHeader';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { SchoolCrest, formatLogoUrl } from './components/SchoolCrest';
import { PostCard } from './components/PostCard';
import { PostDetailModal } from './components/PostDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPostModal } from './components/AdminPostModal';
import { AdminLogoModal } from './components/AdminLogoModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { PersonnelPedigreeModal } from './components/PersonnelPedigreeModal';
import { FacilityModal } from './components/FacilityModal';
import { SchoolProfile } from './components/SchoolProfile';
import { HealthyLearningInstitute } from './components/HealthyLearningInstitute';
import { SchoolStatisticsSection } from './components/SchoolStatisticsSection';
import { AcademicPrograms } from './components/AcademicPrograms';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { PlusCircle, Image as ImageIcon, Settings, LogOut, Filter, Newspaper, Bell, Sparkles, Check, GitBranch, Cloud, Building2, Trash2, HeartPulse } from 'lucide-react';
import { testConnection, auth, isQuotaExceededError } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  subscribeToPosts,
  savePostToFirestore,
  deletePostFromFirestore,
  subscribeToSchoolInfo,
  saveSchoolInfoToFirestore,
  subscribeToPersonnel,
  savePersonnelToFirestore,
  subscribeToAdminPassword,
  saveAdminPasswordToFirestore,
  subscribeToFacilities,
  saveFacilitiesToFirestore,
  subscribeToHLI,
  saveHLIToFirestore,
  subscribeToHLIFiles,
  saveHLIFileToCloud,
  deleteHLIFileFromCloud,
} from './services/firestoreService';

const CATEGORY_TABS: (PostCategory | 'All')[] = [
  'All',
  'Announcements',
  'Advisories & Memos',
  'Campus Events',
  'Achievements',
  'Academic Updates',
];

export default function App() {
  // 1. Persistent State for School Info
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    const saved = localStorage.getItem('vis_school_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.announcementTicker && /guidance\s+office/i.test(parsed.announcementTicker)) {
          parsed.announcementTicker = parsed.announcementTicker.replace(/guidance\s+office/gi, 'admin office');
        }
        return { ...DEFAULT_SCHOOL_INFO, ...parsed };
      } catch (e) {
        console.error('Failed to parse school info', e);
      }
    }
    return DEFAULT_SCHOOL_INFO;
  });

  // 2. Persistent State for School Posts
  const [posts, setPosts] = useState<PostItem[]>(() => {
    const saved = localStorage.getItem('vis_school_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map((p: PostItem) => {
            const initial = INITIAL_POSTS.find((ip) => ip.id === p.id);
            if (initial) {
              const combinedTags = Array.from(new Set([...(p.tags || []), ...(initial.tags || [])]));
              return {
                ...p,
                tags: combinedTags,
                galleryImages: (p.galleryImages && p.galleryImages.length > 0) ? p.galleryImages : initial.galleryImages,
                imageUrl: p.imageUrl || initial.imageUrl,
              };
            }
            return p;
          });
          const existingIds = new Set(merged.map((p: PostItem) => p.id));
          const missingInitial = INITIAL_POSTS.filter((ip) => !existingIds.has(ip.id));
          return [...merged, ...missingInitial];
        }
      } catch (e) {
        console.error('Failed to parse posts', e);
      }
    }
    return INITIAL_POSTS;
  });

  // 3. Persistent State for Admin Session
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('vis_admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // 4. Admin Password
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('vis_admin_pass') || 'vis502996';
  });

  // UI state
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<FacilityItem | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<FacilityItem | null>(null);

  // 5. Persistent State for Campus Learning Facilities
  const [facilities, setFacilities] = useState<FacilityItem[]>(() => {
    const saved = localStorage.getItem('vis_school_facilities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse facilities from localStorage', e);
      }
    }
    return DEFAULT_FACILITIES;
  });

  // 6. Persistent State for School Personnel (Pedigree Roster)
  const [personnelList, setPersonnelList] = useState<PersonnelMember[]>(() => {
    const saved = localStorage.getItem('vis_school_personnel');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if District Administrative Officer below PSDS exists in existing storage
          const hasDistrictAO = parsed.some(
            (p: PersonnelMember) =>
              p.id === 'personnel-district-admin-officer' ||
              (p.reportsToId === 'personnel-psds' &&
                (p.category === 'admin_officer' ||
                  p.position?.toLowerCase().includes('admin')))
          );
          let currentList = parsed;
          if (!hasDistrictAO) {
            const districtAO = DEFAULT_PERSONNEL_LIST.find(
              (p) => p.id === 'personnel-district-admin-officer'
            );
            if (districtAO) {
              currentList = [
                ...parsed.slice(0, 1),
                districtAO,
                ...parsed.slice(1)
              ];
            }
          }
          // Enrich any members without photoUrl with matching default photos
          const enriched = currentList.map((m: PersonnelMember) => {
            if (m.photoUrl) return m;
            const def = DEFAULT_PERSONNEL_LIST.find(
              (d) => d.id === m.id || d.name.toLowerCase() === m.name.toLowerCase()
            );
            return def?.photoUrl ? { ...m, photoUrl: def.photoUrl } : m;
          });
          try {
            localStorage.setItem('vis_school_personnel', JSON.stringify(enriched));
          } catch (e) {
            console.error(e);
          }
          return enriched;
        }
      } catch (e) {
        console.error('Failed to parse personnel list', e);
      }
    }
    return DEFAULT_PERSONNEL_LIST;
  });

  // 7. Persistent State for Healthy Learning Institute (HLI) 6 Pillars
  const [hliData, setHliData] = useState<HLISettings>(() => {
    const saved = localStorage.getItem('vis_school_hli');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.pillars) && parsed.pillars.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse HLI data from localStorage', e);
      }
    }
    return DEFAULT_HLI_DATA;
  });

  // Real-time Cloud Files repository for Healthy Learning Institute (HLI)
  const [hliCloudFiles, setHliCloudFiles] = useState<HLIFile[]>([]);
  const [hasCloudFilesLoaded, setHasCloudFilesLoaded] = useState<boolean>(false);

  // Toast notification & Cloud Connection status
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time Firestore Cloud Database Synchronization
  useEffect(() => {
    // 1. Test Firestore Cloud Connection on application startup
    testConnection();

    // 2. Real-time subscription to Posts collection
    const unsubPosts = subscribeToPosts(
      (livePosts) => {
        setPosts(livePosts);
        setIsCloudConnected(true);
      },
      (err) => {
        console.warn('Firestore posts live sync fallback:', err);
      }
    );

    // 3. Real-time subscription to School Info & Profile
    const unsubSchoolInfo = subscribeToSchoolInfo(
      (liveInfo) => {
        setSchoolInfo(liveInfo);
        setIsCloudConnected(true);
      },
      (err) => {
        console.warn('Firestore schoolInfo live sync fallback:', err);
      }
    );

    // 4. Real-time subscription to Personnel Directory
    const unsubPersonnel = subscribeToPersonnel(
      (livePersonnel) => {
        if (Array.isArray(livePersonnel) && livePersonnel.length > 0) {
          setPersonnelList(livePersonnel);
          setIsCloudConnected(true);
          try {
            localStorage.setItem('vis_school_personnel', JSON.stringify(livePersonnel));
          } catch (e) {
            console.error('Failed to cache live personnel to localStorage', e);
          }
        }
      },
      (err) => {
        console.warn('Firestore personnel live sync fallback:', err);
      }
    );

    // 5. Real-time subscription to Admin Security Password
    const unsubSecurity = subscribeToAdminPassword(
      (livePassword) => {
        if (livePassword && livePassword.trim().length > 0) {
          setAdminPassword(livePassword.trim());
          localStorage.setItem('vis_admin_pass', livePassword.trim());
        }
      },
      (err) => {
        console.warn('Firestore security live sync fallback:', err);
      }
    );

    // 6. Real-time subscription to Campus Learning Facilities
    const unsubFacilities = subscribeToFacilities(
      (liveFacilities) => {
        if (liveFacilities && Array.isArray(liveFacilities)) {
          setFacilities(liveFacilities);
          setIsCloudConnected(true);
          try {
            localStorage.setItem('vis_school_facilities', JSON.stringify(liveFacilities));
          } catch (e) {
            console.error('Failed to cache facilities to localStorage', e);
          }
        }
      },
      (err) => {
        console.warn('Firestore facilities live sync fallback:', err);
      }
    );

    // 7. Real-time subscription to Healthy Learning Institute (HLI) 6 Pillars
    const unsubHLI = subscribeToHLI(
      (liveHLI) => {
        if (liveHLI && Array.isArray(liveHLI.pillars) && liveHLI.pillars.length > 0) {
          setHliData(liveHLI);
          setIsCloudConnected(true);
          try {
            localStorage.setItem('vis_school_hli', JSON.stringify(liveHLI));
          } catch (e) {
            console.error('Failed to cache HLI data to localStorage', e);
          }
        }
      },
      (err) => {
        console.warn('Firestore HLI live sync fallback:', err);
      }
    );

    // 8. Real-time subscription to Healthy Learning Institute Cloud Files for all users
    const unsubHLIFiles = subscribeToHLIFiles(
      (liveFiles) => {
        if (liveFiles && Array.isArray(liveFiles)) {
          setHliCloudFiles(liveFiles);
          setHasCloudFilesLoaded(true);
          setIsCloudConnected(true);
        }
      },
      (err) => {
        console.warn('Firestore HLI files live sync fallback:', err);
      }
    );

    // 9. Listen to Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAdminUser((prev) => {
          if (prev) return prev;
          return {
            username: firebaseUser.email?.split('@')[0] || 'admin',
            role: 'School Administrator',
            displayName: firebaseUser.displayName || 'School Head / Administrator',
            email: firebaseUser.email || 'vinisitahangdrive@gmail.com',
          };
        });
      }
    });

    return () => {
      unsubPosts();
      unsubSchoolInfo();
      unsubPersonnel();
      unsubSecurity();
      unsubFacilities();
      unsubHLI();
      unsubHLIFiles();
      unsubAuth();
    };
  }, []);

  // Sync to LocalStorage as resilient client-side cache
  useEffect(() => {
    try {
      localStorage.setItem('vis_school_info', JSON.stringify(schoolInfo));
    } catch (e) {
      console.error('Failed to cache school info to localStorage', e);
    }

    // Dynamically synchronize favicon with active school logo
    const faviconEl = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const appleFaviconEl = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (faviconEl) {
      if (schoolInfo.logoUrl && schoolInfo.logoUrl.trim().length > 0) {
        faviconEl.href = schoolInfo.logoUrl;
      } else {
        faviconEl.href = '/favicon.svg?v=2';
      }
    }
    if (appleFaviconEl) {
      if (schoolInfo.logoUrl && schoolInfo.logoUrl.trim().length > 0) {
        appleFaviconEl.href = schoolInfo.logoUrl;
      } else {
        appleFaviconEl.href = '/favicon.svg?v=2';
      }
    }
  }, [schoolInfo]);

  useEffect(() => {
    try {
      localStorage.setItem('vis_school_posts', JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to cache posts to localStorage', e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('vis_school_personnel', JSON.stringify(personnelList));
    } catch (e) {
      console.error('Failed to cache personnel list to localStorage', e);
    }
  }, [personnelList]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('vis_admin_session', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('vis_admin_session');
    }
  }, [adminUser]);

  useEffect(() => {
    localStorage.setItem('vis_admin_pass', adminPassword);
  }, [adminPassword]);

  // Handle Admin Login & Logout
  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    showToast(`Welcome, Administrator (${user.displayName})`);
  };

  const handleLogout = async () => {
    setAdminUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    showToast('Administrator signed out successfully.');
  };

  // Handle Post Actions (Cloud Firestore + Local State)
  const handleSavePost = async (savedPost: PostItem) => {
    setPosts((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === savedPost.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedPost;
        return updated;
      } else {
        return [savedPost, ...prev];
      }
    });
    setEditingPost(null);
    showToast(editingPost ? 'Post updated successfully!' : 'New post published successfully!');

    try {
      await savePostToFirestore(savedPost);
    } catch (err) {
      console.warn('Failed to sync post to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast('Post saved locally! Cloud sync will resume once daily quota resets.');
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Post removed from school bulletin.');

    try {
      await deletePostFromFirestore(postId);
    } catch (err) {
      console.warn('Failed to delete post from Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast('Post removed locally! Cloud sync will resume once daily quota resets.');
      }
    }
  };

  const handleEditPost = (post: PostItem) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  // Handle Logo Update (Cloud Firestore + Local State)
  const handleSaveLogo = async (newLogoUrl: string | null) => {
    const formattedUrl = formatLogoUrl(newLogoUrl);
    const updated = {
      ...schoolInfo,
      logoUrl: formattedUrl,
    };
    setSchoolInfo(updated);
    showToast(formattedUrl ? 'School logo updated successfully!' : 'School seal reset to official vector crest.');

    try {
      await saveSchoolInfoToFirestore(updated);
    } catch (err) {
      console.warn('Failed to sync logo to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast('Logo saved locally! Daily cloud quota reached.');
      }
    }
  };

  // Handle School Settings Update (Cloud Firestore + Local State)
  const handleSaveSettings = async (updated: SchoolInfo) => {
    const formatted: SchoolInfo = {
      ...updated,
      logoUrl: formatLogoUrl(updated.logoUrl),
    };
    setSchoolInfo(formatted);
    showToast('School profile details updated successfully.');

    try {
      await saveSchoolInfoToFirestore(formatted);
    } catch (err) {
      console.warn('Failed to sync settings to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast('Settings saved locally! Daily cloud quota reached.');
      }
    }
  };

  // Handle Password Update (Cloud Firestore + Local State)
  // Ensures new password immediately syncs to Cloud Firestore so old & default passwords cannot be used
  const handleUpdatePassword = async (newPass: string) => {
    const clean = newPass.trim();
    setAdminPassword(clean);
    localStorage.setItem('vis_admin_pass', clean);
    showToast('Administrator security password updated.');

    try {
      await saveAdminPasswordToFirestore(clean);
      showToast('New password saved to Cloud Firestore.');
    } catch (err) {
      console.warn('Failed to sync password to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast('Password saved locally in active session. Daily cloud quota reached.');
      }
    }
  };

  // Synchronize dynamic faculty counts with School Profile Statistics
  const syncPersonnelCountsToSchoolInfo = (updatedList: PersonnelMember[]) => {
    const teachers = updatedList.filter(
      (m) => m.category === 'elementary' || m.category === 'secondary'
    ).length;
    const nonTeachers = updatedList.filter(
      (m) =>
        m.category === 'non_teaching' ||
        m.category === 'admin_officer' ||
        m.category === 'district_admin_officer'
    ).length;

    setSchoolInfo((prev) => {
      const updated = {
        ...prev,
        teachersCount: teachers,
        nonTeachersCount: nonTeachers,
      };
      saveSchoolInfoToFirestore(updated).catch((err) => {
        console.warn('Background sync of school stats to Firestore:', err);
      });
      return updated;
    });
  };

  // Personnel Handlers (Cloud Firestore + Local State)
  const handleSavePersonnelMember = async (savedMember: PersonnelMember) => {
    let updated: PersonnelMember[];
    const existsIndex = personnelList.findIndex((p) => p.id === savedMember.id);
    if (existsIndex >= 0) {
      updated = [...personnelList];
      updated[existsIndex] = savedMember;
    } else {
      updated = [...personnelList, savedMember];
    }
    setPersonnelList(updated);
    try {
      localStorage.setItem('vis_school_personnel', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    syncPersonnelCountsToSchoolInfo(updated);

    try {
      await savePersonnelToFirestore(updated);
      setIsCloudConnected(true);
      showToast(`Personnel record for "${savedMember.name}" saved.`);
    } catch (err) {
      console.warn('Failed to sync personnel to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast(`Saved locally! Cloud sync will resume once daily quota resets.`);
      } else {
        showToast('Warning: Saved locally, but Firestore sync encountered an issue.');
      }
    }
  };

  const handleDeletePersonnelMember = async (memberId: string) => {
    const memberToDelete = personnelList.find((p) => p.id === memberId);
    const memberName = memberToDelete?.name || 'Personnel member';
    const updated = personnelList.filter((p) => p.id !== memberId);
    setPersonnelList(updated);
    try {
      localStorage.setItem('vis_school_personnel', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    syncPersonnelCountsToSchoolInfo(updated);

    try {
      await savePersonnelToFirestore(updated);
      setIsCloudConnected(true);
      showToast(`"${memberName}" deleted.`);
    } catch (err) {
      console.warn('Failed to sync personnel deletion to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast(`"${memberName}" deleted locally. Daily cloud quota reached.`);
      } else {
        showToast('Warning: Removed locally, but Firestore sync encountered an issue.');
      }
    }
  };

  const handleImportPersonnel = async (newMembers: PersonnelMember[], mode: 'replace' | 'append') => {
    let updated: PersonnelMember[];
    if (mode === 'replace') {
      updated = newMembers;
    } else {
      const existingIds = new Set(personnelList.map((m) => m.id));
      const filteredNew = newMembers.filter((m) => !existingIds.has(m.id));
      updated = [...personnelList, ...filteredNew];
    }
    setPersonnelList(updated);
    try {
      localStorage.setItem('vis_school_personnel', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    syncPersonnelCountsToSchoolInfo(updated);

    try {
      await savePersonnelToFirestore(updated);
      setIsCloudConnected(true);
      showToast(`Successfully imported ${newMembers.length} records.`);
    } catch (err) {
      console.warn('Failed to sync imported personnel to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast(`Imported ${newMembers.length} records locally! Daily cloud quota reached.`);
      } else {
        showToast('Error syncing imported records to Cloud Database.');
      }
    }
  };

  const handleResetPersonnelToDefault = async () => {
    setPersonnelList(DEFAULT_PERSONNEL_LIST);
    try {
      localStorage.setItem('vis_school_personnel', JSON.stringify(DEFAULT_PERSONNEL_LIST));
    } catch (e) {
      console.warn(e);
    }
    syncPersonnelCountsToSchoolInfo(DEFAULT_PERSONNEL_LIST);

    try {
      await savePersonnelToFirestore(DEFAULT_PERSONNEL_LIST);
      setIsCloudConnected(true);
      showToast('Faculty & staff roster reset.');
    } catch (err) {
      console.warn('Failed to sync default personnel to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast('Faculty & staff roster reset locally! Daily cloud quota reached.');
      } else {
        showToast('Error syncing default records to Cloud Database.');
      }
    }
  };

  // 7. Campus Learning Facilities Handlers
  const handleOpenAddFacility = () => {
    setEditingFacility(null);
    setIsFacilityModalOpen(true);
  };

  const handleOpenEditFacility = (facility: FacilityItem) => {
    setEditingFacility(facility);
    setIsFacilityModalOpen(true);
  };

  const handleSaveFacility = async (facility: FacilityItem) => {
    let updatedList: FacilityItem[];
    const exists = facilities.some((f) => f.id === facility.id);
    if (exists) {
      updatedList = facilities.map((f) => (f.id === facility.id ? facility : f));
      showToast(`Facility "${facility.title}" updated successfully.`);
    } else {
      updatedList = [...facilities, facility];
      showToast(`Facility "${facility.title}" added to campus.`);
    }
    setFacilities(updatedList);
    try {
      localStorage.setItem('vis_school_facilities', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }

    try {
      await saveFacilitiesToFirestore(updatedList);
    } catch (err) {
      console.warn('Failed to sync facilities to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast(`Saved locally! Daily cloud quota reached.`);
      }
    }
  };

  const handleDeleteFacility = (facility: FacilityItem) => {
    setFacilityToDelete(facility);
  };

  const confirmDeleteFacility = async () => {
    if (!facilityToDelete) return;
    const targetTitle = facilityToDelete.title;
    const updatedList = facilities.filter((f) => f.id !== facilityToDelete.id);

    setFacilities(updatedList);
    setFacilityToDelete(null);
    showToast(`Facility "${targetTitle}" removed from campus.`);

    try {
      localStorage.setItem('vis_school_facilities', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }

    try {
      await saveFacilitiesToFirestore(updatedList);
    } catch (err) {
      console.warn('Failed to sync facility deletion to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast('Removed locally! Daily cloud quota reached.');
      }
    }
  };

  const handleResetFacilities = async () => {
    setFacilities(DEFAULT_FACILITIES);
    try {
      localStorage.setItem('vis_school_facilities', JSON.stringify(DEFAULT_FACILITIES));
      await saveFacilitiesToFirestore(DEFAULT_FACILITIES);
      showToast('Reset facilities to standard DepEd learning centers.');
    } catch (e) {
      console.warn('Failed to sync default facilities to Firestore:', e);
      if (isQuotaExceededError(e)) {
        showToast('Reset facilities locally! Daily cloud quota reached.');
      }
    }
  };

  // Healthy Learning Institute (HLI) Updates
  const handleUpdateHLIData = async (updatedHLI: HLISettings) => {
    setHliData(updatedHLI);
    try {
      localStorage.setItem('vis_school_hli', JSON.stringify(updatedHLI));
    } catch (e) {
      console.error('Failed to cache HLI to localStorage', e);
    }

    try {
      await saveHLIToFirestore(updatedHLI);
      setIsCloudConnected(true);
    } catch (err) {
      console.warn('Failed to sync HLI data to Firestore:', err);
      if (isQuotaExceededError(err)) {
        showToast('HLI changes saved locally! Daily cloud quota reached.');
      } else {
        showToast('HLI changes saved locally (Cloud sync pending)');
      }
    }
  };

  // Healthy Learning Institute (HLI) Real-time Cloud File Handlers
  const handleUploadHLIFileToCloud = async (pillarId: string, newFile: HLIFile) => {
    showToast(`Uploading "${newFile.name}" to Cloud Firestore...`);
    try {
      await saveHLIFileToCloud(pillarId, newFile);
      setIsCloudConnected(true);
      showToast(`"${newFile.name}" is now live in Cloud Firestore for all users.`);
    } catch (err) {
      console.error('Failed to upload HLI file to cloud:', err);
      showToast(`Upload error: Could not sync "${newFile.name}" to cloud.`);
      throw err;
    }
  };

  const handleSaveHLIFileToCloud = async (pillarId: string, updatedFile: HLIFile) => {
    try {
      await saveHLIFileToCloud(pillarId, updatedFile);
      setIsCloudConnected(true);
      showToast(`Updated cloud file permissions for "${updatedFile.name}".`);
    } catch (err) {
      console.error('Failed to update HLI file in cloud:', err);
      showToast(`Error updating cloud file settings.`);
      throw err;
    }
  };

  const handleDeleteHLIFileFromCloud = async (pillarId: string, fileId: string) => {
    try {
      // 1. Permanently delete from Firestore hli_files collection and any subcollection chunks
      await deleteHLIFileFromCloud(fileId);

      // 2. Optimistically remove from state so the UI reflects the deletion immediately
      setHliCloudFiles((prev) => prev.filter((f) => f.id !== fileId));

      // 3. Purge any residual references from hliData.pillars in settings/hli to avoid cloud database bloat
      const updatedHliData: HLISettings = {
        ...hliData,
        pillars: hliData.pillars.map((pillar) => {
          if (pillar.id === pillarId) {
            return {
              ...pillar,
              files: (pillar.files || []).filter((f) => f.id !== fileId),
            };
          }
          return pillar;
        }),
      };
      setHliData(updatedHliData);
      try {
        localStorage.setItem('vis_school_hli', JSON.stringify(updatedHliData));
        await saveHLIToFirestore(updatedHliData);
      } catch (saveErr) {
        console.warn('Syncing updated pillar settings after file purge:', saveErr);
      }

      setIsCloudConnected(true);
      showToast('File and all cloud storage chunks permanently wiped from database.');
    } catch (err) {
      console.error('Failed to delete file from cloud:', err);
      showToast('Error removing file from cloud.');
      throw err;
    }
  };

  // Dynamic composition of HLI pillars combined with real-time cloud files
  const mergedHliData = useMemo(() => {
    return {
      ...hliData,
      pillars: hliData.pillars.map((pillar) => {
        const pillarFiles = hliCloudFiles.filter((f) => f.pillarId === pillar.id);
        return {
          ...pillar,
          // When cloud files repository is active, accurately show the live list of files
          // even if all files under this pillar have been deleted
          files: hasCloudFilesLoaded ? pillarFiles : (pillarFiles.length > 0 ? pillarFiles : (pillar.files || [])),
        };
      }),
    };
  }, [hliData, hliCloudFiles, hasCloudFilesLoaded]);

  // Filtered & Sorted Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCategory = activeCategory === 'All' || p.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)));
      return matchCategory && matchQuery;
    }).sort((a, b) => {
      // Pinned posts come first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then latest date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [posts, activeCategory, searchQuery]);

  const scrollToSection = (id: string) => {
    const targetMap: Record<string, string> = {
      hero: 'hero-carousel-section',
      featured: 'hero-carousel-section',
      posts: 'posts-section',
      statistics: 'statistics-section',
      profile: 'school-profile-section',
      hli: 'hli-section',
      facilities: 'campus-facilities-section',
      academics: 'academics-section',
      contact: 'contact-section',
    };
    const element = document.getElementById(targetMap[id] || id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#edf7ee] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Admin Quick Bar when Logged In */}
      {adminUser && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold shadow-md sticky top-0 z-50 border-b border-amber-600 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
            <span>Logged in as: <strong>{adminUser.role}</strong> ({adminUser.username})</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/70 text-slate-900 border border-slate-900/15 text-[10px] font-bold tracking-wide">
              <Cloud className="w-3 h-3 text-blue-700" />
              <span>Cloud Sync: Active</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-admin-bar-new-post"
              onClick={() => {
                setEditingPost(null);
                setIsPostModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Create Post</span>
            </button>
            <button
              type="button"
              id="btn-admin-bar-logo"
              onClick={() => setIsLogoModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/80 text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer text-xs font-medium"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
              <span>Upload / Change Logo</span>
            </button>
            <button
              type="button"
              id="btn-admin-bar-pedigree"
              onClick={() => setIsPersonnelModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer text-xs font-semibold shadow-xs"
            >
              <GitBranch className="w-3.5 h-3.5 text-amber-300" />
              <span>Faculty Pedigree Roster</span>
            </button>
            <button
              type="button"
              id="btn-admin-bar-facility"
              onClick={handleOpenAddFacility}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors cursor-pointer text-xs font-semibold shadow-xs"
              title="Add or manage campus learning facilities"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-200" />
              <span>+ Facility</span>
            </button>
            <button
              type="button"
              id="btn-admin-bar-hli"
              onClick={() => scrollToSection('hli')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer text-xs font-semibold shadow-xs"
              title="Healthy Learning Institute (HLI) 6 Pillars & Files"
            >
              <HeartPulse className="w-3.5 h-3.5 text-emerald-300" />
              <span>HLI 6 Pillars</span>
            </button>
            <button
              type="button"
              id="btn-admin-bar-settings"
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/80 text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer text-xs font-medium"
            >
              <Settings className="w-3.5 h-3.5 text-slate-700" />
              <span>School Info</span>
            </button>
            <button
              type="button"
              id="btn-admin-bar-logout"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-2 py-1 text-slate-900 hover:text-red-900 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer text-xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main School DepEd Header */}
      <SchoolHeader
        schoolInfo={schoolInfo}
        isAdmin={!!adminUser}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Navigation Bar */}
      <Navbar
        schoolInfo={schoolInfo}
        adminUser={adminUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenNewPost={() => {
          setEditingPost(null);
          setIsPostModalOpen(true);
        }}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenPersonnelModal={() => setIsPersonnelModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeNav="posts"
        onNavClick={scrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section Auto-Playing Image Carousel (Pulls posts tagged as 'featured') */}
        <HeroCarousel
          posts={posts}
          isAdmin={!!adminUser}
          onSelectPost={(post) => setSelectedPost(post)}
          onEditPost={handleEditPost}
          onOpenNewPost={() => {
            setEditingPost(null);
            setIsPostModalOpen(true);
          }}
          schoolInfo={schoolInfo}
        />

        {/* Posts & Announcements Section */}
        <section id="posts-section" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Section Title & Admin "New Post" Callout */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 mb-2">
                <Newspaper className="w-3.5 h-3.5 text-blue-700" />
                School Bulletin Board
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Latest Announcements & School Updates
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Official circulars, advisories, academic schedules, and campus accomplishments for Vinisitahan Integrated School
              </p>
            </div>

            {/* Admin Create Post Button */}
            {adminUser ? (
              <button
                type="button"
                id="btn-create-post-main"
                onClick={() => {
                  setEditingPost(null);
                  setIsPostModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>Post New Announcement</span>
              </button>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <span>Public Official Feed</span>
              </div>
            )}
          </div>

          {/* Category Filter Pills & Search Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeCategory === cat
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredPosts.length}</strong> {filteredPosts.length === 1 ? 'post' : 'posts'}
              {searchQuery && <span> matching "<span className="text-blue-700">{searchQuery}</span>"</span>}
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAdmin={!!adminUser}
                  onReadMore={setSelectedPost}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Posts Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No announcements match the query "${searchQuery}". Try a different keyword or reset filters.`
                  : 'There are currently no announcements in this category.'}
              </p>
              {(searchQuery || activeCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* School Enrollment & Staffing Statistics Section */}
        <SchoolStatisticsSection
          schoolInfo={schoolInfo}
          isAdmin={!!adminUser}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenPersonnelModal={() => setIsPersonnelModalOpen(true)}
        />

        {/* Healthy Learning Institute (HLI) 6 Pillars Section */}
        <HealthyLearningInstitute
          hliData={mergedHliData}
          adminUser={adminUser}
          onUpdateHLIData={handleUpdateHLIData}
          onUploadFileToCloud={handleUploadHLIFileToCloud}
          onSaveFileToCloud={handleSaveHLIFileToCloud}
          onDeleteFileFromCloud={handleDeleteHLIFileFromCloud}
          onShowToast={showToast}
        />

        {/* School Profile & DepEd Info Section */}
        <SchoolProfile 
          schoolInfo={schoolInfo}
          onOpenPersonnelModal={() => setIsPersonnelModalOpen(true)}
          personnelCount={personnelList.length}
          personnelList={personnelList}
          adminOfficerName={
            personnelList.find(
              (m) =>
                m.category === 'admin_officer' ||
                m.position.toLowerCase().includes('administrative officer') ||
                m.id === 'personnel-admin-officer' ||
                m.id === 'personnel-lead-nonteach'
            )?.name || 'Glenda M. Escober'
          }
          isAdmin={!!adminUser}
          facilities={facilities}
          onAddFacility={handleOpenAddFacility}
          onEditFacility={handleOpenEditFacility}
          onDeleteFacility={handleDeleteFacility}
          onResetFacilities={handleResetFacilities}
        />

        {/* Academic Programs & Levels Section */}
        <AcademicPrograms />

        {/* School Contact & Inquiries Section */}
        <ContactSection schoolInfo={schoolInfo} />
      </main>

      {/* Official Footer */}
      <Footer
        schoolInfo={schoolInfo}
        onOpenLogin={() => setIsLoginOpen(true)}
        isAdmin={!!adminUser}
      />

      {/* Modals */}
      <FacilityModal
        isOpen={isFacilityModalOpen}
        onClose={() => {
          setIsFacilityModalOpen(false);
          setEditingFacility(null);
        }}
        facility={editingFacility}
        onSave={handleSaveFacility}
      />

      {/* Delete Facility Confirmation Modal */}
      {facilityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Campus Facility</h3>
                <p className="text-xs text-slate-500">This action will remove the facility from the school directory.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{facilityToDelete.title}"</strong>? This change will synchronize across all devices.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFacilityToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-facility"
                onClick={confirmDeleteFacility}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <PersonnelPedigreeModal
        isOpen={isPersonnelModalOpen}
        onClose={() => setIsPersonnelModalOpen(false)}
        personnelList={personnelList}
        schoolInfo={schoolInfo}
        isAdmin={!!adminUser}
        onSaveMember={handleSavePersonnelMember}
        onDeleteMember={handleDeletePersonnelMember}
        onImportMembers={handleImportPersonnel}
        onResetToDefault={handleResetPersonnelToDefault}
      />

      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        adminPasswordHash={adminPassword}
      />

      <AdminPostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setEditingPost(null);
        }}
        onSavePost={handleSavePost}
        postToEdit={editingPost}
      />

      <AdminLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        schoolInfo={schoolInfo}
        onSaveLogo={handleSaveLogo}
      />

      <AdminSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        schoolInfo={schoolInfo}
        onSaveSettings={handleSaveSettings}
        onUpdateAdminPassword={handleUpdatePassword}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
      />

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        schoolInfo={schoolInfo}
      />
    </div>
  );
}
