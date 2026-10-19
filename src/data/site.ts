/**
 * All website content, scraped from https://imtpmna.org (Oct 2026).
 * Text is kept as published on the original site. Edit here to update the site.
 */

export const site = {
  name: "Islamic Mission Trust",
  shortName: "IMT",
  heading: "Islamic Mission Trust [IMT]",
  motto: "Excellence in Education with Societal Commitment",
  url: "https://imtpmna.org",
  phone: "+91 9656612612",
  phoneHref: "tel:+919656612612",
  email: "imtrust@gmail.com",
  emailHref: "mailto:imtrust@gmail.com",
  logo: "/images/logo.png",
  emblem: "/images/logo-main.png",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Institutions", href: "/#institutions" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
] as const;

/* ---------- Home ---------- */

export const homeIntro =
  "The Islamic Mission Trust (IMT), successful in making thought leaders, socio-political activists, and media persons and make them capable of leading the community. When education was a privilege of few in the early independent India, the vision of the founders was ‘Excellence in Education with Societal Commitment. Today 5 decades later, IMT through the institutions, are in the forefront among providers of quality education in the region. The Trust has Higher Secondary Schools, Government aided Upper Primary School, Islamiya University and Colleges, and CBSE Higher secondary schools and other study centers with more than 400 committed faculty and 7000 students under its umbrella.";

/** Figures stated in the site copy above. */
export const stats = [
  { value: 5, suffix: "", label: "Decades of service" },
  { value: 13, suffix: "", label: "Institutions" },
  { value: 400, suffix: "+", label: "Committed faculty" },
  { value: 7000, suffix: "", label: "Students" },
] as const;

/* ---------- About ---------- */

export const aboutParagraphs = [
  "The Islamic Mission Trust (IMT) came into existence as a beacon of educational and cultural revival in the 1970s as a result of the formation efforts of educational and social activists in Malabar that began in 1955. Its primary goal is to make modern education accessible to all sections of society, particularly those who face backwardness and exclusion from mainstream education. Alongside a strong emphasis on religious syncretism, IMT has been instrumental in establishing and maintaining numerous educational institutions, contributing significantly to the social and educational revolution in Kerala over the last five decades.",
  "Today, IMT operates around 13 prestigious institutions that cater to diverse educational needs, including the renowned Al Jamia Al Islamia. Through various streams of income such as agriculture, commercial establishments and donations, IMT continues to expand its reach and influence in the region.",
] as const;

const todayParagraph = aboutParagraphs[1];

export const missionVision = [
  {
    key: "mission",
    title: "Mission",
    icon: "/images/icon-mission.png",
    paragraphs: [
      "To provide modern, holistic education that integrates religious syncretism, fostering both academic excellence and personal development. IMT aims to uplift marginalized sections of society and bring them into the mainstream by establishing institutions that combine academic knowledge with spiritual and ethical guidance.",
      todayParagraph,
    ],
  },
  {
    key: "vision",
    title: "Vision",
    icon: "/images/icon-vision.png",
    paragraphs: [
      "To create an inclusive educational system that empowers individuals from all walks of life to excel in both secular and religious education. IMT envisions a future where students are equipped with the knowledge, skills, and moral values necessary to lead society in fields such as science, technology, law, business, administration and social services.",
      todayParagraph,
    ],
  },
] as const;

/* ---------- Institutions and Courses ---------- */

export type CourseGroup = { title?: string; items: readonly string[] };

export type Institution = {
  slug: string;
  name: string;
  location?: string;
  image: { src: string; width: number; height: number };
  /** Affiliation / recognition line, e.g. "(Recognised by the Govt. of Kerala)". */
  affiliation?: string;
  description?: string;
  groups?: readonly CourseGroup[];
};

export const institutions: readonly Institution[] = [
  {
    slug: "al-jamia-al-islamia",
    name: "Al Jamia Al Islamia",
    location: "Santapuram",
    image: { src: "/images/al-jamia.png", width: 2353, height: 1231 },
    description: "Offering a wide range of courses:",
    groups: [
      {
        title: "Undergraduate Programs:",
        items: [
          "Two-Year Senior Secondary Course",
          "Four-Year Usuluddin and Shariah Degree Courses",
          "Two-Year Postgraduate Courses in Quran, Hadith, and Dawah",
          "PG Diploma in Arabic & English Translation",
          "Short-Term Courses in Islamic Studies",
        ],
      },
      {
        title: "Al Jamia also features",
        items: [
          "IT Center",
          "Foreign Language Teachers and Scholars",
          "Full-Time Library",
          "HRD Center for Personal Growth",
          "Students Activities Department",
          "Recreation Center",
          "Health and Wellness Hub",
          "Career Planning Cell",
          "Auditorium",
        ],
      },
    ],
  },
  {
    slug: "knowledge-world",
    name: "Knowledge World",
    image: { src: "/images/knowledge-world.png", width: 2468, height: 1312 },
    description: "A groundbreaking project under IMT focused on innovative education.",
  },
  {
    slug: "imt-law-college",
    name: "IMT Law College",
    image: { src: "/images/law-college.webp", width: 860, height: 415 },
    description:
      "Affiliated with Calicut University and recognized by the Bar Council of India, offering:",
    groups: [{ items: ["Five-Year BBA/B.Com, LLB (Hons) Courses", "Three-Year LLB Course"] }],
  },
  {
    slug: "islamia-college-hss",
    name: "Islamia College Higher Secondary School",
    location: "Santhapuram",
    image: { src: "/images/ichss.jpeg", width: 1280, height: 963 },
    affiliation: "(Recognised by the Govt. of Kerala)",
    description: "Offering a variety of streams in secondary education.",
  },
  {
    slug: "women-islamia-college",
    name: "Women Islamia College",
    location: "Wandoor",
    image: { src: "/images/women-islamia-college.jpeg", width: 1600, height: 1066 },
    affiliation: "(Affiliated to the University of Calicut)",
    groups: [
      {
        items: [
          "BA in English, Sociology, Arabic",
          "BSc in Physics",
          "BCom",
          "+2 Humanities, Commerce, Science",
          "Usooludheen",
        ],
      },
    ],
  },
  {
    slug: "competex",
    name: "Competex",
    image: { src: "/images/competex.webp", width: 800, height: 500 },
    description:
      "Integrated coaching program for UPSC, SSC, KAS, PSC-LSGI. Knowledge World also focusses on :",
    groups: [
      {
        items: [
          "Science and Technology",
          "Science and Technology",
          "Research and Languages",
          "Business Administration",
        ],
      },
    ],
  },
  {
    slug: "al-jamia-iti",
    name: "Al Jamia ITI",
    location: "Wandoor",
    image: { src: "/images/al-jamia-iti.jpg", width: 1360, height: 1020 },
    description: "Providing training in Electrical courses.",
  },
  {
    slug: "al-jamia-arts-science-college",
    name: "Al Jamia Arts and Science College",
    location: "Poopalam",
    image: { src: "/images/ajsas.jpeg", width: 1600, height: 737 },
    affiliation: "(Affiliated with the University of Calicut)",
    groups: [
      {
        title: "Undergraduate Programs:",
        items: [
          "BA in English, BCA, Islamic Studies",
          "BCom, BBA",
          "BSc in Psychology, Computer Science, Geography",
        ],
      },
      { title: "Postgraduate Programs:", items: ["MA in Islamic Finance", "MCom"] },
    ],
  },
  {
    slug: "hss-wandoor",
    name: "Higher Secondary School",
    location: "Wandoor",
    image: { src: "/images/hss-wandoor.jpeg", width: 1600, height: 1066 },
    affiliation: "(Recognised by the Govt. of Kerala)",
  },
  {
    slug: "aup-school-eriyad",
    name: "AUP School",
    location: "Eriyad, Wandoor",
    image: { src: "/images/aup-eriyad.jpeg", width: 925, height: 519 },
    affiliation: "(Affiliated to the University of Calicut)",
  },
  {
    slug: "ptm-aup-school",
    name: "PTM AUP School",
    location: "Mulliyakursi, Santapuram",
    image: { src: "/images/ptm-aup.jpeg", width: 1170, height: 1683 },
    affiliation: "(Recognised by the Govt. of Kerala)",
    groups: [
      {
        items: [
          "Science and Technology",
          "Science and Technology",
          "Research and Languages",
          "Business Administration",
        ],
      },
    ],
  },
  {
    slug: "darul-falah-english-school",
    name: "Darul Falah English School (CBSE)",
    location: "Poopalam",
    image: { src: "/images/dfes.jpeg", width: 1048, height: 632 },
    affiliation: "(Affiliated to the University of Calicut)",
    groups: [
      {
        items: [
          "BA in English, Sociology, Arabic",
          "BSc in Physics",
          "BCom",
          "+2 Humanities, Commerce, Science",
          "Usooludheen",
        ],
      },
    ],
  },
  {
    slug: "grace-public-school",
    name: "Grace Public School (CBSE)",
    location: "Eriyad, Wandoor",
    image: { src: "/images/grace.jpeg", width: 1280, height: 576 },
  },
];

/* ---------- Gallery (same order as the original gallery page) ---------- */

export const gallery = [
  { src: "/images/grace.jpeg", width: 1280, height: 576, alt: "Grace Public School (CBSE), Eriyad, Wandoor" },
  { src: "/images/dfes.jpeg", width: 1048, height: 632, alt: "Darul Falah English School (CBSE), Poopalam" },
  { src: "/images/ptm-aup.jpeg", width: 1170, height: 1683, alt: "PTM AUP School, Mulliyakursi, Santapuram" },
  { src: "/images/wandoodo.jpeg", width: 1170, height: 855, alt: "Students assembled on the school ground, Wandoor" },
  { src: "/images/aup-eriyad.jpeg", width: 925, height: 519, alt: "AUP School, Eriyad, Wandoor" },
  { src: "/images/vmc-hss-wandoor.avif", width: 2000, height: 1500, alt: "V.M.C. Govt. Higher Secondary School, Wandoor" },
  { src: "/images/hss-wandoor.jpeg", width: 1600, height: 1066, alt: "Higher Secondary School, Wandoor" },
  { src: "/images/ichss.jpeg", width: 1280, height: 963, alt: "Islamia College Higher Secondary School, Santhapuram" },
  { src: "/images/al-jamia-iti.jpg", width: 1360, height: 1020, alt: "Al Jamia ITI, Wandoor" },
  { src: "/images/ajsas.jpeg", width: 1600, height: 737, alt: "Al Jamia Arts and Science College, Poopalam" },
  { src: "/images/al-jamia.png", width: 2353, height: 1231, alt: "Al Jamia Al Islamia, Santapuram" },
] as const;

/* ---------- News (WordPress posts) ---------- */

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  author: string;
  content: readonly string[];
  comments: readonly { author: string; date: string; content: readonly string[] }[];
};

export const posts: readonly Post[] = [
  {
    slug: "hello-world",
    title: "Hello world!",
    date: "2024-10-16T09:57:00",
    category: "Uncategorized",
    author: "Datahex",
    content: ["Welcome to WordPress. This is your first post. Edit or delete it, then start writing!"],
    comments: [
      {
        author: "A WordPress Commenter",
        date: "2024-10-16T09:57:00",
        content: [
          "Hi, this is a comment.",
          "To get started with moderating, editing, and deleting comments, please visit the Comments screen in the dashboard.",
          "Commenter avatars come from Gravatar.",
        ],
      },
    ],
  },
];
