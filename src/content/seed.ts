/**
 * Default site content, taken from https://imtpmna.org (Oct 2026).
 *
 * This is only the starting point: the first time the site runs it is copied into
 * `data/content.json`, and from then on everything is edited in the admin panel (/admin).
 * Editing this file later has no effect on a site that already has a `data/content.json`.
 */
import type { Content, GalleryImage, Institution } from "./schema";

const institutions: Institution[] = [
  {
    slug: "al-jamia-al-islamia",
    name: "Al Jamia Al Islamia",
    category: "college",
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
    category: "training",
    image: { src: "/images/knowledge-world.png", width: 2468, height: 1312 },
    description: "A groundbreaking project under IMT focused on innovative education.",
  },
  {
    slug: "imt-law-college",
    name: "IMT Law College",
    category: "college",
    image: { src: "/images/law-college.webp", width: 860, height: 415 },
    description:
      "Affiliated with Calicut University and recognized by the Bar Council of India, offering:",
    groups: [{ items: ["Five-Year BBA/B.Com, LLB (Hons) Courses", "Three-Year LLB Course"] }],
  },
  {
    slug: "islamia-college-hss",
    name: "Islamia College Higher Secondary School",
    category: "school",
    location: "Santhapuram",
    image: { src: "/images/ichss.jpeg", width: 1280, height: 963 },
    affiliation: "(Recognised by the Govt. of Kerala)",
    description: "Offering a variety of streams in secondary education.",
  },
  {
    slug: "women-islamia-college",
    name: "Women Islamia College",
    category: "college",
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
    category: "training",
    image: { src: "/images/competex.webp", width: 800, height: 500 },
    description:
      "Integrated coaching program for UPSC, SSC, KAS, PSC-LSGI. Knowledge World also focusses on :",
    groups: [
      {
        items: ["Science and Technology", "Research and Languages", "Business Administration"],
      },
    ],
  },
  {
    slug: "al-jamia-iti",
    name: "Al Jamia ITI",
    category: "training",
    location: "Wandoor",
    image: { src: "/images/al-jamia-iti.jpg", width: 1360, height: 1020 },
    description: "Providing training in Electrical courses.",
  },
  {
    slug: "al-jamia-arts-science-college",
    name: "Al Jamia Arts and Science College",
    category: "college",
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
    category: "school",
    location: "Wandoor",
    image: { src: "/images/hss-wandoor.jpeg", width: 1600, height: 1066 },
    affiliation: "(Recognised by the Govt. of Kerala)",
  },
  {
    slug: "aup-school-eriyad",
    name: "AUP School",
    category: "school",
    location: "Eriyad, Wandoor",
    image: { src: "/images/aup-eriyad.jpeg", width: 925, height: 519 },
    affiliation: "(Affiliated to the University of Calicut)",
  },
  {
    slug: "ptm-aup-school",
    name: "PTM AUP School",
    category: "school",
    location: "Mulliyakursi, Santapuram",
    image: { src: "/images/ptm-aup.jpeg", width: 1170, height: 1683 },
    affiliation: "(Recognised by the Govt. of Kerala)",
  },
  {
    slug: "darul-falah-english-school",
    name: "Darul Falah English School (CBSE)",
    category: "school",
    location: "Poopalam",
    image: { src: "/images/dfes.jpeg", width: 1048, height: 632 },
  },
  {
    slug: "grace-public-school",
    name: "Grace Public School (CBSE)",
    category: "school",
    location: "Eriyad, Wandoor",
    image: { src: "/images/grace.jpeg", width: 1280, height: 576 },
  },
];

const gallery: GalleryImage[] = [
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
];

const todayParagraph =
  "Today, IMT operates around 13 prestigious institutions that cater to diverse educational needs, including the renowned Al Jamia Al Islamia. Through various streams of income such as agriculture, commercial establishments and donations, IMT continues to expand its reach and influence in the region.";

export const seedContent: Content = {
  site: {
    name: "Islamic Mission Trust",
    shortName: "IMT",
    motto: "Excellence in Education with Societal Commitment",
    url: "https://imtpmna.org",
    phone: "+91 9656612612",
    email: "imtrust@gmail.com",
    addressLines: ["PATTIKKAD P.O 679325", "PERINTHALMANNA, MALAPPURAM, KERALA"],
    footerBlurb:
      "Nurturing enlightened individuals through quality education, moral values and social responsibility for a progressive and harmonious society.",
    logo: "/images/logo.png",
    emblem: "/images/logo-main.png",
    pillars: ["Education", "Character", "Community"],
  },
  home: {
    hero: {
      eyebrow: "A legacy of education, a brighter tomorrow",
      tagline: "Knowledge. Character. Community.",
      text: "Nurturing enlightened individuals and stronger communities through quality education, moral values and social responsibility for a better tomorrow.",
      image: "/images/hero-campus.jpeg",
      imageAlt: "Main gate of an IMT campus",
    },
    about: {
      text: "The Islamic Mission Trust (IMT) is committed to making thoughtful leaders, socio-political activists, and morally upright individuals by nurturing knowledge, character and community values. Through its network of institutions, the Trust provides quality education that empowers individuals and contributes to the development of society.",
    },
    stats: [
      { value: 13, suffix: "", label: "Institutions", caption: "Schools, colleges & training centres" },
      { value: 5, suffix: "", label: "Decades of service", caption: "Serving Kerala since the 1970s" },
      { value: 400, suffix: "+", label: "Educators", caption: "Committed to excellence" },
      { value: 7000, suffix: "", label: "Students", caption: "Learning for a brighter future" },
    ],
    missionVision: {
      mission:
        "To provide modern, holistic education that integrates moral values, intellectual growth and social commitment for the betterment of individuals and communities.",
      vision:
        "To create an inclusive educational system that empowers individuals to excel in both world and hereafter, contributing to a just, peaceful and progressive society.",
    },
    cta: {
      eyebrow: "Our commitment",
      lead: "Excellence in Education",
      highlight: "Societal Commitment",
      text: "Be part of a legacy that shapes individuals and strengthens communities.",
    },
    campusLife: [
      { src: "/images/grace.jpeg", caption: "Students at our campus", alt: "Students assembled on the ground of Grace Public School, Eriyad, Wandoor" },
      { src: "/images/dfes.jpeg", caption: "Green and peaceful campuses", alt: "Darul Falah English School campus among palm trees, Poopalam" },
      { src: "/images/aup-eriyad.jpeg", caption: "Modern learning facilities", alt: "Classroom block of AUP School, Eriyad, Wandoor" },
      { src: "/images/wandoodo.jpeg", caption: "Extracurricular activities", alt: "Students in uniform lined up on the school ground, Wandoor" },
      { src: "/images/hss-wandoor.jpeg", caption: "A safe and nurturing environment", alt: "Higher Secondary School building and garden, Wandoor" },
    ],
  },
  aboutPage: {
    heading: "A beacon of educational and cultural revival",
    paragraphs: [
      "The Islamic Mission Trust (IMT) came into existence as a beacon of educational and cultural revival in the 1970s as a result of the formation efforts of educational and social activists in Malabar that began in 1955. Its primary goal is to make modern education accessible to all sections of society, particularly those who face backwardness and exclusion from mainstream education. Alongside a strong emphasis on religious syncretism, IMT has been instrumental in establishing and maintaining numerous educational institutions, contributing significantly to the social and educational revolution in Kerala over the last five decades.",
      todayParagraph,
    ],
    milestones: [
      { year: "1955", text: "Formation efforts of educational and social activists begin in Malabar." },
      { year: "1970s", text: "IMT comes into existence as a beacon of educational and cultural revival." },
      { year: "5 decades", text: "Contributing to the social and educational revolution in Kerala." },
      { year: "Today", text: "Around 13 prestigious institutions, including the renowned Al Jamia Al Islamia." },
    ],
    mission: [
      "To provide modern, holistic education that integrates religious syncretism, fostering both academic excellence and personal development. IMT aims to uplift marginalized sections of society and bring them into the mainstream by establishing institutions that combine academic knowledge with spiritual and ethical guidance.",
      todayParagraph,
    ],
    vision: [
      "To create an inclusive educational system that empowers individuals from all walks of life to excel in both secular and religious education. IMT envisions a future where students are equipped with the knowledge, skills, and moral values necessary to lead society in fields such as science, technology, law, business, administration and social services.",
      todayParagraph,
    ],
  },
  institutions,
  gallery,
  posts: [],
};
