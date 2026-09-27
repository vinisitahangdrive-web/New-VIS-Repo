import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PostItem, SchoolInfo, PersonnelMember, FacilityItem, HLISettings, HLIFile, InquiryMessage, InquiryStatus } from '../types';
import { DEFAULT_SCHOOL_INFO, INITIAL_POSTS, DEFAULT_PERSONNEL_LIST, DEFAULT_FACILITIES } from '../data/initialData';
import { DEFAULT_HLI_DATA } from '../data/hliData';

// Helper to remove undefined fields which Firestore rejects
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// 1. Posts Service
export function subscribeToPosts(
  onUpdate: (posts: PostItem[]) => void,
  onError?: (err: unknown) => void
) {
  const postsCollectionRef = collection(db, 'posts');

  return onSnapshot(
    postsCollectionRef,
    async (snapshot) => {
      if (snapshot.empty) {
        console.log('No posts in Firestore. Seeding default initial posts...');
        try {
          const batch = writeBatch(db);
          INITIAL_POSTS.forEach((post) => {
            const postRef = doc(db, 'posts', post.id);
            batch.set(postRef, sanitizeForFirestore(post));
          });
          await batch.commit();
        } catch (seedErr) {
          handleFirestoreError(seedErr, OperationType.WRITE, 'posts');
        }
        onUpdate(INITIAL_POSTS);
        return;
      }

      const loadedPosts: PostItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as PostItem;
        loadedPosts.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Sort posts: pinned first, then by date descending
      loadedPosts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });

      onUpdate(loadedPosts);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'posts');
      if (onError) onError(error);
    }
  );
}

export async function savePostToFirestore(post: PostItem): Promise<void> {
  const path = `posts/${post.id}`;
  try {
    const postRef = doc(db, 'posts', post.id);
    await setDoc(postRef, sanitizeForFirestore(post), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deletePostFromFirestore(postId: string): Promise<void> {
  const path = `posts/${postId}`;
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// 2. School Info Service
export function subscribeToSchoolInfo(
  onUpdate: (info: SchoolInfo) => void,
  onError?: (err: unknown) => void
) {
  const docRef = doc(db, 'settings', 'schoolInfo');

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        console.log('Seeding initial schoolInfo to Firestore...');
        try {
          await setDoc(docRef, sanitizeForFirestore(DEFAULT_SCHOOL_INFO));
        } catch (seedErr) {
          handleFirestoreError(seedErr, OperationType.WRITE, 'settings/schoolInfo');
        }
        onUpdate(DEFAULT_SCHOOL_INFO);
        return;
      }

      const data = snapshot.data() as SchoolInfo;
      onUpdate({ ...DEFAULT_SCHOOL_INFO, ...data });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/schoolInfo');
      if (onError) onError(error);
    }
  );
}

export async function saveSchoolInfoToFirestore(info: SchoolInfo): Promise<void> {
  const path = 'settings/schoolInfo';
  try {
    const docRef = doc(db, 'settings', 'schoolInfo');
    await setDoc(docRef, sanitizeForFirestore(info), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Helper to safeguard personnel data before pushing to Cloud Firestore
function cleanPersonnelForCloud(members: PersonnelMember[]): PersonnelMember[] {
  return members.map((m) => {
    const cleaned = { ...m };
    // If photo is a massive uncompressed dataUrl > 250KB, truncate safely to avoid Firestore document limits
    if (cleaned.photoUrl && cleaned.photoUrl.startsWith('data:image/') && cleaned.photoUrl.length > 300000) {
      console.warn(`Personnel photo for "${m.name}" is unusually large (${Math.round(cleaned.photoUrl.length / 1024)}KB).`);
    }
    return cleaned;
  });
}

// 3. Personnel Directory Service
export function subscribeToPersonnel(
  onUpdate: (members: PersonnelMember[]) => void,
  onError?: (err: unknown) => void
) {
  const docRef = doc(db, 'settings', 'personnel');

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        console.log('Seeding default personnel roster to Firestore...');
        try {
          await setDoc(docRef, {
            members: sanitizeForFirestore(cleanPersonnelForCloud(DEFAULT_PERSONNEL_LIST)),
            updatedAt: new Date().toISOString(),
          });
        } catch (seedErr) {
          handleFirestoreError(seedErr, OperationType.WRITE, 'settings/personnel');
        }
        onUpdate(DEFAULT_PERSONNEL_LIST);
        return;
      }

      const data = snapshot.data();
      if (data && Array.isArray(data.members)) {
        onUpdate(data.members);
      } else {
        onUpdate(DEFAULT_PERSONNEL_LIST);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/personnel');
      if (onError) onError(error);
    }
  );
}

export async function getPersonnelFromFirestore(): Promise<PersonnelMember[]> {
  const docRef = doc(db, 'settings', 'personnel');
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.members)) {
        return data.members as PersonnelMember[];
      }
    }
    return DEFAULT_PERSONNEL_LIST;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/personnel');
    return DEFAULT_PERSONNEL_LIST;
  }
}

export async function savePersonnelToFirestore(members: PersonnelMember[]): Promise<void> {
  const path = 'settings/personnel';
  try {
    const docRef = doc(db, 'settings', 'personnel');
    const sanitizedMembers = sanitizeForFirestore(cleanPersonnelForCloud(members));
    await setDoc(
      docRef,
      {
        members: sanitizedMembers,
        updatedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// 4. Security & Admin Password Service
export function subscribeToAdminPassword(
  onUpdate: (password: string) => void,
  onError?: (err: unknown) => void
) {
  const docRef = doc(db, 'settings', 'security');

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        // If not initialized, initialize with default
        const defaultPass = localStorage.getItem('vis_admin_pass') || 'vis502996';
        try {
          await setDoc(docRef, {
            adminPassword: defaultPass,
            updatedAt: new Date().toISOString(),
          });
        } catch (seedErr) {
          handleFirestoreError(seedErr, OperationType.WRITE, 'settings/security');
        }
        onUpdate(defaultPass);
        return;
      }

      const data = snapshot.data();
      if (data && typeof data.adminPassword === 'string' && data.adminPassword.trim().length > 0) {
        onUpdate(data.adminPassword.trim());
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/security');
      if (onError) onError(error);
    }
  );
}

export async function saveAdminPasswordToFirestore(newPassword: string): Promise<void> {
  const path = 'settings/security';
  const cleanPass = newPassword.trim();
  try {
    const docRef = doc(db, 'settings', 'security');
    await setDoc(
      docRef,
      {
        adminPassword: cleanPass,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// 5. Campus Learning Facilities Service
export function subscribeToFacilities(
  onUpdate: (facilities: FacilityItem[]) => void,
  onError?: (err: unknown) => void
) {
  const docRef = doc(db, 'settings', 'facilities');

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        console.log('Seeding default campus learning facilities to Firestore...');
        try {
          await setDoc(docRef, {
            facilities: sanitizeForFirestore(DEFAULT_FACILITIES),
            updatedAt: new Date().toISOString(),
          });
        } catch (seedErr) {
          handleFirestoreError(seedErr, OperationType.WRITE, 'settings/facilities');
        }
        onUpdate(DEFAULT_FACILITIES);
        return;
      }

      const data = snapshot.data();
      if (data && Array.isArray(data.facilities)) {
        onUpdate(data.facilities);
      } else {
        onUpdate(DEFAULT_FACILITIES);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/facilities');
      if (onError) onError(error);
    }
  );
}

export async function saveFacilitiesToFirestore(facilities: FacilityItem[]): Promise<void> {
  const path = 'settings/facilities';
  try {
    const docRef = doc(db, 'settings', 'facilities');
    await setDoc(
      docRef,
      {
        facilities: sanitizeForFirestore(facilities),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// 6. Healthy Learning Institute (HLI) 6 Pillars Service
export function subscribeToHLI(
  onUpdate: (hli: HLISettings) => void,
  onError?: (err: unknown) => void
) {
  const docRef = doc(db, 'settings', 'hli');

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        console.log('Seeding default Healthy Learning Institute data to Firestore...');
        try {
          await setDoc(docRef, {
            ...sanitizeForFirestore(DEFAULT_HLI_DATA),
            updatedAt: new Date().toISOString(),
          });
        } catch (seedErr) {
          handleFirestoreError(seedErr, OperationType.WRITE, 'settings/hli');
        }
        onUpdate(DEFAULT_HLI_DATA);
        return;
      }

      const data = snapshot.data() as HLISettings;
      if (data && Array.isArray(data.pillars) && data.pillars.length > 0) {
        onUpdate(data);
      } else {
        onUpdate(DEFAULT_HLI_DATA);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/hli');
      if (onError) onError(error);
    }
  );
}

export async function saveHLIToFirestore(hliData: HLISettings): Promise<void> {
  const path = 'settings/hli';
  try {
    const docRef = doc(db, 'settings', 'hli');
    // Sanitize pillars to store file metadata without excessive base64 payload in settings document
    const sanitizedPillars = hliData.pillars.map((pillar) => ({
      ...pillar,
      files: (pillar.files || []).map((file) => ({
        ...file,
        downloadUrl: (file.downloadUrl && file.downloadUrl.length > 5000) ? '' : file.downloadUrl,
      })),
    }));

    await setDoc(
      docRef,
      {
        ...sanitizeForFirestore({
          ...hliData,
          pillars: sanitizedPillars,
        }),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// 7. Healthy Learning Institute (HLI) Cloud Files Real-Time Sync & Storage
export function subscribeToHLIFiles(
  onUpdate: (files: HLIFile[]) => void,
  onError?: (err: unknown) => void
) {
  const filesColRef = collection(db, 'hli_files');
  const metaDocRef = doc(db, 'settings', 'hli_meta');

  return onSnapshot(
    filesColRef,
    async (snapshot) => {
      if (snapshot.empty) {
        let isAlreadyInitialized = false;
        try {
          const metaSnap = await getDoc(metaDocRef);
          if (metaSnap.exists() && metaSnap.data()?.seeded) {
            isAlreadyInitialized = true;
          }
        } catch {
          // If meta check fails, check localStorage flag
          if (localStorage.getItem('vis_hli_seeded') === 'true') {
            isAlreadyInitialized = true;
          }
        }

        // If collection was initialized and is now empty, user permanently deleted all files.
        // Do NOT re-seed deleted files!
        if (isAlreadyInitialized) {
          onUpdate([]);
          return;
        }

        console.log('Seeding initial Healthy Learning Institute documents to Cloud Firestore...');
        const initialFiles: HLIFile[] = [];
        DEFAULT_HLI_DATA.pillars.forEach((pillar) => {
          if (pillar.files && pillar.files.length > 0) {
            pillar.files.forEach((file) => {
              initialFiles.push({
                ...file,
                pillarId: pillar.id,
              });
            });
          }
        });

        try {
          const batch = writeBatch(db);
          for (const file of initialFiles) {
            const fileDocRef = doc(db, 'hli_files', file.id);
            batch.set(
              fileDocRef,
              sanitizeForFirestore({
                ...file,
                hasChunks: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            );
          }
          await batch.commit();

          // Mark metadata so deleted files never get resurrected
          await setDoc(metaDocRef, { seeded: true, seededAt: new Date().toISOString() }, { merge: true });
          localStorage.setItem('vis_hli_seeded', 'true');
        } catch (seedErr) {
          console.warn('Initial HLI file seeding fallback:', seedErr);
        }

        onUpdate(initialFiles);
        return;
      }

      // Mark initialized flag in local storage once documents exist
      try {
        localStorage.setItem('vis_hli_seeded', 'true');
      } catch {
        // ignore
      }

      const files: HLIFile[] = [];
      snapshot.forEach((docSnap) => {
        files.push(docSnap.data() as HLIFile);
      });
      onUpdate(files);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'hli_files');
      if (onError) onError(error);
    }
  );
}

const CHUNK_SIZE = 450000; // 450 KB chunk size (well under Firestore's 1MB document limit)

export async function saveHLIFileToCloud(pillarId: string, file: HLIFile): Promise<void> {
  const path = `hli_files/${file.id}`;
  try {
    const fileDocRef = doc(db, 'hli_files', file.id);
    const downloadUrl = file.downloadUrl || '';

    if (downloadUrl.length > CHUNK_SIZE) {
      // Large file: slice into chunks stored in subcollection
      const chunks: string[] = [];
      for (let i = 0; i < downloadUrl.length; i += CHUNK_SIZE) {
        chunks.push(downloadUrl.slice(i, i + CHUNK_SIZE));
      }

      const fileMetadata: HLIFile = {
        ...file,
        pillarId,
        downloadUrl: '', // Keeps parent document small and lightweight
        hasChunks: true,
        chunkCount: chunks.length,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(fileDocRef, sanitizeForFirestore(fileMetadata), { merge: true });

      // Save each chunk in subcollection
      for (let i = 0; i < chunks.length; i++) {
        const chunkDocRef = doc(db, 'hli_files', file.id, 'chunks', `chunk_${i}`);
        await setDoc(chunkDocRef, {
          index: i,
          data: chunks[i],
          fileId: file.id,
        });
      }
    } else {
      // Normal size file: fits directly into the document
      const fileData: HLIFile = {
        ...file,
        pillarId,
        hasChunks: false,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(fileDocRef, sanitizeForFirestore(fileData), { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Permanently deletes an HLI file from Cloud Firestore.
 * Removes both the root document and all associated binary chunks in the subcollection,
 * completely freeing up cloud storage space so no residual data clogs the database.
 */
export async function deleteHLIFileFromCloud(fileId: string): Promise<void> {
  const path = `hli_files/${fileId}`;
  try {
    const fileDocRef = doc(db, 'hli_files', fileId);

    // 1. Delete all chunk documents in subcollection to free binary cloud storage
    try {
      const chunksCol = collection(db, 'hli_files', fileId, 'chunks');
      const chunksSnap = await getDocs(chunksCol);
      if (!chunksSnap.empty) {
        let batch = writeBatch(db);
        let opCount = 0;
        for (const chunkDoc of chunksSnap.docs) {
          batch.delete(chunkDoc.ref);
          opCount++;
          if (opCount >= 400) {
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
          }
        }
        if (opCount > 0) {
          await batch.commit();
        }
      }
    } catch (chunkErr) {
      console.warn('Error clearing subcollection chunks during file deletion:', chunkErr);
    }

    // 2. Permanently delete the primary file document from hli_files
    await deleteDoc(fileDocRef);

    // 3. Purge the file reference from settings/hli so no trace remains in Firestore
    try {
      const hliSettingsRef = doc(db, 'settings', 'hli');
      const hliSnap = await getDoc(hliSettingsRef);
      if (hliSnap.exists()) {
        const hliData = hliSnap.data() as HLISettings;
        if (hliData && Array.isArray(hliData.pillars)) {
          let modified = false;
          const updatedPillars = hliData.pillars.map((pillar) => {
            if (pillar.files && pillar.files.some((f) => f.id === fileId)) {
              modified = true;
              return {
                ...pillar,
                files: pillar.files.filter((f) => f.id !== fileId),
              };
            }
            return pillar;
          });
          if (modified) {
            await setDoc(
              hliSettingsRef,
              sanitizeForFirestore({
                ...hliData,
                pillars: updatedPillars,
                updatedAt: new Date().toISOString(),
              }),
              { merge: true }
            );
          }
        }
      }
    } catch (settingsErr) {
      console.warn('Error clearing file reference from settings/hli during cloud file deletion:', settingsErr);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function fetchHLIFileDownloadUrl(file: HLIFile): Promise<string> {
  if (file.downloadUrl && file.downloadUrl.trim().length > 0) {
    return file.downloadUrl;
  }

  // Check if file metadata in hli_files collection has downloadUrl or chunks
  try {
    const fileDocRef = doc(db, 'hli_files', file.id);
    const fileSnap = await getDoc(fileDocRef);
    if (fileSnap.exists()) {
      const cloudData = fileSnap.data() as HLIFile;
      if (cloudData.downloadUrl && cloudData.downloadUrl.trim().length > 0) {
        return cloudData.downloadUrl;
      }
      if (cloudData.hasChunks) {
        const chunksCol = collection(db, 'hli_files', file.id, 'chunks');
        const chunksSnap = await getDocs(chunksCol);
        const chunkList: { index: number; data: string }[] = [];
        chunksSnap.forEach((docSnap) => {
          const d = docSnap.data() as { index: number; data: string };
          chunkList.push(d);
        });
        chunkList.sort((a, b) => a.index - b.index);
        const merged = chunkList.map((c) => c.data).join('');
        if (merged) return merged;
      }
    }
  } catch (checkErr) {
    console.warn('Note checking hli_files doc in cloud:', checkErr);
  }

  if (file.hasChunks && file.chunkCount && file.chunkCount > 0) {
    try {
      const chunksCol = collection(db, 'hli_files', file.id, 'chunks');
      const chunksSnap = await getDocs(chunksCol);
      const chunkList: { index: number; data: string }[] = [];
      chunksSnap.forEach((docSnap) => {
        const d = docSnap.data() as { index: number; data: string };
        chunkList.push(d);
      });
      chunkList.sort((a, b) => a.index - b.index);
      return chunkList.map((c) => c.data).join('');
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `hli_files/${file.id}/chunks`);
      throw err;
    }
  }

  return file.downloadUrl || '';
}

// 8. Inquiries & Admin Notification Service
export function subscribeToInquiries(
  onUpdate: (inquiries: InquiryMessage[]) => void,
  onError?: (err: unknown) => void
) {
  const inquiriesColRef = collection(db, 'inquiries');

  return onSnapshot(
    inquiriesColRef,
    (snapshot) => {
      const list: InquiryMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as InquiryMessage;
        list.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Sort by submittedAt descending (newest inquiries first)
      list.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'inquiries');
      if (onError) onError(error);
    }
  );
}

export async function saveInquiryToFirestore(inquiry: InquiryMessage): Promise<void> {
  const path = `inquiries/${inquiry.id}`;
  try {
    const docRef = doc(db, 'inquiries', inquiry.id);
    await setDoc(
      docRef,
      sanitizeForFirestore({
        ...inquiry,
        createdAt: inquiry.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
  adminNotes?: string
): Promise<void> {
  const path = `inquiries/${inquiryId}`;
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    const updatePayload: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updatePayload.adminNotes = adminNotes;
    }
    await setDoc(docRef, sanitizeForFirestore(updatePayload), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteInquiryFromFirestore(inquiryId: string): Promise<void> {
  const path = `inquiries/${inquiryId}`;
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}


