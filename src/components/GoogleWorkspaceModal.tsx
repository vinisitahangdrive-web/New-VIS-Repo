import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Mail,
  Plus,
  ExternalLink,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Building2,
  BarChart3,
  Calendar,
  Lock,
  Send,
  Inbox,
  UserCheck,
  Reply,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  WorkspaceFile,
  GoogleSpreadsheetDetails,
  GoogleDocDetails,
  GmailMessageSummary,
  GmailMessageDetail,
  GmailProfile,
  listUserSpreadsheets,
  createGoogleSpreadsheet,
  getSpreadsheetDetails,
  getSpreadsheetValues,
  deleteDriveFile,
  listUserDocuments,
  createGoogleDocument,
  getDocumentDetails,
  exportPersonnelToGoogleSheet,
  exportFacilitiesToGoogleSheet,
  exportStatisticsToGoogleSheet,
  generateSchoolMemorandumDoc,
  generateAccomplishmentReportDoc,
  listGmailMessages,
  getGmailMessageDetails,
  sendGmailMessage,
  deleteGmailMessage,
  getGmailProfile,
  signInWithGoogleWorkspace,
  getWorkspaceAccessToken,
  logoutWorkspace,
  isAuthPopupCancellation,
} from '../services/googleWorkspaceService';
import { SchoolInfo, PersonnelMember, FacilityItem, HLISettings } from '../types';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: SchoolInfo;
  personnelList: PersonnelMember[];
  facilities: FacilityItem[];
  hliData: HLISettings;
  showToast: (msg: string) => void;
  initialTab?: 'gmail' | 'sheets' | 'docs' | 'templates';
  initialEmailTo?: string;
  initialEmailSubject?: string;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  schoolInfo,
  personnelList,
  facilities,
  hliData,
  showToast,
  initialTab = 'gmail',
  initialEmailTo = '',
  initialEmailSubject = '',
}) => {
  // Navigation tabs: Gmail, Sheets, Docs, Templates
  const [activeTab, setActiveTab] = useState<'gmail' | 'sheets' | 'docs' | 'templates'>(initialTab);

  // Auth state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getWorkspaceAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Gmail state
  const [gmailProfile, setGmailProfile] = useState<GmailProfile | null>(null);
  const [gmailList, setGmailList] = useState<GmailMessageSummary[]>([]);
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [gmailSearch, setGmailSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<GmailMessageDetail | null>(null);
  const [loadingEmailDetail, setLoadingEmailDetail] = useState(false);

  // Gmail Compose state
  const [isComposingEmail, setIsComposingEmail] = useState(false);
  const [composeTo, setComposeTo] = useState(initialEmailTo);
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState(initialEmailSubject);
  const [composeBody, setComposeBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Mandatory explicit confirmation state for sending and deleting emails (SKILL requirement)
  const [pendingSendEmail, setPendingSendEmail] = useState<{
    to: string;
    cc?: string;
    subject: string;
    body: string;
  } | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<{ id: string; subject: string } | null>(null);
  const [isDeletingEmail, setIsDeletingEmail] = useState(false);

  // Sheets state
  const [sheetsList, setSheetsList] = useState<WorkspaceFile[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [sheetsSearch, setSheetsSearch] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<WorkspaceFile | null>(null);
  const [sheetDetails, setSheetDetails] = useState<GoogleSpreadsheetDetails | null>(null);
  const [activeSheetTabTitle, setActiveSheetTabTitle] = useState<string>('');
  const [sheetGridValues, setSheetGridValues] = useState<any[][]>([]);
  const [loadingSheetData, setLoadingSheetData] = useState(false);

  // Docs state
  const [docsList, setDocsList] = useState<WorkspaceFile[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsSearch, setDocsSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<WorkspaceFile | null>(null);
  const [docDetails, setDocDetails] = useState<GoogleDocDetails | null>(null);
  const [loadingDocData, setLoadingDocData] = useState(false);

  // Modals & Creation state
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  // Memo generator state
  const [isCreatingMemo, setIsCreatingMemo] = useState(false);
  const [memoRecipient, setMemoRecipient] = useState('All Teaching & Non-Teaching Faculty');
  const [memoSubject, setMemoSubject] = useState('Implementation of DepEd School Directives');
  const [memoBody, setMemoBody] = useState('');

  // General export loading state
  const [exportingAction, setExportingAction] = useState<string | null>(null);

  // Drive File Deletion confirmation modal state (Required by SKILL.md)
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string; type: 'sheet' | 'doc' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check current token on mount or open
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialEmailTo) {
        setComposeTo(initialEmailTo);
        setIsComposingEmail(true);
      }
      if (initialEmailSubject) {
        setComposeSubject(initialEmailSubject);
      }

      const currentToken = getWorkspaceAccessToken();
      setAccessToken(currentToken);
      if (currentToken) {
        loadGmailData(currentToken);
        loadSpreadsheets(currentToken);
        loadDocuments(currentToken);
      }
    }
  }, [isOpen, initialTab, initialEmailTo, initialEmailSubject]);

  // Sign in handler
  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      const result = await signInWithGoogleWorkspace();
      if (!result) {
        // User closed or dismissed the sign-in popup
        showToast('Google sign-in was cancelled.');
        return;
      }
      setGoogleUser(result.user);
      setAccessToken(result.accessToken);
      showToast(`Connected to Google Workspace & Gmail as ${result.user.email}`);
      loadGmailData(result.accessToken);
      loadSpreadsheets(result.accessToken);
      loadDocuments(result.accessToken);
    } catch (err: unknown) {
      if (isAuthPopupCancellation(err)) {
        showToast('Google sign-in was cancelled.');
        return;
      }
      console.error('Google Workspace sign-in failed:', err);
      const msg = err instanceof Error ? err.message : 'Google Workspace authentication failed.';
      showToast(`Error: ${msg}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDisconnect = async () => {
    await logoutWorkspace();
    setAccessToken(null);
    setGoogleUser(null);
    setGmailProfile(null);
    setGmailList([]);
    setSelectedEmail(null);
    setSheetsList([]);
    setDocsList([]);
    setSelectedSheet(null);
    setSelectedDoc(null);
    showToast('Disconnected from Google Workspace.');
  };

  // Load Gmail messages & profile
  const loadGmailData = async (token = accessToken) => {
    if (!token) return;
    setLoadingGmail(true);
    try {
      const [profile, messages] = await Promise.all([
        getGmailProfile(token).catch(() => null),
        listGmailMessages(token, gmailSearch),
      ]);
      if (profile) setGmailProfile(profile);
      setGmailList(messages);
    } catch (err: unknown) {
      console.error('Failed to load Gmail data:', err);
      showToast('Could not fetch Gmail messages. Session may have expired. Please re-sign in.');
      setAccessToken(null);
    } finally {
      setLoadingGmail(false);
    }
  };

  // Load single email detail
  const handleSelectEmail = async (summary: GmailMessageSummary) => {
    if (!accessToken) return;
    setLoadingEmailDetail(true);
    try {
      const details = await getGmailMessageDetails(accessToken, summary.id);
      setSelectedEmail(details);
    } catch (err: unknown) {
      console.error('Failed to fetch email details:', err);
      showToast('Could not load email details.');
    } finally {
      setLoadingEmailDetail(false);
    }
  };

  // Prepare email send (Triggers mandatory user confirmation dialog)
  const handleInitiateSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) {
      showToast('Recipient and subject are required.');
      return;
    }
    setPendingSendEmail({
      to: composeTo.trim(),
      cc: composeCc.trim() || undefined,
      subject: composeSubject.trim(),
      body: composeBody.trim(),
    });
  };

  // Confirm and send email via Gmail API
  const handleConfirmSendEmail = async () => {
    if (!accessToken || !pendingSendEmail) return;
    setIsSendingEmail(true);
    try {
      await sendGmailMessage(
        accessToken,
        pendingSendEmail.to,
        pendingSendEmail.subject,
        pendingSendEmail.body,
        pendingSendEmail.cc
      );
      showToast(`Email sent successfully to ${pendingSendEmail.to}!`);
      setIsComposingEmail(false);
      setPendingSendEmail(null);
      setComposeTo('');
      setComposeCc('');
      setComposeSubject('');
      setComposeBody('');
      await loadGmailData();
    } catch (err: unknown) {
      console.error('Failed to send email:', err);
      showToast('Failed to send email via Gmail. Check recipient address.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Confirm and trash email
  const handleConfirmDeleteEmail = async () => {
    if (!accessToken || !emailToDelete) return;
    setIsDeletingEmail(true);
    try {
      await deleteGmailMessage(accessToken, emailToDelete.id);
      showToast(`Moved email "${emailToDelete.subject}" to Trash.`);
      setGmailList((prev) => prev.filter((m) => m.id !== emailToDelete.id));
      if (selectedEmail?.id === emailToDelete.id) {
        setSelectedEmail(null);
      }
      setEmailToDelete(null);
    } catch (err: unknown) {
      console.error('Failed to trash email:', err);
      showToast('Failed to delete email.');
    } finally {
      setIsDeletingEmail(false);
    }
  };

  // Load user spreadsheets
  const loadSpreadsheets = async (token = accessToken) => {
    if (!token) return;
    setLoadingSheets(true);
    try {
      const files = await listUserSpreadsheets(token);
      setSheetsList(files);
    } catch (err: unknown) {
      console.error('Failed to load spreadsheets:', err);
      showToast('Could not fetch spreadsheets. Token may have expired. Please re-sign in.');
      setAccessToken(null);
    } finally {
      setLoadingSheets(false);
    }
  };

  // Load user documents
  const loadDocuments = async (token = accessToken) => {
    if (!token) return;
    setLoadingDocs(true);
    try {
      const files = await listUserDocuments(token);
      setDocsList(files);
    } catch (err: unknown) {
      console.error('Failed to load documents:', err);
      showToast('Could not fetch documents. Token may have expired. Please re-sign in.');
      setAccessToken(null);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Load spreadsheet table contents
  const handleSelectSheet = async (file: WorkspaceFile) => {
    if (!accessToken) return;
    setSelectedSheet(file);
    setLoadingSheetData(true);
    setSheetDetails(null);
    setSheetGridValues([]);

    try {
      const details = await getSpreadsheetDetails(accessToken, file.id);
      setSheetDetails(details);
      const firstTab = details.sheets[0]?.title || 'Sheet1';
      setActiveSheetTabTitle(firstTab);

      const values = await getSpreadsheetValues(accessToken, file.id, `${firstTab}!A1:Z50`);
      setSheetGridValues(values);
    } catch (err: unknown) {
      console.error('Failed to fetch spreadsheet details:', err);
      showToast('Failed to load sheet details.');
    } finally {
      setLoadingSheetData(false);
    }
  };

  // Switch tab in spreadsheet viewer
  const handleSwitchSheetTab = async (tabTitle: string) => {
    if (!accessToken || !selectedSheet) return;
    setActiveSheetTabTitle(tabTitle);
    setLoadingSheetData(true);
    try {
      const values = await getSpreadsheetValues(accessToken, selectedSheet.id, `${tabTitle}!A1:Z50`);
      setSheetGridValues(values);
    } catch (err: unknown) {
      console.error('Failed to switch tab:', err);
    } finally {
      setLoadingSheetData(false);
    }
  };

  // Load document contents
  const handleSelectDoc = async (file: WorkspaceFile) => {
    if (!accessToken) return;
    setSelectedDoc(file);
    setLoadingDocData(true);
    setDocDetails(null);

    try {
      const details = await getDocumentDetails(accessToken, file.id);
      setDocDetails(details);
    } catch (err: unknown) {
      console.error('Failed to fetch document:', err);
      showToast('Failed to load document text.');
    } finally {
      setLoadingDocData(false);
    }
  };

  // Create new blank sheet
  const handleCreateNewSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newSheetTitle.trim()) return;

    setExportingAction('creating-sheet');
    try {
      const created = await createGoogleSpreadsheet(accessToken, newSheetTitle.trim(), [
        {
          title: 'Sheet1',
          rows: [
            ['VINISITAHAN INTEGRATED SCHOOL', `SCHOOL ID: ${schoolInfo.schoolId}`],
            ['Date Created', new Date().toLocaleDateString()],
            [],
            ['No.', 'Item Description', 'Quantity', 'Remarks'],
          ],
        },
      ]);
      showToast(`Created Google Sheet: "${created.title}"`);
      setIsCreatingSheet(false);
      setNewSheetTitle('');
      await loadSpreadsheets();
      window.open(created.spreadsheetUrl, '_blank');
    } catch (err: unknown) {
      console.error('Failed to create sheet:', err);
      showToast('Error creating Google Sheet.');
    } finally {
      setExportingAction(null);
    }
  };

  // Create new blank doc
  const handleCreateNewDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newDocTitle.trim()) return;

    setExportingAction('creating-doc');
    try {
      const initialText = `${schoolInfo.name.toUpperCase()}\nDepEd School ID: ${schoolInfo.schoolId}\n${newDocTitle.trim()}\n\nDate: ${new Date().toLocaleDateString()}\n\n`;
      const created = await createGoogleDocument(accessToken, newDocTitle.trim(), initialText);
      showToast(`Created Google Doc: "${created.title}"`);
      setIsCreatingDoc(false);
      setNewDocTitle('');
      await loadDocuments();
      window.open(created.documentUrl, '_blank');
    } catch (err: unknown) {
      console.error('Failed to create document:', err);
      showToast('Error creating Google Doc.');
    } finally {
      setExportingAction(null);
    }
  };

  // 1-Click Export: Faculty Roster to Google Sheets
  const handleExportFacultyToSheets = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    setExportingAction('faculty-sheets');
    try {
      const res = await exportPersonnelToGoogleSheet(accessToken, schoolInfo, personnelList);
      showToast(`Exported ${personnelList.length} faculty members to Google Sheets!`);
      await loadSpreadsheets();
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: unknown) {
      console.error('Export faculty error:', err);
      showToast('Failed to export faculty to Google Sheets.');
    } finally {
      setExportingAction(null);
    }
  };

  // 1-Click Export: Facilities to Google Sheets
  const handleExportFacilitiesToSheets = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    setExportingAction('facilities-sheets');
    try {
      const res = await exportFacilitiesToGoogleSheet(accessToken, schoolInfo, facilities);
      showToast(`Exported ${facilities.length} learning facilities to Google Sheets!`);
      await loadSpreadsheets();
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: unknown) {
      console.error('Export facilities error:', err);
      showToast('Failed to export facilities to Google Sheets.');
    } finally {
      setExportingAction(null);
    }
  };

  // 1-Click Export: BEIS Statistics to Google Sheets
  const handleExportStatisticsToSheets = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    setExportingAction('statistics-sheets');
    try {
      const res = await exportStatisticsToGoogleSheet(accessToken, schoolInfo, personnelList);
      showToast('Exported BEIS school statistics to Google Sheets!');
      await loadSpreadsheets();
      window.open(res.spreadsheetUrl, '_blank');
    } catch (err: unknown) {
      console.error('Export statistics error:', err);
      showToast('Failed to export statistics.');
    } finally {
      setExportingAction(null);
    }
  };

  // 1-Click Export: DepEd School Memorandum to Google Docs
  const handleGenerateMemorandumDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      handleSignIn();
      return;
    }
    setExportingAction('memo-doc');
    try {
      const res = await generateSchoolMemorandumDoc(
        accessToken,
        schoolInfo,
        memoSubject,
        memoRecipient,
        memoSubject,
        memoBody
      );
      showToast('Generated DepEd Official Memorandum in Google Docs!');
      setIsCreatingMemo(false);
      setMemoBody('');
      await loadDocuments();
      window.open(res.documentUrl, '_blank');
    } catch (err: unknown) {
      console.error('Generate memo error:', err);
      showToast('Failed to generate memorandum in Google Docs.');
    } finally {
      setExportingAction(null);
    }
  };

  // 1-Click Export: School Accomplishment & Profile Narrative in Google Docs
  const handleGenerateNarrativeDoc = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    setExportingAction('narrative-doc');
    try {
      const res = await generateAccomplishmentReportDoc(accessToken, schoolInfo, personnelList, hliData);
      showToast('Generated Institutional Profile & Narrative Report in Google Docs!');
      await loadDocuments();
      window.open(res.documentUrl, '_blank');
    } catch (err: unknown) {
      console.error('Generate narrative error:', err);
      showToast('Failed to generate report in Google Docs.');
    } finally {
      setExportingAction(null);
    }
  };

  // Confirm and delete file (SKILL.md MANDATORY explicit user confirmation)
  const confirmDeleteFile = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      showToast(`Permanently removed "${fileToDelete.name}" from Google Drive.`);

      if (fileToDelete.type === 'sheet') {
        setSheetsList((prev) => prev.filter((f) => f.id !== fileToDelete.id));
        if (selectedSheet?.id === fileToDelete.id) {
          setSelectedSheet(null);
          setSheetDetails(null);
        }
      } else {
        setDocsList((prev) => prev.filter((f) => f.id !== fileToDelete.id));
        if (selectedDoc?.id === fileToDelete.id) {
          setSelectedDoc(null);
          setDocDetails(null);
        }
      }
      setFileToDelete(null);
    } catch (err: unknown) {
      console.error('Delete error:', err);
      showToast('Failed to delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  // DepEd email template loader
  const applyEmailTemplate = (templateType: 'circular' | 'parent' | 'student' | 'division') => {
    if (templateType === 'circular') {
      setComposeSubject(`[DepEd Circular] ${schoolInfo.name} - Official School Directive`);
      setComposeBody(`Dear Teaching and Non-Teaching Personnel,\n\nPlease be informed of the following school directive effective immediately:\n\n1. Submission of quarterly learner progress reports.\n2. Participation in upcoming Learning Action Cell (LAC) sessions.\n3. Implementation of campus safety and sanitation guidelines.\n\nFor questions or compliance reporting, coordinate with the Principal's Office.\n\nWarm regards,\n${schoolInfo.schoolHead}\n${schoolInfo.headTitle}, ${schoolInfo.name}\nDepEd School ID: ${schoolInfo.schoolId}`);
    } else if (templateType === 'parent') {
      setComposeSubject(`[School Advisory] ${schoolInfo.name} - Important Notice for Parents & Guardians`);
      setComposeBody(`Dear Parents and Guardians of Vinisitahan Integrated School,\n\nGreetings from Vinisitahan Integrated School!\n\nWe would like to share an important school announcement regarding upcoming academic activities and Parent-Teacher Conferences.\n\nPlease review your child's student handbook for additional guidelines.\n\nSincerely,\nOffice of the School Principal\n${schoolInfo.name}\nContact: ${schoolInfo.contactNumber}`);
    } else if (templateType === 'student') {
      setComposeSubject(`[Student Advisory] ${schoolInfo.name} - Academic Notice & Schedule`);
      setComposeBody(`Dear Learners of Vinisitahan Integrated School,\n\nPlease take note of the scheduled school activities, examination schedules, and Healthy Learning Institute (HLI) campus wellness programs for this month.\n\nRemain committed to your studies and uphold our school values.\n\nFrom,\nYour Teachers and Administration\n${schoolInfo.name}`);
    } else if (templateType === 'division') {
      setComposeSubject(`[Official Transmittal] ${schoolInfo.name} - Division Office Report Submission`);
      setComposeCc(schoolInfo.email);
      setComposeBody(`The Schools Division Superintendent\nDepartment of Education\n\nSir/Madam:\n\nRespectfully submitting herewith the official report and documentation from ${schoolInfo.name} (School ID: ${schoolInfo.schoolId}) for your review and endorsement.\n\nRespectfully yours,\n\n${schoolInfo.schoolHead}\n${schoolInfo.headTitle}, ${schoolInfo.name}\n${schoolInfo.address}`);
    }
  };

  if (!isOpen) return null;

  const filteredSheets = sheetsList.filter((f) =>
    f.name.toLowerCase().includes(sheetsSearch.toLowerCase())
  );
  const filteredDocs = docsList.filter((f) =>
    f.name.toLowerCase().includes(docsSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-google-workspace"
        className="relative w-full max-w-5xl h-[94vh] max-h-[880px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-5 py-3.5 border-b border-blue-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-xl border border-white/15">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm" title="Gmail">
                <Mail className="w-4 h-4" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm" title="Google Sheets">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm" title="Google Docs">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Google Workspace & Gmail Hub
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mail, Sheets & Docs
                </span>
              </div>
              <p className="text-xs text-blue-200">
                DepEd School Communications, Spreadsheets & Official Documents for {schoolInfo.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {accessToken ? (
              <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-200 font-medium truncate max-w-[180px]">
                  {gmailProfile?.emailAddress || googleUser?.email || 'Connected'}
                </span>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-slate-400 hover:text-amber-300 text-[11px] underline ml-1 cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Banner if not authenticated */}
        {!accessToken ? (
          <div className="p-4 bg-gradient-to-r from-red-50 via-blue-50 to-indigo-50 border-b border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Connect your Google Account to use Gmail, Sheets & Docs
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Authorizes sending and reading school emails via Gmail, and creating official DepEd spreadsheets and documents directly in your Google account.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="shrink-0 py-2 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2.5 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : null}

        {/* Tab Navigation: Gmail, Sheets, Docs, Templates */}
        <div className="bg-slate-100/80 px-4 pt-2 border-b border-slate-200 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* 1. Gmail Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('gmail')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'gmail'
                  ? 'border-red-600 text-red-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-t-lg'
              }`}
            >
              <Mail className="w-4 h-4 text-red-600" />
              <span>Gmail Dispatch</span>
              {gmailList.length > 0 && (
                <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {gmailList.length}
                </span>
              )}
            </button>

            {/* 2. Sheets Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'sheets'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-t-lg'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Sheets</span>
              {sheetsList.length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {sheetsList.length}
                </span>
              )}
            </button>

            {/* 3. Docs Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'docs'
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-t-lg'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Google Docs</span>
              {docsList.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {docsList.length}
                </span>
              )}
            </button>

            {/* 4. Export Hub Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'templates'
                  ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-t-lg'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>DepEd Export Hub</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-1.5">
            <button
              type="button"
              onClick={() => {
                if (accessToken) {
                  loadGmailData();
                  loadSpreadsheets();
                  loadDocuments();
                  showToast('Refreshed Gmail & Drive files.');
                }
              }}
              disabled={!accessToken || loadingGmail || loadingSheets || loadingDocs}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              title="Refresh Workspace data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingGmail || loadingSheets || loadingDocs ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-hidden p-3.5 bg-slate-50">
          
          {/* ========================================================================= */}
          {/* TAB 1: GMAIL OFFICIAL DISPATCH & COMMUNICATIONS */}
          {/* ========================================================================= */}
          {activeTab === 'gmail' && (
            <div className="h-full flex flex-col md:flex-row gap-3.5 overflow-hidden">
              
              {/* Left Column: Gmail Inbox List & Controls */}
              <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden shrink-0">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={gmailSearch}
                      onChange={(e) => setGmailSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') loadGmailData();
                      }}
                      placeholder="Search messages..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!accessToken) handleSignIn();
                      else setIsComposingEmail(true);
                    }}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-xs font-bold px-2.5"
                    title="Compose new official email"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Compose</span>
                  </button>
                </div>

                {/* Profile indicator */}
                {gmailProfile && (
                  <div className="px-3 py-1.5 bg-red-50/50 border-b border-red-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="truncate max-w-[200px] font-medium text-red-950">
                      {gmailProfile.emailAddress}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {gmailProfile.messagesTotal.toLocaleString()} messages
                    </span>
                  </div>
                )}

                {/* Gmail List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {loadingGmail ? (
                    <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-red-600 animate-spin mb-2" />
                      Fetching Gmail messages...
                    </div>
                  ) : gmailList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-3">
                      <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>
                        {accessToken
                          ? 'No messages found in your mailbox.'
                          : 'Sign in with Google to view and manage school emails.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (!accessToken) handleSignIn();
                          else setIsComposingEmail(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Draft First School Email</span>
                      </button>
                    </div>
                  ) : (
                    gmailList.map((msg) => {
                      const isSelected = selectedEmail?.id === msg.id;
                      return (
                        <div
                          key={msg.id}
                          onClick={() => handleSelectEmail(msg)}
                          className={`p-3 text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-red-50/80 border-l-4 border-red-600'
                              : msg.isUnread
                              ? 'bg-slate-50/70 font-semibold'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {msg.isUnread && (
                                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" title="Unread" />
                              )}
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {msg.subject || '(No Subject)'}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate mt-0.5">
                              {msg.from || 'Unknown Sender'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {msg.snippet || ''}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[10px] text-slate-400">
                              {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmailToDelete({ id: msg.id, subject: msg.subject || 'this email' });
                              }}
                              className="p-1 text-slate-300 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Trash email"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick DepEd Email Action Footer */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Quick Official DepEd Dispatch
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        applyEmailTemplate('circular');
                        setIsComposingEmail(true);
                      }}
                      className="px-2 py-1.5 bg-white hover:bg-red-50 text-red-800 border border-red-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Users className="w-3 h-3 text-red-600" />
                      <span>Faculty Notice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        applyEmailTemplate('parent');
                        setIsComposingEmail(true);
                      }}
                      className="px-2 py-1.5 bg-white hover:bg-red-50 text-red-800 border border-red-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <UserCheck className="w-3 h-3 text-red-600" />
                      <span>Parent Advisory</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Gmail Message Viewer */}
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
                {selectedEmail ? (
                  <>
                    <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                            DepEd Mail
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {selectedEmail.subject || '(No Subject)'}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                          <span><strong>From:</strong> {selectedEmail.from}</span>
                          {selectedEmail.to && <span><strong>To:</strong> {selectedEmail.to}</span>}
                          {selectedEmail.date && <span><strong>Date:</strong> {selectedEmail.date}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setComposeTo(selectedEmail.from || '');
                            setComposeSubject(`Re: ${selectedEmail.subject}`);
                            setComposeBody(`\n\n--- On ${selectedEmail.date || 'prior'}, ${selectedEmail.from} wrote ---\n> ${(selectedEmail.bodyText || '').substring(0, 300)}...`);
                            setIsComposingEmail(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Reply className="w-3.5 h-3.5 text-slate-600" />
                          <span>Reply</span>
                        </button>
                        <a
                          href="https://mail.google.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-2xs"
                        >
                          <span>Open in Gmail</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Email Body Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
                      {loadingEmailDetail ? (
                        <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500">
                          <RefreshCw className="w-6 h-6 text-red-600 animate-spin mb-2" />
                          <span>Loading full email content from Gmail API...</span>
                        </div>
                      ) : (
                        <div className="max-w-3xl mx-auto bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                          {selectedEmail.bodyText || 'No message content available.'}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-3 shadow-xs">
                      <Mail className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Official Gmail Communications Desk</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                      Select an incoming school message from the left to read full correspondence, or compose official circulars, parent notices, and division transmittals.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!accessToken) handleSignIn();
                        else setIsComposingEmail(true);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Compose School Email</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GOOGLE SHEETS */}
          {/* ========================================================================= */}
          {activeTab === 'sheets' && (
            <div className="h-full flex flex-col md:flex-row gap-3.5 overflow-hidden">
              
              {/* Left Column: Sheets List & Controls */}
              <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden shrink-0">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={sheetsSearch}
                      onChange={(e) => setSheetsSearch(e.target.value)}
                      placeholder="Search spreadsheets..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!accessToken) handleSignIn();
                      else setIsCreatingSheet(true);
                    }}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                    title="Create new spreadsheet"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Sheets Listing */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {loadingSheets ? (
                    <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin mb-2" />
                      Loading Google Sheets...
                    </div>
                  ) : filteredSheets.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-3">
                      <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>
                        {accessToken
                          ? 'No Google Sheets found in your Drive matching query.'
                          : 'Sign in with Google to view and manage your spreadsheets.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleExportFacultyToSheets}
                        disabled={exportingAction !== null}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Export Faculty Roster (SF7)</span>
                      </button>
                    </div>
                  ) : (
                    filteredSheets.map((file) => {
                      const isSelected = selectedSheet?.id === file.id;
                      return (
                        <div
                          key={file.id}
                          onClick={() => handleSelectSheet(file)}
                          className={`p-3 text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {file.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {file.modifiedTime
                                ? new Date(file.modifiedTime).toLocaleDateString()
                                : 'Recent'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 text-slate-400 hover:text-emerald-700 rounded hover:bg-slate-100 transition-colors"
                              title="Open directly in Google Sheets"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFileToDelete({ id: file.id, name: file.name, type: 'sheet' });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete spreadsheet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick 1-Click Export Footer */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    1-Click DepEd Sheets Export
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportFacultyToSheets}
                      disabled={exportingAction !== null}
                      className="px-2 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Users className="w-3 h-3 text-emerald-600" />
                      <span>Roster (SF7)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportFacilitiesToSheets}
                      disabled={exportingAction !== null}
                      className="px-2 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Building2 className="w-3 h-3 text-emerald-600" />
                      <span>Facilities</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Spreadsheet Preview / Grid Table */}
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
                {selectedSheet ? (
                  <>
                    <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {selectedSheet.name}
                          </h3>
                          <p className="text-[10px] text-slate-500">
                            Live Spreadsheet Preview • Vinisitahan IS Workspace
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={selectedSheet.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs"
                        >
                          <span>Open in Google Sheets</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Sheet Tabs Header */}
                    {sheetDetails && sheetDetails.sheets.length > 1 && (
                      <div className="px-3 pt-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
                        {sheetDetails.sheets.map((tab) => (
                          <button
                            key={tab.sheetId}
                            type="button"
                            onClick={() => handleSwitchSheetTab(tab.title)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
                              activeSheetTabTitle === tab.title
                                ? 'bg-white text-emerald-800 font-bold border-t border-x border-slate-200'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {tab.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Spreadsheet Table View */}
                    <div className="flex-1 overflow-auto p-3">
                      {loadingSheetData ? (
                        <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500">
                          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
                          <span>Reading spreadsheet cell data from Google Sheets API...</span>
                        </div>
                      ) : sheetGridValues.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                          <FileSpreadsheet className="w-10 h-10 text-slate-200 mb-2" />
                          <span>No cells populated in this range yet.</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                          <table className="w-full border-collapse text-left text-xs font-mono">
                            <tbody>
                              {sheetGridValues.map((row, rIdx) => {
                                const isHeader = rIdx === 0 || (sheetGridValues.length > 5 && rIdx === 6);
                                return (
                                  <tr
                                    key={rIdx}
                                    className={`border-b border-slate-200 ${
                                      isHeader
                                        ? 'bg-emerald-50/90 font-bold text-emerald-950 sticky top-0'
                                        : rIdx % 2 === 0
                                        ? 'bg-white text-slate-800 hover:bg-slate-50'
                                        : 'bg-slate-50/50 text-slate-800 hover:bg-slate-100/60'
                                    }`}
                                  >
                                    <td className="py-1.5 px-2.5 text-[10px] font-bold text-slate-400 bg-slate-100 border-r border-slate-200 select-none w-8 text-center">
                                      {rIdx + 1}
                                    </td>
                                    {row.map((cell: any, cIdx: number) => (
                                      <td
                                        key={cIdx}
                                        className="py-1.5 px-3 border-r border-slate-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-[240px]"
                                      >
                                        {String(cell ?? '')}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                      <FileSpreadsheet className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Select a Google Sheet to Preview</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Choose a spreadsheet from the left list to view tabular data, or export fresh school records into a new Google Sheet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: GOOGLE DOCS */}
          {/* ========================================================================= */}
          {activeTab === 'docs' && (
            <div className="h-full flex flex-col md:flex-row gap-3.5 overflow-hidden">
              
              {/* Left Column: Docs List */}
              <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden shrink-0">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={docsSearch}
                      onChange={(e) => setDocsSearch(e.target.value)}
                      placeholder="Search documents..."
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!accessToken) handleSignIn();
                      else setIsCreatingDoc(true);
                    }}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                    title="Create new Google Doc"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Docs Listing */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {loadingDocs ? (
                    <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mb-2" />
                      Loading Google Docs...
                    </div>
                  ) : filteredDocs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-3">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>
                        {accessToken
                          ? 'No Google Docs found in your Drive matching query.'
                          : 'Sign in with Google to view and manage your school documents.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerateNarrativeDoc}
                        disabled={exportingAction !== null}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Generate First School Doc</span>
                      </button>
                    </div>
                  ) : (
                    filteredDocs.map((file) => {
                      const isSelected = selectedDoc?.id === file.id;
                      return (
                        <div
                          key={file.id}
                          onClick={() => handleSelectDoc(file)}
                          className={`p-3 text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-50/70 border-l-4 border-blue-600'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {file.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {file.modifiedTime
                                ? new Date(file.modifiedTime).toLocaleDateString()
                                : 'Recent'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-slate-100 transition-colors"
                              title="Open directly in Google Docs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFileToDelete({ id: file.id, name: file.name, type: 'doc' });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick 1-Click Docs Action */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    1-Click DepEd Docs Generator
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!accessToken) handleSignIn();
                        else setIsCreatingMemo(true);
                      }}
                      className="px-2 py-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3 h-3 text-blue-600" />
                      <span>School Memo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateNarrativeDoc}
                      disabled={exportingAction !== null}
                      className="px-2 py-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>Narrative Profile</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Google Doc Paper Preview */}
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
                {selectedDoc ? (
                  <>
                    <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {selectedDoc.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>Google Docs Reader</span>
                            {docDetails && (
                              <>
                                <span>•</span>
                                <span>{docDetails.wordCount} words</span>
                                <span>•</span>
                                <span>{docDetails.characterCount} characters</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={selectedDoc.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs"
                        >
                          <span>Open in Google Docs</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Clean Paper Document Preview */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
                      {loadingDocData ? (
                        <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500">
                          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                          <span>Reading document content via Google Docs API...</span>
                        </div>
                      ) : !docDetails || !docDetails.bodyText ? (
                        <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                          <FileText className="w-10 h-10 text-slate-200 mb-2" />
                          <span>This document has no readable body text.</span>
                        </div>
                      ) : (
                        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 font-serif text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {docDetails.bodyText}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Select a Google Doc to Read</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Choose a document from the left list to read its content, or generate an official DepEd School Memorandum or narrative report.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DEPED EXPORT & DISPATCH HUB */}
          {/* ========================================================================= */}
          {activeTab === 'templates' && (
            <div className="h-full overflow-y-auto pr-1 space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    DepEd School Records & Forms Workspace Hub
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Synchronize Vinisitahan Integrated School records directly with Gmail, Google Sheets, and Google Docs.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>DepEd School ID: {schoolInfo.schoolId}</span>
                </div>
              </div>

              {/* Grid of Templates and 1-Click Operations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Gmail Official Dispatches */}
                <div className="p-4 bg-white rounded-xl border border-red-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Official DepEd Faculty Circular
                      </h4>
                      <p className="text-[11px] text-slate-500">Target: Gmail API</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Dispatches formal DepEd administrative memos and guidelines to all faculty and staff email inboxes registered under Vinisitahan IS.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      applyEmailTemplate('circular');
                      setActiveTab('gmail');
                      setIsComposingEmail(true);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Draft Faculty Circular in Gmail</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-red-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Parent & Stakeholder Advisory
                      </h4>
                      <p className="text-[11px] text-slate-500">Target: Gmail API</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Sends general PTA advisories, academic schedules, suspension notices, and healthy learning milestones directly via school email.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      applyEmailTemplate('parent');
                      setActiveTab('gmail');
                      setIsComposingEmail(true);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Draft Parent Advisory in Gmail</span>
                  </button>
                </div>

                {/* 2. Google Sheets Cards */}
                <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Faculty & Personnel Roster (SF7)
                      </h4>
                      <p className="text-[11px] text-slate-500">Target: Google Sheets</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Generates an official formatted DepEd School Form 7 with all {personnelList.length} faculty and staff members, plantilla positions, advisory sections, and verified emails.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportFacultyToSheets}
                    disabled={exportingAction !== null}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{exportingAction === 'faculty-sheets' ? 'Exporting...' : 'Export to Google Sheets'}</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Facilities & Physical Infrastructure
                      </h4>
                      <p className="text-[11px] text-slate-500">Target: Google Sheets</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Exports campus learning centers, IT laboratories, classrooms, capacities, and usability conditions across all {facilities.length} physical assets.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportFacilitiesToSheets}
                    disabled={exportingAction !== null}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{exportingAction === 'facilities-sheets' ? 'Exporting...' : 'Export to Google Sheets'}</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        BEIS Profile & School Statistics
                      </h4>
                      <p className="text-[11px] text-slate-500">Target: Google Sheets</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Creates an official DepEd Basic Education Information System statistical summary table covering learner totals, teacher ratios, and school credentials.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportStatisticsToSheets}
                    disabled={exportingAction !== null}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{exportingAction === 'statistics-sheets' ? 'Exporting...' : 'Export to Google Sheets'}</span>
                  </button>
                </div>

                {/* 3. Google Docs Cards */}
                <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Official DepEd School Memorandum
                      </h4>
                      <p className="text-[11px] text-slate-500">Target: Google Docs</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Draft and create a formal Vinisitahan Integrated School Memorandum with complete DepEd letterhead, subject, directive paragraphs, and sign-off blocks.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!accessToken) handleSignIn();
                      else setIsCreatingMemo(true);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Draft Memorandum in Google Docs</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Comprehensive School Accomplishment & Profile Narrative
                      </h4>
                      <p className="text-[11px] text-slate-500">Target: Google Docs</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Generates a full-length institutional report in Google Docs covering Vinisitahan Integrated School history, mission, student demographics, faculty counts, physical learning infrastructure, and Healthy Learning Institute (HLI) 6 Pillars milestone progress.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateNarrativeDoc}
                    disabled={exportingAction !== null}
                    className="w-full sm:w-auto py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{exportingAction === 'narrative-doc' ? 'Generating Report in Google Docs...' : 'Generate Complete Accomplishment Narrative'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* COMPOSE GMAIL MODAL */}
        {/* ========================================================================= */}
        {isComposingEmail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
            <form
              onSubmit={handleInitiateSendEmail}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Compose Official School Email</h4>
                    <p className="text-[10px] text-slate-500">Dispatched via Gmail API</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComposingEmail(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Template quick pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="text-[10px] font-semibold text-slate-400">Templates:</span>
                <button
                  type="button"
                  onClick={() => applyEmailTemplate('circular')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-medium whitespace-nowrap cursor-pointer text-[10px]"
                >
                  Faculty Circular
                </button>
                <button
                  type="button"
                  onClick={() => applyEmailTemplate('parent')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-medium whitespace-nowrap cursor-pointer text-[10px]"
                >
                  Parent Advisory
                </button>
                <button
                  type="button"
                  onClick={() => applyEmailTemplate('student')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-medium whitespace-nowrap cursor-pointer text-[10px]"
                >
                  Student Notice
                </button>
                <button
                  type="button"
                  onClick={() => applyEmailTemplate('division')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-medium whitespace-nowrap cursor-pointer text-[10px]"
                >
                  Division Transmittal
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">To (Recipient Email)</label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="e.g. division.sorsogon@deped.gov.ph or parent@gmail.com"
                  required
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Cc (Optional)</label>
                <input
                  type="text"
                  value={composeCc}
                  onChange={(e) => setComposeCc(e.target.value)}
                  placeholder="e.g. principal@deped.gov.ph"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject line"
                  required
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Message Body</label>
                <textarea
                  rows={5}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type email body..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 font-medium leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposingEmail(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Send</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MANDATORY EXPLICIT CONFIRMATION FOR SENDING EMAIL (SKILL REQUIREMENT) */}
        {/* ========================================================================= */}
        {pendingSendEmail && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirm Email Dispatch
                  </h3>
                  <p className="text-xs text-slate-500">
                    This email will be dispatched using your Gmail account.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-xs space-y-1.5 text-slate-800">
                <div><strong>To:</strong> {pendingSendEmail.to}</div>
                {pendingSendEmail.cc && <div><strong>Cc:</strong> {pendingSendEmail.cc}</div>}
                <div><strong>Subject:</strong> {pendingSendEmail.subject}</div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-red-100 max-h-24 overflow-y-auto">
                  {pendingSendEmail.body.substring(0, 150)}...
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingSendEmail(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Back to Editing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendEmail}
                  disabled={isSendingEmail}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Sending via Gmail...' : 'Confirm & Send Now'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MANDATORY EXPLICIT CONFIRMATION FOR DELETING EMAIL (SKILL REQUIREMENT) */}
        {/* ========================================================================= */}
        {emailToDelete && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Trash Email Message?
                  </h3>
                  <p className="text-xs text-slate-500">
                    This message will be moved to your Gmail Trash folder.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-800">
                Are you sure you want to trash <strong className="text-red-950 font-bold">"{emailToDelete.subject}"</strong>?
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailToDelete(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteEmail}
                  disabled={isDeletingEmail}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isDeletingEmail ? 'Trashing...' : 'Confirm Move to Trash'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE SPREADSHEET DIALOG */}
        {isCreatingSheet && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
            <form
              onSubmit={handleCreateNewSheet}
              className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Create New Google Sheet</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingSheet(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spreadsheet Title
                </label>
                <input
                  type="text"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  placeholder="e.g. Vinisitahan IS - Grade 7 Enrolment 2026"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSheet(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={exportingAction !== null}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  {exportingAction === 'creating-sheet' ? 'Creating...' : 'Create & Open in Sheets'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CREATE DOCUMENT DIALOG */}
        {isCreatingDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
            <form
              onSubmit={handleCreateNewDoc}
              className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Create New Google Doc</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingDoc(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Vinisitahan IS - Action Plan 2026"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingDoc(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={exportingAction !== null}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  {exportingAction === 'creating-doc' ? 'Creating...' : 'Create & Open in Docs'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DRAFT MEMORANDUM MODAL */}
        {isCreatingMemo && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
            <form
              onSubmit={handleGenerateMemorandumDoc}
              className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Draft DepEd Memorandum in Google Docs</h4>
                    <p className="text-[10px] text-slate-500">Official Vinisitahan IS Document</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingMemo(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Recipient (To:)</label>
                <input
                  type="text"
                  value={memoRecipient}
                  onChange={(e) => setMemoRecipient(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Subject / Matter</label>
                <input
                  type="text"
                  value={memoSubject}
                  onChange={(e) => setMemoSubject(e.target.value)}
                  required
                  placeholder="e.g. Schedule of 3rd Quarter Parent-Teacher Conference"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Memo Directive Content</label>
                <textarea
                  rows={4}
                  value={memoBody}
                  onChange={(e) => setMemoBody(e.target.value)}
                  placeholder="Type specific guidelines, instructions, or advisories for this school memo..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingMemo(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={exportingAction !== null}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  {exportingAction === 'memo-doc' ? 'Generating Memo in Docs...' : 'Create & Open Memorandum'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DRIVE FILE DELETION CONFIRMATION MODAL (MANDATORY REQUIREMENT OF WORKSPACE SKILL) */}
        {fileToDelete && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Delete Google {fileToDelete.type === 'sheet' ? 'Spreadsheet' : 'Document'}?
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action will permanently remove the file from your Google Drive.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-800">
                Are you sure you want to delete <strong className="text-red-950 font-bold">"{fileToDelete.name}"</strong>? This operation cannot be undone.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToDelete(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFile}
                  disabled={isDeleting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting from Drive...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
