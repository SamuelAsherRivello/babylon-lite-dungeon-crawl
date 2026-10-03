const baseUrl = import.meta.env?.BASE_URL ?? "/";

export const AUDIO_ASSETS = Object.freeze({
  music: Object.freeze([
    `${baseUrl}assets/audio/music/spooky_dungeon.ogg`,
    `${baseUrl}assets/audio/music/end_dungeon.mp3`,
    `${baseUrl}assets/audio/music/dungeon_04.ogg`,
  ]),
  sfx: Object.freeze({
    footstep: `${baseUrl}assets/audio/sfx/footstep.ogg`,
    weaponHit: `${baseUrl}assets/audio/sfx/weapon_hit.ogg`,
    enemyHit: `${baseUrl}assets/audio/sfx/enemy_hit.ogg`,
    enemyFall: `${baseUrl}assets/audio/sfx/enemy_fall.ogg`,
    potion: `${baseUrl}assets/audio/sfx/potion.ogg`,
    chest: `${baseUrl}assets/audio/sfx/chest.ogg`,
    stairs: `${baseUrl}assets/audio/sfx/stairs.ogg`,
    accepted: `${baseUrl}assets/audio/sfx/ui_accept.ogg`,
    rejected: `${baseUrl}assets/audio/sfx/ui_reject.ogg`,
    ability: `${baseUrl}assets/audio/sfx/ability.ogg`,
  }),
});

const eventCues = Object.freeze({
  "player.moved": "footstep",
  "enemy.defeated": "enemyFall",
  "potion.consumed": "potion",
  "chest.opened": "chest",
  "realm.entered": "stairs",
  "ability.used": "ability",
});

function readVolume(value, fallback) { return Number.isInteger(value) && value >= 0 && value <= 100 ? value : fallback; }
function muteFromSearch(search) { return new URLSearchParams(search).get("mute") === "1"; }
function ignoreRejectedPlay(result) { if (result && typeof result.catch === "function") result.catch(() => {}); }

export function createAudioManager({ search = "", createAudio = (src) => new Audio(src), random = Math.random } = {}) {
  const hardMuted = muteFromSearch(search);
  let preferences = { sfxVolume: 80, musicVolume: 20, muteAll: false };
  let musicAudio = null;
  let lastFootstepAt = -Infinity;

  const busMuted = (bus) => hardMuted || preferences.muteAll || preferences[`${bus}Volume`] === 0;
  const setPreferences = (value = {}) => {
    preferences = {
      sfxVolume: readVolume(value.sfxVolume, 80),
      musicVolume: readVolume(value.musicVolume, 20),
      muteAll: value.muteAll === true,
    };
    if (musicAudio) musicAudio.volume = busMuted("music") ? 0 : preferences.musicVolume / 100;
  };

  const playCue = (cue, now = Date.now()) => {
    const src = AUDIO_ASSETS.sfx[cue];
    if (!src || busMuted("sfx")) return false;
    if (cue === "footstep") {
      if (now - lastFootstepAt < 140) return false;
      lastFootstepAt = now;
    }
    const audio = createAudio(src);
    audio.preload = "auto";
    audio.volume = preferences.sfxVolume / 100;
    ignoreRejectedPlay(audio.play());
    return true;
  };

  const playEvents = (events = []) => {
    for (const event of events) {
      if (event.outcome === "rejected") continue;
      let cue = eventCues[event.type];
      if (event.type === "combat.hit" && !event.facts?.source) cue = "weaponHit";
      if (event.type === "resource.changed" && event.facts?.cause === "enemy-attack") cue = "enemyHit";
      if (cue) playCue(cue);
    }
  };

  const startMusic = () => {
    if (busMuted("music")) return false;
    if (musicAudio) return true;
    const tracks = AUDIO_ASSETS.music;
    const index = Math.min(tracks.length - 1, Math.max(0, Math.floor(random() * tracks.length)));
    musicAudio = createAudio(tracks[index]);
    musicAudio.preload = "auto";
    musicAudio.loop = true;
    musicAudio.volume = preferences.musicVolume / 100;
    ignoreRejectedPlay(musicAudio.play());
    return true;
  };

  const playDropResult = (accepted) => playCue(accepted ? "accepted" : "rejected");

  return Object.freeze({
    hardMuted,
    setPreferences,
    startMusic,
    playCue,
    playDropResult,
    playEvents,
    isMuted: (bus = null) => bus ? busMuted(bus) : hardMuted || preferences.muteAll,
  });
}
