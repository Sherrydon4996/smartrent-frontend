import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Clock,
  FileText,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Building2,
  Smartphone,
  Users,
  BarChart3,
  Zap,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/LoginModal";
import heroImage from "@/assets/hero-rent-payment.jpg";
import landlordBgImage from "@/assets/landlord-collecting-rent.jpg";

// Typewriter hook
function useTypewriter(
  phrases: string[],
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseTime = 2000,
) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      timeout = setTimeout(
        () => {
          setText(
            currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)),
          );
        },
        isDeleting ? deletingSpeed : typingSpeed,
      );
    }
    return () => clearTimeout(timeout);
  }, [
    text,
    isDeleting,
    phraseIndex,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseTime,
  ]);

  return text;
}

// Animated counter
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Section wrapper with scroll animation
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const typedText = useTypewriter([
    "Automate Rent Collection.",
    "Eliminate Late Payments.",
    "Manage Properties Smarter.",
    "Track M-Pesa Payments.",
  ]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Secure M-Pesa Payments",
      description:
        "Integrated M-Pesa & bank transfers with encrypted transactions and auto receipts.",
    },
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description:
        "Monitor payments, balances, and overdue accounts with instant SMS & email alerts.",
    },
    {
      icon: FileText,
      title: "Automated Reports",
      description:
        "Generate KRA-ready financial reports. Export to PDF, CSV, or Excel in one click.",
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description:
        "Visualize income trends, occupancy rates, and collection efficiency with dashboards.",
    },
    {
      icon: Smartphone,
      title: "Mobile-First",
      description:
        "Tenants pay via M-Pesa from anywhere. Landlords manage from any device.",
    },
    {
      icon: Users,
      title: "Multi-Property",
      description:
        "Manage hundreds of units across multiple buildings from a single dashboard.",
    },
  ];

  const testimonials = [
    {
      name: "James Mwangi",
      role: "Property Owner, Nairobi",
      text: "SmartRent reduced my late payments by 90%. The M-Pesa integration is seamless — tenants pay on time now.",
      rating: 5,
    },
    {
      name: "Akinyi Odhiambo",
      role: "Real Estate Manager, Mombasa",
      text: "Managing 200+ units was chaos before SmartRent. Now I run everything from my phone. Incredible tool.",
      rating: 5,
    },
    {
      name: "Peter Kamau",
      role: "Landlord, Kisumu",
      text: "The automated penalty system and SMS reminders changed my business. I collect KSH 2M+ monthly stress-free.",
      rating: 5,
    },
  ];

  const slides = [
    {
      title: "Rent Payment Dashboard",
      description: "Track every payment in real-time",
      image: heroImage,
    },
    {
      title: "Tenant Management",
      description: "Complete tenant profiles & history",
      image: landlordBgImage,
    },
    {
      title: "Analytics & Reports",
      description: "KRA-ready financial insights",
      image: heroImage,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Clean White Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground font-display">
                SmartRent
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="tel:+254711140899"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Contact
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLoginOpen(true)}
                className="text-sm"
              >
                Log in
              </Button>
              <Button
                size="sm"
                onClick={() => setIsLoginOpen(true)}
                className="rounded-full px-5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 animate-gradient-shift" />

        {/* Floating blurred shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-blob" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-blob"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-success/10 rounded-full blur-[80px] animate-blob"
          style={{ animationDelay: "4s" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
              >
                <Zap className="w-3.5 h-3.5" />
                #1 Property Management in Kenya
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight text-foreground mb-6">
                <span className="block text-muted-foreground text-lg sm:text-xl lg:text-2xl font-normal mb-2 font-sans">
                  SmartRent Manager
                </span>
                <span className="text-primary animate-typing-cursor inline-block min-h-[1.2em]">
                  {typedText}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                The all-in-one platform for Kenyan landlords. Collect rent via
                M-Pesa, track payments, and manage tenants — all automated.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button
                  size="lg"
                  onClick={() => setIsLoginOpen(true)}
                  className="rounded-full px-8 py-6 text-base font-semibold group"
                >
                  Start Collecting Rent
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-6 text-base font-semibold"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>M-Pesa Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Free to Start</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>No Card Required</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual - Floating Dashboard Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Main dashboard card */}
              <div className="relative animate-float">
                <div className="glass-card rounded-3xl p-6 border border-border/50 shadow-elevated bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      Monthly Collection
                    </h3>
                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                      +12%
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    Over ksh. 100,000
                  </p>
                  <p className="text-sm text-muted-foreground">February 2026</p>
                  <div className="mt-4 flex gap-1">
                    {[65, 80, 45, 90, 70, 85, 95, 60, 88, 75, 92, 78].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/20 rounded-full overflow-hidden"
                          style={{ height: "60px" }}
                        >
                          <div
                            className="w-full bg-primary rounded-full mt-auto"
                            style={{
                              height: `${h}%`,
                              marginTop: `${100 - h}%`,
                            }}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Floating payment card */}
              <motion.div
                className="absolute -bottom-6 -left-8 animate-float-slow"
                style={{ animationDelay: "1s" }}
              >
                <div className="glass-card rounded-2xl p-4 border border-border/50 shadow-elevated bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Payment Received
                      </p>
                      <p className="text-xs text-muted-foreground">
                        KSH 25,000 via M-Pesa
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating occupancy card */}
              <motion.div
                className="absolute -top-4 -right-4 animate-float"
                style={{ animationDelay: "2s" }}
              >
                <div className="glass-card rounded-2xl p-4 border border-border/50 shadow-elevated bg-card">
                  <p className="text-2xl font-bold text-primary">98%</p>
                  <p className="text-xs text-muted-foreground">
                    Occupancy Rate
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section with animated counters */}
      <section className="relative py-16 bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 5, suffix: "+", label: "Properties Managed" },
              { value: 50, suffix: "+", label: "Happy Tenants" },
              {
                value: 100,
                prefix: "KSH ",
                suffix: "K+",
                label: "Rent Collected",
              },
              { value: 98, suffix: "%", label: "Collection Rate" },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.1} className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-1">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix || ""}
                  />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A powerful dashboard designed for Kenyan property managers
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-elevated bg-card">
              <div className="relative aspect-[16/9] overflow-hidden">
                {slides.map((slide, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: currentSlide === i ? 1 : 0,
                      scale: currentSlide === i ? 1 : 1.05,
                    }}
                    transition={{ duration: 0.7 }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold">{slide.title}</h3>
                      <p className="text-white/70">{slide.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Carousel controls */}
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button
                  onClick={() => setCurrentSlide((p) => (p - 1 + 3) % 3)}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((p) => (p + 1) % 3)}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Slide indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === i ? "w-8 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-background relative">
        {/* Subtle background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-success/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              Powerful Features
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              Everything You Need to Manage Rentals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built tools for Kenyan landlords and property managers.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group bg-card rounded-2xl p-7 border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 h-full"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Kenya Trust Section with parallax */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${landlordBgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <span className="inline-block text-sm font-semibold text-success bg-success/20 px-4 py-1.5 rounded-full mb-6">
              Trusted Across Kenya 🇰🇪
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-6">
              Built for the Kenyan Market
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto mb-10">
              From Nairobi to Mombasa, landlords trust SmartRent Manager to
              automate their rental collections. Easier for anyone to get
              started where it's fully KES currency supported.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Smartphone,
                  label: "Easier to record and monitor",
                  desc: "full track records",
                },
                {
                  icon: Shield,
                  label: "well documented periodical reports",
                  desc: "monthly, yearly, and depts reports",
                },
                {
                  icon: Users,
                  label: "50+ Tenants",
                  desc: "Active on platform",
                },
                {
                  icon: BarChart3,
                  label: "Real-Time Data",
                  desc: "Live dashboards",
                },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center"
                  >
                    <item.icon className="w-8 h-8 text-success mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">
                      {item.label}
                    </p>
                    <p className="text-white/50 text-sm">{item.desc}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              Loved by Kenyan Landlords
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl p-7 border border-border/50 shadow-card h-full flex flex-col"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 text-warning fill-warning"
                      />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 flex-1 leading-relaxed">
                    "{t.text}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with animated blobs */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-[80px] animate-blob" />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-[100px] animate-blob"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-primary-foreground mb-6">
              Ready to Transform Your
              <br />
              Rental Business?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join 20+ Kenyan property owners who automate rent collection with
              SmartRent Manager. Start free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setIsLoginOpen(true)}
                className="rounded-full px-10 py-6 text-base font-semibold bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              {/* <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 py-6 text-base font-semibold border-white/30 text-primary-foreground hover:bg-white/10"
              >
                Talk to Sales */}
              {/* </Button> */}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground font-display">
                  SmartRent Manager
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Kenya's #1 property management platform. Automate rent
                collection, manage tenants, and grow your portfolio.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
              <div className="space-y-3">
                <a
                  href="tel:+254711140899"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +254 711 140 899
                </a>
                <a
                  href="mailto:harrynjogu4996@gmail.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  harrynjogu4996@gmail.com
                </a>
                <a
                  href="https://wa.me/254711140899"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp: +254 711 140 899
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2026 SmartRent developed by{" "}
              <a
                href="https://www.harrytechservices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                HarryTech
              </a>
              . All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
