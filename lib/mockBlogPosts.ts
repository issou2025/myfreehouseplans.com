import type { BlogPost } from "@/types/blog";

const cover = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const mockBlogPosts: BlogPost[] = [
  {
    id: "blog-001",
    title: "How to Choose the Right House Plan",
    slug: "how-to-choose-the-right-house-plan",
    category: "House Plan Guides",
    excerpt: "A practical framework for matching your family, land, climate and budget to the right plan before you spend serious money.",
    content: [
      "Choosing a house plan starts with your land, not the drawing. Plot width, length, road access, sun direction and drainage can make a beautiful plan easy or difficult to build.",
      "After the site, compare daily routines. A good plan supports cooking, resting, hosting, storage, privacy and future changes without forcing awkward circulation.",
      "Finally, ask a local professional to review the plan before construction. Regulations, soil conditions and structural requirements are always local."
    ],
    coverImage: cover("photo-1503387762-592deb58ef4e"),
    author: "myfreehouseplans.com Editorial",
    readTime: "7 min read",
    date: "May 10, 2026",
    status: "Published",
    seoTitle: "How to Choose the Right House Plan | myfreehouseplans.com",
    metaDescription: "Learn how to choose a house plan based on land size, family needs, budget, climate and construction reality.",
    keywords: ["choose house plan", "house plan guide", "building planning"],
    focusKeyword: "choose the right house plan",
    relatedPlanIds: ["plan-001", "plan-003"],
    seoScore: 91
  },
  {
    id: "blog-002",
    title: "Why Beautiful House Plans Fail in Real Life",
    slug: "why-beautiful-house-plans-fail-in-real-life",
    category: "Building Mistakes",
    excerpt: "Good renders can hide poor ventilation, expensive spans, weak storage and site incompatibility.",
    content: [
      "A plan can look impressive online while ignoring construction logic. Long unsupported spans, complex roofs and oversized glass can increase cost quickly.",
      "The most common failures are not visual. They are circulation, heat, privacy, drainage, storage and a mismatch between the plan and the real plot.",
      "Use previews as a starting point, then verify the details with a qualified designer or engineer."
    ],
    coverImage: cover("photo-1487958449943-2429e8be8625"),
    author: "Design Review Team",
    readTime: "6 min read",
    date: "May 12, 2026",
    status: "Published",
    seoTitle: "Why Beautiful House Plans Fail in Real Life",
    metaDescription: "Understand the hidden design and construction issues that make attractive house plans difficult to build.",
    keywords: ["house plan mistakes", "building mistakes"],
    focusKeyword: "house plans fail",
    relatedPlanIds: ["plan-004", "plan-006"],
    seoScore: 84
  },
  {
    id: "blog-003",
    title: "PDF vs DWG vs Revit: Which One Do You Need?",
    slug: "pdf-vs-dwg-vs-revit-which-one-do-you-need",
    category: "CAD / Revit / BIM",
    excerpt: "Understand the difference between review files, editable CAD drawings, BIM models and IFC exchange files.",
    content: [
      "PDF files are best for viewing, printing and early review. DWG files are editable CAD drawings used by many architects and technicians.",
      "Revit files contain a BIM model, which can support coordinated drawings, schedules and 3D views. IFC files help exchange model information between BIM platforms.",
      "Homeowners usually start with PDF. Professionals usually need DWG, Revit or IFC when they want to adapt the project."
    ],
    coverImage: cover("photo-1581090464777-f3220bbe1b8b"),
    author: "BIM Desk",
    readTime: "8 min read",
    date: "May 14, 2026",
    status: "Published",
    seoTitle: "PDF vs DWG vs Revit: Which House Plan File Do You Need?",
    metaDescription: "Compare PDF, DWG, Revit and IFC files for homeowners, builders, architects and BIM users.",
    keywords: ["PDF DWG Revit", "CAD house plans", "BIM files"],
    focusKeyword: "PDF vs DWG vs Revit",
    relatedPlanIds: ["plan-007"],
    seoScore: 95
  },
  {
    id: "blog-004",
    title: "How to Know if a Plan Fits Your Land",
    slug: "how-to-know-if-a-plan-fits-your-land",
    category: "House Plan Guides",
    excerpt: "A simple checklist for plot dimensions, setbacks, access, orientation and future expansion.",
    content: [
      "Start by subtracting required setbacks from your land width and length. The remaining rectangle is your practical buildable zone.",
      "Then check car access, septic or utility zones, outdoor space and how the plan faces the road and sun.",
      "A compatibility checker can help early, but final approval should come from local professionals."
    ],
    coverImage: cover("photo-1518005020951-eccb494ad742"),
    author: "Site Planning Team",
    readTime: "5 min read",
    date: "May 16, 2026",
    status: "Published",
    seoTitle: "How to Know if a House Plan Fits Your Land",
    metaDescription: "Check plot dimensions, setbacks, access and orientation before selecting a house plan.",
    keywords: ["plot compatibility", "house plan land size"],
    focusKeyword: "plan fits your land",
    relatedPlanIds: ["plan-001", "plan-005"],
    seoScore: 88
  },
  {
    id: "blog-005",
    title: "Best House Plans for 20x20m / 66x66 ft Plots",
    slug: "best-house-plans-for-20x20m-plots",
    category: "African House Plans",
    excerpt: "What works well on a 20m by 20m plot, from single-level family homes to courtyard concepts.",
    content: [
      "A 20x20m / 66x66 ft plot gives enough flexibility for a comfortable family home, parking and outdoor living when setbacks are managed well.",
      "Good options include 3 bedroom bungalows, compact 4 bedroom homes and courtyard layouts that improve airflow.",
      "Always confirm the legal setbacks and service access rules in your city before selecting a final plan."
    ],
    coverImage: cover("photo-1494526585095-c41746248156"),
    author: "Planning Desk",
    readTime: "6 min read",
    date: "May 18, 2026",
    status: "Published",
    seoTitle: "Best House Plans for 20x20m / 66x66 ft Plots",
    metaDescription: "Explore practical house plan ideas for 20m by 20m plots, including family and courtyard layouts.",
    keywords: ["20x20m plot", "house plans for 20x20"],
    focusKeyword: "house plans for 20x20m plots",
    relatedPlanIds: ["plan-001", "plan-006"],
    seoScore: 89
  },
  {
    id: "blog-006",
    title: "How to Build a House in Phases",
    slug: "how-to-build-a-house-in-phases",
    category: "Construction Cost",
    excerpt: "Plan foundations, structure, services and future expansion before you start phase one.",
    content: [
      "Phased construction works best when the final house is planned from day one. Structure, plumbing and roof lines should anticipate future work.",
      "Prioritize a complete safe core first: essential bedrooms, bathroom, kitchen and secure envelope.",
      "Before building, ask an engineer to verify that the first phase can carry or connect to the future phase."
    ],
    coverImage: cover("photo-1504307651254-35680f356dfd"),
    author: "Construction Desk",
    readTime: "7 min read",
    date: "May 20, 2026",
    status: "Published",
    seoTitle: "How to Build a House in Phases",
    metaDescription: "Plan phased construction safely with future structure, services and expansion in mind.",
    keywords: ["build in phases", "phased construction"],
    focusKeyword: "build a house in phases",
    relatedPlanIds: ["plan-003", "plan-008"],
    seoScore: 82
  }
];

export const getBlogPostBySlug = (slug: string) => mockBlogPosts.find((post) => post.slug === slug);
