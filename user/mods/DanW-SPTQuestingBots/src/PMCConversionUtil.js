"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PMCConversionUtil = void 0;
const config_json_1 = __importDefault(require("../config/config.json"));
class PMCConversionUtil {
    commonUtils;
    iPmcConfig;
    iBotConfig;
    constructor(commonUtils, iPmcConfig, iBotConfig) {
        this.commonUtils = commonUtils;
        this.iPmcConfig = iPmcConfig;
        this.iBotConfig = iBotConfig;
    }
    removeBlacklistedBrainTypes() {
        const badBrains = config_json_1.default.bot_spawns.blacklisted_pmc_bot_brains;
        let removedBrains = 0;
        for (const pmcType in this.iPmcConfig.pmcType) {
            for (const map in this.iPmcConfig.pmcType[pmcType]) {
                const mapBrains = this.iPmcConfig.pmcType[pmcType][map];
                for (const i in badBrains) {
                    if (mapBrains[badBrains[i]] === undefined) {
                        continue;
                    }
                    // this.commonUtils.logInfo(`Removing ${badBrains[i]} from ${pmcType} in ${map}...`);
                    delete mapBrains[badBrains[i]];
                    removedBrains++;
                }
            }
        }
        for (const map in this.iBotConfig.playerScavBrainType) {
            const mapBrains = this.iBotConfig.playerScavBrainType[map];
            for (const i in badBrains) {
                if (mapBrains[badBrains[i]] === undefined) {
                    continue;
                }
                // this.commonUtils.logInfo(`Removing ${badBrains[i]} from playerscavs in ${map}...`);
                delete mapBrains[badBrains[i]];
                removedBrains++;
            }
        }
        this.commonUtils.logInfo(`Removed ${removedBrains} blacklisted brain types from being used for PMC's and Player Scav's`);
    }
}
exports.PMCConversionUtil = PMCConversionUtil;
//# sourceMappingURL=PMCConversionUtil.js.map