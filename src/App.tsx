/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from "motion/react";
import { 
  Scale, 
  ShieldCheck, 
  Briefcase, 
  Gavel, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Menu,
  X,
  ArrowLeft
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from "react-router-dom";

const practices = [
  {
    id: "01",
    slug: "corporate-litigation",
    title: "Corporate Litigation",
    desc: "Strategic representation in complex corporate disputes and shareholder conflicts.",
    detailedDesc: `Our Corporate Litigation practice is dedicated to resolving complex disputes that arise within the corporate framework. We represent major corporations, boards of directors, and shareholders in high-stakes litigation involving fiduciary duty breaches, shareholder activism, and post-M&A disputes.

    Key areas of focus include:
    • Board and Special Committee advisory
    • Derivative actions and class action defense
    • Proxy contests and control contests
    • Internal investigations and regulatory compliance

    We combine deep legal knowledge with a sharp understanding of business realities to deliver results that protect our clients' interests and corporate reputation.`,
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2070"
  },
  {
    id: "02",
    slug: "commercial-litigation",
    title: "Commercial Litigation",
    desc: "Resolving high-stakes commercial disputes with precision and rigorous advocacy.",
    detailedDesc: `In the realm of Commercial Litigation, Himahlini & Co provides aggressive and sophisticated advocacy for businesses across diverse industries. We handle a wide range of commercial conflicts, from breach of contract claims to complex business torts.

    Our expertise covers:
    • Contractual and joint venture disputes
    • Intellectual property and non-compete litigation
    • Consumer protection and product liability
    • Professional malpractice defense

    We approach each case with the goal of achieving the most favorable outcome, whether through trial, arbitration, or strategic settlement negotiations.`,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2070"
  },
  {
    id: "03",
    slug: "corporate-restructuring",
    title: "Corporate Restructuring",
    desc: "Navigating complex financial reorganizations to protect enterprise value.",
    detailedDesc: `Our Corporate Restructuring team assists companies, creditors, and stakeholders in navigating financial distress. We provide strategic advice on both out-of-court workouts and court-supervised reorganizations designed to stabilize operations and maximize recovery.

    Our services include:
    • Debt restructuring and recapitalization strategies
    • Asset divestiture and distressed M&A
    • Representation in Chapter 11 and international insolvency proceedings
    • Board advisory on insolvency duties

    We specialize in creating innovative solutions that allow businesses to emerge stronger from challenging financial environments.`,
    image: "https://images.unsplash.com/photo-1454165833767-027ffea7028c?auto=format&fit=crop&q=80&w=2070"
  },
  {
    id: "04",
    slug: "corporate-insolvency",
    title: "Corporate Insolvency",
    desc: "Comprehensive advisory on insolvency proceedings, receiverships, and liquidations.",
    detailedDesc: `Himahlini & Co offers profound expertise in Corporate Insolvency, acting for liquidators, receivers, and troubled entities. We manage the delicate balance between creditor rights and asset preservation during formal insolvency procedures.

    Our comprehensive support includes:
    • Voluntary and compulsory liquidations
    • Receiverships and special administrations
    • Recovery of assets and clawback actions
    • Cross-border insolvency coordination

    We ensure that all processes are conducted with total transparency and in strict adherence to Malaysian and international legal standards.`,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2070"
  },
  {
    id: "05",
    slug: "defamation",
    title: "Defamation",
    desc: "Protecting individual and corporate reputations against unlawful communications.",
    detailedDesc: `Reputation is a priceless asset. Our Defamation practice helps individuals and corporations defend their honor in an increasingly digital world. We provide swift and decisive action against libel and slander across all media platforms.

    Our focus areas:
    • Pre-publication advice and risk management
    • Digital defamation and cyber-libel mitigation
    • Representation in high-profile defamation trials
    • Strategic crisis communication advisory

    We act with discretion and force to ensure that false statements are addressed and reputations are vindicated.`,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070"
  }
];

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const SectionHeader = ({ 
  label, 
  title, 
  as: Component = "h2", 
  light = false,
  className = ""
}: { 
  label?: string; 
  title: React.ReactNode; 
  as?: "h1" | "h2"; 
  light?: boolean;
  className?: string;
}) => (
  <div className={`mb-12 ${className}`}>
    {label && (
      <span className="font-sans text-xs tracking-[0.4em] uppercase text-accent mb-8 block">
        {label}
      </span>
    )}
    <Component className={`text-2xl md:text-4xl lg:text-5xl leading-[1.1] ${light ? 'font-normal' : 'font-serif'} text-primary`}>
      {title}
    </Component>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navItems = ["Services", "About", "People", "Contact"];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-8 lg:px-12 py-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-4 group">
          <span className="font-serif text-xl tracking-[0.2em] font-semibold text-primary uppercase transition-opacity group-hover:opacity-70">
            Himahlini & Co
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-12 font-sans text-xs tracking-[0.3em] uppercase">
          {navItems.map((item) => (
            <a 
              key={item} 
              href={isHome ? `#${item.toLowerCase()}` : `/#${item.toLowerCase()}`}
              className="text-accent hover:text-primary transition-colors font-medium"
            >
              {item}
            </a>
          ))}
          <motion.button 
            whileHover={{ opacity: 0.7 }}
            className="border-b border-primary pb-1 font-medium"
          >
            Consultation
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-bg border-b border-border px-8 py-12 flex flex-col gap-8 font-sans text-xs tracking-widest uppercase"
        >
          {navItems.map((item) => (
            <a 
              key={item} 
              href={isHome ? `#${item.toLowerCase()}` : `/#${item.toLowerCase()}`}
              className="text-primary"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </a>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col justify-start lg:justify-center pt-48 pb-32 lg:py-32 px-8 lg:px-24 overflow-hidden bg-bg">
      <div className="max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader 
            as="h1"
            label="Established 1995 • Kuala Lumpur, Malaysia"
            title={<>Got a Legal Problem? <br/>We'll Help You Sort It Out.</>}
            light
          />
          <p className="font-sans text-lg md:text-xl text-accent leading-relaxed max-w-xl mb-16 font-normal">
            Whether it's a business dispute, company restructuring, debt recovery, or a defamation claim — our lawyers are here to guide you from start to finish. No confusion, no runaround.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <button className="bg-primary text-bg px-12 py-5 font-sans text-md transition-opacity hover:opacity-90">
              Talk to a lawyer
            </button>
            <button className="border border-primary text-primary px-12 py-5 font-sans text-[11px] tracking-[0.3em] uppercase transition-colors hover:bg-white/50">
              Firm Profile
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div style={{ y }} className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none grayscale hidden lg:block">
        <img 
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2070" 
          alt="Architecture"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0">
        <div className="w-px h-16 bg-border" />
      </div>
    </section>
  );
};

const Expertise = () => {
  return (
    <section id="services" className="bg-bg border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {practices.map((practice, idx) => (
          <Link 
            key={idx}
            to={`/practice/${practice.slug}`}
            className={`p-10 lg:p-12 flex flex-col justify-between border-b border-border ${idx % 2 === 0 ? 'md:border-r' : ''} ${idx % 3 !== 2 ? 'lg:border-r' : 'lg:border-r-0'} group bg-white/20 hover:bg-white transition-all duration-500 min-h-[250px] relative`}
          >
            <div className="flex justify-between items-start mb-12">
              <span className="text-xs font-sans tracking-[0.3em] uppercase text-accent">{practice.id}</span>
              <ChevronRight size={14} className="text-border group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-primary mb-4 transition-colors group-hover:text-primary">{practice.title}</h3>
              <p className="font-sans text-sm text-accent leading-relaxed font-normal">
                {practice.desc}
              </p>
            </div>
            <div className="mt-8 overflow-hidden h-px bg-border group-hover:bg-primary transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
};

const Story = () => {
  return (
    <section id="about" className="py-40 bg-bg">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-32 items-start">
          <div className="lg:w-1/2">
            <SectionHeader 
              label="The Firm"
              title={<>Trusted Corporate Lawyers in KL <br />Since 1995</>}
            />
            <div className="space-y-8 text-accent font-normal leading-relaxed font-sans text-sm max-w-md">
              <p>
                Established in 1995, Himahlini & Co represents the intersection of Malaysian legacy and global legal standards. Our practice is built on the belief that clarity is the ultimate form of sophistication.
              </p>
              <p>
                We do not strive for volume; we strive for depth. Every case is treated with the same intellectual rigor and unwavering commitment to ethical excellence.
              </p>
              <div className="flex gap-20 pt-8 border-t border-border">
                <div>
                  <div className="text-3xl font-serif mb-1 text-primary">28+</div>
                  <div className="text-[11px] uppercase tracking-widest font-medium">Years</div>
                </div>
                <div>
                  <div className="text-3xl font-serif mb-1 text-primary">50+</div>
                  <div className="text-[11px] uppercase tracking-widest font-medium">Specialists</div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="aspect-[3/4] relative grayscale hover:grayscale-0 transition-all duration-1000">
              <img 
                src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2070" 
                alt="Lawyer's study"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-white/20 m-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-40 bg-bg border-t border-border">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
          <div>
            <SectionHeader title="Connect with us." />
            
            <div className="space-y-12">
              <div className="flex flex-col gap-4">
                <span className="font-sans text-xs tracking-wider uppercase text-accent font-semibold">Our Office</span>
                <p className="font-sans text-base text-primary leading-relaxed max-w-md">
                  M-1-14, Block M, No.60, Jalan Sri Hartamas 1, Taman Sri Hartamas, 50480 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <span className="font-sans text-xs tracking-wider uppercase text-accent font-semibold">Direct Communication</span>
                <div className="font-sans text-base text-primary space-y-1">
                  <p>03-6201 9938</p>
                  <p>contact@harispartners.legal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-accent">Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-primary transition-colors text-sm font-sans" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.3em] text-accent">Email</label>
                  <input type="email" className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-primary transition-colors text-sm font-sans" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.3em] text-accent">Brief Inquiry</label>
                <textarea rows={4} className="w-full bg-transparent border-b border-border py-4 focus:outline-none focus:border-primary transition-colors resize-none text-sm font-sans"></textarea>
              </div>
              <button className="bg-primary text-bg w-full py-6 text-xs font-bold uppercase tracking-[0.4em] transition-opacity hover:opacity-90">
                Send Notification
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const People = () => {
  const team = [
    {
      // name: "Himahlini A/P M. Ramalingam @ Yalumallai",
      name: "Himahlini",
      role: "Managing Partner",
      credentials: "LLB (Hons) University of Malaya",
      bio: "Advocate & Solicitor of the High Court of Malaya since May 2005",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000"
    },
    {
      // name: "Aiman Haqeem Al Sadat bin Zyed Al Sadat",
      name: "Aiman Haqeem",
      role: "Partner",
      credentials: "LLB (Hons) Universiti Teknologi MARA",
      bio: "Advocate & Solicitor of the High Court of Malaya since October 2021",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000"
    },
    {
      name: "Lee Jia Rou",
      role: "Associate",
      credentials: "LLB (Hons) Multimedia University",
      bio: "Advocate & Solicitor of the High Court of Malaya since April 2024",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=1000"
    }
  ];

  return (
    <section id="people" className="py-40 bg-bg border-t border-border">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <SectionHeader 
              label="Our People"
              title="Experience that defines excellence."
              className="mb-0"
            />
          </div>
          <p className="text-accent max-w-sm font-sans text-sm font-normal leading-relaxed mb-12">
            Our multi-disciplinary team combines local depth with global litigation standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {team.map((lawyer, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="group"
            >
              <div className="aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 mb-8">
                <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              </div>
              <h3 className="text-xl md:text-2xl font-serif text-primary mb-3 leading-snug">{lawyer.name}</h3>
              <div className="text-xs uppercase tracking-widest text-accent font-medium mb-6 leading-relaxed">
                <span className="block mb-1 text-primary">{lawyer.role}</span>
                {lawyer.credentials}
              </div>
              <p className="text-accent font-sans text-sm leading-relaxed font-normal">
                {lawyer.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PracticeDetail = () => {
  const { slug } = useParams();
  const currentIndex = practices.findIndex(p => p.slug === slug);
  const practice = practices[currentIndex];

  if (!practice) return <div className="pt-40 px-8 text-center font-sans tracking-widest uppercase">Practice Area Not Found</div>;

  const nextPractice = practices[(currentIndex + 1) % practices.length];
  const prevPractice = practices[(currentIndex - 1 + practices.length) % practices.length];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-32 bg-bg min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <Link to="/" className="inline-flex items-center gap-4 group mb-16 text-xs font-sans tracking-[0.3em] uppercase text-accent hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          Back to Overview
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/2">
            <SectionHeader 
              as="h1"
              label={`Expertise — ${practice.id}`}
              title={practice.title}
            />
            <div className="prose prose-sm prose-gray max-w-none text-accent font-sans text-base leading-relaxed space-y-8 whitespace-pre-line">
              {practice.detailedDesc}
            </div>
            
            <div className="mt-20 pt-12 border-t border-border">
              <div className="flex justify-between items-center gap-8">
                <Link 
                  to={`/practice/${prevPractice.slug}`}
                  className="flex flex-col gap-2 group max-w-[150px]"
                >
                  <span className="text-xs uppercase text-accent group-hover:text-primary transition-colors">Previous</span>
                  <span className="text-sm font-serif text-primary lowercase font-normal group-hover:opacity-70 transition-opacity">
                    {prevPractice.title}
                  </span>
                </Link>

                <div className="w-px h-8 bg-border" />

                <Link 
                  to={`/practice/${nextPractice.slug}`}
                  className="flex flex-col gap-2 group text-right max-w-[150px]"
                >
                  <span className="text-xs uppercase text-accent group-hover:text-primary transition-colors">Next Area</span>
                  <span className="text-sm font-serif text-primary lowercase font-normal group-hover:opacity-70 transition-opacity">
                    {nextPractice.title}
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="mt-12 pt-12 border-t border-border">
              <button className="bg-primary text-bg px-12 py-5 font-sans text-[10px] tracking-[0.3em] uppercase transition-opacity hover:opacity-90">
                Inquire about this service
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 rounded-sm">
              <img src={practice.image} alt={practice.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => (
  <>
    <Hero />
    <Expertise />
    <Story />
    <People />
    <section className="bg-primary py-32 px-8 lg:px-12 border-y border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <blockquote className="text-2xl md:text-5xl text-bg font-serif leading-relaxed mb-12">
          "In the courtroom of truth, the simplest argument is the most effective. 
          We strive to be the voice of reason across the Malaysian legal landscape."
        </blockquote>
        <cite className="text-accent/60 block font-sans font-medium tracking-[0.4em] uppercase text-xs">
          — Himahlini, Managing Partner
        </cite>
      </div>
    </section>
    <Contact />
  </>
);

const Footer = () => (
  <footer className="bg-bg border-t border-border py-12 px-8 lg:px-12">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 font-sans text-[11px] tracking-[0.3em] uppercase text-accent">
      <div className="flex items-center gap-8">
        <span className="text-primary font-serif text-base tracking-normal normal-case">Himahlini & Co</span>
        <span className="opacity-60 text-primary">© {new Date().getFullYear()} • Kuala Lumpur</span>
      </div>
      <div className="flex gap-10">
        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
        <a href="#" className="hover:text-primary transition-colors">Terms</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-bg selection:bg-primary selection:text-bg">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice/:slug" element={<PracticeDetail />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
