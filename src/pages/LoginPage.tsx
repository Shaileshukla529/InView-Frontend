'use client'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, RefreshCw, Scan, Shield, Clock, CheckCircle2, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const affirmations = [
  {
    text: "Redefining attendance with intelligent face recognition",
    subtext: "Advanced AI that understands your workforce"
  },
  {
    text: "Building trust through transparency and precision",
    subtext: "Every moment accounted for, every person valued"
  },
  {
    text: "Empowering organizations with real-time insights",
    subtext: "Transform time tracking into strategic advantage"
  },
  {
    text: "Seamless security meets effortless experience",
    subtext: "Enterprise-grade protection without complexity"
  },
  {
    text: "Your time is valuable. We make every second count",
    subtext: "Accurate tracking, meaningful analytics"
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: "", answer: 0 });
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ["+", "-", "×"];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer = 0;
    if (operation === "+") answer = num1 + num2;
    else if (operation === "-") answer = num1 - num2;
    else answer = num1 * num2;

    setCaptchaQuestion({
      question: `${num1} ${operation} ${num2}`,
      answer: answer,
    });
    setCaptchaValue("");
  };

  useEffect(() => {
    generateCaptcha();
    
    // Rotate affirmations every 5 seconds
    const interval = setInterval(() => {
      setCurrentAffirmation((prev) => (prev + 1) % affirmations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }

      if (parseInt(captchaValue) !== captchaQuestion.answer) {
        setError("Incorrect CAPTCHA answer. Please try again.");
        generateCaptcha();
        return;
      }

      await login({ email, password });
      navigate("/dashboard", { replace: true });
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || 
        "Login failed. Please check your credentials and try again."
      );
      generateCaptcha(); // Generate new captcha on error
    } finally {
      setEmail("");
      setPassword("");
      setCaptchaValue("");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-background order-2 lg:order-1 overflow-y-auto">
        <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl my-4 lg:my-0">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 font-bold font-serif text-4xl">Welcome Back</h2>
            <p className="text-muted-foreground font-serif font-medium">
              Sign in to access your attendance dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans sm:space-y-6">
            {/* Email Field */}
            <div className="space-y-2 ">
              <Label htmlFor="email" className="text-lg font-sans">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 sm:h-11"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password"  className="text-lg font-sans">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 sm:h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="space-y-2">
              <Label htmlFor="captcha"  className="text-lg font-sans">Security Check</Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 p-2.5 sm:p-3 bg-muted rounded-lg border">
                    <p className="text-base sm:text-lg font-mono select-none">
                      {captchaQuestion.question} = ?
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateCaptcha}
                      className="ml-auto h-7 w-7 p-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <Input
                    id="captcha"
                    type="number"
                    placeholder="Enter answer"
                    value={captchaValue}
                    onChange={(e) => setCaptchaValue(e.target.value)}
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 sm:h-11"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Additional Links */}
            <div className="text-center text-sm pt-2">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Forgot your password?
              </a>
            </div>
          </form>
        </Card>
      </div>

      {/* Right Panel - Branding & Affirmations */}
      <div className="lg:w-1/2 bg-linear-to-br font-serif from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden order-1 lg:order-2 min-h-[50vh] lg:min-h-0">
        {/* Background Pattern with Animation */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 sm:mb-12 lg:mb-16">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border border-white/20">
              <Scan className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-5xl font-serif ">InView</h1>
              <p className="text-xs sm:text-lg text-slate-300">Face Attendance System</p>
            </div>
          </div>

          {/* Affirmation */}
          <div className="mb-8 sm:mb-12 hidden sm:block">
            <div className="relative min-h-[140px] sm:min-h-[180px]">
              {affirmations.map((affirmation, index) => {
                const isActive = index === currentAffirmation;
                const isPrevious = index === (currentAffirmation - 1 + affirmations.length) % affirmations.length;
                
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all ease-in-out ${
                      isActive
                        ? "opacity-100 translate-y-0 duration-700 delay-300"
                        : isPrevious
                        ? "opacity-0 -translate-y-8 duration-500"
                        : "opacity-0 translate-y-8 duration-0"
                    }`}
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <div className="inline-block p-1.5 sm:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl leading-tight">
                        {affirmation.text}
                      </h2>
                      <p className="text-slate-300 text-base sm:text-lg">
                        {affirmation.subtext}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-2.5 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all hover:bg-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg shrink-0">
              <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-lg mb-0.5 truncate">AI-Powered Face Recognition</h4>
              <p className="text-s text-slate-400 hidden sm:block">99.9% accuracy with advanced biometric technology</p>
            </div>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-green-400" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all hover:bg-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-lg mb-0.5 truncate">Enterprise-Grade Security</h4>
              <p className="text-s text-slate-400 hidden sm:block">Bank-level encryption and privacy protection</p>
            </div>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-green-400" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all hover:bg-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1  min-w-0">
              <h4 className="text-md sm:text-lg mb-0.5 truncate">Real-Time Analytics</h4>
              <p className="text-s text-slate-400 hidden sm:block">Instant insights and automated reporting</p>
            </div>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
