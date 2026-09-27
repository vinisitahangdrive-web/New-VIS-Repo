import { GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged } from 'firebase/auth';
import { auth, isAuthPopupCancellation } from '../lib/firebase';
import { PersonnelMember, SchoolInfo, FacilityItem, HLISettings } from '../types';

export { isAuthPopupCancellation };

// Standard Google Workspace OAuth Scopes configured for this application
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
];

// Configure the GoogleAuthProvider with the Workspace scopes
export const workspaceGoogleProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  workspaceGoogleProvider.addScope(scope);
});
// Request prompt consent to ensure refresh token / full access is granted
workspaceGoogleProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline',
});

// Cache the access token strictly in memory (NOT in localStorage/sessionStorage as required by SKILL)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initialize Google Auth State listener.
 */
export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged into Firebase, but access token needs a sign-in interaction
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger interactive Google Sign-In with Workspace Scopes
 */
export const signInWithGoogleWorkspace = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) {
    return null;
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, workspaceGoogleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No Google Workspace access token returned. Please ensure popups are allowed and permissions are accepted.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    if (isAuthPopupCancellation(error)) {
      console.info('Google sign-in popup was dismissed or closed by user.');
      return null;
    }
    console.error('Workspace Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory access token
 */
export const getWorkspaceAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Manually set access token in memory
 */
export const setWorkspaceAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Sign out of Google Workspace
 */
export const logoutWorkspace = async () => {
  cachedAccessToken = null;
};

// ----------------------------------------------------------------------------------------
// GOOGLE DRIVE & FILE TYPES
// ----------------------------------------------------------------------------------------

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
}

export interface GoogleSheetTab {
  sheetId: number;
  title: string;
  index: number;
  rowCount?: number;
  columnCount?: number;
}

export interface GoogleSpreadsheetDetails {
  spreadsheetId: string;
  title: string;
  sheets: GoogleSheetTab[];
  spreadsheetUrl: string;
}

export interface GoogleDocDetails {
  documentId: string;
  title: string;
  bodyText: string;
  revisionId?: string;
  characterCount?: number;
  wordCount?: number;
}

// ----------------------------------------------------------------------------------------
// GOOGLE SHEETS API
// ----------------------------------------------------------------------------------------

/**
 * List all Google Sheets belonging to or shared with the user
 */
export async function listUserSpreadsheets(accessToken: string): Promise<WorkspaceFile[]> {
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)&orderBy=modifiedTime desc&pageSize=30`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Google Sheets (${res.status})`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    ...f,
    webViewLink: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
  }));
}

/**
 * Create a new Google Spreadsheet with optional initial sheet data
 */
export async function createGoogleSpreadsheet(
  accessToken: string,
  title: string,
  sheetData?: { title: string; rows: any[][] }[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const payload: any = {
    properties: {
      title,
    },
  };

  if (sheetData && sheetData.length > 0) {
    payload.sheets = sheetData.map((s) => ({
      properties: { title: s.title },
      data: [
        {
          startRow: 0,
          startColumn: 0,
          rowData: s.rows.map((row) => ({
            values: row.map((cell) => ({
              userEnteredValue:
                typeof cell === 'number'
                  ? { numberValue: cell }
                  : typeof cell === 'boolean'
                  ? { boolValue: cell }
                  : { stringValue: String(cell ?? '') },
            })),
          })),
        },
      ],
    }));
  }

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Google Spreadsheet (${res.status})`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    title: data.properties?.title || title,
  };
}

/**
 * Get spreadsheet details and sheets list
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<GoogleSpreadsheetDetails> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties(title),spreadsheetUrl,sheets(properties(sheetId,title,index,gridProperties))`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch spreadsheet metadata (${res.status})`);
  }

  const data = await res.json();
  const sheets: GoogleSheetTab[] = (data.sheets || []).map((s: any) => ({
    sheetId: s.properties?.sheetId ?? 0,
    title: s.properties?.title || 'Sheet1',
    index: s.properties?.index ?? 0,
    rowCount: s.properties?.gridProperties?.rowCount,
    columnCount: s.properties?.gridProperties?.columnCount,
  }));

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    sheets,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Read values from a spreadsheet range (e.g. 'Sheet1!A1:Z50' or 'A1:H20')
 */
export async function getSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to read sheet values (${res.status})`);
  }

  const data = await res.json();
  return data.values || [];
}

/**
 * Append rows to a Google Spreadsheet
 */
export async function appendSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to append values (${res.status})`);
  }

  return await res.json();
}

// ----------------------------------------------------------------------------------------
// GOOGLE DOCS API
// ----------------------------------------------------------------------------------------

/**
 * List all Google Docs belonging to or shared with the user
 */
export async function listUserDocuments(accessToken: string): Promise<WorkspaceFile[]> {
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.document' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)&orderBy=modifiedTime desc&pageSize=30`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Google Docs (${res.status})`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    ...f,
    webViewLink: f.webViewLink || `https://docs.google.com/document/d/${f.id}/edit`,
  }));
}

/**
 * Create a new Google Document with optional initial text
 */
export async function createGoogleDocument(
  accessToken: string,
  title: string,
  initialContent?: string
): Promise<{ documentId: string; title: string; documentUrl: string }> {
  // Step 1: Create Document
  const res = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Google Doc (${res.status})`);
  }

  const docData = await res.json();
  const documentId = docData.documentId;

  // Step 2: If initialContent is provided, insert it into the document body
  if (initialContent && initialContent.trim().length > 0) {
    try {
      await insertDocumentText(accessToken, documentId, initialContent);
    } catch (insertErr) {
      console.warn('Could not insert initial content into new Google Doc:', insertErr);
    }
  }

  return {
    documentId,
    title: docData.title || title,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

/**
 * Insert plain or structured text into an existing Google Doc
 */
export async function insertDocumentText(
  accessToken: string,
  documentId: string,
  text: string
): Promise<any> {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;

  const body = {
    requests: [
      {
        insertText: {
          endOfSegmentLocation: {},
          text,
        },
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to insert text into Google Doc (${res.status})`);
  }

  return await res.json();
}

/**
 * Get Google Doc metadata and extract its readable plain-text body
 */
export async function getDocumentDetails(
  accessToken: string,
  documentId: string
): Promise<GoogleDocDetails> {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Google Doc (${res.status})`);
  }

  const data = await res.json();
  let fullText = '';

  if (data.body?.content && Array.isArray(data.body.content)) {
    for (const elem of data.body.content) {
      if (elem.paragraph?.elements) {
        for (const pElem of elem.paragraph.elements) {
          if (pElem.textRun?.content) {
            fullText += pElem.textRun.content;
          }
        }
      } else if (elem.table) {
        // Extract basic table cells
        for (const row of elem.table.tableRows || []) {
          for (const cell of row.tableCells || []) {
            for (const contentElem of cell.content || []) {
              if (contentElem.paragraph?.elements) {
                for (const pElem of contentElem.paragraph.elements) {
                  if (pElem.textRun?.content) {
                    fullText += pElem.textRun.content.trim() + ' | ';
                  }
                }
              }
            }
          }
          fullText += '\n';
        }
      }
    }
  }

  const cleanText = fullText.trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

  return {
    documentId: data.documentId,
    title: data.title || 'Untitled Document',
    bodyText: cleanText,
    revisionId: data.revisionId,
    characterCount: cleanText.length,
    wordCount,
  };
}

/**
 * Delete a Drive file (Doc, Sheet, etc.)
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete file (${res.status})`);
  }
}

// ----------------------------------------------------------------------------------------
// DEPED EXPORT GENERATORS (SHEETS & DOCS)
// ----------------------------------------------------------------------------------------

/**
 * Export Personnel Directory into an official DepEd Google Sheet
 */
export async function exportPersonnelToGoogleSheet(
  accessToken: string,
  schoolInfo: SchoolInfo,
  personnelList: PersonnelMember[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const title = `${schoolInfo.name} - Faculty & Staff Directory (${timestamp})`;

  const headers = [
    'Order',
    'Full Name',
    'Official Position / Designation',
    'Department / Category',
    'Assigned Grade / Advisory',
    'Specialization / Subject',
    'DepEd Email',
    'Contact Phone',
    'Employment Status',
  ];

  const rows = [
    [`REPUBLIC OF THE PHILIPPINES - DEPARTMENT OF EDUCATION`],
    [`REGION V (BICOL) - ${schoolInfo.division.toUpperCase()} - ${schoolInfo.district.toUpperCase()}`],
    [`${schoolInfo.name.toUpperCase()} (SCHOOL ID: ${schoolInfo.schoolId})`],
    [`OFFICIAL FACULTY & STAFF ROSTER / SF7 DATA`],
    [`Export Date: ${timestamp}`],
    [], // Blank separator
    headers,
    ...personnelList.map((m, idx) => [
      idx + 1,
      m.name,
      m.position,
      m.category === 'administration' || m.category === 'district' || m.category === 'admin_officer'
        ? 'Administration'
        : m.category === 'elementary' || m.category === 'secondary'
        ? 'Teaching Faculty'
        : 'Non-Teaching / Support',
      m.departmentOrGrade || 'School-wide',
      'Basic Education DepEd Curriculum',
      m.email || '—',
      m.contactNumber || '—',
      'Active / Verified',
    ]),
  ];

  return createGoogleSpreadsheet(accessToken, title, [
    {
      title: 'Faculty & Staff Roster',
      rows,
    },
  ]);
}

/**
 * Export Campus Facilities Inventory into a Google Sheet
 */
export async function exportFacilitiesToGoogleSheet(
  accessToken: string,
  schoolInfo: SchoolInfo,
  facilities: FacilityItem[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const title = `${schoolInfo.name} - Facilities Inventory (${timestamp})`;

  const headers = [
    'No.',
    'Facility Name',
    'Category',
    'Room / Building Identifier',
    'Seating / Student Capacity',
    'Current Usability Condition',
    'Description',
    'Key Equipment & Amenities',
  ];

  const rows = [
    [`DEPARTMENT OF EDUCATION - ${schoolInfo.division}`],
    [`${schoolInfo.name.toUpperCase()} - PHYSICAL LEARNING SPACES & FACILITIES INVENTORY`],
    [`Generated: ${timestamp}`],
    [],
    headers,
    ...facilities.map((f, idx) => [
      idx + 1,
      f.title,
      (f.category || 'INSTRUCTIONAL').toUpperCase(),
      f.title.includes('Building') ? f.title : 'Campus Instructional Facility',
      f.capacity || 'Standard Class Size',
      'Operational / Good Condition',
      f.desc || 'DepEd learning space and academic environment',
      'Standard classroom and educational facilities',
    ]),
  ];

  return createGoogleSpreadsheet(accessToken, title, [
    {
      title: 'Facilities Inventory',
      rows,
    },
  ]);
}

/**
 * Export Basic Education Information System (BEIS) Statistical Profile to Google Sheet
 */
export async function exportStatisticsToGoogleSheet(
  accessToken: string,
  schoolInfo: SchoolInfo,
  personnelList: PersonnelMember[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const title = `${schoolInfo.name} - BEIS School Profile & Statistics (${timestamp})`;

  const teachers = schoolInfo.teachersCount || personnelList.filter((p) => p.category === 'elementary' || p.category === 'secondary').length;
  const nonTeachers = schoolInfo.nonTeachersCount || personnelList.filter((p) => p.category === 'non_teaching' || p.category === 'administration' || p.category === 'admin_officer').length;
  const totalEnrolled = (schoolInfo.elementaryEnrolled || 0) + (schoolInfo.secondaryEnrolled || 0);
  const ratio = Math.round(totalEnrolled / (teachers || 1));

  const rows = [
    ['DEPED BASIC EDUCATION INFORMATION SYSTEM (BEIS) PROFILE SUMMARY'],
    [`School Name: ${schoolInfo.name}`],
    [`School ID: ${schoolInfo.schoolId}`],
    [`Division: ${schoolInfo.division}`],
    [`District: ${schoolInfo.district}`],
    [`Curriculum Offerings: Kindergarten to Grade 10 (Integrated Junior High)`],
    [`Principal / School Head: ${schoolInfo.schoolHead} (${schoolInfo.headTitle})`],
    [`Generated On: ${timestamp}`],
    [],
    ['KEY PERFORMANCE INDICATOR', 'RECORDED VALUE', 'METRIC NOTES'],
    ['Total Enrolled Learners', totalEnrolled, 'Official DepEd LIS Synced Enrollment (Elementary + Secondary)'],
    ['Elementary Enrolment', schoolInfo.elementaryEnrolled, 'Kindergarten to Grade 6'],
    ['Junior High School Enrolment', schoolInfo.secondaryEnrolled, 'Grade 7 to Grade 10'],
    ['Teaching Faculty Roster', teachers, 'DepEd Item Plantilla Teachers'],
    ['Non-Teaching & Support Staff', nonTeachers, 'Administrative, Security, Health, ICT Support'],
    ['Total School Personnel', personnelList.length, 'Sum of all verified personnel'],
    ['Student-to-Teacher Ratio', `1 : ${ratio}`, 'DepEd Standard Classroom Planning Metric'],
    ['School Motto', schoolInfo.motto, 'Institutional vision slogan'],
    ['Official Contact Number', schoolInfo.contactNumber, 'School Administration desk'],
    ['Official DepEd Email', schoolInfo.email, 'Official communications'],
    ['Physical Campus Address', schoolInfo.address, 'Albay, Bicol Region V, Philippines'],
  ];

  return createGoogleSpreadsheet(accessToken, title, [
    {
      title: 'BEIS Profile Summary',
      rows,
    },
  ]);
}

/**
 * Generate an official DepEd School Memorandum in Google Docs
 */
export async function generateSchoolMemorandumDoc(
  accessToken: string,
  schoolInfo: SchoolInfo,
  memoTitle: string,
  recipient: string,
  subject: string,
  bodyContent: string
): Promise<{ documentId: string; title: string; documentUrl: string }> {
  const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const docTitle = `School Memorandum - ${memoTitle || 'General Advisory'} (${timestamp})`;

  const formattedContent = 
`REPUBLIC OF THE PHILIPPINES
DEPARTMENT OF EDUCATION
REGION V (BICOL)
SCHOOLS DIVISION OF ALBAY
${schoolInfo.district.toUpperCase()}
${schoolInfo.name.toUpperCase()}
School ID: ${schoolInfo.schoolId} | Address: ${schoolInfo.address}

═══════════════════════════════════════════════════════════════════════════════
SCHOOL MEMORANDUM
═══════════════════════════════════════════════════════════════════════════════

Date:       ${timestamp}
To:         ${recipient || 'All Teaching Faculty, Non-Teaching Personnel, and School Stakeholders'}
From:       ${schoolInfo.schoolHead}
            ${schoolInfo.headTitle}, ${schoolInfo.name}
Subject:    ${subject || memoTitle || 'School Activity and Operational Advisory'}

1. GENERAL DIRECTIVE & PURPOSE
${bodyContent || 'Please be advised of the upcoming school directives, guidelines, and coordinated activities at Vinisitahan Integrated School. All concerned personnel and faculty are enjoined to observe DepEd orders and standard operating procedures.'}

2. SPECIFIC INSTRUCTIONS & IMPLEMENTATION GUIDELINES
- All Grade Level Chairs and Subject Coordinators are requested to facilitate student compliance and activity tracking.
- Coordination with the School ICT and Administrative Office should be maintained for proper documentation and student safety.
- For queries and submissions, please coordinate through the official school email at ${schoolInfo.email} or contact ${schoolInfo.contactNumber}.

3. WIDE DISSEMINATION
Immediate dissemination of and strict compliance with this Memorandum is directed.


Approved and Noted:

${schoolInfo.schoolHead}
${schoolInfo.headTitle}
${schoolInfo.name}
DepEd School ID: ${schoolInfo.schoolId}
`;

  return createGoogleDocument(accessToken, docTitle, formattedContent);
}

/**
 * Generate Comprehensive School Profile Narrative in Google Docs
 */
export async function generateAccomplishmentReportDoc(
  accessToken: string,
  schoolInfo: SchoolInfo,
  personnelList: PersonnelMember[],
  hliData: HLISettings
): Promise<{ documentId: string; title: string; documentUrl: string }> {
  const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const docTitle = `${schoolInfo.name} - Institutional Profile & Accomplishment Narrative (${timestamp})`;

  const teachers = schoolInfo.teachersCount || personnelList.filter((p) => p.category === 'elementary' || p.category === 'secondary').length;
  const staff = schoolInfo.nonTeachersCount || personnelList.filter((p) => p.category === 'non_teaching' || p.category === 'administration' || p.category === 'admin_officer').length;
  const totalEnrolled = (schoolInfo.elementaryEnrolled || 0) + (schoolInfo.secondaryEnrolled || 0);

  const content = 
`REPUBLIC OF THE PHILIPPINES
DEPARTMENT OF EDUCATION
REGION V (BICOL) - DIVISION OF ALBAY
${schoolInfo.name.toUpperCase()}
Official DepEd School ID: ${schoolInfo.schoolId}

═══════════════════════════════════════════════════════════════════════════════
INSTITUTIONAL SCHOOL PROFILE & NARRATIVE REPORT
Generated on: ${timestamp}
═══════════════════════════════════════════════════════════════════════════════

I. INSTITUTIONAL IDENTITY & VISION
${schoolInfo.name} stands as a beacon of academic excellence, character formation, and holistic community development in ${schoolInfo.district}, Division of Albay. 

Institutional Motto: "${schoolInfo.motto}"
Curricular Framework: Basic Education Curriculum from Kindergarten through Grade 10 (Integrated Junior High School).

Core Mission & Principles:
The institution is committed to nurturing resilient, scientifically minded, and socially responsible Filipino learners equipped with 21st-century learning skills within a safe, inclusive, and learner-centered academic environment.


II. VITAL SCHOOL DEMOGRAPHICS & PROFILE
- Total Enrolled Learners (K-10): ${totalEnrolled} Students (${schoolInfo.elementaryEnrolled} Elementary, ${schoolInfo.secondaryEnrolled} Junior High)
- Total Teaching Personnel: ${teachers} DepEd Plantilla Educators
- Non-Teaching & Support Staff: ${staff} Personnel
- Average Student-to-Teacher Ratio: 1 : ${Math.round(totalEnrolled / (teachers || 1))}
- Physical Campus Address: ${schoolInfo.address}
- Official Contact Hotline: ${schoolInfo.contactNumber}
- Official DepEd Email: ${schoolInfo.email}


III. HEALTHY LEARNING INSTITUTE (HLI) 6-PILLARS FRAMEWORK
Vinisitahan Integrated School actively champions the DepEd Healthy Learning Institute program across six fundamental dimensions of adolescent and learner well-being:

${hliData.pillars
  .map(
    (p, i) =>
      `Pillar ${i + 1}: ${p.title}
Focus: ${p.description}`
  )
  .join('\n\n')}


IV. CONCLUSION & STRATEGIC DIRECTIONS
Through continuous collaboration between teachers, parents, community leaders, and local government units, ${schoolInfo.name} continues to uplift the standards of basic education in Albay.


Submitted by:

${schoolInfo.schoolHead}
${schoolInfo.headTitle}
${schoolInfo.name}
DepEd School ID: ${schoolInfo.schoolId}
`;

  return createGoogleDocument(accessToken, docTitle, content);
}

// ----------------------------------------------------------------------------------------
// GMAIL API (OFFICIAL SCHOOL DISPATCH & COMMUNICATIONS)
// ----------------------------------------------------------------------------------------

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  isUnread?: boolean;
  labels?: string[];
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText?: string;
  bodyHtml?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

/**
 * Base64Url encoder for RFC 2822 email payload
 */
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64Url decoder for message parts
 */
function base64UrlDecode(base64url: string): string {
  try {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return '';
  }
}

/**
 * Get Gmail Profile info (current authenticated email address, message counts)
 */
export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Gmail profile (${res.status})`);
  }

  return await res.json();
}

/**
 * List Gmail messages for the authenticated user
 */
export async function listGmailMessages(
  accessToken: string,
  query = '',
  maxResults = 25
): Promise<GmailMessageSummary[]> {
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (query.trim()) {
    url += `&q=${encodeURIComponent(query.trim())}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Gmail messages (${res.status})`);
  }

  const listData = await res.json();
  const rawList = listData.messages || [];
  if (rawList.length === 0) return [];

  // Fetch summaries in batch
  const summaries: GmailMessageSummary[] = await Promise.all(
    rawList.slice(0, 20).map(async (item: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!detailRes.ok) return { id: item.id, threadId: item.threadId };
        const msg = await detailRes.json();
        const headers: { name: string; value: string }[] = msg.payload?.headers || [];
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
        const to = headers.find((h) => h.name.toLowerCase() === 'to')?.value || '';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';
        const isUnread = (msg.labelIds || []).includes('UNREAD');

        return {
          id: item.id,
          threadId: item.threadId,
          snippet: msg.snippet,
          subject,
          from,
          to,
          date,
          isUnread,
          labels: msg.labelIds || [],
        };
      } catch {
        return { id: item.id, threadId: item.threadId };
      }
    })
  );

  return summaries;
}

/**
 * Get detailed content and body of a single Gmail message
 */
export async function getGmailMessageDetails(
  accessToken: string,
  messageId: string
): Promise<GmailMessageDetail> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch message details (${res.status})`);
  }

  const msg = await res.json();
  const headers: { name: string; value: string }[] = msg.payload?.headers || [];
  const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
  const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
  const to = headers.find((h) => h.name.toLowerCase() === 'to')?.value || '';
  const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';

  // Extract body text or html
  let bodyText = '';
  let bodyHtml = '';

  const extractBody = (part: any) => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText += base64UrlDecode(part.body.data) + '\n';
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml += base64UrlDecode(part.body.data);
    }
    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(extractBody);
    }
  };

  if (msg.payload) {
    if (msg.payload.body?.data) {
      if (msg.payload.mimeType === 'text/html') {
        bodyHtml = base64UrlDecode(msg.payload.body.data);
      } else {
        bodyText = base64UrlDecode(msg.payload.body.data);
      }
    }
    if (msg.payload.parts) {
      msg.payload.parts.forEach(extractBody);
    }
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet,
    subject,
    from,
    to,
    date,
    bodyText: bodyText.trim() || msg.snippet,
    bodyHtml: bodyHtml || undefined,
    labels: msg.labelIds || [],
    isUnread: (msg.labelIds || []).includes('UNREAD'),
  };
}

/**
 * Send an email via the Gmail API
 * Note: Must follow user confirmation requirement before invoking this function.
 */
export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  cc?: string
): Promise<{ id: string; threadId: string }> {
  // Construct RFC 2822 email format
  const headers = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
  ]
    .filter(Boolean)
    .join('\r\n');

  const raw = base64UrlEncode(headers);

  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email via Gmail (${res.status})`);
  }

  return await res.json();
}

/**
 * Delete / trash a Gmail message
 */
export async function deleteGmailMessage(accessToken: string, messageId: string): Promise<void> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to trash email (${res.status})`);
  }
}

