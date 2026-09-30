import { MemberSocialAccounts, Subtask } from '../types';

/**
 * URL Resmi Media Sosial & Grup WhatsApp Admin Komunitas TBK
 * Sesuai instruksi resmi:
 * 1. Youtube : https://youtube.com/@adrian_and_andrew
 * 2. Instagram : @erickson.halomoans
 * 3. Tiktok : @josjus_store
 * 4. Facebook : https://web.facebook.com/people/JosJus-Gaming/100063723931662/?locale=id_ID
 * 5. Link group whatsapp : https://chat.whatsapp.com/HGnKisfjO8fBpy8YdJ2pt3?s=cl&p=a&mlu=4&ilr=4
 */
export const MASTER_OFFICIAL_SOCIALS: MemberSocialAccounts = {
  youtube: 'https://youtube.com/@adrian_and_andrew',
  instagram: '@erickson.halomoans',
  tiktok: '@josjus_store',
  facebook: 'https://web.facebook.com/people/JosJus-Gaming/100063723931662/?locale=id_ID',
  whatsappGroup: 'https://chat.whatsapp.com/HGnKisfjO8fBpy8YdJ2pt3?s=cl&p=a&mlu=4&ilr=4',
};

/**
 * Format any handle or link into a clickable, valid browser URL
 */
export function formatSocialUrl(
  platform: 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'whatsappGroup',
  val?: string
): string {
  if (!val) {
    val = MASTER_OFFICIAL_SOCIALS[platform] || '';
  }
  const clean = val.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  switch (platform) {
    case 'youtube':
      return `https://youtube.com/@${clean.replace(/^@/, '')}`;
    case 'instagram':
      return `https://instagram.com/${clean.replace(/^@/, '')}`;
    case 'tiktok':
      return `https://tiktok.com/@${clean.replace(/^@/, '')}`;
    case 'facebook':
      return `https://facebook.com/${clean.replace(/^@/, '')}`;
    case 'whatsappGroup':
      return clean.includes('chat.whatsapp.com') ? `https://${clean}` : `https://chat.whatsapp.com/${clean}`;
    default:
      return clean;
  }
}

/**
 * Sanitize and guarantee that official socials never revert to legacy placeholders
 * across any client device (Desktop, Laptop, HP/Mobile)
 */
export function sanitizeOfficialSocials(
  input?: Partial<MemberSocialAccounts> | null
): MemberSocialAccounts {
  const result: MemberSocialAccounts = { ...MASTER_OFFICIAL_SOCIALS };

  if (!input || typeof input !== 'object') {
    return result;
  }

  // YouTube
  if (
    input.youtube &&
    input.youtube.trim().length > 3 &&
    !input.youtube.includes('adrian_andrew.id') &&
    !input.youtube.includes('adrian_andrew.official')
  ) {
    result.youtube = input.youtube.trim();
  }

  // Instagram
  if (
    input.instagram &&
    input.instagram.trim().length > 2 &&
    !input.instagram.includes('adrian_andrew.id')
  ) {
    result.instagram = input.instagram.trim();
  }

  // TikTok
  if (
    input.tiktok &&
    input.tiktok.trim().length > 2 &&
    !input.tiktok.includes('adrianandrew_tiktok')
  ) {
    result.tiktok = input.tiktok.trim();
  }

  // Facebook
  if (
    input.facebook &&
    input.facebook.trim().length > 2 &&
    !input.facebook.includes('Adrian Andrew ID')
  ) {
    result.facebook = input.facebook.trim();
  }

  // WhatsApp Group
  if (
    input.whatsappGroup &&
    input.whatsappGroup.trim().length > 10 &&
    !input.whatsappGroup.includes('TBKOfficialCommunity')
  ) {
    result.whatsappGroup = input.whatsappGroup.trim();
  }

  return result;
}

/**
 * Build 5 structured mandatory subtasks for TBK onboarding
 */
export function buildOfficialMandatorySubtasks(socials?: MemberSocialAccounts): Subtask[] {
  const soc = sanitizeOfficialSocials(socials);
  return [
    {
      id: 'sub-yt-official',
      title: `Subscribe & Tonton YouTube Official Admin: ${soc.youtube}`,
      completed: false,
    },
    {
      id: 'sub-ig-official',
      title: `Follow Instagram Official Admin: ${soc.instagram}`,
      completed: false,
    },
    {
      id: 'sub-tt-official',
      title: `Follow TikTok Official Admin: ${soc.tiktok}`,
      completed: false,
    },
    {
      id: 'sub-fb-official',
      title: `Follow Fanspage Facebook Official Admin: ${soc.facebook}`,
      completed: false,
    },
    {
      id: 'sub-wa-official',
      title: `Gabung Grup WhatsApp Resmi Komunitas TBK: ${soc.whatsappGroup}`,
      completed: false,
    },
  ];
}
