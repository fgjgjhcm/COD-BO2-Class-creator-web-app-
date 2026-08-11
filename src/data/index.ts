export { weapons, weaponsById, getPrimaryWeapons, getSecondaryWeapons, weaponSupportsAttachments } from "./weapons";
export {
  attachments,
  attachmentsById,
  ATTACHMENT_CONFLICTS,
  getAttachmentsForWeapon,
  getAttachmentsForWeaponSlot,
  getAttachmentsForWeaponCategory,
  isAttachmentCompatibleWithWeapon,
  sanitizeEquippedAttachments,
} from "./attachments";
export { perks, perksById, getPerksByTier } from "./perks";
export { equipment, equipmentById, getEquipmentByType } from "./equipment";
export { wildcards, wildcardsById } from "./wildcards";
