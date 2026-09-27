import { HLISettings, HLIPillar, HLIFile } from '../types';

// Helper to generate downloadable sample text document encoded as data URI
function createSampleDataUrl(filename: string, content: string): string {
  const fullText = `================================================================================
DEPARTMENT OF EDUCATION - REGION V (BICOL)
SCHOOLS DIVISION OFFICE OF SORSOGON
DONSOL WEST II DISTRICT
VINISITAHAN INTEGRATED SCHOOL (School ID: 502996)
HEALTHY LEARNING INSTITUTIONS (HLI) ARCHIVE
================================================================================
Document: ${filename}
Generated: ${new Date().toLocaleDateString()}
Status: Certified School Record

${content}

================================================================================
Approved by: School Head / Administrator
Vinisitahan Integrated School • Donsol, Sorsogon
DepEd Bicol • Region V
================================================================================`;
  return `data:text/plain;charset=utf-8,${encodeURIComponent(fullText)}`;
}

export const DEFAULT_HLI_DATA: HLISettings = {
  title: "Healthy Learning Institute",
  subtitle: "DepEd-DOH Comprehensive School Health and Nutrition Framework",
  description: "Vinisitahan Integrated School is an accredited Healthy Learning Institution (HLI), implementing the six core pillars established by the Department of Education and Department of Health to nurture healthy, safe, well-nourished, and resilient learners.",
  updatedAt: new Date().toISOString(),
  pillars: [
    {
      id: "pillar-1",
      pillarNumber: 1,
      name: "Pillar 1",
      title: "Healthy School Policy & Leadership",
      subtitle: "Institutional health directives, anti-smoking mandates, and DepEd-DOH compliance",
      description: "Institutionalization of comprehensive school health policies that protect learner and personnel well-being. Enforces 100% smoke-free and vape-free campus mandates (DO 48, s. 2016), healthy food and beverage standards in the school canteen (DO 13, s. 2017), and school disaster-risk health emergency protocols.",
      keyFocusAreas: [
        "100% Smoke-Free & Vape-Free Campus",
        "Healthy Canteen Food & Drink Standards",
        "Disaster Preparedness & Health Emergency Plans",
        "DepEd-DOH Health Governance Committee"
      ],
      leadCoordinator: "School Health & Safety Committee",
      status: "Fully Implemented",
      files: [
        {
          id: "file-p1-1",
          name: "VIS_Comprehensive_School_Health_Policy_2025.txt",
          title: "VIS School Health & Nutrition Institutional Policy",
          fileSize: "420 KB",
          fileType: "pdf",
          uploadedAt: "2025-01-15",
          downloadUrl: createSampleDataUrl(
            "VIS_Comprehensive_School_Health_Policy_2025.pdf",
            "This document establishes the official school health, sanitation, and safety policies of Vinisitahan Integrated School for Academic Year 2024-2025 in adherence to DepEd Order No. 43, s. 2017 and DOH Administrative Order No. 2021-0039."
          ),
          isRestricted: false,
          description: "Official institutional policy framework for student health, canteen compliance, and emergency protocols."
        },
        {
          id: "file-p1-2",
          name: "DepEd_Order_13_s2017_Canteen_Policy.txt",
          title: "DepEd Canteen Healthy Food & Beverage Standards",
          fileSize: "680 KB",
          fileType: "pdf",
          uploadedAt: "2025-02-01",
          downloadUrl: createSampleDataUrl(
            "DepEd_Order_13_s2017_Canteen_Policy.pdf",
            "DepEd Policy and Guidelines on Healthy Food and Beverage Choices in Schools and in DepEd Offices. Color-coded food categorization (Green, Yellow, Red)."
          ),
          isRestricted: false,
          description: "Traffic-light food categorization guidelines enforced in the Vinisitahan Integrated School canteen."
        },
        {
          id: "file-p1-3",
          name: "Confidential_Administrative_Audit_Record_2025.txt",
          title: "Internal Health Policy Compliance & Inspection Audit",
          fileSize: "1.2 MB",
          fileType: "docx",
          uploadedAt: "2025-02-20",
          downloadUrl: createSampleDataUrl(
            "Confidential_Administrative_Audit_Record_2025.docx",
            "CONFIDENTIAL INTERNAL AUDIT: Assessment of school sanitation, canteen permits, and safety equipment inspections for internal administrative monitoring."
          ),
          isRestricted: true,
          restrictionReason: "Internal Faculty & DepEd Division Inspector Access Only",
          description: "Internal compliance assessment ratings and school head review documentation."
        }
      ]
    },
    {
      id: "pillar-2",
      pillarNumber: 2,
      name: "Pillar 2",
      title: "Physical Learning Environment (WASH / WinS)",
      subtitle: "Safe water, clean sanitation, handwashing stations, and ecological solid waste management",
      description: "Provision of safe, clean, accessible, and child-friendly school physical facilities. Implements the DepEd Water, Sanitation, and Hygiene in Schools (WinS) Three-Star criteria (DO 10, s. 2016), gender-segregated comfort rooms, continuous handwashing facilities with soap, and campus-wide biodegradable waste management.",
      keyFocusAreas: [
        "WinS Three-Star Star System Accreditation",
        "Gender-Segregated Restrooms with Clean Running Water",
        "Group Handwashing Facilities with Soap",
        "Ecological Solid Waste Segregation & Composting"
      ],
      leadCoordinator: "WinS / School Physical Facilities Coordinator",
      status: "Three-Star WinS Certified",
      files: [
        {
          id: "file-p2-1",
          name: "VIS_WinS_Sanitation_ThreeStar_Report.txt",
          title: "Water, Sanitation, & Hygiene (WinS) 2025 School Report",
          fileSize: "850 KB",
          fileType: "pdf",
          uploadedAt: "2025-01-20",
          downloadUrl: createSampleDataUrl(
            "VIS_WinS_Sanitation_ThreeStar_Report.pdf",
            "Comprehensive WinS survey and monitoring results for Vinisitahan Integrated School documenting water potability, functional cubicles, and handwashing ratios."
          ),
          isRestricted: false,
          description: "Official DepEd WinS monitoring document demonstrating 3-Star sanitation achievements."
        },
        {
          id: "file-p2-2",
          name: "Campus_Waste_Segregation_Protocol.txt",
          title: "Ecological Waste Management & Recycling Protocols",
          fileSize: "310 KB",
          fileType: "pdf",
          uploadedAt: "2025-01-28",
          downloadUrl: createSampleDataUrl(
            "Campus_Waste_Segregation_Protocol.pdf",
            "Standard operating procedures for classroom trash segregation, recycling bins, and organic garden composting."
          ),
          isRestricted: false,
          description: "Student and faculty guideline for maintaining green, litter-free learning grounds."
        }
      ]
    },
    {
      id: "pillar-3",
      pillarNumber: 3,
      name: "Pillar 3",
      title: "Social & Emotional Learning Environment",
      subtitle: "DepEd Child Protection Policy, bullying prevention, and mental health psychosocial support",
      description: "Ensuring an emotionally safe, inclusive, welcoming, and non-violent learning environment. Guided strictly by the DepEd Child Protection Policy (DO 40, s. 2012), active School Child Protection Committee (CPC), peer counseling initiatives, and psychosocial first aid for learners during crises.",
      keyFocusAreas: [
        "DepEd Child Protection Policy (DO 40, s. 2012)",
        "Zero-Tolerance Anti-Bullying Protocol",
        "Mental Health Psychosocial Support Services (MHPSS)",
        "Inclusive Education & Anti-Discrimination"
      ],
      leadCoordinator: "Guidance Counselor & Child Protection Focal Person",
      status: "Active & Fully Operational",
      files: [
        {
          id: "file-p3-1",
          name: "VIS_Child_Protection_Policy_Handbook.txt",
          title: "Child Protection Policy & Anti-Bullying Handbook",
          fileSize: "1.1 MB",
          fileType: "pdf",
          uploadedAt: "2025-02-05",
          downloadUrl: createSampleDataUrl(
            "VIS_Child_Protection_Policy_Handbook.pdf",
            "Official handbook outlining student rights, definitions of bullying and harassment, intake procedures, and positive disciplinary practices."
          ),
          isRestricted: false,
          description: "Essential reading for students, parents, and teachers on child protection rights."
        },
        {
          id: "file-p3-2",
          name: "Confidential_Incident_Intake_Form.txt",
          title: "Guidance Confidential Case Intake & Referral Form",
          fileSize: "290 KB",
          fileType: "docx",
          uploadedAt: "2025-02-12",
          downloadUrl: createSampleDataUrl(
            "Confidential_Incident_Intake_Form.docx",
            "RESTRICTED FORM: Template for confidential recording of student grievances, child protection incidents, and professional guidance interventions."
          ),
          isRestricted: true,
          restrictionReason: "Designated Guidance Personnel & School Head Access Only",
          description: "Restricted intake form to safeguard minor confidentiality under RA 10627 and DO 40."
        }
      ]
    },
    {
      id: "pillar-4",
      pillarNumber: 4,
      name: "Pillar 4",
      title: "Health Skills & Curriculum Education",
      subtitle: "Nutrition literacy, life skills, hygiene education, and age-appropriate reproductive health",
      description: "Empowering learners from Kindergarten through Grade 10 with actionable health literacy, personal hygiene habits, disease prevention, and lifelong wellness skills integrated into the MATATAG curriculum, MAPEH, Science, and Edukasyon sa Pagpapakatao.",
      keyFocusAreas: [
        "MATATAG Health & Physical Education Competencies",
        "Personal Hygiene & Toothbrushing Literacy",
        "Adolescent Reproductive Health & Life Skills",
        "Substance Abuse & Drug Education (NDEP)"
      ],
      leadCoordinator: "MAPEH & Science Learning Area Coordinators",
      status: "Curriculum Integrated",
      files: [
        {
          id: "file-p4-1",
          name: "K10_MATATAG_Health_Instruction_Guide.txt",
          title: "K-10 MATATAG Health Skills Curriculum Matrix",
          fileSize: "750 KB",
          fileType: "pdf",
          uploadedAt: "2025-01-25",
          downloadUrl: createSampleDataUrl(
            "K10_MATATAG_Health_Instruction_Guide.pdf",
            "Integration guide aligning health topics (nutrition, disease control, dental hygiene, mental health) into classroom daily lesson plans."
          ),
          isRestricted: false,
          description: "Curriculum integration blueprint for elementary and secondary teachers."
        },
        {
          id: "file-p4-2",
          name: "Learner_Personal_Hygiene_Primer.txt",
          title: "Learner Daily Hygiene & Nutrition Primer",
          fileSize: "510 KB",
          fileType: "pdf",
          uploadedAt: "2025-02-10",
          downloadUrl: createSampleDataUrl(
            "Learner_Personal_Hygiene_Primer.pdf",
            "Illustrated guide for students covering the 7 steps of handwashing, proper tooth brushing, and balanced Pinggang Pinoy meal choices."
          ),
          isRestricted: false,
          description: "Illustrated student guide for healthy daily habits and balanced food choices."
        }
      ]
    },
    {
      id: "pillar-5",
      pillarNumber: 5,
      name: "Pillar 5",
      title: "Community & Stakeholder Partnerships",
      subtitle: "Barangay health station coordination, municipal health office (MHO Donsol), and PTA linkages",
      description: "Mobilizing local community resources, rural health units, and families to sustain child health interventions. Active coordination with Barangay Vinisitahan Health Station, Donsol Municipal Health Office (MHO), Sorsogon Provincial Health Office, and the General Parent-Teacher Association (GPTA).",
      keyFocusAreas: [
        "Barangay Vinisitahan Health Center Collaboration",
        "General Parent-Teacher Association (GPTA) Health Committee",
        "Rural Health Unit (RHU / MHO Donsol) Medical Missions",
        "BHERT & Community Disaster Preparedness"
      ],
      leadCoordinator: "School Partnerships & Community Liaison Focal",
      status: "Multi-Agency Partnered",
      files: [
        {
          id: "file-p5-1",
          name: "Barangay_Vinisitahan_Health_MoA_2025.txt",
          title: "MoA: School & Barangay Health Station Joint Protocol",
          fileSize: "620 KB",
          fileType: "pdf",
          uploadedAt: "2025-01-18",
          downloadUrl: createSampleDataUrl(
            "Barangay_Vinisitahan_Health_MoA_2025.pdf",
            "Memorandum of Agreement between Vinisitahan Integrated School and Barangay Health Workers for immunization assistance and referral of sick learners."
          ),
          isRestricted: false,
          description: "Official partnership agreement for immunization, emergency transport, and community checkups."
        },
        {
          id: "file-p5-2",
          name: "Emergency_Health_Directory_Donsol.txt",
          title: "Emergency Health Directory & Medical Responder Contacts",
          fileSize: "240 KB",
          fileType: "pdf",
          uploadedAt: "2025-02-14",
          downloadUrl: createSampleDataUrl(
            "Emergency_Health_Directory_Donsol.pdf",
            "Verified contact list for Donsol Municipal Health Office, Donsol District Hospital, BFP, PNP, and Barangay Emergency Health Response Teams."
          ),
          isRestricted: false,
          description: "Quick emergency dial directory for school nurses, teachers, and parents."
        }
      ]
    },
    {
      id: "pillar-6",
      pillarNumber: 6,
      name: "Pillar 6",
      title: "Access to Health & Nutrition Services",
      subtitle: "School-based feeding program (SBFP), deworming, immunization, and medical-dental checkups",
      description: "Direct provision of preventive and curative primary healthcare on school premises. Coordinates the DepEd School-Based Feeding Program (SBFP) for wasted and severely wasted learners, biannual National Deworming Month, measles-rubella school vaccination, oral dental checkups, and vision screenings.",
      keyFocusAreas: [
        "DepEd School-Based Feeding Program (SBFP)",
        "Harmonized National Deworming Program",
        "School-Based Immunization (SBI)",
        "Campus First Aid, Dental & Vision Checkups"
      ],
      leadCoordinator: "School Nurse & SBFP Focal Teacher",
      status: "Active Feeding & Clinic Delivery",
      files: [
        {
          id: "file-p6-1",
          name: "VIS_SBFP_Implementation_Plan_2025.txt",
          title: "School-Based Feeding Program (SBFP) Master Plan",
          fileSize: "890 KB",
          fileType: "pdf",
          uploadedAt: "2025-01-10",
          downloadUrl: createSampleDataUrl(
            "VIS_SBFP_Implementation_Plan_2025.pdf",
            "Nutritional assessment baseline, hot-meal menu cycles, procurement standards, and weight-height monitoring schedules for 120 feeding days."
          ),
          isRestricted: false,
          description: "Master operations plan for the 120-day school nutritional rehabilitation feeding program."
        },
        {
          id: "file-p6-2",
          name: "National_Deworming_Parental_Consent_Form.txt",
          title: "National Deworming Month Parental Consent Form",
          fileSize: "310 KB",
          fileType: "pdf",
          uploadedAt: "2025-01-22",
          downloadUrl: createSampleDataUrl(
            "National_Deworming_Parental_Consent_Form.pdf",
            "Official bilingual DepEd-DOH parental consent form for the administration of Albendazole chewable deworming tablets."
          ),
          isRestricted: false,
          description: "Downloadable parental consent slip required prior to student deworming administration."
        },
        {
          id: "file-p6-3",
          name: "Confidential_Student_Health_Records_Log.txt",
          title: "Confidential Student Health & Medical Screening Registry",
          fileSize: "1.4 MB",
          fileType: "xlsx",
          uploadedAt: "2025-02-18",
          downloadUrl: createSampleDataUrl(
            "Confidential_Student_Health_Records_Log.xlsx",
            "RESTRICTED CLINIC DATA: Individual student nutritional baseline BMI logs, allergy disclosures, and confidential immunization tracking records."
          ),
          isRestricted: true,
          restrictionReason: "School Health Nurse & Medical Officer Restricted Access",
          description: "Strictly protected health data ledger under Data Privacy Act and DepEd health policies."
        }
      ]
    }
  ]
};
