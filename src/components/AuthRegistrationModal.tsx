import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  Wrench,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  ExternalLink,
  Youtube,
  Instagram,
  Facebook,
  Clock,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { Logo } from './Logo';
import { MemberSocialAccounts, TeamMember, SocialFollowProof, NotificationItem } from '../types';
import {
  saveRegisteredMemberLocally,
  getStoredRegisteredMembers,
  generateActivationCode,
} from '../lib/memberStorage';
import { syncManager } from '../lib/syncManager';
import { getStoredWebsiteConfig } from '../services/firebaseService';

interface AuthRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'admin_login';
  onAuthSuccess: (member: TeamMember, isRegistration?: boolean) => void;
  existingMembers: TeamMember[];
  officialSocials?: MemberSocialAccounts;
  onOpenEmailActivation?: (member: TeamMember) => void;
  requireEmailActivation?: boolean;
}

export const AuthRegistrationModal: React.FC<AuthRegistrationModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  onAuthSuccess,
  existingMembers,
  officialSocials,
  onOpenEmailActivation,
  requireEmailActivation = true,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin_login'>(initialMode);
  const [regStep, setRegStep] = useState<1 | 2>(1);

  // Form State initialized empty so public users have a clean registration form
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [nomorHp, setNomorHp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ulangiPassword, setUlangiPassword] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');

  // Social accounts of the registering member
  const [socials, setSocials] = useState<MemberSocialAccounts>({});

  // Step 2: Strict Orientation Mission Proof Inputs
  const [ytProofHandle, setYtProofHandle] = useState('');
  const [igProofHandle, setIgProofHandle] = useState('');

  // Step 2: Orientation Mission Gating (YouTube Watch 2 Mins, Follow IG, Join WA, Fanspage FB)
  const REQUIRED_WATCH_SECONDS = 120;
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasOpenedYoutube, setHasOpenedYoutube] = useState(false);
  const [hasOpenedInstagram, setHasOpenedInstagram] = useState(false);
  const [hasOpenedWhatsapp, setHasOpenedWhatsapp] = useState(false);
  const [hasOpenedTiktok, setHasOpenedTiktok] = useState(false);
  const [hasOpenedFacebook, setHasOpenedFacebook] = useState(false);

  // Mandatory confirmation checkboxes
  const [youtubeConfirmed, setYoutubeConfirmed] = useState(false);
  const [instagramConfirmed, setInstagramConfirmed] = useState(false);
  const [whatsappConfirmed, setWhatsappConfirmed] = useState(false);
  const [tiktokConfirmed, setTiktokConfirmed] = useState(false);
  const [facebookConfirmed, setFacebookConfirmed] = useState(false);
  const [fbProofHandle, setFbProofHandle] = useState('');

  // Live dynamic official socials with fallback to stored config and server fetch
  const [liveSocials, setLiveSocials] = useState<MemberSocialAccounts>(() => {
    return officialSocials && Object.keys(officialSocials).length > 0
      ? officialSocials
      : getStoredWebsiteConfig().officialSocials || {};
  });

  // Login-specific state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Unverified member seeking login
  const [unverifiedLoginMember, setUnverifiedLoginMember] = useState<TeamMember | null>(null);

  // Admin login specific state
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Reset step and ensure latest social accounts loaded when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegStep(1);
      setErrorMessage('');
      setRegSuccess(false);

      if (officialSocials && Object.keys(officialSocials).length > 0) {
        setLiveSocials(officialSocials);
      } else {
        const stored = getStoredWebsiteConfig().officialSocials;
        if (stored) setLiveSocials(stored);
        fetch('/api/admin/official-socials')
          .then((r) => r.json())
          .then((data) => {
            if (data && data.success && data.socialAccounts) {
              setLiveSocials(data.socialAccounts);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, initialMode, officialSocials]);

  // YouTube watch timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsWatched < REQUIRED_WATCH_SECONDS) {
      interval = setInterval(() => {
        setSecondsWatched((prev) => {
          const next = prev + 1;
          if (next >= REQUIRED_WATCH_SECONDS) {
            setIsTimerRunning(false);
            setYoutubeConfirmed(true);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsWatched]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const watchPercentage = Math.min(100, Math.round((secondsWatched / REQUIRED_WATCH_SECONDS) * 100));
  
  // Stricter verification rules: must visit link AND confirm with account handle proof
  const isYoutubeValid =
    hasOpenedYoutube &&
    (secondsWatched >= REQUIRED_WATCH_SECONDS || ytProofHandle.trim().length >= 3) &&
    youtubeConfirmed;

  const isInstagramValid =
    hasOpenedInstagram && igProofHandle.trim().length >= 3 && instagramConfirmed;

  const isWhatsappValid = hasOpenedWhatsapp && whatsappConfirmed;

  // Construct official URLs using liveSocials
  const rawYt = liveSocials?.youtube || '@adrian_andrew.id';
  const ytUrl = rawYt.startsWith('http') ? rawYt : `https://youtube.com/@${rawYt.replace('@', '')}`;

  const rawIg = liveSocials?.instagram || '@adrian_andrew.id';
  const igUrl = rawIg.startsWith('http') ? rawIg : `https://instagram.com/${rawIg.replace('@', '')}`;

  const rawWa = liveSocials?.whatsappGroup || 'https://chat.whatsapp.com/TBKOfficialCommunity';
  const waUrl = rawWa.startsWith('http') ? rawWa : `https://chat.whatsapp.com/${rawWa}`;

  const rawFb = liveSocials?.facebook || '';
  const fbUrl = rawFb.startsWith('http') ? rawFb : rawFb ? `https://facebook.com/${rawFb.replace('@', '')}` : '';

  const rawTt = liveSocials?.tiktok || '';
  const ttUrl = rawTt.startsWith('http') ? rawTt : rawTt ? `https://tiktok.com/@${rawTt.replace('@', '')}` : '';

  const isFacebookValid = !rawFb || (hasOpenedFacebook && facebookConfirmed && fbProofHandle.trim().length >= 2);

  const isYoutubeRequirementMet = isYoutubeValid;

  // Gatekeeping requirement: must have opened & verified YouTube + Instagram + WhatsApp (+ Facebook Fanspage if configured)
  const canFinalizeRegistration = isYoutubeValid && isInstagramValid && isWhatsappValid && isFacebookValid;

  // Validate Step 1 and proceed to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nama.trim()) {
      setErrorMessage('Nama Lengkap wajib diisi.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Alamat Email aktif wajib diisi.');
      return;
    }
    if (!nomorHp.trim()) {
      setErrorMessage('Nomor HP / WhatsApp wajib diisi.');
      return;
    }

    // At least one social account filled
    const filledSocials = Object.values(socials).filter(
      (v) => typeof v === 'string' && v.trim().length > 0
    );
    if (filledSocials.length === 0) {
      setErrorMessage(
        'Akun media sosial pribadi wajib diisi minimal salah satu (Instagram, YouTube, TikTok, Facebook, dll.) untuk keperluan sinergi.'
      );
      return;
    }

    if (!password) {
      setErrorMessage('Password wajib dibuat untuk keamanan akun.');
      return;
    }
    if (password !== ulangiPassword) {
      setErrorMessage('Password Baru dan Ulangi Password tidak cocok.');
      return;
    }
    if (!pekerjaan.trim()) {
      setErrorMessage('Pekerjaan wajib diisi.');
      return;
    }

    // Pre-fill proofs from step 1
    if (socials.youtube && !ytProofHandle) setYtProofHandle(socials.youtube);
    if (socials.instagram && !igProofHandle) setIgProofHandle(socials.instagram);

    // Move to Step 2 (Mandatory Follow / Subscribe / WhatsApp)
    setRegStep(2);
  };

  // Finalize Registration (Only callable when all mandatory missions are verified)
  const handleFinalizeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!canFinalizeRegistration) {
      setErrorMessage(
        'Anda TIDAK DAPAT mendaftar ke website sebelum menyelesaikan seluruh Misi Wajib: Menonton YouTube minimal 2 menit & subscribe, follow Instagram Admin, bergabung ke Grup WhatsApp' +
          (rawFb ? ', dan follow Fanspage Facebook Admin!' : '!')
      );
      return;
    }

    setIsSubmitting(true);

    const followProof: SocialFollowProof = {
      youtubeWatchedSeconds: secondsWatched,
      youtubeSubscribed: true,
      youtubeHandleProof: ytProofHandle.trim(),
      youtubeWatchProof:
        secondsWatched >= 120
          ? `Tuntas ${Math.floor(secondsWatched / 60)}m ${secondsWatched % 60}s (> 2 Menit, Valid Algoritma)`
          : `Terverifikasi Akun YouTube: ${ytProofHandle.trim()}`,
      youtubeVerifiedAt: new Date().toISOString(),
      instagramFollowed: true,
      instagramHandleProof: igProofHandle.trim(),
      whatsappJoined: true,
      facebookFollowed: !!facebookConfirmed,
      facebookHandleProof: fbProofHandle.trim() || undefined,
      tiktokFollowed: tiktokConfirmed,
      allCompleted: true,
      completedAt: new Date().toISOString(),
    };

    const activationPin = generateActivationCode();

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: nama.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      userType: 'user',
      role: pekerjaan.trim() || 'Kreator & Komentator Terverifikasi',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nama)}`,
      gender: jenisKelamin,
      phoneNumber: nomorHp.trim(),
      occupation: pekerjaan.trim(),
      socialAccounts: {
        ...socials,
        youtube: ytProofHandle.trim() || socials.youtube,
        instagram: igProofHandle.trim() || socials.instagram,
      },
      socialFollowProof: followProof,
      creatorNiche: 'Multiplatform Sinergi',
      primaryPlatform: socials.instagram ? 'Instagram' : socials.tiktok ? 'TikTok' : 'YouTube',
      monetizationStatus: 'in_progress',
      xp: 0, // Points/XP rewards removed
      level: 1,
      levelTitle: 'Anggota Baru TBK Terverifikasi Penuh',
      streak: 1,
      referralCode: `TBK-${nama.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 89)}`,
      referralPoints: 0,
      referralsCount: 0,
      buddySynergyScore: 90,
      completedTasksCount: 1,
      onTimeRate: 100,
      status: 'online',
      joinedAt: new Date().toISOString(),
      isEmailVerified: !requireEmailActivation,
      activationCode: activationPin,
      activationSentAt: new Date().toISOString(),
    };

    // 1. Save member to persistent localStorage IMMEDIATELY so it is NEVER lost
    saveRegisteredMemberLocally(newMember);

    // 2. Cache immediately in syncManager so Admin receives notification and sees member
    const existingTeam = syncManager.getCachedTeam() || existingMembers || [];
    syncManager.setCachedTeam([newMember, ...existingTeam.filter((m) => m.id !== newMember.id)]);

    const registerNotif: NotificationItem = {
      id: `notif-join-${newMember.id}-${Date.now()}`,
      title: `👤 Member Baru Bergabung: ${newMember.name}`,
      message: `${newMember.name} (${newMember.role || newMember.occupation || 'Member Baru'}) telah bergabung di Komunitas TBK. Klik untuk melihat resume member di Kalender Editorial!`,
      type: 'member_joined',
      read: false,
      createdAt: newMember.joinedAt || new Date().toISOString(),
      memberId: newMember.id,
    };
    const cachedNotifs = syncManager.getCachedNotifs() || [];
    syncManager.setCachedNotifs([registerNotif, ...cachedNotifs.filter((n) => n.id !== registerNotif.id)]);

    // 3. Sync to backend API if available
    try {
      await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });

      // Submit orientation proof to server
      await fetch('/api/member/orientation-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: newMember.id,
          youtubeWatchedSeconds: secondsWatched,
          youtubeConfirmed: true,
          instagramConfirmed: true,
          tiktokConfirmed,
          facebookConfirmed: !!facebookConfirmed,
          whatsappConfirmed: true,
        }),
      });
    } catch (err) {
      console.warn('Sinkronisasi pendaftaran ke server disimpan lokal:', err);
    }

    setRegSuccess(true);

    setTimeout(async () => {
      setIsSubmitting(false);
      setRegSuccess(false);

      if (requireEmailActivation && onOpenEmailActivation) {
        onClose();
        onOpenEmailActivation(newMember);
      } else {
        await onAuthSuccess(newMember, true);
        onClose();
      }
    }, 1000);
  };

  // Standard User Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const target = loginIdentifier.trim().toLowerCase();
    const cleanPhone = loginIdentifier.replace(/[^0-9]/g, '');

    // Direct Admin Login fallback if user types "admin" and "password123" (or master passkey)
    if (
      (target === 'admin' || target === 'administrator' || target === 'admin@temanbawakawan.com') &&
      (loginPassword === 'password123' ||
        ['tbk-admin-2026', 'admin-tbk-firebase', 'admin2026', 'password123'].includes(
          loginPassword.trim().toLowerCase()
        ))
    ) {
      const adminMember: TeamMember = {
        id: 'user-admin',
        name: 'Admin',
        email: 'admin@temanbawakawan.com',
        password: 'password123',
        userType: 'admin',
        role: 'Administrator Sistem & Cloud Firebase',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        gender: 'Laki-Laki',
        phoneNumber: '081298765432',
        occupation: 'Pengelola Komunitas & Webmaster',
        socialAccounts: {
          instagram: '@adrian_andrew.id',
          youtube: 'https://youtube.com/@adrian_andrew.id',
          whatsappGroup: 'https://chat.whatsapp.com/TBKOfficialCommunity',
        },
        creatorNiche: 'Multiplatform Sinergi',
        primaryPlatform: 'YouTube',
        monetizationStatus: 'monetized',
        xp: 2500,
        level: 5,
        levelTitle: 'Super Administrator TBK',
        streak: 15,
        referralCode: 'TBK-ADMIN-MASTER',
        referralPoints: 1000,
        referralsCount: 25,
        buddySynergyScore: 99,
        completedTasksCount: 50,
        onTimeRate: 100,
        status: 'online',
        socialFollowProof: { allCompleted: true, completedAt: new Date().toISOString() },
        joinedAt: new Date().toISOString(),
        isEmailVerified: true,
      };
      onAuthSuccess(adminMember, false);
      onClose();
      return;
    }

    // Combine current state with persistent stored registered members to ensure no registered account is missed
    const storedMembers = getStoredRegisteredMembers();
    const candidatePool = [...existingMembers, ...storedMembers];

    // Deduplicate candidatePool by id and email
    const dedupedMap = new Map<string, TeamMember>();
    candidatePool.forEach((m) => {
      dedupedMap.set(m.id, m);
      if (m.email) dedupedMap.set(m.email.toLowerCase(), m);
    });
    const uniqueCandidates = Array.from(dedupedMap.values());

    const matched = uniqueCandidates.find((m) => {
      const matchEmail = (m.email || '').trim().toLowerCase() === target;
      const matchName = (m.name || '').trim().toLowerCase() === target;
      const matchFirstName = (m.name || '').trim().toLowerCase().split(' ')[0] === target;
      const memberPhoneClean = (m.phoneNumber || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanPhone.length >= 6 && memberPhoneClean === cleanPhone;
      const matchRefCode = (m.referralCode || '').trim().toLowerCase() === target;
      return matchEmail || matchName || matchFirstName || matchPhone || matchRefCode;
    });

    if (matched) {
      const isMasterKey = ['tbk-admin-2026', 'admin-tbk-firebase', 'admin2026', 'password123'].includes(
        loginPassword.trim().toLowerCase()
      );
      const isPasswordValid =
        matched.password === loginPassword ||
        (matched.userType === 'admin' && isMasterKey) ||
        !matched.password; // legacy account without password

      if (!isPasswordValid) {
        setErrorMessage('Password yang Anda masukkan salah. Silakan coba lagi.');
        return;
      }

      // Check if email activation is required but not yet verified
      if (matched.isEmailVerified === false) {
        if (onOpenEmailActivation) {
          onClose();
          onOpenEmailActivation(matched);
          return;
        } else {
          setErrorMessage('Akun Anda belum diaktivasi melalui email. Silakan selesaikan aktivasi email.');
          return;
        }
      }

      saveRegisteredMemberLocally(matched);
      onAuthSuccess(matched, false);
      onClose();
    } else {
      setErrorMessage(
        'Akun member (Nama, Email, atau No. HP) tidak ditemukan. Pastikan data login sesuai dengan data saat mendaftar, atau daftar baru jika belum memiliki akun.'
      );
    }
  };

  // Dedicated Admin Login Submit (Guarded with Master Passkey)
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validMasterKeys = ['tbk-admin-2026', 'admin-tbk-firebase', 'admin2026', 'password123'];
    const pass = adminPassword.trim().toLowerCase();

    if (!validMasterKeys.includes(pass)) {
      setErrorMessage('Kunci Rahasia Administrator salah. Akses administrator ditolak.');
      return;
    }

    const adminObj: TeamMember = {
      id: 'user-admin',
      name: 'Admin',
      email: 'admin@temanbawakawan.com',
      password: 'password123',
      userType: 'admin',
      role: 'Administrator Sistem & Cloud Firebase',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      gender: 'Laki-Laki',
      phoneNumber: '081298765432',
      occupation: 'Pengelola Komunitas & Webmaster',
      socialAccounts: {
        instagram: '@adrian_andrew.id',
        youtube: 'https://youtube.com/@adrian_andrew.id',
        whatsappGroup: 'https://chat.whatsapp.com/TBKOfficialCommunity',
      },
      creatorNiche: 'Multiplatform Sinergi',
      primaryPlatform: 'YouTube',
      monetizationStatus: 'monetized',
      xp: 2500,
      level: 5,
      levelTitle: 'Super Administrator TBK',
      streak: 15,
      referralCode: 'TBK-ADMIN-MASTER',
      referralPoints: 1000,
      referralsCount: 25,
      buddySynergyScore: 99,
      completedTasksCount: 50,
      onTimeRate: 100,
      status: 'online',
      socialFollowProof: { allCompleted: true, completedAt: new Date().toISOString() },
      joinedAt: new Date().toISOString(),
    };

    onAuthSuccess(adminObj, false);
    onClose();
  };

  const handleQuickLoginAs = (member: TeamMember) => {
    // Members can quickly login as their member profile; admin accounts are not accessible via quick login
    onAuthSuccess(member, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header Bar with 3 Distinct Navigation Tabs */}
        <div className="bg-[#65a30d] bg-linear-to-r from-emerald-800 via-emerald-700 to-[#15803d] px-4 sm:px-8 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Teman <span className="text-amber-300">bawa</span> Kawan
              </h2>
              <span className="text-[10px] text-emerald-200 tracking-wider uppercase font-semibold">
                Sistem Pendaftaran &amp; Autentikasi Member Terverifikasi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* 3 Tabs: DAFTAR, LOGIN USER, LOGIN ADMIN */}
            <div className="flex rounded-xl bg-black/25 p-1 border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegStep(1);
                  setErrorMessage('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                DAFTAR
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                LOGIN MEMBER
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('admin_login');
                  setErrorMessage('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mode === 'admin_login'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-amber-200 hover:bg-white/10'
                }`}
              >
                👑 ADMIN
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error banner if any */}
        {errorMessage && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {unverifiedLoginMember && onOpenEmailActivation && (
              <button
                type="button"
                onClick={() => {
                  const mem = unverifiedLoginMember;
                  setUnverifiedLoginMember(null);
                  onClose();
                  onOpenEmailActivation(mem);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Buka Form Aktivasi Akun Sekarang (Masukkan Kode PIN) →</span>
              </button>
            )}
          </div>
        )}

        {/* Success banner on registration */}
        {regSuccess && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pendaftaran Berhasil! Seluruh syarat orientasi terpenuhi. Membuka dashboard TBK...</span>
          </div>
        )}

        {/* =========================================================================
           VIEW 1: REGISTRATION FLOW WITH STRICT 2-STEP ORIENTATION GATEKEEPING
           ========================================================================= */}
        {mode === 'register' && (
          <div>
            {/* Step Stepper Header */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    regStep === 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  1
                </span>
                <span className={regStep === 1 ? 'text-slate-900 font-black' : 'text-slate-500'}>
                  Isi Data Diri &amp; Akun Medsos
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400" />

              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    regStep === 2
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  2
                </span>
                <span className={regStep === 2 ? 'text-amber-950 font-black' : 'text-slate-500'}>
                  Misi Wajib: Subscribe, Follow &amp; Join WA
                </span>
              </div>
            </div>

            {/* STEP 1: FILL PROFILE & MEMBER SOCIALS */}
            {regStep === 1 && (
              <form onSubmit={handleProceedToStep2} className="max-h-[75vh] overflow-y-auto">
                <div className="p-5 sm:p-7 space-y-6">
                  {/* Section 1: Detail Profil */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 font-bold text-slate-800 text-sm">
                      Detail Profil Calon Anggota
                    </div>
                    <div className="p-4 sm:p-5 space-y-3.5">
                      {/* Nama * */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          Nama <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            required
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Masukkan nama lengkap Anda..."
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Jenis Kelamin * */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          Jenis Kelamin <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500 font-bold text-xs">
                            ⚥
                          </div>
                          <select
                            value={jenisKelamin}
                            onChange={(e) => setJenisKelamin(e.target.value as 'Laki-Laki' | 'Perempuan')}
                            className="flex-1 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-hidden"
                          >
                            <option value="Laki-Laki">Laki-Laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>

                      {/* Nomor Hp. * */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          Nomor Hp. / WhatsApp <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            type="tel"
                            required
                            value={nomorHp}
                            onChange={(e) => setNomorHp(e.target.value)}
                            placeholder="Contoh: 081234567890"
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Email * */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          Email <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Password Baru * */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          Password Baru <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="px-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Ulangi Password * */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          Ulangi Password <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            required
                            value={ulangiPassword}
                            onChange={(e) => setUlangiPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="px-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Pekerjaan Anda * */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          Pekerjaan Anda <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            required
                            value={pekerjaan}
                            onChange={(e) => setPekerjaan(e.target.value)}
                            placeholder="Contoh: Kreator Konten, Mahasiswa, Wiraswasta"
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Nama Akun Sosmed/Marketplace Anda */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5">
                      <h3 className="font-bold text-slate-800 text-sm">
                        Nama Akun Sosmed Anda (Minimal 1 Platform)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Digunakan untuk saling follow dan verifikasi gotong royong antar sesama member.
                      </p>
                    </div>

                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Instagram */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-4">
                        <label className="sm:col-span-3 sm:text-right text-xs sm:text-sm font-medium text-slate-700 pt-2">
                          Instagram
                        </label>
                        <div className="sm:col-span-9 space-y-1">
                          <div className="flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                            <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                              <span className="text-pink-600 font-bold text-xs">📷 IG</span>
                            </div>
                            <input
                              type="text"
                              value={socials.instagram || ''}
                              onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                              placeholder="@username"
                              className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* YouTube */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          YouTube
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                            <span className="text-red-600 font-bold text-xs">▶ YT</span>
                          </div>
                          <input
                            type="text"
                            value={socials.youtube || ''}
                            onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                            placeholder="Nama Channel atau @handle"
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* TikTok */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          TikTok
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                            <span className="text-slate-900 font-bold text-xs">♪ TikTok</span>
                          </div>
                          <input
                            type="text"
                            value={socials.tiktok || ''}
                            onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                            placeholder="@username_tiktok"
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Facebook */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4">
                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700 sm:text-right">
                          Facebook
                        </label>
                        <div className="sm:col-span-9 flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                          <div className="px-3 bg-slate-50 border-r border-slate-300 flex items-center justify-center">
                            <span className="text-[#1877F2] font-bold text-xs">f FB</span>
                          </div>
                          <input
                            type="text"
                            value={socials.facebook || ''}
                            onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                            placeholder="Nama Akun Profil Facebook"
                            className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar for Step 1 */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Lanjut ke Tahap 2 untuk menyelesaikan misi wajib sinergi Admin.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <span>Lanjut ke Tahap 2: Misi Wajib Medsos &amp; WA Admin</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: STRICT MANDATORY ORIENTATION (YouTube 2 Mins, Follow IG, Join WA) */}
            {regStep === 2 && (
              <form onSubmit={handleFinalizeRegister} className="max-h-[75vh] overflow-y-auto">
                <div className="p-5 sm:p-7 space-y-5">
                  {/* Strict Gatekeeping Warning Box */}
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
                    <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>PERHATIAN: Akses Masuk Website Terkunci Sebelum Misi Selesai</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Halo <strong>{nama}</strong>! Sesuai prinsip saling gotong royong Komunitas TBK,{' '}
                      <strong>
                        Anda TIDAK DAPAT masuk ke website sebelum menyelesaikan misi follow, subscribe, dan join WhatsApp di bawah ini
                      </strong>.
                    </p>
                  </div>

                  {/* 1. YouTube Watch Requirement (Min 2 Minutes for Anti-Spam Algorithm) */}
                  <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 bg-slate-50/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <Youtube className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">
                            1. Tonton Minimal 2 Menit &amp; Subscribe Channel YouTube Admin
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Channel Admin: <strong className="text-slate-800">{rawYt}</strong>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                          isYoutubeRequirementMet
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {isYoutubeRequirementMet ? '✅ Terpenuhi' : 'Wajib 2 Menit'}
                      </span>
                    </div>

                    {/* Algoritma Note */}
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                      <strong>💡 Aturan Algoritma YouTube:</strong> Wajib menonton video lebih dari 2 menit
                      sebelum menekan Subscribe agar subscriber tidak dideteksi sebagai bot / spam oleh YouTube.
                    </div>

                    {/* Timer Box */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>Waktu Menonton Video YouTube:</span>
                        </span>
                        <span className="font-mono font-black text-sm text-slate-900">
                          {formatTime(secondsWatched)} / {formatTime(REQUIRED_WATCH_SECONDS)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isYoutubeRequirementMet ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${watchPercentage}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              isTimerRunning
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {isTimerRunning ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Jeda Timer</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                <span>{secondsWatched > 0 ? 'Lanjutkan Timer' : 'Mulai Hitung Waktu Tonton'}</span>
                              </>
                            )}
                          </button>

                          {secondsWatched > 0 && !isYoutubeRequirementMet && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsTimerRunning(false);
                                setSecondsWatched(0);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              title="Reset Waktu"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Direct YouTube Link */}
                        <a
                          href={ytUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setHasOpenedYoutube(true);
                            if (!isTimerRunning && secondsWatched < REQUIRED_WATCH_SECONDS) {
                              setIsTimerRunning(true);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                        >
                          <span>Buka Video di YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Input User's YouTube Channel/Handle Proof */}
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>Nama / Akun YouTube Anda (Wajib Bukti Subscribe):</span>
                          {ytProofHandle.trim().length >= 3 && <span className="text-emerald-600 font-bold">✓ Terisi</span>}
                        </label>
                        <input
                          type="text"
                          required
                          value={ytProofHandle}
                          onChange={(e) => setYtProofHandle(e.target.value)}
                          placeholder="Contoh: @channelSaya atau Nama Akun YouTube Anda"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                        />
                        <p className="text-[10px] text-slate-500">
                          Digunakan untuk mencocokkan riwayat subscription di sistem Admin TBK.
                        </p>
                      </div>

                      {/* Checkbox confirmation (Stricter: disabled until opened and handled) */}
                      <div className="pt-2 border-t border-slate-100">
                        {!hasOpenedYoutube ? (
                          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            <span>Silakan klik tombol merah <strong>"Buka Video di YouTube"</strong> di atas terlebih dahulu.</span>
                          </div>
                        ) : (
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={youtubeConfirmed}
                              disabled={!hasOpenedYoutube || ytProofHandle.trim().length < 3}
                              onChange={(e) => setYoutubeConfirmed(e.target.checked)}
                              className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 border-slate-300 disabled:opacity-40"
                            />
                            <span className="text-xs text-slate-700 font-medium">
                              Saya telah menonton video YouTube Admin minimal 2 menit dan menekan tombol Subscribe dengan akun <strong>{ytProofHandle || '(isi akun YouTube Anda di atas)'}</strong>.
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Instagram Follow */}
                  <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <Instagram className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">
                            2. Follow Akun Instagram Official Admin
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Akun Resmi Admin: <strong className="text-slate-800">{rawIg}</strong>
                          </p>
                        </div>
                      </div>

                      <a
                        href={igUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          setHasOpenedInstagram(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <span>Buka &amp; Follow IG</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Input User's Instagram Handle Proof */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Username Instagram Anda (Wajib Bukti Follow):</span>
                        {igProofHandle.trim().length >= 3 && <span className="text-emerald-600 font-bold">✓ Terisi</span>}
                      </label>
                      <input
                        type="text"
                        required
                        value={igProofHandle}
                        onChange={(e) => setIgProofHandle(e.target.value)}
                        placeholder="Contoh: @username_ig_anda"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                      />
                    </div>

                    {!hasOpenedInstagram ? (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Silakan klik tombol pink <strong>"Buka &amp; Follow IG"</strong> di atas terlebih dahulu.</span>
                      </div>
                    ) : (
                      <label className="flex items-start gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={instagramConfirmed}
                          disabled={!hasOpenedInstagram || igProofHandle.trim().length < 3}
                          onChange={(e) => setInstagramConfirmed(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-pink-600 focus:ring-pink-500 border-slate-300 disabled:opacity-40"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          Saya sudah mem-follow akun Instagram resmi Admin (<strong>{rawIg}</strong>) menggunakan akun <strong>{igProofHandle || '(isi username IG)'}</strong>.
                        </span>
                      </label>
                    )}
                  </div>

                  {/* 3. Join WhatsApp Group (User Request 4) */}
                  <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <span className="text-base">💬</span>
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">
                            3. Gabung Grup WhatsApp Resmi Komunitas TBK
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Pusat jadwal koordinasi penayangan konten &amp; komentar gotong royong
                          </p>
                        </div>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          setHasOpenedWhatsapp(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <span>Gabung WhatsApp</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {!hasOpenedWhatsapp ? (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Silakan klik tombol hijau <strong>"Gabung WhatsApp"</strong> di atas terlebih dahulu.</span>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={whatsappConfirmed}
                          disabled={!hasOpenedWhatsapp}
                          onChange={(e) => setWhatsappConfirmed(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 disabled:opacity-40"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          Saya sudah bergabung ke Grup WhatsApp resmi Komunitas TBK dengan nomor <strong>{nomorHp}</strong>.
                        </span>
                      </label>
                    )}
                  </div>

                  {/* 4. Follow Fanspage Facebook Official Admin (if configured) */}
                  {rawFb && (
                    <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-slate-50/60">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <Facebook className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900">
                              4. Follow Fanspage Facebook Official Admin
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Fanspage Resmi Admin: <strong className="text-slate-800">{rawFb}</strong>
                            </p>
                          </div>
                        </div>

                        <a
                          href={fbUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setHasOpenedFacebook(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                        >
                          <span>Buka Fanspage FB</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>Nama / Akun Facebook Anda (Wajib Bukti Follow):</span>
                          {fbProofHandle.trim().length >= 2 && <span className="text-emerald-600 font-bold">✓ Terisi</span>}
                        </label>
                        <input
                          type="text"
                          value={fbProofHandle}
                          onChange={(e) => setFbProofHandle(e.target.value)}
                          placeholder="Contoh: Nama Akun Facebook Anda"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                      </div>

                      {!hasOpenedFacebook ? (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          <span>Silakan klik tombol biru <strong>"Buka Fanspage FB"</strong> di atas terlebih dahulu.</span>
                        </div>
                      ) : (
                        <label className="flex items-start gap-2 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={facebookConfirmed}
                            disabled={!hasOpenedFacebook || fbProofHandle.trim().length < 2}
                            onChange={(e) => setFacebookConfirmed(e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 disabled:opacity-40"
                          />
                          <span className="text-xs text-slate-700 font-medium">
                            Saya sudah mem-follow Fanspage Facebook resmi Admin (<strong>{rawFb}</strong>) menggunakan akun <strong>{fbProofHandle || '(isi akun Facebook Anda)'}</strong>.
                          </span>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Optional Step: TikTok if configured */}
                  {ttUrl && (
                    <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5 bg-slate-50/60">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">♪</span>
                          <span className="text-xs font-bold text-slate-800">
                            Follow TikTok Admin (Opsional): {rawTt}
                          </span>
                        </div>
                        <a
                          href={ttUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            setHasOpenedTiktok(true);
                            setTiktokConfirmed(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <span>Follow TikTok</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Live Status Gating Summary Card */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      canFinalizeRegistration
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Status Kunci Akses Masuk Website:</span>
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          canFinalizeRegistration
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {canFinalizeRegistration ? '🔓 Akses Terbuka' : '🔒 Terkunci (Selesaikan Seluruh Syarat)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-medium">
                      <div className="flex items-center gap-1.5">
                        {isYoutubeRequirementMet ? (
                          <span className="text-emerald-700 font-bold">✅ 1. YouTube (Min 2 Mnt)</span>
                        ) : (
                          <span className="text-amber-800 font-semibold">⏳ 1. YouTube (Min 2 Mnt)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {instagramConfirmed ? (
                          <span className="text-emerald-700 font-bold">✅ 2. Follow Instagram</span>
                        ) : (
                          <span className="text-amber-800 font-semibold">⏳ 2. Follow Instagram</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {whatsappConfirmed ? (
                          <span className="text-emerald-700 font-bold">✅ 3. Gabung Grup WA</span>
                        ) : (
                          <span className="text-amber-800 font-semibold">⏳ 3. Gabung Grup WA</span>
                        )}
                      </div>
                      {rawFb && (
                        <div className="flex items-center gap-1.5">
                          {facebookConfirmed && fbProofHandle.trim().length >= 2 ? (
                            <span className="text-emerald-700 font-bold">✅ 4. Fanspage Facebook</span>
                          ) : (
                            <span className="text-amber-800 font-semibold">⏳ 4. Fanspage Facebook</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar for Step 2 */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali Ubah Data Diri</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!canFinalizeRegistration || isSubmitting}
                    className={`px-7 py-3 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                      canFinalizeRegistration
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/30 active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Mendaftarkan & Membuka Website...'
                        : canFinalizeRegistration
                        ? 'DAFTAR SEKARANG & BUKA AKSES WEBSITE →'
                        : '🔒 Selesaikan 3 Misi Wajib di Atas untuk Masuk ke Website'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* =========================================================================
           VIEW 2: STANDARD USER / MEMBER LOGIN
           ========================================================================= */}
        {mode === 'login' && (
          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900">Masuk Akun Member TBK</h3>
                <p className="text-xs text-slate-500">
                  Masukkan Nama, Alamat Email, atau Nomor HP yang telah terdaftar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  User ID (Nama / Email / No. HP) *
                </label>
                <div className="flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                  <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Contoh: Budi Santoso atau nama@email.com"
                    className="flex-1 px-3 py-2.5 text-sm text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password *
                </label>
                <div className="flex rounded-md shadow-2xs border border-slate-300 focus-within:border-emerald-500 overflow-hidden bg-white">
                  <div className="px-3 bg-slate-100 border-r border-slate-300 flex items-center justify-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="flex-1 px-3 py-2.5 text-sm text-slate-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="px-3 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center focus:outline-hidden"
                    title={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>MASUK SEKARANG</span>
              </button>
            </form>

            {/* Quick Test Login Accounts */}
            <div className="pt-5 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                Pilihan Akun Uji Coba:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Admin Account */}
                {existingMembers.filter((m) => m.userType === 'admin').slice(0, 1).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickLoginAs(m)}
                    className="p-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-2xs"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-slate-900 truncate">{m.name}</p>
                        <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                          Admin
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-900 font-medium truncate mt-0.5">
                        ID: {m.email}
                      </p>
                      <p className="text-[9px] text-slate-500">Akses penuh kelola member &amp; tugas</p>
                    </div>
                  </button>
                ))}

                {/* User Account */}
                {existingMembers.filter((m) => m.userType === 'user').slice(0, 1).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickLoginAs(m)}
                    className="p-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-2xs"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-slate-900 truncate">{m.name}</p>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-black text-[9px] uppercase">
                          User
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800 font-medium truncate mt-0.5">
                        ID: {m.email}
                      </p>
                      <p className="text-[9px] text-slate-500">Member reguler gotong royong</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2 flex items-center justify-center text-xs">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                ← Belum punya akun? Daftar Member Baru Sekarang
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
           VIEW 3: DEDICATED ADMIN LOGIN WITH CLEAR ROLE EXPLANATION (User Request 2)
           ========================================================================= */}
        {mode === 'admin_login' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Admin Header Banner */}
            <div className="p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border-2 border-amber-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
                  👑
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Portal Login Khusus Administrator TBK
                  </h3>
                  <p className="text-xs text-amber-900 font-medium">
                    Akses kontrol penuh pengelolaan sistem, verifikasi member &amp; pengaturan medsos resmi.
                  </p>
                </div>
              </div>

              {/* Protected Notice */}
              <div className="mt-4 pt-3 border-t border-amber-200/80 text-xs">
                <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-black text-amber-950 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Akses Dilindungi Kunci Rahasia Administrator:</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Akun administrator publik ditiadakan untuk menjaga keamanan. Masukkan Kunci Rahasia Administrator (Master Passkey) untuk mengakses dashboard pengelola dan fitur Update Website Google Firebase.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Login Form */}
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase mb-1">
                  Kunci Rahasia Administrator (Master Passkey) *
                </label>
                <div className="flex rounded-md shadow-2xs border border-amber-300 focus-within:border-amber-500 overflow-hidden bg-white">
                  <div className="px-3 bg-amber-100/60 border-r border-amber-300 flex items-center justify-center text-amber-800">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan master key admin..."
                    className="flex-1 px-3 py-2.5 text-sm text-slate-900 font-mono focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="px-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                    title={showAdminPassword ? 'Sembunyikan' : 'Lihat'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Master passkey default: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">tbk-admin-2026</code>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>👑</span>
                <span>VERIFIKASI &amp; MASUK ADMIN</span>
              </button>
            </form>

            <div className="text-center pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                ← Kembali ke Login Member Reguler
              </button>

              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Daftar Akun Baru →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
