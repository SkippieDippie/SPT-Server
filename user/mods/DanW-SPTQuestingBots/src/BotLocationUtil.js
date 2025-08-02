"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotUtil = void 0;
const config_json_1 = __importDefault(require("../config/config.json"));
class BotUtil {
    commonUtils;
    databaseTables;
    iLocationConfig;
    iBotConfig;
    iPmcConfig;
    static pmcRoles = ["pmcBEAR", "pmcUSEC"];
    constructor(commonUtils, databaseTables, iLocationConfig, iBotConfig, iPmcConfig) {
        this.commonUtils = commonUtils;
        this.databaseTables = databaseTables;
        this.iLocationConfig = iLocationConfig;
        this.iBotConfig = iBotConfig;
        this.iPmcConfig = iPmcConfig;
    }
    adjustAllBotHostilityChances() {
        if (!config_json_1.default.bot_spawns.pmc_hostility_adjustments.enabled) {
            return;
        }
        this.commonUtils.logInfo("Adjusting bot hostility chances...");
        for (const location in this.databaseTables.locations) {
            this.adjustAllBotHostilityChancesForLocation(this.databaseTables.locations[location]);
        }
        this.adjustSptPmcHostilityChances(this.iPmcConfig.hostilitySettings["pmcusec"]);
        this.adjustSptPmcHostilityChances(this.iPmcConfig.hostilitySettings["pmcbear"]);
        if (config_json_1.default.bot_spawns.pmc_hostility_adjustments.pmcs_always_hostile_against_scavs) {
            this.databaseTables.bots.types.assault.difficulty.easy.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.assault.difficulty.normal.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.assault.difficulty.hard.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.assault.difficulty.impossible.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.assaultgroup.difficulty.easy.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.assaultgroup.difficulty.normal.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.assaultgroup.difficulty.hard.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.assaultgroup.difficulty.impossible.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.marksman.difficulty.easy.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.marksman.difficulty.normal.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.marksman.difficulty.hard.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
            this.databaseTables.bots.types.marksman.difficulty.impossible.Mind.ENEMY_BOT_TYPES = BotUtil.pmcRoles;
        }
        this.commonUtils.logInfo("Adjusting bot hostility chances...done.");
    }
    adjustAllBotHostilityChancesForLocation(location) {
        if ((location.base === undefined) || (location.base.BotLocationModifier === undefined)) {
            return;
        }
        const settings = location.base.BotLocationModifier.AdditionalHostilitySettings;
        if (settings === undefined) {
            return;
        }
        for (const botType in settings) {
            if (!BotUtil.pmcRoles.includes(settings[botType].BotRole)) {
                //this.commonUtils.logWarning(`Did not adjust ${settings[botType].BotRole} hostility settings on ${location.base.Name}`);
                continue;
            }
            this.adjustBotHostilityChances(settings[botType]);
        }
    }
    adjustBotHostilityChances(settings) {
        // This seems to be undefined for most maps
        if (settings.SavageEnemyChance !== undefined) {
            settings.SavageEnemyChance = config_json_1.default.bot_spawns.pmc_hostility_adjustments.global_scav_enemy_chance;
        }
        if (config_json_1.default.bot_spawns.pmc_hostility_adjustments.pmcs_always_hostile_against_scavs) {
            settings.SavagePlayerBehaviour = "AlwaysEnemies";
        }
        for (const chancedEnemy in settings.ChancedEnemies) {
            if (config_json_1.default.bot_spawns.pmc_hostility_adjustments.pmc_enemy_roles.includes(settings.ChancedEnemies[chancedEnemy].Role)) {
                settings.ChancedEnemies[chancedEnemy].EnemyChance = 100;
                continue;
            }
            // This allows Questing Bots to set boss hostilities when the bot spawns
            settings.ChancedEnemies[chancedEnemy].EnemyChance = 0;
        }
        if (config_json_1.default.bot_spawns.pmc_hostility_adjustments.pmcs_always_hostile_against_pmcs) {
            settings.BearEnemyChance = 100;
            settings.UsecEnemyChance = 100;
            this.addMissingPMCRolesToChancedEnemies(settings);
        }
    }
    addMissingPMCRolesToChancedEnemies(settings) {
        for (const pmcRole of BotUtil.pmcRoles) {
            if (!config_json_1.default.bot_spawns.pmc_hostility_adjustments.pmc_enemy_roles.includes(pmcRole)) {
                continue;
            }
            let foundRole = false;
            for (const chancedEnemy in settings.ChancedEnemies) {
                if (settings.ChancedEnemies[chancedEnemy].Role === pmcRole) {
                    foundRole = true;
                    break;
                }
            }
            if (foundRole) {
                continue;
            }
            const newEnemy = {
                EnemyChance: 100,
                Role: pmcRole
            };
            settings.ChancedEnemies.push(newEnemy);
        }
    }
    adjustSptPmcHostilityChances(settings) {
        settings.savageEnemyChance = config_json_1.default.bot_spawns.pmc_hostility_adjustments.global_scav_enemy_chance;
        if (config_json_1.default.bot_spawns.pmc_hostility_adjustments.pmcs_always_hostile_against_scavs) {
            settings.savagePlayerBehaviour = "AlwaysEnemies";
        }
        for (const chancedEnemy in settings.chancedEnemies) {
            if (config_json_1.default.bot_spawns.pmc_hostility_adjustments.pmc_enemy_roles.includes(settings.chancedEnemies[chancedEnemy].Role)) {
                settings.chancedEnemies[chancedEnemy].EnemyChance = 100;
                continue;
            }
        }
        if (config_json_1.default.bot_spawns.pmc_hostility_adjustments.pmcs_always_hostile_against_pmcs) {
            settings.bearEnemyChance = 100;
            settings.usecEnemyChance = 100;
        }
    }
    disablePvEBossWaves() {
        let removedWaves = 0;
        for (const location in this.databaseTables.locations) {
            removedWaves += this.removePvEBossWavesFromLocation(this.databaseTables.locations[location]);
        }
        if (removedWaves > 0) {
            this.commonUtils.logInfo(`Disabled ${removedWaves} PvE boss waves`);
        }
    }
    removePvEBossWavesFromLocation(location) {
        let removedWaves = 0;
        if ((location.base === undefined) || (location.base.BossLocationSpawn === undefined)) {
            return removedWaves;
        }
        const modifiedBossLocationSpawn = [];
        for (const bossLocationSpawnId in location.base.BossLocationSpawn) {
            const bossLocationSpawn = location.base.BossLocationSpawn[bossLocationSpawnId];
            if (BotUtil.pmcRoles.includes(bossLocationSpawn.BossName)) {
                removedWaves++;
                continue;
            }
            modifiedBossLocationSpawn.push(bossLocationSpawn);
        }
        location.base.BossLocationSpawn = modifiedBossLocationSpawn;
        return removedWaves;
    }
    disableBotWaves(waves, botType) {
        let originalWaves = 0;
        for (const location in waves) {
            originalWaves += waves[location].length;
            waves[location] = [];
        }
        if (originalWaves > 0) {
            this.commonUtils.logInfo(`Disabled ${originalWaves} custom ${botType} waves`);
        }
    }
    useEFTBotCaps() {
        for (const location in this.iBotConfig.maxBotCap) {
            if ((this.databaseTables.locations[location] === undefined) || (this.databaseTables.locations[location].base === undefined)) {
                continue;
            }
            const originalSPTCap = this.iBotConfig.maxBotCap[location];
            const eftCap = this.databaseTables.locations[location].base.BotMax;
            const shouldChangeBotCap = (originalSPTCap > eftCap) || !config_json_1.default.bot_spawns.bot_cap_adjustments.only_decrease_bot_caps;
            if (config_json_1.default.bot_spawns.bot_cap_adjustments.use_EFT_bot_caps && shouldChangeBotCap) {
                this.iBotConfig.maxBotCap[location] = eftCap;
            }
            const fixedAdjustment = config_json_1.default.bot_spawns.bot_cap_adjustments.map_specific_adjustments[location];
            this.iBotConfig.maxBotCap[location] += fixedAdjustment;
            const newCap = this.iBotConfig.maxBotCap[location];
            if (newCap !== originalSPTCap) {
                this.commonUtils.logInfo(`Updated bot cap for ${location} to ${newCap} (Original SPT: ${originalSPTCap}, EFT: ${eftCap}, fixed adjustment: ${fixedAdjustment})`);
            }
        }
    }
}
exports.BotUtil = BotUtil;
//# sourceMappingURL=BotLocationUtil.js.map