import { expect, test } from "@playwright/test";

test("@smoke opens the muted saved-game entry screen", async ({ page }) => {
  await page.goto("/babylon-lite-dungeon-crawl/?mute=1");

  await expect(page).toHaveURL(/\/babylon-lite-dungeon-crawl\/\?mute=1$/);
  await expect(page.getByRole("heading", { name: "Dungeon Roguelite (DR)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "3 Saved Games" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Saved Game [1-3]/ })).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Tooltip help" })).toBeVisible();
});

test("@smoke resolves a visible level-up choice without another turn", async ({ page }) => {
  await page.addInitScript(() => {
    const map = Array.from({ length: 100 }, () => Array(100).fill(1)); map[50][50] = 0; map[50][51] = 0;
    const resource = (current, currentMax) => ({ current, currentMax });
    localStorage.setItem("cryptbound.slot.1", JSON.stringify({
      version: 3, world: "One", realm: "Underground 1",
      floor: { seed: 1, width: 100, height: 100, map, start: { x: 50, y: 50 }, time: 0, level: 1, entities: [{ id: "rat", kind: "enemy", name: "Cave Rat", x: 51, y: 50, hp: 1, maxHp: 1, damage: 0, xp: 8, awareness: 6, actionCooldown: 2, nextActionAt: 2 }] },
      progression: { attributes: { health: 30, stamina: 16, offense: 0, defense: 1, mana: 12, vitality: 0, strength: 0, luck: 0, recovery: 0, stealth: 0 }, level: 1, xp: 99, nextXp: 100, totalKills: 0, difficulty: 1, pendingUpgrades: [] },
      player: { x: 50, y: 50, resources: { health: resource(30, 30), stamina: resource(16, 16), offense: resource(6, 6), defense: resource(1, 1), mana: resource(12, 12), xp: { ...resource(99, 100), level: 1 } }, equipment: { weapons: [{ id: "stick", name: "Wooden Stick", group: "weapons", modifiers: { offense: 6 } }, null], armor: [null, null] }, inventory: [], inventoryCapacity: 10, abilities: ["heal", "wand", null, null], sneaking: false },
      counters: { keys: 1, gold: 55 }, objective: "Find the exit", log: [],
    }));
  });
  await page.goto("/babylon-lite-dungeon-crawl/?mute=1");
  await page.getByRole("button", { name: /Saved Game 1/ }).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("heading", { name: "Level 2: Choose a Stat" })).toBeVisible();
  await page.locator(".level_up_chooser").getByRole("button", { name: /Vitality/ }).click();
  await expect(page.getByRole("heading", { name: "Level 2: Choose a Stat" })).toBeHidden();
});
