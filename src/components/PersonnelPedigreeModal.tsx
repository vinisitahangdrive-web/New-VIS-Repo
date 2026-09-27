import React, { useState, useMemo } from 'react';
import { PersonnelMember, PersonnelCategory, SchoolInfo } from '../types';
import { SchoolCrest } from './SchoolCrest';
import { PersonnelEditModal } from './PersonnelEditModal';
import { PersonnelUploadModal } from './PersonnelUploadModal';
import { PersonnelAvatar } from './PersonnelAvatar';
import { 
  Users, 
  GitBranch, 
  ListFilter, 
  Search, 
  UserPlus, 
  Upload, 
  Download, 
  Printer, 
  RotateCcw, 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  GraduationCap, 
  School, 
  Briefcase, 
  Award, 
  X, 
  CheckCircle2, 
  Shield, 
  ChevronRight,
  Sparkles,
  Plus,
  AlertTriangle
} from 'lucide-react';

interface PersonnelPedigreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: PersonnelMember[];
  schoolInfo: SchoolInfo;
  isAdmin: boolean;
  onSaveMember: (member: PersonnelMember) => void;
  onDeleteMember: (memberId: string) => void;
  onImportMembers: (members: PersonnelMember[], mode: 'replace' | 'append') => void;
  onResetToDefault: () => void;
}

export const PersonnelPedigreeModal: React.FC<PersonnelPedigreeModalProps> = ({
  isOpen,
  onClose,
  personnelList,
  schoolInfo,
  isAdmin,
  onSaveMember,
  onDeleteMember,
  onImportMembers,
  onResetToDefault,
}) => {
  const [viewMode, setViewMode] = useState<'pedigree' | 'roster'>('pedigree');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingMember, setEditingMember] = useState<PersonnelMember | null>(null);
  const [addDefaults, setAddDefaults] = useState<{
    category?: PersonnelCategory;
    reportsToId?: string | null;
  }>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<PersonnelMember | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Classification helpers for District and School Administrative Officers
  const isDistrictAO = (m: PersonnelMember): boolean => {
    if (m.category === 'district_admin_officer') return true;
    if (m.id === 'personnel-district-admin-officer') return true;
    if (m.category === 'admin_officer') {
      if (psdsMember && m.reportsToId === psdsMember.id) return true;
      const pos = (m.position || '').toLowerCase();
      const dept = (m.departmentOrGrade || '').toLowerCase();
      if (pos.includes('district') || dept.includes('district')) return true;
    }
    return false;
  };

  const isSchoolAO = (m: PersonnelMember): boolean => {
    if (isDistrictAO(m)) return false;
    if (m.category === 'admin_officer') return true;
    if (m.id === 'personnel-admin-officer') return true;
    const pos = (m.position || '').toLowerCase();
    const dept = (m.departmentOrGrade || '').toLowerCase();
    if (
      pos.includes('administrative officer') ||
      pos.includes('ao ii') ||
      pos.includes('ao iv') ||
      dept.includes('administrative officer') ||
      dept.includes('school operations')
    ) {
      return true;
    }
    return false;
  };

  // Group members into pedigree tiers
  const psdsMember = useMemo(() => {
    return personnelList.find((m) => m.category === 'district');
  }, [personnelList]);

  // Multiple District Administrative Officers directly below the PSDS
  const districtAdminOfficers = useMemo(() => {
    return personnelList.filter((m) => isDistrictAO(m));
  }, [personnelList, psdsMember]);

  const schoolHeadMember = useMemo(() => {
    return personnelList.find(
      (m) =>
        m.category === 'administration' ||
        m.id === 'personnel-principal' ||
        m.position.toLowerCase().includes('principal') ||
        m.position.toLowerCase().includes('school head')
    );
  }, [personnelList]);

  // Multiple School Administrative Officers below Principal
  const schoolAdminOfficers = useMemo(() => {
    return personnelList.filter((m) => isSchoolAO(m));
  }, [personnelList, psdsMember]);

  const elementaryMembers = useMemo(() => {
    return personnelList.filter((m) => m.category === 'elementary');
  }, [personnelList]);

  const secondaryMembers = useMemo(() => {
    return personnelList.filter((m) => m.category === 'secondary');
  }, [personnelList]);

  const nonTeachingMembers = useMemo(() => {
    return personnelList.filter(
      (m) =>
        m.category === 'non_teaching' &&
        !isDistrictAO(m) &&
        !isSchoolAO(m)
    );
  }, [personnelList, psdsMember]);

  // Filtered members for directory / roster view & search
  const filteredList = useMemo(() => {
    return personnelList.filter((member) => {
      let matchesCategory = true;
      if (selectedCategory === 'all') {
        matchesCategory = true;
      } else if (selectedCategory === 'district') {
        matchesCategory = member.category === 'district';
      } else if (selectedCategory === 'district_admin_officer') {
        matchesCategory = isDistrictAO(member);
      } else if (selectedCategory === 'administration') {
        matchesCategory = member.category === 'administration';
      } else if (selectedCategory === 'admin_officer') {
        matchesCategory = isSchoolAO(member);
      } else if (selectedCategory === 'elementary') {
        matchesCategory = member.category === 'elementary';
      } else if (selectedCategory === 'secondary') {
        matchesCategory = member.category === 'secondary';
      } else if (selectedCategory === 'non_teaching') {
        matchesCategory =
          member.category === 'non_teaching' &&
          !isDistrictAO(member) &&
          !isSchoolAO(member);
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        member.name.toLowerCase().includes(q) ||
        member.position.toLowerCase().includes(q) ||
        member.departmentOrGrade.toLowerCase().includes(q) ||
        (member.email && member.email.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [personnelList, selectedCategory, searchQuery, psdsMember]);

  if (!isOpen) return null;

  const handleOpenAdd = (category?: PersonnelCategory, reportsToId?: string | null) => {
    setEditingMember(null);
    setAddDefaults({ category, reportsToId });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (member: PersonnelMember) => {
    setEditingMember(member);
    setAddDefaults({ category: member.category, reportsToId: member.reportsToId });
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (member: PersonnelMember) => {
    setMemberToDelete(member);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      onDeleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  const handleConfirmReset = () => {
    onResetToDefault();
    setShowResetConfirm(false);
  };

  const handleExportCSV = () => {
    const headers = 'Name,Position,Category,DepartmentOrGrade,Email,ContactNumber';
    const rows = personnelList.map(
      (m) =>
        `"${m.name.replace(/"/g, '""')}","${m.position.replace(/"/g, '""')}","${m.category}","${m.departmentOrGrade.replace(/"/g, '""')}","${m.email || ''}","${m.contactNumber || ''}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vinisitahan_personnel_list_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="modal-personnel-pedigree"
        className="relative w-full max-w-7xl max-h-[94vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <SchoolCrest
                customLogoUrl={schoolInfo.logoUrl}
                size="md"
                schoolName={schoolInfo.name}
                schoolId={schoolInfo.schoolId}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider border border-blue-200">
                  DepEd BEIS ID: {schoolInfo.schoolId}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {schoolInfo.district}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Faculty & Personnel Organizational Hierarchy
              </h2>
              <p className="text-xs text-slate-500">
                Official pedigree tree and directory of teachers, school heads, and non-teaching personnel.
              </p>
            </div>
          </div>

          {/* Action Buttons & Close */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Cloud Database Sync Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Cloud Storage Synced</span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex rounded-lg bg-slate-200 p-0.5 border border-slate-300 text-xs">
              <button
                type="button"
                id="btn-view-pedigree"
                onClick={() => setViewMode('pedigree')}
                className={`px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'pedigree'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Pedigree Tree</span>
              </button>
              <button
                type="button"
                id="btn-view-roster"
                onClick={() => setViewMode('roster')}
                className={`px-3 py-1.5 font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'roster'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Directory List</span>
              </button>
            </div>

            {/* Print & Export */}
            <button
              type="button"
              onClick={handleExportCSV}
              title="Download CSV Spreadsheet"
              className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Print Hierarchy / Directory"
              className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Admin Management Tools */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  id="btn-admin-add-personnel"
                  onClick={() => handleOpenAdd('elementary', schoolHeadMember?.id || null)}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>

                <button
                  type="button"
                  id="btn-admin-upload-personnel"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Upload CSV / JSON Spreadsheet"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Data</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
                  title="Reset to default personnel list"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="input-search-personnel"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, rank, grade, or subject..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({personnelList.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('district')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'district'
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              District PSDS ({psdsMember ? 1 : 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('district_admin_officer')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'district_admin_officer'
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              District Admin ({districtAdminOfficers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('administration')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'administration'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              School Head ({schoolHeadMember ? 1 : 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('admin_officer')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'admin_officer'
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              School Admin ({schoolAdminOfficers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('elementary')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'elementary'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Elementary ({elementaryMembers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('secondary')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'secondary'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Secondary ({secondaryMembers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('non_teaching')}
              className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'non_teaching'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Non-Teaching ({nonTeachingMembers.length})
            </button>
          </div>
        </div>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {viewMode === 'pedigree' && !searchQuery && selectedCategory === 'all' ? (
            /* ================= PEDIGREE TREE VIEW ================= */
            <div className="space-y-8 min-w-[760px] pb-10">
              
              {/* LEVEL 1: DISTRICT SUPERVISION (PSDS) */}
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 mb-2">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  District Educational Leadership
                </div>

                {psdsMember ? (
                  <div className="relative group w-full max-w-md bg-gradient-to-br from-amber-50 to-white rounded-2xl border-2 border-amber-300 shadow-md p-5 text-center hover:shadow-lg transition-all">
                    <div className="flex flex-col items-center space-y-2">
                      <PersonnelAvatar
                        photoUrl={psdsMember.photoUrl}
                        name={psdsMember.name}
                        category="district"
                        size="xl"
                        ringClassName="ring-4 ring-amber-300 shadow-md"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 uppercase tracking-wide">
                          {psdsMember.position}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                          {psdsMember.name}
                        </h3>
                        <p className="text-xs text-amber-800 font-medium">
                          {psdsMember.departmentOrGrade}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-500">
                        {psdsMember.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {psdsMember.email}
                          </span>
                        )}
                        {psdsMember.contactNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {psdsMember.contactNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(psdsMember)}
                          className="p-1.5 rounded-md bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 text-xs shadow-2xs cursor-pointer"
                          title="Edit PSDS details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(psdsMember)}
                          className="p-1.5 rounded-md bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 text-xs shadow-2xs cursor-pointer"
                          title="Delete PSDS"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-md p-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 text-center space-y-2">
                    <p className="text-xs font-semibold text-amber-800">
                      Public Schools District Supervisor (Vacant / Not Set)
                    </p>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd('district', null)}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add PSDS Leader</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Vertical Connector Line from PSDS to District Administrative Office */}
                <div className="w-0.5 h-6 bg-amber-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"></div>
                <div className="w-0.5 h-4 bg-amber-300"></div>
              </div>

              {/* LEVEL 2: DISTRICT ADMINISTRATIVE OFFICE (BELOW PSDS) */}
              <div className="flex flex-col items-center w-full">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                    <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                    <span>District Administrative Office</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
                      {districtAdminOfficers.length}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      id="btn-admin-add-district-ao"
                      onClick={() => handleOpenAdd('district_admin_officer', psdsMember?.id || null)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      title="Add another District Administrative Officer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add District AO</span>
                    </button>
                  )}
                </div>

                {districtAdminOfficers.length > 0 ? (
                  <div
                    className={`grid gap-4 w-full justify-center ${
                      districtAdminOfficers.length === 1
                        ? 'max-w-md mx-auto grid-cols-1'
                        : districtAdminOfficers.length === 2
                        ? 'max-w-3xl mx-auto grid-cols-1 md:grid-cols-2'
                        : 'max-w-5xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}
                  >
                    {districtAdminOfficers.map((officer) => (
                      <div
                        key={officer.id}
                        className="relative group bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 rounded-2xl border-2 border-amber-400 shadow-md p-5 text-center hover:shadow-xl transition-all flex flex-col justify-between"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <PersonnelAvatar
                            photoUrl={officer.photoUrl}
                            name={officer.name}
                            category="district_admin_officer"
                            size="xl"
                            ringClassName="ring-4 ring-amber-400 shadow-md"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-700 text-white uppercase tracking-wide">
                                {officer.position}
                              </span>
                              <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                                District Staff
                              </span>
                            </div>

                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                              {officer.name}
                            </h3>
                            <p className="text-xs text-amber-900 font-semibold">
                              {officer.departmentOrGrade}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-slate-600">
                            {officer.email && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <Mail className="w-3 h-3 text-amber-700" />
                                {officer.email}
                              </span>
                            )}
                            {officer.contactNumber && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                {officer.contactNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(officer)}
                              className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 hover:text-amber-700 border border-slate-200 text-xs shadow-2xs cursor-pointer"
                              title="Edit District Administrative Officer details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(officer)}
                              className="p-1.5 rounded-md bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 text-xs shadow-2xs cursor-pointer"
                              title="Delete District Administrative Officer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full max-w-md p-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 text-center space-y-2">
                    <p className="text-xs font-semibold text-amber-800">
                      District Administrative Office (Vacant / Not Set)
                    </p>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd('district_admin_officer', psdsMember?.id || null)}
                        className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add District Admin Officer</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Vertical Connector Line from District Administrative Office to School Head */}
                <div className="w-0.5 h-6 bg-blue-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white"></div>
                <div className="w-0.5 h-4 bg-blue-300"></div>
              </div>

              {/* LEVEL 3: SCHOOL HEAD / PRINCIPAL */}
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-blue-100 text-blue-900 border border-blue-300 mb-2">
                  <Building className="w-3.5 h-3.5 text-blue-700" />
                  Office of the School Head
                </div>

                {schoolHeadMember ? (
                  <div className="relative group w-full max-w-lg bg-gradient-to-br from-blue-50 via-white to-slate-50 rounded-2xl border-2 border-blue-600 shadow-md p-5 text-center hover:shadow-xl transition-all">
                    <div className="flex flex-col items-center space-y-2">
                      <PersonnelAvatar
                        photoUrl={schoolHeadMember.photoUrl}
                        name={schoolHeadMember.name}
                        category="administration"
                        size="2xl"
                        ringClassName="ring-4 ring-blue-500 shadow-lg"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-700 text-white uppercase tracking-wide">
                            {schoolHeadMember.position}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                            Integrated School Head
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          {schoolHeadMember.name}
                        </h3>
                        <p className="text-xs text-blue-900 font-semibold">
                          {schoolInfo.name} • School ID: {schoolInfo.schoolId}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-slate-600">
                        {schoolHeadMember.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-600" />
                            {schoolHeadMember.email}
                          </span>
                        )}
                        {schoolHeadMember.contactNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {schoolHeadMember.contactNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(schoolHeadMember)}
                          className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 hover:text-blue-700 border border-slate-200 text-xs shadow-2xs cursor-pointer"
                          title="Edit School Head details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(schoolHeadMember)}
                          className="p-1.5 rounded-md bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 text-xs shadow-2xs cursor-pointer"
                          title="Delete School Head"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-lg p-5 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 text-center space-y-2">
                    <p className="text-xs font-semibold text-blue-800">
                      Office of the School Head (Vacant / Not Set)
                    </p>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd('administration', districtAdminOfficers[0]?.id || psdsMember?.id || null)}
                        className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add School Head / Principal</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Vertical Connector Line from School Head to Administrative Officer */}
                <div className="w-0.5 h-6 bg-blue-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white"></div>
                <div className="w-0.5 h-4 bg-blue-300"></div>
              </div>

              {/* LEVEL 4: SCHOOL ADMINISTRATIVE OFFICER */}
              <div className="flex flex-col items-center w-full">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-teal-100 text-teal-950 border border-teal-300 shadow-2xs">
                    <Briefcase className="w-3.5 h-3.5 text-teal-700" />
                    <span>Office of the Administrative Officer</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-teal-200 text-teal-900 text-[10px] font-black">
                      {schoolAdminOfficers.length}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      id="btn-admin-add-school-ao"
                      onClick={() => handleOpenAdd('admin_officer', schoolHeadMember?.id || null)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      title="Add another School Administrative Officer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Administrative Officer</span>
                    </button>
                  )}
                </div>

                {schoolAdminOfficers.length > 0 ? (
                  <div
                    className={`grid gap-4 w-full justify-center ${
                      schoolAdminOfficers.length === 1
                        ? 'max-w-md mx-auto grid-cols-1'
                        : schoolAdminOfficers.length === 2
                        ? 'max-w-3xl mx-auto grid-cols-1 md:grid-cols-2'
                        : 'max-w-5xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}
                  >
                    {schoolAdminOfficers.map((officer) => (
                      <div
                        key={officer.id}
                        className="relative group bg-gradient-to-br from-teal-50/80 via-white to-slate-50 rounded-2xl border-2 border-teal-500 shadow-md p-5 text-center hover:shadow-xl transition-all flex flex-col justify-between"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <PersonnelAvatar
                            photoUrl={officer.photoUrl}
                            name={officer.name}
                            category="admin_officer"
                            size="xl"
                            ringClassName="ring-4 ring-teal-400 shadow-md"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-700 text-white uppercase tracking-wide">
                                {officer.position}
                              </span>
                              <span className="text-[10px] font-semibold text-teal-900 bg-teal-100 px-2 py-0.5 rounded-full">
                                School Operations
                              </span>
                            </div>

                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                              {officer.name}
                            </h3>
                            <p className="text-xs text-teal-900 font-semibold">
                              {officer.departmentOrGrade}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-slate-600">
                            {officer.email && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <Mail className="w-3 h-3 text-teal-600" />
                                {officer.email}
                              </span>
                            )}
                            {officer.contactNumber && (
                              <span className="flex items-center gap-1 text-[11px]">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                {officer.contactNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(officer)}
                              className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 hover:text-teal-700 border border-slate-200 text-xs shadow-2xs cursor-pointer"
                              title="Edit Administrative Officer details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(officer)}
                              className="p-1.5 rounded-md bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 text-xs shadow-2xs cursor-pointer"
                              title="Delete Administrative Officer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full max-w-lg p-5 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 text-center space-y-2">
                    <p className="text-xs font-semibold text-teal-800">
                      Office of the Administrative Officer (Vacant / Not Set)
                    </p>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd('admin_officer', schoolHeadMember?.id || null)}
                        className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add School Administrative Officer</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Vertical Stem from Administrative Officer to Horizontal Branching Bar */}
                <div className="w-0.5 h-8 bg-blue-300"></div>
                <div className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-white"></div>
              </div>

              {/* HORIZONTAL BRANCHING BAR */}
              <div className="relative max-w-5xl mx-auto">
                <div className="h-0.5 bg-blue-300 w-full"></div>
                <div className="flex justify-between items-start -mt-0.5">
                  <div className="w-0.5 h-6 bg-blue-300"></div>
                  <div className="w-0.5 h-6 bg-blue-300"></div>
                  <div className="w-0.5 h-6 bg-blue-300"></div>
                </div>
              </div>

              {/* LEVEL 5 & 6: THE THREE FUNCTIONAL PILLARS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
                
                {/* PILLAR 1: ELEMENTARY DEPARTMENT */}
                <div className="space-y-4">
                  {/* Pillar Banner */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 shadow-xs text-center space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase">
                        <School className="w-3 h-3 text-emerald-700" />
                        Department I
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenAdd('elementary', schoolHeadMember?.id || null)}
                          className="px-2 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Teacher</span>
                        </button>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Elementary Department</h4>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Kindergarten to Grade 6 • {elementaryMembers.length} Faculty Members
                      </p>
                    </div>
                  </div>

                  {/* Elementary Teacher Nodes */}
                  <div className="space-y-2.5">
                    {elementaryMembers.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 text-center space-y-2">
                        <p className="text-xs text-emerald-800 font-medium">No elementary teachers listed yet.</p>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleOpenAdd('elementary', schoolHeadMember?.id || null)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Elementary Teacher</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      elementaryMembers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="group relative p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <PersonnelAvatar
                                photoUrl={teacher.photoUrl}
                                name={teacher.name}
                                category="elementary"
                                size="sm"
                              />
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">
                                    {teacher.position}
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-500">
                                    {teacher.departmentOrGrade}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-900 truncate">
                                  {teacher.name}
                                </h5>
                                {teacher.email && (
                                  <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                    {teacher.email}
                                  </p>
                                )}
                              </div>
                            </div>

                            {isAdmin && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(teacher)}
                                  className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 cursor-pointer transition-colors"
                                  title="Edit Teacher"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRequest(teacher)}
                                  className="p-1 rounded bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 cursor-pointer transition-colors"
                                  title="Delete Teacher"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* PILLAR 2: SECONDARY DEPARTMENT */}
                <div className="space-y-4">
                  {/* Pillar Banner */}
                  <div className="p-3.5 rounded-xl bg-blue-50 border-2 border-blue-300 shadow-xs text-center space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-extrabold uppercase">
                        <GraduationCap className="w-3 h-3 text-blue-700" />
                        Department II
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenAdd('secondary', schoolHeadMember?.id || null)}
                          className="px-2 py-1 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Teacher</span>
                        </button>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Secondary Department</h4>
                      <p className="text-[11px] text-blue-800 font-medium">
                        Junior High (Grades 7–10) • {secondaryMembers.length} Faculty Members
                      </p>
                    </div>
                  </div>

                  {/* Secondary Teacher Nodes */}
                  <div className="space-y-2.5">
                    {secondaryMembers.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 text-center space-y-2">
                        <p className="text-xs text-blue-800 font-medium">No secondary teachers listed yet.</p>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleOpenAdd('secondary', schoolHeadMember?.id || null)}
                            className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Secondary Teacher</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      secondaryMembers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="group relative p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <PersonnelAvatar
                                photoUrl={teacher.photoUrl}
                                name={teacher.name}
                                category="secondary"
                                size="sm"
                              />
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900">
                                    {teacher.position}
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-500">
                                    {teacher.departmentOrGrade}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-900 truncate">
                                  {teacher.name}
                                </h5>
                                {teacher.email && (
                                  <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                    {teacher.email}
                                  </p>
                                )}
                              </div>
                            </div>

                            {isAdmin && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(teacher)}
                                  className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 cursor-pointer transition-colors"
                                  title="Edit Teacher"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRequest(teacher)}
                                  className="p-1 rounded bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 cursor-pointer transition-colors"
                                  title="Delete Teacher"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* PILLAR 3: NON-TEACHING & SUPPORT SERVICES */}
                <div className="space-y-4">
                  {/* Pillar Banner */}
                  <div className="p-3.5 rounded-xl bg-purple-50 border-2 border-purple-300 shadow-xs text-center space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-extrabold uppercase">
                        <Briefcase className="w-3 h-3 text-purple-700" />
                        Support Services
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenAdd('non_teaching', schoolAdminOfficers[0]?.id || schoolHeadMember?.id || null)}
                          className="px-2 py-1 rounded-md bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Staff</span>
                        </button>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Non-Teaching Staff</h4>
                      <p className="text-[11px] text-purple-800 font-medium">
                        Under Office of the Admin Officer • {nonTeachingMembers.length} Staff Members
                      </p>
                    </div>
                  </div>

                  {/* Non-Teaching Nodes */}
                  <div className="space-y-2.5">
                    {nonTeachingMembers.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-purple-300 bg-purple-50/40 text-center space-y-2">
                        <p className="text-xs text-purple-800 font-medium">No non-teaching personnel listed yet.</p>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleOpenAdd('non_teaching', schoolAdminOfficers[0]?.id || schoolHeadMember?.id || null)}
                            className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Staff Member</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      nonTeachingMembers.map((staff) => (
                        <div
                          key={staff.id}
                          className="group relative p-3 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <PersonnelAvatar
                                photoUrl={staff.photoUrl}
                                name={staff.name}
                                category="non_teaching"
                                size="sm"
                              />
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900">
                                    {staff.position}
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-500">
                                    {staff.departmentOrGrade}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-900 truncate">
                                  {staff.name}
                                </h5>
                                {staff.email && (
                                  <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                    {staff.email}
                                  </p>
                                )}
                              </div>
                            </div>

                            {isAdmin && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(staff)}
                                  className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 cursor-pointer transition-colors"
                                  title="Edit Staff"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRequest(staff)}
                                  className="p-1 rounded bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 cursor-pointer transition-colors"
                                  title="Delete Staff"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* ================= DIRECTORY / ROSTER VIEW ================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {filteredList.length} of {personnelList.length} personnel records
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-3">
                    <span className="text-blue-700 font-medium">
                      Admin editing mode active
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAdd('elementary', schoolHeadMember?.id || null)}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Member</span>
                    </button>
                  </div>
                )}
              </div>

              {filteredList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No personnel records found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No faculty or staff member matches your current search or category filter.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Clear Filter
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd()}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Member</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredList.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              member.category === 'district'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : member.category === 'district_admin_officer' || isDistrictAO(member)
                                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                : member.category === 'administration'
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : member.category === 'admin_officer' || isSchoolAO(member)
                                ? 'bg-teal-100 text-teal-900 border border-teal-200'
                                : member.category === 'elementary'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : member.category === 'secondary'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : 'bg-purple-100 text-purple-900 border border-purple-200'
                            }`}
                          >
                            {member.category === 'district_admin_officer' || isDistrictAO(member)
                              ? 'District AO'
                              : member.category === 'admin_officer' || isSchoolAO(member)
                              ? 'School AO'
                              : member.category === 'district'
                              ? 'District PSDS'
                              : member.category === 'administration'
                              ? 'School Head'
                              : member.category.replace('_', ' ')}
                          </span>

                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(member)}
                                className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRequest(member)}
                                className="p-1 rounded text-slate-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <PersonnelAvatar
                            photoUrl={member.photoUrl}
                            name={member.name}
                            category={member.category}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {member.name}
                            </h4>
                            <p className="text-xs text-blue-800 font-semibold truncate">
                              {member.position}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {member.departmentOrGrade}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                        {member.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                        {member.contactNumber && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{member.contactNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info & DepEd credentials */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Faculty Registry • Schools Division of Sorsogon • Region V</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              Total Community: {personnelList.length} Personnel
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Personnel Record?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This action will permanently remove the personnel record from the school hierarchy and synchronize across all devices.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <PersonnelAvatar
                photoUrl={memberToDelete.photoUrl}
                name={memberToDelete.name}
                category={memberToDelete.category}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {memberToDelete.name}
                </h4>
                <p className="text-[11px] text-blue-800 font-medium truncate">
                  {memberToDelete.position}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {memberToDelete.departmentOrGrade}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-personnel"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reset Faculty & Personnel Directory?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reset the directory back to official DepEd default records for Vinisitahan Integrated School. Custom additions and edits will be replaced.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-reset-personnel"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modals for Editing and Uploading */}
      <PersonnelEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMember(null);
        }}
        onSave={(saved) => {
          onSaveMember(saved);
          setIsEditModalOpen(false);
          setEditingMember(null);
        }}
        initialData={editingMember}
        defaultCategory={addDefaults.category}
        defaultReportsToId={addDefaults.reportsToId}
        allMembers={personnelList}
      />

      <PersonnelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImport={onImportMembers}
      />
    </div>
  );
};
