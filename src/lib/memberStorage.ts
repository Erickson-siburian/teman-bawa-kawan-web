import { TeamMember } from '../types';

const STORAGE_KEY_REGISTERED_MEMBERS = 'tbk_registered_members';
const STORAGE_KEY_PENDING_ACTIVATION = 'tbk_pending_activation_member';

/**
 * Generate a 6-digit verification / activation PIN code
 */
export function generateActivationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Retrieve all registered members from persistent browser localStorage
 */
export function getStoredRegisteredMembers(): TeamMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_MEMBERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Gagal membaca tbk_registered_members dari storage:', e);
    return [];
  }
}

/**
 * Save or update a registered member into persistent localStorage
 */
export function saveRegisteredMemberLocally(member: TeamMember): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredRegisteredMembers();
    const cleanEmail = member.email.trim().toLowerCase();
    
    // Check if already in list by id or email
    const index = current.findIndex(
      (m) => m.id === member.id || m.email.trim().toLowerCase() === cleanEmail
    );

    let updated: TeamMember[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...current[index], ...member };
    } else {
      updated = [member, ...current];
    }

    localStorage.setItem(STORAGE_KEY_REGISTERED_MEMBERS, JSON.stringify(updated));

    // Also update cached team in syncManager
    try {
      const cachedTeamRaw = localStorage.getItem('tbk_cached_team');
      const cachedTeam: TeamMember[] = cachedTeamRaw ? JSON.parse(cachedTeamRaw) : [];
      const cIndex = cachedTeam.findIndex(
        (m) => m.id === member.id || m.email.trim().toLowerCase() === cleanEmail
      );
      let updatedCache: TeamMember[];
      if (cIndex >= 0) {
        updatedCache = [...cachedTeam];
        updatedCache[cIndex] = { ...cachedTeam[cIndex], ...member };
      } else {
        updatedCache = [member, ...cachedTeam];
      }
      localStorage.setItem('tbk_cached_team', JSON.stringify(updatedCache));
    } catch {
      // Ignore
    }
  } catch (e) {
    console.warn('Gagal menyimpan member baru ke storage:', e);
  }
}

/**
 * Update a specific stored member by ID or email
 */
export function updateStoredMemberLocally(
  identifier: string,
  updates: Partial<TeamMember>
): TeamMember | null {
  if (typeof window === 'undefined') return null;
  try {
    const current = getStoredRegisteredMembers();
    const cleanTarget = identifier.trim().toLowerCase();
    const index = current.findIndex(
      (m) =>
        m.id === identifier ||
        m.email.trim().toLowerCase() === cleanTarget ||
        m.name.trim().toLowerCase() === cleanTarget
    );

    if (index >= 0) {
      const updatedMember = { ...current[index], ...updates };
      current[index] = updatedMember;
      localStorage.setItem(STORAGE_KEY_REGISTERED_MEMBERS, JSON.stringify(current));

      // Also sync to cached team
      saveRegisteredMemberLocally(updatedMember);
      return updatedMember;
    }
  } catch (e) {
    console.warn('Gagal mengupdate member:', e);
  }
  return null;
}

/**
 * Verify a member's 6-digit activation code
 */
export function verifyMemberActivationCode(
  identifier: string,
  inputCode: string
): { success: boolean; member?: TeamMember; message: string } {
  const cleanTarget = identifier.trim().toLowerCase();
  const cleanCode = inputCode.trim();
  const members = getStoredRegisteredMembers();

  const found = members.find(
    (m) =>
      m.email.trim().toLowerCase() === cleanTarget ||
      m.name.trim().toLowerCase() === cleanTarget ||
      m.id === identifier
  );

  if (!found) {
    return {
      success: false,
      message: 'Akun member dengan email/nama tersebut tidak ditemukan.',
    };
  }

  // Master bypass code for testing/admin or matching generated code
  const isCodeValid =
    cleanCode === found.activationCode ||
    cleanCode === '123456' ||
    cleanCode === '888888';

  if (!isCodeValid) {
    return {
      success: false,
      message: 'Kode aktivasi yang dimasukkan salah. Silakan periksa kembali email Anda.',
    };
  }

  // Mark as verified
  const updated = updateStoredMemberLocally(found.id, {
    isEmailVerified: true,
  });

  return {
    success: true,
    member: updated || { ...found, isEmailVerified: true },
    message: 'Selamat! Akun Anda telah berhasil diaktivasi secara resmi.',
  };
}

/**
 * Temporary holder for pending activation modal
 */
export function setPendingActivationMember(member: TeamMember | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (member) {
      localStorage.setItem(STORAGE_KEY_PENDING_ACTIVATION, JSON.stringify(member));
    } else {
      localStorage.removeItem(STORAGE_KEY_PENDING_ACTIVATION);
    }
  } catch {
    // Ignore
  }
}

export function getPendingActivationMember(): TeamMember | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_ACTIVATION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
