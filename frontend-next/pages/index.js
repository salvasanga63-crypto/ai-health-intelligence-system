import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DashboardContent } from "./dashboard";
import {
  ArrowRightIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  HeartIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const patientClusterOptions = [
  "lactating mothers",
  "pregnant/expectant mothers",
  "children under 5",
  "children 5-17",
  "women",
  "men",
  "elders",
  "general patients",
];

const heroSlides = [
  {
    id: "expectant",
    title: "Comprehensive Prenatal Tracking & Maternal Guidance",
    body: "Our specialized maternal registry offers expectant mothers structured guidance throughout every trimester of pregnancy. Clinicians can monitor fetal development, track maternal health telemetry, schedule vital scan appointments, and access tailored nutritional guidelines to ensure a safe, supported path to delivery.",
    image: "/images/maternity-placeholder.svg",
  },
  {
    id: "lactating",
    title: "Postpartum Recovery & Newborn Nutrition Support",
    body: "Navigating the postpartum journey requires dedicated clinical attention. This panel provides mothers with expert lactation consulting records, neonatal growth monitoring, and maternal mental health tracking. Our system actively syncs postnatal checkups to optimize infant nutrition and support maternal recovery milestones.",
    image: "/images/lactating-placeholder.svg",
  },
  {
    id: "elders",
    title: "Advanced Geriatric Care & Chronic Disease Management",
    body: "Dedicated to optimizing health and quality of life for senior citizens. This interface allows medical staff to coordinate multi-specialist care plans, track routine cognitive assessments, manage complex medication regimens, and monitor age-specific mobility and cardiovascular telemetry streams.",
    image: "/images/elders-placeholder.svg",
  },
  {
    id: "women",
    title: "Specialized Preventive Care & Wellness Services for Women",
    body: "A comprehensive clinical workspace for women's healthcare across all stages of life. Staff can track essential preventive screenings, manage general gynecological and reproductive health records, log diagnostic telemetry, and deploy community health outreach initiatives optimized for women's wellness.",
    image: "/images/women-placeholder.svg",
  },
  {
    id: "children_u5",
    title: "Critical Early Childhood Growth & Immunization Tracking",
    body: "The first five years are vital for neurodevelopment and physical growth. This registry automates standard pediatric immunization schedules, monitors early childhood growth percentiles, tracks acute pediatric infectious risks, and ensures immediate clinical prioritization for infants and toddlers in our triage system.",
    image: "/images/children-u5-placeholder.svg",
  },
  {
    id: "children_5_17",
    title: "School-Age Development & Adolescent Healthcare Monitoring",
    body: "Designed to track physical development, mental well-being, and nutritional health throughout childhood and adolescence. Features integrated tracking for school physicals, mandatory vaccination updates, behavioral health assessments, and early interventions for youth and teenagers.",
    image: "/images/children-5-17-placeholder.svg",
  },
  {
    id: "men",
    title: "Preventive Screening & Comprehensive Health Protocols for Men",
    body: "Focused on promoting proactive healthcare behaviors and addressing gender-specific medical risks in men. This includes clinical workflows for tracking metabolic health tracking, cardiovascular risk assessments, and age-related prostate and urological screenings.",
    image: "/images/men-placeholder.svg",
  },
  {
    id: "whole",
    title: "Unified Patient Records & Holistic Family Medicine Portal",
    body: "The foundational bedrock of our Health Intelligence Platform. This view aggregates primary care, holistic family health history, broad outpatient tracking data, and global diagnostic telemetry, enabling inter-departmental collaboration across all medical disciplines.",
    image: "/images/wholepatients-placeholder.svg",
  },
];

const carouselIntervalMs = 5000;

const accordionSectionStyle = (active) => ({
  background: "white",
  borderRadius: "16px",
  border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
  boxShadow: active
    ? "0 20px 50px rgba(37, 99, 235, 0.12)"
    : "0 0 0 rgba(15, 23, 42, 0)",
  transform: active ? "translateY(-2px)" : "none",
  opacity: active ? 1 : 0.88,
  transition: "all 260ms ease",
  cursor: "pointer",
  overflow: "hidden",
  padding: "18px",
});

const accordionBodyStyle = (active) => ({
  maxHeight: active ? "1200px" : "0",
  opacity: active ? 1 : 0,
  overflow: "hidden",
  transition: "all 260ms ease",
});

export default function Home() {
  const router = useRouter();
  const [activeView, setActiveView] = useState("login");
  const [lightMode, setLightMode] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState(heroSlides);

  // Fetch slides from simulated CMS endpoint; fallback to local slides
  useEffect(() => {
    let mounted = true;
    fetch("/api/cms/slides")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data && Array.isArray(data.slides) && data.slides.length > 0) {
          setSlides(data.slides);
        }
      })
      .catch(() => {
        // keep fallback slides
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isPaused || slides.length === 0) return undefined;
    const id = setInterval(
      () => setCurrentSlide((s) => (s + 1) % slides.length),
      carouselIntervalMs,
    );
    return () => clearInterval(id);
  }, [isPaused, slides.length]);

  // ensure currentSlide is valid when slides change
  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides.length]);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState({});

  const [registerFullName, setRegisterFullName] = useState("");
  const [registerStaffId, setRegisterStaffId] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerCode, setRegisterCode] = useState("");
  const [registerRole, setRegisterRole] = useState("Doctor");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerErrors, setRegisterErrors] = useState({});
  const [verificationSent, setVerificationSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [registerStatus, setRegisterStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerSection, setRegisterSection] = useState("personal");
  const registrationProgress =
    registerSection === "personal"
      ? "33%"
      : registerSection === "verification"
        ? "66%"
        : "100%";

  const resetValidation = () => {
    setLoginErrors({});
    setRegisterErrors({});
    setRegisterStatus("");
  };

  const switchView = (view) => {
    setActiveView(view);
    resetValidation();
    if (view === "register") setRegisterSection("personal");
  };

  const toggleTheme = () => {
    setLightMode((value) => {
      const nextValue = !value;
      document.documentElement.classList.toggle("light-mode", nextValue);
      return nextValue;
    });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const errors = {};
    if (!loginUsername.trim()) errors.username = "Username is required";
    if (!loginPassword.trim()) errors.password = "Password is required";
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    startDemoSession();
    router.push("/triage");
  };

  const handleSendVerificationCode = () => {
    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!registerEmail.trim() || !emailPattern.test(registerEmail)) {
      setRegisterErrors((prev) => ({
        ...prev,
        email: "Enter a valid work email before sending.",
      }));
      setRegisterStatus("");
      return;
    }

    // call API to send verification
    sendVerificationEmail(registerEmail)
      .then((res) => {
        if (!res.ok) {
          setRegisterStatus("Failed to send verification code.");
          return;
        }
        setVerificationSent(true);
        setCodeVerified(false);
        setRegisterSection("verification");
        setRegisterStatus(
          "A secure 6-digit verification code was sent to your email.",
        );
        setRegisterErrors((prev) => ({
          ...prev,
          email: undefined,
          verification_code: undefined,
        }));
      })
      .catch(() => {
        setRegisterStatus("Network error sending verification code.");
      });
  };

  const handleVerifyCode = () => {
    if (!verificationSent) {
      setRegisterErrors((prev) => ({
        ...prev,
        verification_code: "Send the verification code first.",
      }));
      setRegisterStatus("");
      return;
    }

    if (!/^\d{6}$/.test(registerCode.trim())) {
      setRegisterErrors((prev) => ({
        ...prev,
        verification_code: "Enter the 6-digit code received by email.",
      }));
      setCodeVerified(false);
      setRegisterStatus("Invalid verification code.");
      return;
    }

    verifyEmailCode(registerEmail, registerCode)
      .then((res) => {
        if (!res.ok) {
          setRegisterErrors((prev) => ({
            ...prev,
            verification_code:
              "Verification failed. Check the code and try again.",
          }));
          setRegisterStatus("Verification failed.");
          setCodeVerified(false);
          return;
        }
        setCodeVerified(true);
        setRegisterSection("security");
        setRegisterErrors((prev) => ({
          ...prev,
          verification_code: undefined,
        }));
        setRegisterStatus(
          "Email verified successfully. You may continue registration.",
        );
      })
      .catch(() => {
        setRegisterStatus("Network error verifying code.");
      });
  };

  const handleRegister = (event) => {
    event.preventDefault();
    const errors = {};
    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!registerFullName.trim()) errors.full_name = "Full name is required";
    if (!registerStaffId.trim()) errors.staff_id = "Staff ID is required";
    if (!registerEmail.trim() || !emailPattern.test(registerEmail))
      errors.email = "Enter a valid email address";
    if (!registerPhone.trim()) errors.phone = "Phone number is required";
    if (!verificationSent)
      errors.verification_code = "Send the email verification code first";
    if (!codeVerified)
      errors.verification_code = "Verify your email before registering";
    if (!registerPassword) errors.password = "Password is required";
    if (!registerConfirmPassword)
      errors.confirm_password = "Confirm your password";
    if (
      registerPassword &&
      registerConfirmPassword &&
      registerPassword !== registerConfirmPassword
    ) {
      errors.password = "Passwords do not match";
      errors.confirm_password = "Passwords do not match";
    }

    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) {
      setRegisterStatus("Please fix validation issues before continuing.");
      return;
    }

    // Hash password client-side before sending (SHA-256)
    const hashPassword = async (pw) => {
      if (
        typeof window === "undefined" ||
        !window.crypto ||
        !window.crypto.subtle
      )
        return pw;
      const enc = new TextEncoder();
      const data = enc.encode(pw);
      const hash = await window.crypto.subtle.digest("SHA-256", data);
      const arr = Array.from(new Uint8Array(hash));
      return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    (async () => {
      try {
        const hashed = await hashPassword(registerPassword);
        const payload = {
          full_name: registerFullName,
          staff_id: registerStaffId,
          email: registerEmail,
          phone: registerPhone,
          role: registerRole,
          password: hashed,
        };

        const res = await registerRequest(payload);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setRegisterStatus(body.error || "Registration failed");
          return;
        }
        setRegisterStatus(
          "Staff registration complete. Please log in with your new credentials.",
        );
        switchView("login");
      } catch (e) {
        setRegisterStatus("Network error during registration.");
      }
    })();
  };

  return (
    <div style={styles.container}>
      <nav style={styles.publicNav} aria-label="Public navigation">
        <a href="/" style={styles.brandLink}>
          <span style={styles.brandMark}>+</span>
          <span>
            <small style={styles.brandEyebrow}>
              Clinical operations console
            </small>
            Health Intelligence Platform
          </span>
        </a>
        <div style={styles.publicNavActions}>
          <a href="/login" style={styles.navButton}>
            Sign In
          </a>
          <button type="button" onClick={toggleTheme} style={styles.navButton}>
            {lightMode ? "Dark mode" : "☀ Light mode"}
          </button>
        </div>
      </nav>

      <div style={styles.heroLayout}>
        <div
          style={styles.heroWrapper}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {slides.map((s, idx) => (
            <div
              key={s.id}
              aria-hidden={idx !== currentSlide}
              style={{
                ...styles.heroSlide,
                position: "absolute",
                inset: 0,
                opacity: idx === currentSlide ? 1 : 0,
                transition: "opacity 600ms ease",
                zIndex: idx === currentSlide ? 2 : 1,
              }}
            >
              <img
                src={s.image}
                alt={s.title}
                style={styles.heroImage}
                loading={idx === currentSlide ? "eager" : "lazy"}
                draggable={false}
              />

              <div style={styles.heroOverlay} aria-hidden />

              <div style={styles.heroContent}>
                <span style={styles.heroEyebrow}>
                  {s.cluster || "Clinical workspace"}
                </span>
                <h2 style={styles.heroTitle}>{s.title}</h2>
                <p style={styles.heroBody}>{s.body}</p>
              </div>
            </div>
          ))}

          <div style={styles.carouselControls}>
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                style={
                  idx === currentSlide
                    ? styles.carouselDotActive
                    : styles.carouselDot
                }
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {false && (
          <div style={styles.card}>
            <header style={styles.cardHeader}>
              <div>
                <h1 style={styles.title}>
                  {activeView === "login"
                    ? "Staff Portal"
                    : "Staff Registration"}
                </h1>
                <p style={styles.subTitle}>
                  {activeView === "login"
                    ? "Sign in with your staff credentials to access the workspace."
                    : "Register staff accounts with secure verification and role selection."}
                </p>
              </div>
            </header>

            <div style={styles.cardBody}>
              {activeView === "login" ? (
                <form onSubmit={handleLogin} style={styles.formGrid} noValidate>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="username">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      placeholder="Enter your patient username"
                      value={loginUsername}
                      onChange={(event) => setLoginUsername(event.target.value)}
                      style={
                        loginErrors.username
                          ? { ...styles.input, ...styles.inputError }
                          : styles.input
                      }
                    />
                    {loginErrors.username && (
                      <span style={styles.errorText}>
                        {loginErrors.username}
                      </span>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="loginPassword">
                      Password
                    </label>
                    <input
                      id="loginPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      style={
                        loginErrors.password
                          ? { ...styles.input, ...styles.inputError }
                          : styles.input
                      }
                    />
                    {loginErrors.password && (
                      <span style={styles.errorText}>
                        {loginErrors.password}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    style={{ ...styles.button, marginTop: 8 }}
                  >
                    Sign In
                  </button>

                  <p style={styles.switchPrompt}>
                    Don&rsquo;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchView("register")}
                      style={styles.linkButton}
                    >
                      Register now
                    </button>
                  </p>
                  {loginErrors.submit && (
                    <span style={styles.errorText}>{loginErrors.submit}</span>
                  )}
                </form>
              ) : (
                <form
                  onSubmit={handleRegister}
                  style={styles.registerForm}
                  noValidate
                >
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: registrationProgress,
                      }}
                      role="progressbar"
                      aria-valuenow={Number(
                        registrationProgress.replace("%", ""),
                      )}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                  <div
                    style={accordionSectionStyle(
                      registerSection === "personal",
                    )}
                    onClick={() => setRegisterSection("personal")}
                  >
                    <div style={styles.sectionHeader}>
                      <div>
                        <strong>Staff Info</strong>
                        <p style={styles.sectionHint}>
                          Full name, staff ID, contact email and phone.
                        </p>
                      </div>
                      <span style={styles.sectionIndicator}>
                        {registerSection === "personal" ? "−" : "+"}
                      </span>
                    </div>
                    <div
                      style={accordionBodyStyle(registerSection === "personal")}
                    >
                      <div style={styles.rowGrid}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label} htmlFor="fullName">
                            Full Name
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            placeholder="Dr. Jane Doe"
                            value={registerFullName}
                            onChange={(event) =>
                              setRegisterFullName(event.target.value)
                            }
                            style={
                              registerErrors.full_name
                                ? { ...styles.input, ...styles.inputError }
                                : styles.input
                            }
                          />
                          {registerErrors.full_name && (
                            <span style={styles.errorText}>
                              {registerErrors.full_name}
                            </span>
                          )}
                        </div>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label} htmlFor="staffId">
                            Staff ID
                          </label>
                          <input
                            id="staffId"
                            type="text"
                            placeholder="HOSP-12345"
                            value={registerStaffId}
                            onChange={(event) =>
                              setRegisterStaffId(event.target.value)
                            }
                            onBlur={() => {
                              if (!registerStaffId) return;
                              checkStaffId(registerStaffId)
                                .then((r) => {
                                  if (!r.ok) {
                                    setRegisterErrors((prev) => ({
                                      ...prev,
                                      staff_id:
                                        "Staff ID already in use or invalid.",
                                    }));
                                    return;
                                  }
                                  setRegisterErrors((prev) => ({
                                    ...prev,
                                    staff_id: undefined,
                                  }));
                                })
                                .catch(() =>
                                  setRegisterErrors((prev) => ({
                                    ...prev,
                                    staff_id: "Could not verify Staff ID.",
                                  })),
                                );
                            }}
                            style={
                              registerErrors.staff_id
                                ? { ...styles.input, ...styles.inputError }
                                : styles.input
                            }
                          />
                          {registerErrors.staff_id && (
                            <span style={styles.errorText}>
                              {registerErrors.staff_id}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={styles.rowGrid}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label} htmlFor="registerEmail">
                            Email
                          </label>
                          <input
                            id="registerEmail"
                            type="email"
                            placeholder="name@hospital.org"
                            value={registerEmail}
                            onChange={(event) =>
                              setRegisterEmail(event.target.value)
                            }
                            style={
                              registerErrors.email
                                ? { ...styles.input, ...styles.inputError }
                                : styles.input
                            }
                          />
                          {registerErrors.email && (
                            <span style={styles.errorText}>
                              {registerErrors.email}
                            </span>
                          )}
                        </div>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label} htmlFor="registerPhone">
                            Phone Number
                          </label>
                          <input
                            id="registerPhone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={registerPhone}
                            onChange={(event) =>
                              setRegisterPhone(event.target.value)
                            }
                            style={
                              registerErrors.phone
                                ? { ...styles.input, ...styles.inputError }
                                : styles.input
                            }
                          />
                          {registerErrors.phone && (
                            <span style={styles.errorText}>
                              {registerErrors.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={accordionSectionStyle(
                      registerSection === "verification",
                    )}
                    onClick={() => setRegisterSection("verification")}
                  >
                    <div style={styles.sectionHeader}>
                      <div>
                        <strong>Email Verification</strong>
                        <p style={styles.sectionHint}>
                          Send and confirm the one-time verification code.
                        </p>
                      </div>
                      <span style={styles.sectionIndicator}>
                        {registerSection === "verification" ? "−" : "+"}
                      </span>
                    </div>
                    <div
                      style={accordionBodyStyle(
                        registerSection === "verification",
                      )}
                    >
                      <div style={styles.verificationRow}>
                        <div style={styles.fieldGroupFullWidth}>
                          <label
                            style={styles.label}
                            htmlFor="verificationCode"
                          >
                            Verification Code
                          </label>
                          <div style={styles.inlineVerifyGroup}>
                            <input
                              id="verificationCode"
                              type="text"
                              maxLength={6}
                              placeholder="123456"
                              value={registerCode}
                              onChange={(event) =>
                                setRegisterCode(event.target.value)
                              }
                              style={
                                registerErrors.verification_code
                                  ? {
                                      ...styles.input,
                                      ...styles.inputError,
                                      ...styles.verifyInput,
                                    }
                                  : { ...styles.input, ...styles.verifyInput }
                              }
                            />
                            <button
                              type="button"
                              onClick={handleVerifyCode}
                              style={styles.verifyButton}
                            >
                              Verify Code
                            </button>
                          </div>
                          {registerErrors.verification_code && (
                            <span style={styles.errorText}>
                              {registerErrors.verification_code}
                            </span>
                          )}
                          {registerStatus && (
                            <span
                              style={
                                registerErrors.verification_code
                                  ? styles.errorText
                                  : styles.statusText
                              }
                            >
                              {registerStatus}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleSendVerificationCode}
                          style={styles.sendCodeButton}
                        >
                          Send Code
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    style={accordionSectionStyle(
                      registerSection === "security",
                    )}
                    onClick={() => setRegisterSection("security")}
                  >
                    <div style={styles.sectionHeader}>
                      <div>
                        <strong>Account Security</strong>
                        <p style={styles.sectionHint}>
                          Set a secure password to access your patient portal.
                        </p>
                      </div>
                      <span style={styles.sectionIndicator}>
                        {registerSection === "security" ? "−" : "+"}
                      </span>
                    </div>
                    <div
                      style={accordionBodyStyle(registerSection === "security")}
                    >
                      <div style={styles.rowGrid}>
                        <div style={styles.fieldGroup}>
                          <label
                            style={styles.label}
                            htmlFor="registerPassword"
                          >
                            Password
                          </label>
                          <div style={styles.passwordWrapper}>
                            <input
                              id="registerPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              value={registerPassword}
                              onChange={(event) =>
                                setRegisterPassword(event.target.value)
                              }
                              style={
                                registerErrors.password
                                  ? { ...styles.input, ...styles.inputError }
                                  : styles.input
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((value) => !value)}
                              style={styles.visibilityToggle}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? "🙈" : "👁️"}
                            </button>
                          </div>
                          {registerErrors.password && (
                            <span style={styles.errorText}>
                              {registerErrors.password}
                            </span>
                          )}
                        </div>
                        <div style={styles.fieldGroup}>
                          <label
                            style={styles.label}
                            htmlFor="registerConfirmPassword"
                          >
                            Confirm Password
                          </label>
                          <div style={styles.passwordWrapper}>
                            <input
                              id="registerConfirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Repeat your password"
                              value={registerConfirmPassword}
                              onChange={(event) =>
                                setRegisterConfirmPassword(event.target.value)
                              }
                              style={
                                registerErrors.confirm_password
                                  ? { ...styles.input, ...styles.inputError }
                                  : styles.input
                              }
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword((value) => !value)
                              }
                              style={styles.visibilityToggle}
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showConfirmPassword ? "🙈" : "👁️"}
                            </button>
                          </div>
                          {registerErrors.confirm_password && (
                            <span style={styles.errorText}>
                              {registerErrors.confirm_password}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ ...styles.button, marginTop: 4 }}
                  >
                    Create Account
                  </button>

                  <p style={styles.switchPrompt}>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => switchView("login")}
                      style={styles.linkButton}
                    >
                      Sign in here
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <section
        style={styles.platformSection}
        aria-labelledby="platformHighlightsTitle"
      >
        <div style={styles.sectionIntro}>
          <div>
            <span style={styles.eyebrow}>Explore the platform</span>
            <h2 id="platformHighlightsTitle" style={styles.sectionTitle}>
              Clinical workspaces
            </h2>
          </div>
          <span style={styles.liveBadge}>● Live systems</span>
        </div>
        <div style={styles.workspaceGrid}>
          {[
            ["Care Queue", "Live triage & priority review", "↝"],
            ["Clinical AI", "Symptoms, imaging & diagnosis", "✦"],
            ["Chatbot", "Visualize live hospital data", "◇"],
            ["Operations", "Devices & predictive maintenance", "⌘"],
          ].map(([title, body, icon]) => (
            <article key={title} style={styles.workspaceCard}>
              <span style={styles.workspaceIcon}>{icon}</span>
              <div className="workspace-copy" style={styles.workspaceCopy}>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
              <span style={styles.workspaceArrow}>→</span>
            </article>
          ))}
        </div>
      </section>

      <section
        style={styles.dashboardSection}
        aria-label="Health intelligence dashboard"
      >
        <DashboardContent />
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1120px",
    margin: "48px auto",
    padding: "0 20px",
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  publicNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    padding: "10px 4px",
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    color: "#e2e8f0",
    fontWeight: 800,
    fontSize: "1.15rem",
    letterSpacing: "0.01em",
    textDecoration: "none",
  },
  brandMark: {
    display: "grid",
    placeItems: "center",
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#2aa9e0",
    color: "#042033",
    fontSize: "1.45rem",
    lineHeight: 1,
  },
  brandEyebrow: {
    display: "block",
    marginBottom: 2,
    color: "#2aa9e0",
    fontSize: "0.58rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  publicNavActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  navButton: {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #294767",
    borderRadius: 10,
    background: "#101a2b",
    color: "#dbeafe",
    padding: "10px 15px",
    fontSize: "0.82rem",
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.16)",
  },
  heroLayout: { display: "block" },
  dashboardSection: {
    margin: "0 -20px 48px",
    padding: "32px 20px",
    background: "#05080f",
    borderRadius: "24px",
  },
  platformSection: { margin: "40px 0 28px" },
  sectionIntro: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: 16,
    marginBottom: 16,
  },
  eyebrow: {
    color: "#2aa9e0",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },
  sectionTitle: { margin: "8px 0 0", color: "#e2e8f0", fontSize: "1.7rem" },
  liveBadge: {
    border: "1px solid rgba(16, 185, 129, 0.4)",
    borderRadius: 999,
    color: "#6ee7b7",
    background: "rgba(16, 185, 129, 0.08)",
    padding: "8px 12px",
    fontSize: "0.78rem",
    fontWeight: 700,
  },
  workspaceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  workspaceIcon: {
    display: "grid",
    placeItems: "center",
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 9,
    background: "rgba(42, 169, 224, 0.12)",
    color: "#2aa9e0",
    fontWeight: 800,
  },
  workspaceCard: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    minHeight: 72,
    padding: 14,
    border: "1px solid #203047",
    borderRadius: 14,
    background: "#101a2b",
    color: "#e2e8f0",
  },
  workspaceArrow: { marginLeft: "auto", color: "#2aa9e0", fontWeight: 800 },
  workspaceCopy: { minWidth: 0, lineHeight: 1.25 },
  card: {
    maxWidth: "700px",
    margin: "0 auto",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 28px 80px rgba(15, 23, 42, 0.12)",
  },
  cardHeader: {
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    color: "white",
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "-0.025em",
  },
  subTitle: {
    margin: 0,
    color: "#c7d2fe",
    maxWidth: "720px",
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  heroWrapper: {
    width: "100%",
    aspectRatio: "16/7",
    minHeight: "360px",
    marginBottom: "28px",
    border: "1px solid #294767",
    borderRadius: "18px",
    overflow: "hidden",
    position: "relative",
    background: "#101a2b",
    boxShadow: "0 24px 70px rgba(0,0,0,0.38)",
  },
  heroSlide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "absolute",
    inset: 0,
  },
  heroImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    transform: "scale(1.02) translateZ(0)",
    willChange: "transform",
    imageRendering: "auto",
    filter: "contrast(1.08) saturate(0.82) brightness(0.7)",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(2,6,23,0.94) 0%, rgba(2,6,23,0.72) 38%, rgba(2,6,23,0.28) 76%, rgba(2,6,23,0.48) 100%), linear-gradient(180deg, rgba(2,6,23,0.05) 0%, rgba(2,6,23,0.42) 100%)",
    zIndex: 2,
  },
  heroContent: {
    position: "relative",
    zIndex: 3,
    background: "linear-gradient(90deg, rgba(2,6,23,0.72), rgba(2,6,23,0))",
    color: "white",
    padding: "42px 32px",
    maxWidth: "min(70%, 720px)",
    borderRadius: "12px",
    marginLeft: "6%",
  },
  heroEyebrow: {
    display: "block",
    marginBottom: 10,
    color: "#55d6f4",
    fontSize: "0.7rem",
    fontWeight: 800,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: 0,
    fontSize: "2.7rem",
    lineHeight: 1.08,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    textShadow: "0 4px 24px rgba(0,0,0,0.45)",
  },
  heroBody: {
    marginTop: 8,
    color: "rgba(255,255,255,0.95)",
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  carouselControls: {
    position: "absolute",
    bottom: 12,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    background: "#c7d2fe",
    border: "none",
    cursor: "pointer",
    opacity: 0.9,
  },
  carouselDotActive: {
    width: 28,
    height: 8,
    borderRadius: 999,
    background: "linear-gradient(90deg,#60a5fa,#2563eb)",
    border: "none",
    cursor: "pointer",
  },
  cardBody: {
    background: "white",
    padding: "30px 28px 34px",
    display: "grid",
    gap: "20px",
  },
  formGrid: { display: "grid", gap: "18px" },
  registerForm: { display: "grid", gap: "20px" },
  rowGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" },
  formGroup: { display: "grid", gap: "8px" },
  fieldGroup: { display: "grid", gap: "8px" },
  fieldGroupFullWidth: { display: "grid", gap: "8px" },
  label: { fontSize: "0.95rem", fontWeight: 600, color: "#111827" },
  input: {
    width: "100%",
    minHeight: "46px",
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#f8fafc",
    fontSize: "0.98rem",
    color: "#0f172a",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  inputError: { borderColor: "#ef4444", background: "#fff1f2" },
  errorText: { marginTop: "6px", color: "#b91c1c", fontSize: "0.9rem" },
  statusText: { marginTop: "6px", color: "#0f766e", fontSize: "0.9rem" },
  button: {
    border: "none",
    borderRadius: "14px",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "14px 20px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s ease, background 0.2s ease",
    boxShadow: "0 16px 28px rgba(37, 99, 235, 0.2)",
  },
  verificationRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "18px",
    alignItems: "flex-end",
  },
  inlineVerifyGroup: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
  },
  verifyInput: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  verifyButton: {
    minWidth: "130px",
    borderRadius: "0 14px 14px 0",
    border: "none",
    backgroundColor: "#0f172a",
    color: "white",
    padding: "0 16px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  sendCodeButton: {
    borderRadius: "14px",
    padding: "14px 18px",
    border: "1px solid #d1d5db",
    background: "white",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
  },
  passwordWrapper: { position: "relative", display: "grid" },
  visibilityToggle: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#475569",
    padding: 0,
    lineHeight: 1,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    cursor: "pointer",
    marginBottom: "14px",
  },
  sectionHint: {
    margin: 0,
    color: "#475569",
    fontSize: "0.93rem",
    lineHeight: 1.5,
  },
  sectionIndicator: {
    fontSize: "1.5rem",
    lineHeight: 1,
    color: "#0f172a",
    fontWeight: 700,
  },
  progressTrack: {
    width: "100%",
    height: "6px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
    marginBottom: "24px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #2563eb, #60a5fa)",
    transition: "width 280ms ease",
  },
  switchPrompt: {
    margin: 0,
    marginTop: "14px",
    color: "#475569",
    fontSize: "0.96rem",
  },
  linkButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    padding: 0,
    fontWeight: 700,
    textDecoration: "underline",
  },
};
