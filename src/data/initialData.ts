import { SchoolInfo, PostItem, FacilityItem } from '../types';

export const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  name: "Vinisitahan Integrated School",
  schoolId: "502996",
  address: "Vinisitahan, Donsol, Sorsogon, Philippines",
  barangay: "Vinisitahan",
  municipality: "Donsol",
  province: "Sorsogon",
  district: "Donsol West II District",
  division: "Schools Division of Sorsogon",
  region: "Region V - Bicol Region",
  country: "Philippines",
  email: "vinisitahangdrive@gmail.com",
  contactNumber: "+63 917 829 4500 / (056) 311-2099",
  schoolHead: "Maria Teresa G. Ramos, PhD",
  headTitle: "Principal / School Head",
  motto: "Excellence, Integrity, and Service to the Community",
  logoUrl: null, // Will use official generated SVG crest by default unless custom uploaded
  announcementTicker: "Welcome to Vinisitahan Integrated School (School ID: 502996) • Donsol West II District • Early Registration for School Year is now open! Please visit the admin office for inquiries.",
  academicYear: "S.Y. 2024 - 2025",
  elementaryEnrolled: 342,
  secondaryEnrolled: 218,
  teachersCount: 22,
  nonTeachersCount: 5,
};

export const INITIAL_POSTS: PostItem[] = [
  {
    id: "post-1",
    title: "Official Announcement: Early Registration for Incoming Elementary & Junior High Students",
    slug: "early-registration-vis-502996",
    category: "Announcements",
    date: "2024-10-14",
    author: "Office of the School Head",
    summary: "Vinisitahan Integrated School (School ID 502996) formally opens early registration for Kindergarten, Grade 1, Grade 7, and transferee learners for the upcoming academic year.",
    content: `Vinisitahan Integrated School, under Donsol West II District, cordially informs all parents, guardians, and learners in Barangay Vinisitahan and neighboring communities that the Early Registration is officially open.

Requirements for New Students & Transferees:
1. Original and photocopy of PSA Birth Certificate (or Barangay Certification if unavailable)
2. Kindergarten Certificate of Completion (for incoming Grade 1)
3. SF9 (Progress Report Card) for transferees and incoming Grade 7
4. 2 copies of recent 2x2 colored ID picture with white background
5. Accomplished Basic Education Enrollment Form (available at the Registrar's desk)

Registration booths are situated at the VIS Covered Court and Administrative Office from 8:00 AM to 4:00 PM, Monday through Friday.

For inquiries, you may contact the VIS Helpdesk at vinisitahangdrive@gmail.com or visit the school campus in Vinisitahan, Donsol, Sorsogon.`,
    pinned: true,
    department: "Admissions & Registrar",
    tags: ["Registration", "Enrollment", "DepEd Bicol", "VIS 502996"]
  },
  {
    id: "post-2",
    title: "VIS Athletics Team Shines at Donsol West II District Sports & Cultural Meet",
    slug: "vis-donsol-west-ii-sports-meet",
    category: "Achievements",
    date: "2024-09-28",
    author: "Sports Development Committee",
    summary: "Student athletes from Vinisitahan Integrated School bagged 14 gold medals and the Sportsmanship Award at the concluded Donsol West II District Meet.",
    content: `Congratulations to our hardworking student-athletes, coaches, and sports coordinators!

Vinisitahan Integrated School demonstrated outstanding athletic prowess, sportsmanship, and teamwork during the recently concluded Donsol West II District Athletic and Cultural Meet.

Highlights of Awards:
• Athletics (Track & Field): 6 Gold Medals, 3 Silver Medals
• Badminton Singles & Doubles (Secondary Boys & Girls): 4 Gold Medals
• Table Tennis Elementary: 2 Gold Medals
• Vocal Solo & Folk Dance Exhibition: 1st Runner Up

The administration, led by the School Head and faculty, extends its heartfelt gratitude to all the supportive parents, community stakeholders, and Barangay Vinisitahan council for their generous encouragement. Our champions will proudly advance to represent Donsol West II at the Division Meet of Sorsogon!`,
    pinned: true,
    department: "MAPEH & Athletics",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["featured", "Sports Meet", "Donsol West II", "Achievements", "DepEd Sorsogon"]
  },
  {
    id: "post-3",
    title: "Executive Memorandum No. 08: Brigada Eskwela & School Disaster Preparedness Campaign",
    slug: "brigada-eskwela-disaster-preparedness",
    category: "Advisories & Memos",
    date: "2024-09-15",
    author: "Disaster Risk Reduction Management (DRRM)",
    summary: "Guidelines on the community cleanup, classroom enhancement, and coastal storm readiness program for Barangay Vinisitahan school grounds.",
    content: `In accordance with Division guidelines and our commitment to a child-friendly, disaster-resilient learning environment, Vinisitahan Integrated School will spearhead the community-wide Brigada Eskwela and Campus Safety Inspection.

Key Activities:
1. Structural integrity check of elementary and secondary school buildings
2. Tree trimming and drainage unclogging around campus perimeters
3. Classroom painting and learning nook enhancement
4. Orientation for learners on Coastal Storm Surge & Earthquake Drill protocols

We invite our generous alumni, PTA officers, and community volunteers to join hands in ensuring our children study in safe, clean, and conducive learning spaces. Donations of paint, cleaning materials, and first-aid supplies are warmly welcomed at the Principal's Office.`,
    pinned: false,
    department: "SDRRM & School Governance",
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["featured", "Brigada Eskwela", "Safety", "Memo"]
  },
  {
    id: "post-5",
    title: "Vinisitahan Integrated School Hosts Annual Science, Math & Innovation Olympiad",
    slug: "vis-science-math-olympiad",
    category: "Campus Events",
    date: "2024-10-05",
    author: "Science & Mathematics Department",
    summary: "Young scientists and mathematicians from Grades 1 to 10 showcase robotics, investigatory projects, and mental math prowess at the school gymnasium.",
    content: `Vinisitahan Integrated School successfully concluded its 2024 Science, Mathematics, and Innovation Olympiad under the theme "Empowering Resilient Minds Through STEM Excellence."

Learners from both Elementary and Junior High school presented hands-on experiments, eco-friendly robotics utilizing recycled components, and botanical studies on coastal biodiversity in Barangay Vinisitahan.

Winners from the investigatory project competition will proceed to represent Donsol West II District in the upcoming Division Science Fair in Sorsogon City. Congratulations to our young scientists and passionate STEM teachers!`,
    pinned: true,
    department: "Science & Technology",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
    ],
    tags: ["featured", "Science Fair", "STEM", "Innovation", "Campus Events"]
  },
  {
    id: "post-4",
    title: "General Parents-Teachers Association (GPTA) Quarterly Assembly & Card Distribution",
    slug: "gpta-general-assembly-quarter-1",
    category: "Campus Events",
    date: "2024-09-02",
    author: "GPTA Advisory Board",
    summary: "Schedule and agenda for the Card Giving Day and election of classroom PTA homeroom officers for both Elementary and Junior High departments.",
    content: `To all esteemed parents and guardians of Vinisitahan Integrated School learners:

Please be reminded of our 1st Quarter Card Distribution and General PTA Assembly this coming Friday at 1:30 PM in the VIS Multi-Purpose Covered Gymnasium.

Agenda:
• Presentation of School Performance & Accomplishment Report
• Distribution of Form 138 (Learner's Progress Report Card)
• Consultation with Subject Teachers and Class Advisers
• Implementation of School Canteen Nutritional Standards and Child Protection Policy

Your attendance is of paramount importance as we partner together in nurturing the academic and personal growth of our learners. Light refreshments will be served.`,
    pinned: false,
    department: "School & Community Relations",
    tags: ["PTA", "Card Giving", "Parents"]
  }
];

export const DEFAULT_FACILITIES: FacilityItem[] = [
  {
    id: "facility-1",
    title: "Elementary & JHS Academic Classrooms",
    desc: "Well-ventilated learning environments equipped with modern DepEd learning modules, blackboards, teacher desks, and audiovisual aids.",
    category: "Academic Instruction",
    capacity: "40 Students / Room",
    iconName: "Building2",
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
    order: 1,
  },
  {
    id: "facility-2",
    title: "Science & Technology Laboratory",
    desc: "Equipped with compound microscopes, test kits, glassware, and experimentation benches for general biology, chemistry, and STEM exploration.",
    category: "Science & STEM",
    capacity: "45 Students",
    iconName: "Microscope",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    order: 2,
  },
  {
    id: "facility-3",
    title: "Integrated Computer & ICT Center",
    desc: "Desktop computer terminals connected via local area network, providing digital literacy, coding fundamentals, and research capabilities.",
    category: "Information & Tech",
    capacity: "35 Workstations",
    iconName: "Monitor",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    order: 3,
  },
  {
    id: "facility-4",
    title: "Multi-Purpose Gymnasium",
    desc: "Dedicated covered venue for physical education, district athletic competitions, scouting activities, and community townhall gatherings.",
    category: "Sports & Athletics",
    capacity: "600+ Attendees",
    iconName: "Trophy",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    order: 4,
  },
  {
    id: "facility-5",
    title: "School Library & Reading Hub",
    desc: "A curated repository of DepEd textbooks, Filipino literature, reference encyclopedias, and peaceful study carrels for independent research.",
    category: "Library & Research",
    capacity: "50 Seats",
    iconName: "BookOpen",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    order: 5,
  },
  {
    id: "facility-6",
    title: "Gulayan sa Paaralan Eco-Garden",
    desc: "Educational agricultural plot fostering environmental stewardship, organic vegetable cultivation, and supplementing the school feeding program.",
    category: "Eco & Agriculture",
    capacity: "Active Plot & Nursery",
    iconName: "Sprout",
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    order: 6,
  }
];

export const SCHOOL_FACILITIES = DEFAULT_FACILITIES;

export const CURRICULUM_OFFERINGS = [
  {
    level: "Kindergarten",
    age: "5 years old",
    desc: "Foundational play-based curriculum instilling early literacy, numeracy, social emotional growth, and mother-tongue appreciation.",
    badge: "Early Childhood"
  },
  {
    level: "Elementary (Grades 1 to 6)",
    age: "6 - 12 years old",
    desc: "Comprehensive basic education covering Mathematics, Science, English, Filipino, Araling Panlipunan, MAPEH, and Edukasyon sa Pagpapakatao.",
    badge: "Primary & Intermediate"
  },
  {
    level: "Junior High School (Grades 7 to 10)",
    age: "12 - 16 years old",
    desc: "Secondary curriculum incorporating advanced sciences, mathematics, humanities, and Technology & Livelihood Education (TLE) specializations.",
    badge: "Secondary Education"
  }
];

export const DEFAULT_PERSONNEL_LIST = [
  // 1. District Leadership (Pedigree Level 1)
  {
    id: "personnel-psds",
    name: "Dr. Salvacion B. Alcantara, EdD",
    position: "Public Schools District Supervisor (PSDS)",
    category: "district" as const,
    departmentOrGrade: "DepEd Sorsogon • Donsol West II District",
    reportsToId: null,
    email: "salvacion.alcantara@deped.gov.ph",
    contactNumber: "+63 (056) 311-2001",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    order: 1,
  },
  // 2. District Administrative Office (Pedigree Level 2 - Below PSDS)
  {
    id: "personnel-district-admin-officer",
    name: "Maria Cristina L. Valenzuela",
    position: "Administrative Officer II • District Administrative Office",
    category: "admin_officer" as const,
    departmentOrGrade: "District Administrative Office • Donsol West II District",
    reportsToId: "personnel-psds",
    email: "district.donsolwest2@deped.gov.ph",
    contactNumber: "+63 (056) 311-2005",
    photoUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80",
    order: 2,
  },
  // 3. School Administration (Pedigree Level 3)
  {
    id: "personnel-principal",
    name: "Dr. Maria Teresa G. Ramos, PhD",
    position: "Principal I / School Head",
    category: "administration" as const,
    departmentOrGrade: "Office of the School Head",
    reportsToId: "personnel-district-admin-officer",
    email: "vinisitahangdrive@gmail.com",
    contactNumber: "+63 917 829 4500",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    order: 3,
  },
  // 4. School Administrative Officer (Pedigree Level 4 - School Operations & Non-Teaching Supervision)
  {
    id: "personnel-admin-officer",
    name: "Glenda M. Escober",
    position: "Administrative Officer II",
    category: "admin_officer" as const,
    departmentOrGrade: "Office of the Administrative Officer • School Operations",
    reportsToId: "personnel-principal",
    email: "glenda.escober@deped.gov.ph",
    contactNumber: "+63 918 732 9904",
    photoUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80",
    order: 4,
  },
  // 5. Department Leads & Coordinators (Pedigree Level 5)
  {
    id: "personnel-lead-elem",
    name: "Corazon L. Hernandez, MT-II",
    position: "Master Teacher II • Elementary Department Head",
    category: "elementary" as const,
    departmentOrGrade: "Elementary Department (K to 6)",
    reportsToId: "personnel-principal",
    email: "corazon.hernandez@deped.gov.ph",
    contactNumber: "+63 919 452 1102",
    photoUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
    order: 5,
  },
  {
    id: "personnel-lead-sec",
    name: "Danilo V. Espares, MT-I",
    position: "Master Teacher I • Junior High Department Head",
    category: "secondary" as const,
    departmentOrGrade: "Junior High School (Grades 7 to 10)",
    reportsToId: "personnel-principal",
    email: "danilo.espares@deped.gov.ph",
    contactNumber: "+63 920 883 4510",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    order: 6,
  },

  // 4. Elementary Teachers (K to 6)
  {
    id: "elem-1",
    name: "Janice P. Mortega",
    position: "Teacher I",
    category: "elementary" as const,
    departmentOrGrade: "Kindergarten • Early Childhood",
    reportsToId: "personnel-lead-elem",
    email: "janice.mortega@deped.gov.ph",
    contactNumber: "+63 912 301 4411",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    order: 6,
  },
  {
    id: "elem-2",
    name: "Elena M. Belmonte",
    position: "Teacher III",
    category: "elementary" as const,
    departmentOrGrade: "Grade 1 - Sampaguita",
    reportsToId: "personnel-lead-elem",
    email: "elena.belmonte@deped.gov.ph",
    contactNumber: "+63 915 220 8941",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    order: 7,
  },
  {
    id: "elem-3",
    name: "Ronald S. Doma",
    position: "Teacher II",
    category: "elementary" as const,
    departmentOrGrade: "Grade 2 - Rosal",
    reportsToId: "personnel-lead-elem",
    email: "ronald.doma@deped.gov.ph",
    contactNumber: "+63 921 774 3302",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    order: 8,
  },
  {
    id: "elem-4",
    name: "Lilibeth C. Mirabete",
    position: "Teacher III",
    category: "elementary" as const,
    departmentOrGrade: "Grade 3 - Camia",
    reportsToId: "personnel-lead-elem",
    email: "lilibeth.mirabete@deped.gov.ph",
    contactNumber: "+63 928 661 5590",
    photoUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&auto=format&fit=crop&q=80",
    order: 9,
  },
  {
    id: "elem-5",
    name: "Arlene D. Cantuba",
    position: "Teacher I",
    category: "elementary" as const,
    departmentOrGrade: "Grade 4 - Ilang-Ilang",
    reportsToId: "personnel-lead-elem",
    email: "arlene.cantuba@deped.gov.ph",
    contactNumber: "+63 917 559 0081",
    photoUrl: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&auto=format&fit=crop&q=80",
    order: 10,
  },
  {
    id: "elem-6",
    name: "Jerome F. Grajo",
    position: "Teacher II",
    category: "elementary" as const,
    departmentOrGrade: "Grade 5 - Dalia",
    reportsToId: "personnel-lead-elem",
    email: "jerome.grajo@deped.gov.ph",
    contactNumber: "+63 930 112 8794",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    order: 11,
  },
  {
    id: "elem-7",
    name: "Marites N. Flores",
    position: "Teacher III",
    category: "elementary" as const,
    departmentOrGrade: "Grade 6 - Gumamela / Science Lead",
    reportsToId: "personnel-lead-elem",
    email: "marites.flores@deped.gov.ph",
    contactNumber: "+63 919 883 2415",
    photoUrl: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&auto=format&fit=crop&q=80",
    order: 12,
  },
  {
    id: "elem-8",
    name: "Karen B. Olavario",
    position: "Teacher I",
    category: "elementary" as const,
    departmentOrGrade: "Elementary Inclusive SPED & Reading",
    reportsToId: "personnel-lead-elem",
    email: "karen.olavario@deped.gov.ph",
    contactNumber: "+63 945 771 9023",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    order: 13,
  },

  // 5. Secondary Teachers (Junior High School Grades 7 to 10)
  {
    id: "sec-1",
    name: "Mark Anthony G. Perez",
    position: "Teacher III",
    category: "secondary" as const,
    departmentOrGrade: "Grade 7 Adviser • English & Journalism",
    reportsToId: "personnel-lead-sec",
    email: "markanthony.perez@deped.gov.ph",
    contactNumber: "+63 917 662 1098",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    order: 14,
  },
  {
    id: "sec-2",
    name: "Rachel S. Detera",
    position: "Teacher II",
    category: "secondary" as const,
    departmentOrGrade: "Grade 8 Adviser • Mathematics & Statistics",
    reportsToId: "personnel-lead-sec",
    email: "rachel.detera@deped.gov.ph",
    contactNumber: "+63 922 443 7109",
    photoUrl: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=400&auto=format&fit=crop&q=80",
    order: 15,
  },
  {
    id: "sec-3",
    name: "Christian Paul B. Lopez",
    position: "Teacher II",
    category: "secondary" as const,
    departmentOrGrade: "Grade 9 Adviser • Science & DRRM Coordinator",
    reportsToId: "personnel-lead-sec",
    email: "christianpaul.lopez@deped.gov.ph",
    contactNumber: "+63 939 128 4402",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    order: 16,
  },
  {
    id: "sec-4",
    name: "Joanne D. Abitria",
    position: "Teacher I",
    category: "secondary" as const,
    departmentOrGrade: "Grade 10 Adviser • Filipino & Values (EsP)",
    reportsToId: "personnel-lead-sec",
    email: "joanne.abitria@deped.gov.ph",
    contactNumber: "+63 918 902 3341",
    photoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80",
    order: 17,
  },
  {
    id: "sec-5",
    name: "Ryan C. Balderama",
    position: "Teacher II",
    category: "secondary" as const,
    departmentOrGrade: "Junior High Social Studies (Araling Panlipunan)",
    reportsToId: "personnel-lead-sec",
    email: "ryan.balderama@deped.gov.ph",
    contactNumber: "+63 927 554 1290",
    photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    order: 18,
  },
  {
    id: "sec-6",
    name: "Christine M. Borromeo",
    position: "Teacher I",
    category: "secondary" as const,
    departmentOrGrade: "Junior High MAPEH & Cultural Coordinator",
    reportsToId: "personnel-lead-sec",
    email: "christine.borromeo@deped.gov.ph",
    contactNumber: "+63 949 332 8701",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
    order: 19,
  },
  {
    id: "sec-7",
    name: "Dennis L. Habla",
    position: "Teacher III",
    category: "secondary" as const,
    departmentOrGrade: "Technology & Livelihood Education (TLE)",
    reportsToId: "personnel-lead-sec",
    email: "dennis.habla@deped.gov.ph",
    contactNumber: "+63 917 889 0123",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    order: 20,
  },
  {
    id: "sec-8",
    name: "Hazel V. Monforte",
    position: "Teacher I",
    category: "secondary" as const,
    departmentOrGrade: "ICT & Digital Literacy Coordinator",
    reportsToId: "personnel-lead-sec",
    email: "hazel.monforte@deped.gov.ph",
    contactNumber: "+63 920 119 4582",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    order: 21,
  },

  // 6. Non-Teaching Staff
  {
    id: "nonteach-1",
    name: "Jeffrey K. Serrano",
    position: "Administrative Aide VI",
    category: "non_teaching" as const,
    departmentOrGrade: "School Registrar & Learner Info System (LIS)",
    reportsToId: "personnel-admin-officer",
    email: "jeffrey.serrano@deped.gov.ph",
    contactNumber: "+63 916 443 8901",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    order: 22,
  },
  {
    id: "nonteach-2",
    name: "Noel B. Fortades",
    position: "Property Custodian / Supply Officer",
    category: "non_teaching" as const,
    departmentOrGrade: "School Property & Equipment Office",
    reportsToId: "personnel-admin-officer",
    email: "noel.fortades@deped.gov.ph",
    contactNumber: "+63 928 554 9012",
    photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
    order: 23,
  },
  {
    id: "nonteach-3",
    name: "Jocelyn T. Rito",
    position: "Senior Bookkeeper",
    category: "non_teaching" as const,
    departmentOrGrade: "Financial Records & Budget Monitoring",
    reportsToId: "personnel-admin-officer",
    email: "jocelyn.rito@deped.gov.ph",
    contactNumber: "+63 919 772 3456",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    order: 24,
  },
  {
    id: "nonteach-4",
    name: "Armando E. Alindogan",
    position: "Utility Worker & Security Officer",
    category: "non_teaching" as const,
    departmentOrGrade: "Campus Grounds & Security Services",
    reportsToId: "personnel-admin-officer",
    email: "armando.alindogan@deped.gov.ph",
    contactNumber: "+63 923 881 2345",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    order: 25,
  }
];
