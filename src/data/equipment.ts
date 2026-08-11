import type { Equipment, EquipmentType } from "@/types/class";

export const equipment: Equipment[] = [
  // Lethals
  {
    id: "frag",
    name: "Frag",
    type: "lethal",
    description: "Lethal Grenade",
    icon: "/images/equipment/frag.webp",
  },
  {
    id: "semtex",
    name: "Semtex",
    type: "lethal",
    description: "Sticky Grenade",
    icon: "/images/equipment/semtex.webp",
  },
  {
    id: "combat_axe",
    name: "Combat Axe",
    type: "lethal",
    description: "Thrown Axe",
    icon: "/images/equipment/combat_axe.webp",
  },
  {
    id: "c4",
    name: "C4",
    type: "lethal",
    description: "Remote Explosive",
    icon: "/images/equipment/c4.webp",
  },
  {
    id: "claymore",
    name: "Claymore",
    type: "lethal",
    description: "Proximity Mine",
    icon: "/images/equipment/claymore.webp",
  },
  {
    id: "bouncing_betty",
    name: "Bouncing Betty",
    type: "lethal",
    description: "Proximity Mine",
    icon: "/images/equipment/bouncing_betty.webp",
  },
  // Tacticals
  {
    id: "concussion",
    name: "Concussion",
    type: "tactical",
    description: "Tactical Grenade",
    icon: "/images/equipment/concussion.webp",
  },
  {
    id: "flashbang",
    name: "Flashbang",
    type: "tactical",
    description: "Tactical Grenade",
    icon: "/images/equipment/flashbang.webp",
  },
  {
    id: "emp_grenade",
    name: "EMP Grenade",
    type: "tactical",
    description: "Tactical Grenade",
    icon: "/images/equipment/emp_grenade.webp",
  },
  {
    id: "smoke_grenade",
    name: "Smoke Grenade",
    type: "tactical",
    description: "Tactical Grenade",
    icon: "/images/equipment/smoke_grenade.webp",
  },
  {
    id: "sensor_grenade",
    name: "Sensor Grenade",
    type: "tactical",
    description: "Tactical Grenade",
    icon: "/images/equipment/sensor_grenade.webp",
  },
  {
    id: "shock_charge",
    name: "Shock Charge",
    type: "tactical",
    description: "Tactical Equipment",
    icon: "/images/equipment/shock_charge.webp",
  },
  {
    id: "black_hat",
    name: "Black Hat",
    type: "tactical",
    description: "Tactical Equipment",
    icon: "/images/equipment/black_hat.webp",
  },
  {
    id: "trophy_system",
    name: "Trophy System",
    type: "tactical",
    description: "Tactical Equipment",
    icon: "/images/equipment/trophy_system.webp",
  },
  {
    id: "tactical_insertion",
    name: "Tactical Insertion",
    type: "tactical",
    description: "Tactical Equipment",
    icon: "/images/equipment/tactical_insertion.webp",
  },
];

export const equipmentById = Object.fromEntries(
  equipment.map((item) => [item.id, item]),
) as Record<string, Equipment>;

export function getEquipmentByType(type: EquipmentType): Equipment[] {
  return equipment.filter((item) => item.type === type);
}
