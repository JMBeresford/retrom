import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Timestamp } from "./google/protobuf/timestamp";
export declare const protobufPackage = "igdb";
export declare const AgeRatingCategoryEnum: {
    /** @deprecated */
    readonly AGERATING_CATEGORY_NULL: 0;
    /** @deprecated */
    readonly ESRB: 1;
    /** @deprecated */
    readonly PEGI: 2;
    /** @deprecated */
    readonly CERO: 3;
    /** @deprecated */
    readonly USK: 4;
    /** @deprecated */
    readonly GRAC: 5;
    /** @deprecated */
    readonly CLASS_IND: 6;
    /** @deprecated */
    readonly ACB: 7;
    readonly UNRECOGNIZED: -1;
};
export type AgeRatingCategoryEnum = typeof AgeRatingCategoryEnum[keyof typeof AgeRatingCategoryEnum];
export declare namespace AgeRatingCategoryEnum {
    type AGERATING_CATEGORY_NULL = typeof AgeRatingCategoryEnum.AGERATING_CATEGORY_NULL;
    type ESRB = typeof AgeRatingCategoryEnum.ESRB;
    type PEGI = typeof AgeRatingCategoryEnum.PEGI;
    type CERO = typeof AgeRatingCategoryEnum.CERO;
    type USK = typeof AgeRatingCategoryEnum.USK;
    type GRAC = typeof AgeRatingCategoryEnum.GRAC;
    type CLASS_IND = typeof AgeRatingCategoryEnum.CLASS_IND;
    type ACB = typeof AgeRatingCategoryEnum.ACB;
    type UNRECOGNIZED = typeof AgeRatingCategoryEnum.UNRECOGNIZED;
}
export declare function ageRatingCategoryEnumFromJSON(object: any): AgeRatingCategoryEnum;
export declare function ageRatingCategoryEnumToJSON(object: AgeRatingCategoryEnum): string;
export declare const AgeRatingRatingEnum: {
    /** @deprecated */
    readonly AGERATING_RATING_NULL: 0;
    /** @deprecated */
    readonly THREE: 1;
    /** @deprecated */
    readonly SEVEN: 2;
    /** @deprecated */
    readonly TWELVE: 3;
    /** @deprecated */
    readonly SIXTEEN: 4;
    /** @deprecated */
    readonly EIGHTEEN: 5;
    /** @deprecated */
    readonly RP: 6;
    /** @deprecated */
    readonly EC: 7;
    /** @deprecated */
    readonly E: 8;
    /** @deprecated */
    readonly E10: 9;
    /** @deprecated */
    readonly T: 10;
    /** @deprecated */
    readonly M: 11;
    /** @deprecated */
    readonly AO: 12;
    /** @deprecated */
    readonly CERO_A: 13;
    /** @deprecated */
    readonly CERO_B: 14;
    /** @deprecated */
    readonly CERO_C: 15;
    /** @deprecated */
    readonly CERO_D: 16;
    /** @deprecated */
    readonly CERO_Z: 17;
    /** @deprecated */
    readonly USK_0: 18;
    /** @deprecated */
    readonly USK_6: 19;
    /** @deprecated */
    readonly USK_12: 20;
    /** @deprecated */
    readonly USK_16: 21;
    /** @deprecated */
    readonly USK_18: 22;
    /** @deprecated */
    readonly GRAC_ALL: 23;
    /** @deprecated */
    readonly GRAC_TWELVE: 24;
    /** @deprecated */
    readonly GRAC_FIFTEEN: 25;
    /** @deprecated */
    readonly GRAC_EIGHTEEN: 26;
    /** @deprecated */
    readonly GRAC_TESTING: 27;
    /** @deprecated */
    readonly CLASS_IND_L: 28;
    /** @deprecated */
    readonly CLASS_IND_TEN: 29;
    /** @deprecated */
    readonly CLASS_IND_TWELVE: 30;
    /** @deprecated */
    readonly CLASS_IND_FOURTEEN: 31;
    /** @deprecated */
    readonly CLASS_IND_SIXTEEN: 32;
    /** @deprecated */
    readonly CLASS_IND_EIGHTEEN: 33;
    /** @deprecated */
    readonly ACB_G: 34;
    /** @deprecated */
    readonly ACB_PG: 35;
    /** @deprecated */
    readonly ACB_M: 36;
    /** @deprecated */
    readonly ACB_MA15: 37;
    /** @deprecated */
    readonly ACB_R18: 38;
    /** @deprecated */
    readonly ACB_RC: 39;
    readonly UNRECOGNIZED: -1;
};
export type AgeRatingRatingEnum = typeof AgeRatingRatingEnum[keyof typeof AgeRatingRatingEnum];
export declare namespace AgeRatingRatingEnum {
    type AGERATING_RATING_NULL = typeof AgeRatingRatingEnum.AGERATING_RATING_NULL;
    type THREE = typeof AgeRatingRatingEnum.THREE;
    type SEVEN = typeof AgeRatingRatingEnum.SEVEN;
    type TWELVE = typeof AgeRatingRatingEnum.TWELVE;
    type SIXTEEN = typeof AgeRatingRatingEnum.SIXTEEN;
    type EIGHTEEN = typeof AgeRatingRatingEnum.EIGHTEEN;
    type RP = typeof AgeRatingRatingEnum.RP;
    type EC = typeof AgeRatingRatingEnum.EC;
    type E = typeof AgeRatingRatingEnum.E;
    type E10 = typeof AgeRatingRatingEnum.E10;
    type T = typeof AgeRatingRatingEnum.T;
    type M = typeof AgeRatingRatingEnum.M;
    type AO = typeof AgeRatingRatingEnum.AO;
    type CERO_A = typeof AgeRatingRatingEnum.CERO_A;
    type CERO_B = typeof AgeRatingRatingEnum.CERO_B;
    type CERO_C = typeof AgeRatingRatingEnum.CERO_C;
    type CERO_D = typeof AgeRatingRatingEnum.CERO_D;
    type CERO_Z = typeof AgeRatingRatingEnum.CERO_Z;
    type USK_0 = typeof AgeRatingRatingEnum.USK_0;
    type USK_6 = typeof AgeRatingRatingEnum.USK_6;
    type USK_12 = typeof AgeRatingRatingEnum.USK_12;
    type USK_16 = typeof AgeRatingRatingEnum.USK_16;
    type USK_18 = typeof AgeRatingRatingEnum.USK_18;
    type GRAC_ALL = typeof AgeRatingRatingEnum.GRAC_ALL;
    type GRAC_TWELVE = typeof AgeRatingRatingEnum.GRAC_TWELVE;
    type GRAC_FIFTEEN = typeof AgeRatingRatingEnum.GRAC_FIFTEEN;
    type GRAC_EIGHTEEN = typeof AgeRatingRatingEnum.GRAC_EIGHTEEN;
    type GRAC_TESTING = typeof AgeRatingRatingEnum.GRAC_TESTING;
    type CLASS_IND_L = typeof AgeRatingRatingEnum.CLASS_IND_L;
    type CLASS_IND_TEN = typeof AgeRatingRatingEnum.CLASS_IND_TEN;
    type CLASS_IND_TWELVE = typeof AgeRatingRatingEnum.CLASS_IND_TWELVE;
    type CLASS_IND_FOURTEEN = typeof AgeRatingRatingEnum.CLASS_IND_FOURTEEN;
    type CLASS_IND_SIXTEEN = typeof AgeRatingRatingEnum.CLASS_IND_SIXTEEN;
    type CLASS_IND_EIGHTEEN = typeof AgeRatingRatingEnum.CLASS_IND_EIGHTEEN;
    type ACB_G = typeof AgeRatingRatingEnum.ACB_G;
    type ACB_PG = typeof AgeRatingRatingEnum.ACB_PG;
    type ACB_M = typeof AgeRatingRatingEnum.ACB_M;
    type ACB_MA15 = typeof AgeRatingRatingEnum.ACB_MA15;
    type ACB_R18 = typeof AgeRatingRatingEnum.ACB_R18;
    type ACB_RC = typeof AgeRatingRatingEnum.ACB_RC;
    type UNRECOGNIZED = typeof AgeRatingRatingEnum.UNRECOGNIZED;
}
export declare function ageRatingRatingEnumFromJSON(object: any): AgeRatingRatingEnum;
export declare function ageRatingRatingEnumToJSON(object: AgeRatingRatingEnum): string;
export declare const AgeRatingContentDescriptionCategoryEnum: {
    /** @deprecated */
    readonly AGERATINGCONTENTDESCRIPTION_CATEGORY_NULL: 0;
    /** @deprecated */
    readonly ESRB_ALCOHOL_REFERENCE: 1;
    /** @deprecated */
    readonly ESRB_ANIMATED_BLOOD: 2;
    /** @deprecated */
    readonly ESRB_BLOOD: 3;
    /** @deprecated */
    readonly ESRB_BLOOD_AND_GORE: 4;
    /** @deprecated */
    readonly ESRB_CARTOON_VIOLENCE: 5;
    /** @deprecated */
    readonly ESRB_COMIC_MISCHIEF: 6;
    /** @deprecated */
    readonly ESRB_CRUDE_HUMOR: 7;
    /** @deprecated */
    readonly ESRB_DRUG_REFERENCE: 8;
    /** @deprecated */
    readonly ESRB_FANTASY_VIOLENCE: 9;
    /** @deprecated */
    readonly ESRB_INTENSE_VIOLENCE: 10;
    /** @deprecated */
    readonly ESRB_LANGUAGE: 11;
    /** @deprecated */
    readonly ESRB_LYRICS: 12;
    /** @deprecated */
    readonly ESRB_MATURE_HUMOR: 13;
    /** @deprecated */
    readonly ESRB_NUDITY: 14;
    /** @deprecated */
    readonly ESRB_PARTIAL_NUDITY: 15;
    /** @deprecated */
    readonly ESRB_REAL_GAMBLING: 16;
    /** @deprecated */
    readonly ESRB_SEXUAL_CONTENT: 17;
    /** @deprecated */
    readonly ESRB_SEXUAL_THEMES: 18;
    /** @deprecated */
    readonly ESRB_SEXUAL_VIOLENCE: 19;
    /** @deprecated */
    readonly ESRB_SIMULATED_GAMBLING: 20;
    /** @deprecated */
    readonly ESRB_STRONG_LANGUAGE: 21;
    /** @deprecated */
    readonly ESRB_STRONG_LYRICS: 22;
    /** @deprecated */
    readonly ESRB_STRONG_SEXUAL_CONTENT: 23;
    /** @deprecated */
    readonly ESRB_SUGGESTIVE_THEMES: 24;
    /** @deprecated */
    readonly ESRB_TOBACCO_REFERENCE: 25;
    /** @deprecated */
    readonly ESRB_USE_OF_ALCOHOL: 26;
    /** @deprecated */
    readonly ESRB_USE_OF_DRUGS: 27;
    /** @deprecated */
    readonly ESRB_USE_OF_TOBACCO: 28;
    /** @deprecated */
    readonly ESRB_VIOLENCE: 29;
    /** @deprecated */
    readonly ESRB_VIOLENT_REFERENCES: 30;
    /** @deprecated */
    readonly ESRB_ANIMATED_VIOLENCE: 31;
    /** @deprecated */
    readonly ESRB_MILD_LANGUAGE: 32;
    /** @deprecated */
    readonly ESRB_MILD_VIOLENCE: 33;
    /** @deprecated */
    readonly ESRB_USE_OF_DRUGS_AND_ALCOHOL: 34;
    /** @deprecated */
    readonly ESRB_DRUG_AND_ALCOHOL_REFERENCE: 35;
    /** @deprecated */
    readonly ESRB_MILD_SUGGESTIVE_THEMES: 36;
    /** @deprecated */
    readonly ESRB_MILD_CARTOON_VIOLENCE: 37;
    /** @deprecated */
    readonly ESRB_MILD_BLOOD: 38;
    /** @deprecated */
    readonly ESRB_REALISTIC_BLOOD_AND_GORE: 39;
    /** @deprecated */
    readonly ESRB_REALISTIC_VIOLENCE: 40;
    /** @deprecated */
    readonly ESRB_ALCOHOL_AND_TOBACCO_REFERENCE: 41;
    /** @deprecated */
    readonly ESRB_MATURE_SEXUAL_THEMES: 42;
    /** @deprecated */
    readonly ESRB_MILD_ANIMATED_VIOLENCE: 43;
    /** @deprecated */
    readonly ESRB_MILD_SEXUAL_THEMES: 44;
    /** @deprecated */
    readonly ESRB_USE_OF_ALCOHOL_AND_TOBACCO: 45;
    /** @deprecated */
    readonly ESRB_ANIMATED_BLOOD_AND_GORE: 46;
    /** @deprecated */
    readonly ESRB_MILD_FANTASY_VIOLENCE: 47;
    /** @deprecated */
    readonly ESRB_MILD_LYRICS: 48;
    /** @deprecated */
    readonly ESRB_REALISTIC_BLOOD: 49;
    /** @deprecated */
    readonly PEGI_VIOLENCE: 50;
    /** @deprecated */
    readonly PEGI_SEX: 51;
    /** @deprecated */
    readonly PEGI_DRUGS: 52;
    /** @deprecated */
    readonly PEGI_FEAR: 53;
    /** @deprecated */
    readonly PEGI_DISCRIMINATION: 54;
    /** @deprecated */
    readonly PEGI_BAD_LANGUAGE: 55;
    /** @deprecated */
    readonly PEGI_GAMBLING: 56;
    /** @deprecated */
    readonly PEGI_ONLINE_GAMEPLAY: 57;
    /** @deprecated */
    readonly PEGI_IN_GAME_PURCHASES: 58;
    /** @deprecated */
    readonly CERO_LOVE: 59;
    /** @deprecated */
    readonly CERO_SEXUAL_CONTENT: 60;
    /** @deprecated */
    readonly CERO_VIOLENCE: 61;
    /** @deprecated */
    readonly CERO_HORROR: 62;
    /** @deprecated */
    readonly CERO_DRINKING_SMOKING: 63;
    /** @deprecated */
    readonly CERO_GAMBLING: 64;
    /** @deprecated */
    readonly CERO_CRIME: 65;
    /** @deprecated */
    readonly CERO_CONTROLLED_SUBSTANCES: 66;
    /** @deprecated */
    readonly CERO_LANGUAGES_AND_OTHERS: 67;
    /** @deprecated */
    readonly GRAC_SEXUALITY: 68;
    /** @deprecated */
    readonly GRAC_VIOLENCE: 69;
    /** @deprecated */
    readonly GRAC_FEAR_HORROR_THREATENING: 70;
    /** @deprecated */
    readonly GRAC_LANGUAGE: 71;
    /** @deprecated */
    readonly GRAC_ALCOHOL_TOBACCO_DRUG: 72;
    /** @deprecated */
    readonly GRAC_CRIME_ANTI_SOCIAL: 73;
    /** @deprecated */
    readonly GRAC_GAMBLING: 74;
    /** @deprecated */
    readonly CLASS_IND_VIOLENCIA: 75;
    /** @deprecated */
    readonly CLASS_IND_VIOLENCIA_EXTREMA: 76;
    /** @deprecated */
    readonly CLASS_IND_CONTEUDO_SEXUAL: 77;
    /** @deprecated */
    readonly CLASS_IND_NUDEZ: 78;
    /** @deprecated */
    readonly CLASS_IND_SEXO: 79;
    /** @deprecated */
    readonly CLASS_IND_SEXO_EXPLICITO: 80;
    /** @deprecated */
    readonly CLASS_IND_DROGAS: 81;
    /** @deprecated */
    readonly CLASS_IND_DROGAS_LICITAS: 82;
    /** @deprecated */
    readonly CLASS_IND_DROGAS_ILICITAS: 83;
    /** @deprecated */
    readonly CLASS_IND_LINGUAGEM_IMPROPRIA: 84;
    /** @deprecated */
    readonly CLASS_IND_ATOS_CRIMINOSOS: 85;
    readonly UNRECOGNIZED: -1;
};
export type AgeRatingContentDescriptionCategoryEnum = typeof AgeRatingContentDescriptionCategoryEnum[keyof typeof AgeRatingContentDescriptionCategoryEnum];
export declare namespace AgeRatingContentDescriptionCategoryEnum {
    type AGERATINGCONTENTDESCRIPTION_CATEGORY_NULL = typeof AgeRatingContentDescriptionCategoryEnum.AGERATINGCONTENTDESCRIPTION_CATEGORY_NULL;
    type ESRB_ALCOHOL_REFERENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_ALCOHOL_REFERENCE;
    type ESRB_ANIMATED_BLOOD = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_ANIMATED_BLOOD;
    type ESRB_BLOOD = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_BLOOD;
    type ESRB_BLOOD_AND_GORE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_BLOOD_AND_GORE;
    type ESRB_CARTOON_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_CARTOON_VIOLENCE;
    type ESRB_COMIC_MISCHIEF = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_COMIC_MISCHIEF;
    type ESRB_CRUDE_HUMOR = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_CRUDE_HUMOR;
    type ESRB_DRUG_REFERENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_DRUG_REFERENCE;
    type ESRB_FANTASY_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_FANTASY_VIOLENCE;
    type ESRB_INTENSE_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_INTENSE_VIOLENCE;
    type ESRB_LANGUAGE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_LANGUAGE;
    type ESRB_LYRICS = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_LYRICS;
    type ESRB_MATURE_HUMOR = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MATURE_HUMOR;
    type ESRB_NUDITY = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_NUDITY;
    type ESRB_PARTIAL_NUDITY = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_PARTIAL_NUDITY;
    type ESRB_REAL_GAMBLING = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_REAL_GAMBLING;
    type ESRB_SEXUAL_CONTENT = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_SEXUAL_CONTENT;
    type ESRB_SEXUAL_THEMES = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_SEXUAL_THEMES;
    type ESRB_SEXUAL_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_SEXUAL_VIOLENCE;
    type ESRB_SIMULATED_GAMBLING = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_SIMULATED_GAMBLING;
    type ESRB_STRONG_LANGUAGE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_STRONG_LANGUAGE;
    type ESRB_STRONG_LYRICS = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_STRONG_LYRICS;
    type ESRB_STRONG_SEXUAL_CONTENT = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_STRONG_SEXUAL_CONTENT;
    type ESRB_SUGGESTIVE_THEMES = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_SUGGESTIVE_THEMES;
    type ESRB_TOBACCO_REFERENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_TOBACCO_REFERENCE;
    type ESRB_USE_OF_ALCOHOL = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_USE_OF_ALCOHOL;
    type ESRB_USE_OF_DRUGS = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_USE_OF_DRUGS;
    type ESRB_USE_OF_TOBACCO = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_USE_OF_TOBACCO;
    type ESRB_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_VIOLENCE;
    type ESRB_VIOLENT_REFERENCES = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_VIOLENT_REFERENCES;
    type ESRB_ANIMATED_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_ANIMATED_VIOLENCE;
    type ESRB_MILD_LANGUAGE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_LANGUAGE;
    type ESRB_MILD_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_VIOLENCE;
    type ESRB_USE_OF_DRUGS_AND_ALCOHOL = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_USE_OF_DRUGS_AND_ALCOHOL;
    type ESRB_DRUG_AND_ALCOHOL_REFERENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_DRUG_AND_ALCOHOL_REFERENCE;
    type ESRB_MILD_SUGGESTIVE_THEMES = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_SUGGESTIVE_THEMES;
    type ESRB_MILD_CARTOON_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_CARTOON_VIOLENCE;
    type ESRB_MILD_BLOOD = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_BLOOD;
    type ESRB_REALISTIC_BLOOD_AND_GORE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_REALISTIC_BLOOD_AND_GORE;
    type ESRB_REALISTIC_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_REALISTIC_VIOLENCE;
    type ESRB_ALCOHOL_AND_TOBACCO_REFERENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_ALCOHOL_AND_TOBACCO_REFERENCE;
    type ESRB_MATURE_SEXUAL_THEMES = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MATURE_SEXUAL_THEMES;
    type ESRB_MILD_ANIMATED_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_ANIMATED_VIOLENCE;
    type ESRB_MILD_SEXUAL_THEMES = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_SEXUAL_THEMES;
    type ESRB_USE_OF_ALCOHOL_AND_TOBACCO = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_USE_OF_ALCOHOL_AND_TOBACCO;
    type ESRB_ANIMATED_BLOOD_AND_GORE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_ANIMATED_BLOOD_AND_GORE;
    type ESRB_MILD_FANTASY_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_FANTASY_VIOLENCE;
    type ESRB_MILD_LYRICS = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_MILD_LYRICS;
    type ESRB_REALISTIC_BLOOD = typeof AgeRatingContentDescriptionCategoryEnum.ESRB_REALISTIC_BLOOD;
    type PEGI_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_VIOLENCE;
    type PEGI_SEX = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_SEX;
    type PEGI_DRUGS = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_DRUGS;
    type PEGI_FEAR = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_FEAR;
    type PEGI_DISCRIMINATION = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_DISCRIMINATION;
    type PEGI_BAD_LANGUAGE = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_BAD_LANGUAGE;
    type PEGI_GAMBLING = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_GAMBLING;
    type PEGI_ONLINE_GAMEPLAY = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_ONLINE_GAMEPLAY;
    type PEGI_IN_GAME_PURCHASES = typeof AgeRatingContentDescriptionCategoryEnum.PEGI_IN_GAME_PURCHASES;
    type CERO_LOVE = typeof AgeRatingContentDescriptionCategoryEnum.CERO_LOVE;
    type CERO_SEXUAL_CONTENT = typeof AgeRatingContentDescriptionCategoryEnum.CERO_SEXUAL_CONTENT;
    type CERO_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.CERO_VIOLENCE;
    type CERO_HORROR = typeof AgeRatingContentDescriptionCategoryEnum.CERO_HORROR;
    type CERO_DRINKING_SMOKING = typeof AgeRatingContentDescriptionCategoryEnum.CERO_DRINKING_SMOKING;
    type CERO_GAMBLING = typeof AgeRatingContentDescriptionCategoryEnum.CERO_GAMBLING;
    type CERO_CRIME = typeof AgeRatingContentDescriptionCategoryEnum.CERO_CRIME;
    type CERO_CONTROLLED_SUBSTANCES = typeof AgeRatingContentDescriptionCategoryEnum.CERO_CONTROLLED_SUBSTANCES;
    type CERO_LANGUAGES_AND_OTHERS = typeof AgeRatingContentDescriptionCategoryEnum.CERO_LANGUAGES_AND_OTHERS;
    type GRAC_SEXUALITY = typeof AgeRatingContentDescriptionCategoryEnum.GRAC_SEXUALITY;
    type GRAC_VIOLENCE = typeof AgeRatingContentDescriptionCategoryEnum.GRAC_VIOLENCE;
    type GRAC_FEAR_HORROR_THREATENING = typeof AgeRatingContentDescriptionCategoryEnum.GRAC_FEAR_HORROR_THREATENING;
    type GRAC_LANGUAGE = typeof AgeRatingContentDescriptionCategoryEnum.GRAC_LANGUAGE;
    type GRAC_ALCOHOL_TOBACCO_DRUG = typeof AgeRatingContentDescriptionCategoryEnum.GRAC_ALCOHOL_TOBACCO_DRUG;
    type GRAC_CRIME_ANTI_SOCIAL = typeof AgeRatingContentDescriptionCategoryEnum.GRAC_CRIME_ANTI_SOCIAL;
    type GRAC_GAMBLING = typeof AgeRatingContentDescriptionCategoryEnum.GRAC_GAMBLING;
    type CLASS_IND_VIOLENCIA = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_VIOLENCIA;
    type CLASS_IND_VIOLENCIA_EXTREMA = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_VIOLENCIA_EXTREMA;
    type CLASS_IND_CONTEUDO_SEXUAL = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_CONTEUDO_SEXUAL;
    type CLASS_IND_NUDEZ = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_NUDEZ;
    type CLASS_IND_SEXO = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_SEXO;
    type CLASS_IND_SEXO_EXPLICITO = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_SEXO_EXPLICITO;
    type CLASS_IND_DROGAS = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_DROGAS;
    type CLASS_IND_DROGAS_LICITAS = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_DROGAS_LICITAS;
    type CLASS_IND_DROGAS_ILICITAS = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_DROGAS_ILICITAS;
    type CLASS_IND_LINGUAGEM_IMPROPRIA = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_LINGUAGEM_IMPROPRIA;
    type CLASS_IND_ATOS_CRIMINOSOS = typeof AgeRatingContentDescriptionCategoryEnum.CLASS_IND_ATOS_CRIMINOSOS;
    type UNRECOGNIZED = typeof AgeRatingContentDescriptionCategoryEnum.UNRECOGNIZED;
}
export declare function ageRatingContentDescriptionCategoryEnumFromJSON(object: any): AgeRatingContentDescriptionCategoryEnum;
export declare function ageRatingContentDescriptionCategoryEnumToJSON(object: AgeRatingContentDescriptionCategoryEnum): string;
export declare const GenderGenderEnum: {
    /** @deprecated */
    readonly MALE: 0;
    /** @deprecated */
    readonly FEMALE: 1;
    /** @deprecated */
    readonly OTHER: 2;
    readonly UNRECOGNIZED: -1;
};
export type GenderGenderEnum = typeof GenderGenderEnum[keyof typeof GenderGenderEnum];
export declare namespace GenderGenderEnum {
    type MALE = typeof GenderGenderEnum.MALE;
    type FEMALE = typeof GenderGenderEnum.FEMALE;
    type OTHER = typeof GenderGenderEnum.OTHER;
    type UNRECOGNIZED = typeof GenderGenderEnum.UNRECOGNIZED;
}
export declare function genderGenderEnumFromJSON(object: any): GenderGenderEnum;
export declare function genderGenderEnumToJSON(object: GenderGenderEnum): string;
export declare const CharacterSpeciesEnum: {
    /** @deprecated */
    readonly CHARACTER_SPECIES_NULL: 0;
    /** @deprecated */
    readonly HUMAN: 1;
    /** @deprecated */
    readonly ALIEN: 2;
    /** @deprecated */
    readonly ANIMAL: 3;
    /** @deprecated */
    readonly ANDROID: 4;
    /** @deprecated */
    readonly UNKNOWN: 5;
    readonly UNRECOGNIZED: -1;
};
export type CharacterSpeciesEnum = typeof CharacterSpeciesEnum[keyof typeof CharacterSpeciesEnum];
export declare namespace CharacterSpeciesEnum {
    type CHARACTER_SPECIES_NULL = typeof CharacterSpeciesEnum.CHARACTER_SPECIES_NULL;
    type HUMAN = typeof CharacterSpeciesEnum.HUMAN;
    type ALIEN = typeof CharacterSpeciesEnum.ALIEN;
    type ANIMAL = typeof CharacterSpeciesEnum.ANIMAL;
    type ANDROID = typeof CharacterSpeciesEnum.ANDROID;
    type UNKNOWN = typeof CharacterSpeciesEnum.UNKNOWN;
    type UNRECOGNIZED = typeof CharacterSpeciesEnum.UNRECOGNIZED;
}
export declare function characterSpeciesEnumFromJSON(object: any): CharacterSpeciesEnum;
export declare function characterSpeciesEnumToJSON(object: CharacterSpeciesEnum): string;
export declare const DateFormatChangeDateCategoryEnum: {
    /** @deprecated */
    readonly YYYYMMMMDD: 0;
    /** @deprecated */
    readonly YYYYMMMM: 1;
    /** @deprecated */
    readonly YYYY: 2;
    /** @deprecated */
    readonly YYYYQ1: 3;
    /** @deprecated */
    readonly YYYYQ2: 4;
    /** @deprecated */
    readonly YYYYQ3: 5;
    /** @deprecated */
    readonly YYYYQ4: 6;
    /** @deprecated */
    readonly TBD: 7;
    readonly UNRECOGNIZED: -1;
};
export type DateFormatChangeDateCategoryEnum = typeof DateFormatChangeDateCategoryEnum[keyof typeof DateFormatChangeDateCategoryEnum];
export declare namespace DateFormatChangeDateCategoryEnum {
    type YYYYMMMMDD = typeof DateFormatChangeDateCategoryEnum.YYYYMMMMDD;
    type YYYYMMMM = typeof DateFormatChangeDateCategoryEnum.YYYYMMMM;
    type YYYY = typeof DateFormatChangeDateCategoryEnum.YYYY;
    type YYYYQ1 = typeof DateFormatChangeDateCategoryEnum.YYYYQ1;
    type YYYYQ2 = typeof DateFormatChangeDateCategoryEnum.YYYYQ2;
    type YYYYQ3 = typeof DateFormatChangeDateCategoryEnum.YYYYQ3;
    type YYYYQ4 = typeof DateFormatChangeDateCategoryEnum.YYYYQ4;
    type TBD = typeof DateFormatChangeDateCategoryEnum.TBD;
    type UNRECOGNIZED = typeof DateFormatChangeDateCategoryEnum.UNRECOGNIZED;
}
export declare function dateFormatChangeDateCategoryEnumFromJSON(object: any): DateFormatChangeDateCategoryEnum;
export declare function dateFormatChangeDateCategoryEnumToJSON(object: DateFormatChangeDateCategoryEnum): string;
export declare const WebsiteCategoryEnum: {
    /** @deprecated */
    readonly WEBSITE_CATEGORY_NULL: 0;
    /** @deprecated */
    readonly WEBSITE_OFFICIAL: 1;
    /** @deprecated */
    readonly WEBSITE_WIKIA: 2;
    /** @deprecated */
    readonly WEBSITE_WIKIPEDIA: 3;
    /** @deprecated */
    readonly WEBSITE_FACEBOOK: 4;
    /** @deprecated */
    readonly WEBSITE_TWITTER: 5;
    /** @deprecated */
    readonly WEBSITE_TWITCH: 6;
    /** @deprecated */
    readonly WEBSITE_INSTAGRAM: 8;
    /** @deprecated */
    readonly WEBSITE_YOUTUBE: 9;
    /** @deprecated */
    readonly WEBSITE_IPHONE: 10;
    /** @deprecated */
    readonly WEBSITE_IPAD: 11;
    /** @deprecated */
    readonly WEBSITE_ANDROID: 12;
    /** @deprecated */
    readonly WEBSITE_STEAM: 13;
    /** @deprecated */
    readonly WEBSITE_REDDIT: 14;
    /** @deprecated */
    readonly WEBSITE_ITCH: 15;
    /** @deprecated */
    readonly WEBSITE_EPICGAMES: 16;
    /** @deprecated */
    readonly WEBSITE_GOG: 17;
    /** @deprecated */
    readonly WEBSITE_DISCORD: 18;
    /** @deprecated */
    readonly WEBSITE_BLUESKY: 19;
    readonly UNRECOGNIZED: -1;
};
export type WebsiteCategoryEnum = typeof WebsiteCategoryEnum[keyof typeof WebsiteCategoryEnum];
export declare namespace WebsiteCategoryEnum {
    type WEBSITE_CATEGORY_NULL = typeof WebsiteCategoryEnum.WEBSITE_CATEGORY_NULL;
    type WEBSITE_OFFICIAL = typeof WebsiteCategoryEnum.WEBSITE_OFFICIAL;
    type WEBSITE_WIKIA = typeof WebsiteCategoryEnum.WEBSITE_WIKIA;
    type WEBSITE_WIKIPEDIA = typeof WebsiteCategoryEnum.WEBSITE_WIKIPEDIA;
    type WEBSITE_FACEBOOK = typeof WebsiteCategoryEnum.WEBSITE_FACEBOOK;
    type WEBSITE_TWITTER = typeof WebsiteCategoryEnum.WEBSITE_TWITTER;
    type WEBSITE_TWITCH = typeof WebsiteCategoryEnum.WEBSITE_TWITCH;
    type WEBSITE_INSTAGRAM = typeof WebsiteCategoryEnum.WEBSITE_INSTAGRAM;
    type WEBSITE_YOUTUBE = typeof WebsiteCategoryEnum.WEBSITE_YOUTUBE;
    type WEBSITE_IPHONE = typeof WebsiteCategoryEnum.WEBSITE_IPHONE;
    type WEBSITE_IPAD = typeof WebsiteCategoryEnum.WEBSITE_IPAD;
    type WEBSITE_ANDROID = typeof WebsiteCategoryEnum.WEBSITE_ANDROID;
    type WEBSITE_STEAM = typeof WebsiteCategoryEnum.WEBSITE_STEAM;
    type WEBSITE_REDDIT = typeof WebsiteCategoryEnum.WEBSITE_REDDIT;
    type WEBSITE_ITCH = typeof WebsiteCategoryEnum.WEBSITE_ITCH;
    type WEBSITE_EPICGAMES = typeof WebsiteCategoryEnum.WEBSITE_EPICGAMES;
    type WEBSITE_GOG = typeof WebsiteCategoryEnum.WEBSITE_GOG;
    type WEBSITE_DISCORD = typeof WebsiteCategoryEnum.WEBSITE_DISCORD;
    type WEBSITE_BLUESKY = typeof WebsiteCategoryEnum.WEBSITE_BLUESKY;
    type UNRECOGNIZED = typeof WebsiteCategoryEnum.UNRECOGNIZED;
}
export declare function websiteCategoryEnumFromJSON(object: any): WebsiteCategoryEnum;
export declare function websiteCategoryEnumToJSON(object: WebsiteCategoryEnum): string;
export declare const ExternalGameCategoryEnum: {
    /** @deprecated */
    readonly EXTERNALGAME_CATEGORY_NULL: 0;
    /** @deprecated */
    readonly EXTERNALGAME_STEAM: 1;
    /** @deprecated */
    readonly EXTERNALGAME_GOG: 5;
    /** @deprecated */
    readonly EXTERNALGAME_YOUTUBE: 10;
    /** @deprecated */
    readonly EXTERNALGAME_MICROSOFT: 11;
    /** @deprecated */
    readonly EXTERNALGAME_APPLE: 13;
    /** @deprecated */
    readonly EXTERNALGAME_TWITCH: 14;
    /** @deprecated */
    readonly EXTERNALGAME_ANDROID: 15;
    /** @deprecated */
    readonly EXTERNALGAME_AMAZON_ASIN: 20;
    /** @deprecated */
    readonly EXTERNALGAME_AMAZON_LUNA: 22;
    /** @deprecated */
    readonly EXTERNALGAME_AMAZON_ADG: 23;
    /** @deprecated */
    readonly EXTERNALGAME_EPIC_GAME_STORE: 26;
    /** @deprecated */
    readonly EXTERNALGAME_OCULUS: 28;
    /** @deprecated */
    readonly EXTERNALGAME_UTOMIK: 29;
    /** @deprecated */
    readonly EXTERNALGAME_ITCH_IO: 30;
    /** @deprecated */
    readonly EXTERNALGAME_XBOX_MARKETPLACE: 31;
    /** @deprecated */
    readonly EXTERNALGAME_KARTRIDGE: 32;
    /** @deprecated */
    readonly EXTERNALGAME_PLAYSTATION_STORE_US: 36;
    /** @deprecated */
    readonly EXTERNALGAME_FOCUS_ENTERTAINMENT: 37;
    /** @deprecated */
    readonly EXTERNALGAME_XBOX_GAME_PASS_ULTIMATE_CLOUD: 54;
    /** @deprecated */
    readonly EXTERNALGAME_GAMEJOLT: 55;
    readonly UNRECOGNIZED: -1;
};
export type ExternalGameCategoryEnum = typeof ExternalGameCategoryEnum[keyof typeof ExternalGameCategoryEnum];
export declare namespace ExternalGameCategoryEnum {
    type EXTERNALGAME_CATEGORY_NULL = typeof ExternalGameCategoryEnum.EXTERNALGAME_CATEGORY_NULL;
    type EXTERNALGAME_STEAM = typeof ExternalGameCategoryEnum.EXTERNALGAME_STEAM;
    type EXTERNALGAME_GOG = typeof ExternalGameCategoryEnum.EXTERNALGAME_GOG;
    type EXTERNALGAME_YOUTUBE = typeof ExternalGameCategoryEnum.EXTERNALGAME_YOUTUBE;
    type EXTERNALGAME_MICROSOFT = typeof ExternalGameCategoryEnum.EXTERNALGAME_MICROSOFT;
    type EXTERNALGAME_APPLE = typeof ExternalGameCategoryEnum.EXTERNALGAME_APPLE;
    type EXTERNALGAME_TWITCH = typeof ExternalGameCategoryEnum.EXTERNALGAME_TWITCH;
    type EXTERNALGAME_ANDROID = typeof ExternalGameCategoryEnum.EXTERNALGAME_ANDROID;
    type EXTERNALGAME_AMAZON_ASIN = typeof ExternalGameCategoryEnum.EXTERNALGAME_AMAZON_ASIN;
    type EXTERNALGAME_AMAZON_LUNA = typeof ExternalGameCategoryEnum.EXTERNALGAME_AMAZON_LUNA;
    type EXTERNALGAME_AMAZON_ADG = typeof ExternalGameCategoryEnum.EXTERNALGAME_AMAZON_ADG;
    type EXTERNALGAME_EPIC_GAME_STORE = typeof ExternalGameCategoryEnum.EXTERNALGAME_EPIC_GAME_STORE;
    type EXTERNALGAME_OCULUS = typeof ExternalGameCategoryEnum.EXTERNALGAME_OCULUS;
    type EXTERNALGAME_UTOMIK = typeof ExternalGameCategoryEnum.EXTERNALGAME_UTOMIK;
    type EXTERNALGAME_ITCH_IO = typeof ExternalGameCategoryEnum.EXTERNALGAME_ITCH_IO;
    type EXTERNALGAME_XBOX_MARKETPLACE = typeof ExternalGameCategoryEnum.EXTERNALGAME_XBOX_MARKETPLACE;
    type EXTERNALGAME_KARTRIDGE = typeof ExternalGameCategoryEnum.EXTERNALGAME_KARTRIDGE;
    type EXTERNALGAME_PLAYSTATION_STORE_US = typeof ExternalGameCategoryEnum.EXTERNALGAME_PLAYSTATION_STORE_US;
    type EXTERNALGAME_FOCUS_ENTERTAINMENT = typeof ExternalGameCategoryEnum.EXTERNALGAME_FOCUS_ENTERTAINMENT;
    type EXTERNALGAME_XBOX_GAME_PASS_ULTIMATE_CLOUD = typeof ExternalGameCategoryEnum.EXTERNALGAME_XBOX_GAME_PASS_ULTIMATE_CLOUD;
    type EXTERNALGAME_GAMEJOLT = typeof ExternalGameCategoryEnum.EXTERNALGAME_GAMEJOLT;
    type UNRECOGNIZED = typeof ExternalGameCategoryEnum.UNRECOGNIZED;
}
export declare function externalGameCategoryEnumFromJSON(object: any): ExternalGameCategoryEnum;
export declare function externalGameCategoryEnumToJSON(object: ExternalGameCategoryEnum): string;
export declare const ExternalGameMediaEnum: {
    /** @deprecated */
    readonly EXTERNALGAME_MEDIA_NULL: 0;
    /** @deprecated */
    readonly EXTERNALGAME_DIGITAL: 1;
    /** @deprecated */
    readonly EXTERNALGAME_PHYSICAL: 2;
    readonly UNRECOGNIZED: -1;
};
export type ExternalGameMediaEnum = typeof ExternalGameMediaEnum[keyof typeof ExternalGameMediaEnum];
export declare namespace ExternalGameMediaEnum {
    type EXTERNALGAME_MEDIA_NULL = typeof ExternalGameMediaEnum.EXTERNALGAME_MEDIA_NULL;
    type EXTERNALGAME_DIGITAL = typeof ExternalGameMediaEnum.EXTERNALGAME_DIGITAL;
    type EXTERNALGAME_PHYSICAL = typeof ExternalGameMediaEnum.EXTERNALGAME_PHYSICAL;
    type UNRECOGNIZED = typeof ExternalGameMediaEnum.UNRECOGNIZED;
}
export declare function externalGameMediaEnumFromJSON(object: any): ExternalGameMediaEnum;
export declare function externalGameMediaEnumToJSON(object: ExternalGameMediaEnum): string;
export declare const GameCategoryEnum: {
    /** @deprecated */
    readonly MAIN_GAME: 0;
    /** @deprecated */
    readonly DLC_ADDON: 1;
    /** @deprecated */
    readonly EXPANSION: 2;
    /** @deprecated */
    readonly BUNDLE: 3;
    /** @deprecated */
    readonly STANDALONE_EXPANSION: 4;
    /** @deprecated */
    readonly MOD: 5;
    /** @deprecated */
    readonly EPISODE: 6;
    /** @deprecated */
    readonly SEASON: 7;
    /** @deprecated */
    readonly REMAKE: 8;
    /** @deprecated */
    readonly REMASTER: 9;
    /** @deprecated */
    readonly EXPANDED_GAME: 10;
    /** @deprecated */
    readonly PORT: 11;
    /** @deprecated */
    readonly FORK: 12;
    /** @deprecated */
    readonly PACK: 13;
    /** @deprecated */
    readonly UPDATE: 14;
    readonly UNRECOGNIZED: -1;
};
export type GameCategoryEnum = typeof GameCategoryEnum[keyof typeof GameCategoryEnum];
export declare namespace GameCategoryEnum {
    type MAIN_GAME = typeof GameCategoryEnum.MAIN_GAME;
    type DLC_ADDON = typeof GameCategoryEnum.DLC_ADDON;
    type EXPANSION = typeof GameCategoryEnum.EXPANSION;
    type BUNDLE = typeof GameCategoryEnum.BUNDLE;
    type STANDALONE_EXPANSION = typeof GameCategoryEnum.STANDALONE_EXPANSION;
    type MOD = typeof GameCategoryEnum.MOD;
    type EPISODE = typeof GameCategoryEnum.EPISODE;
    type SEASON = typeof GameCategoryEnum.SEASON;
    type REMAKE = typeof GameCategoryEnum.REMAKE;
    type REMASTER = typeof GameCategoryEnum.REMASTER;
    type EXPANDED_GAME = typeof GameCategoryEnum.EXPANDED_GAME;
    type PORT = typeof GameCategoryEnum.PORT;
    type FORK = typeof GameCategoryEnum.FORK;
    type PACK = typeof GameCategoryEnum.PACK;
    type UPDATE = typeof GameCategoryEnum.UPDATE;
    type UNRECOGNIZED = typeof GameCategoryEnum.UNRECOGNIZED;
}
export declare function gameCategoryEnumFromJSON(object: any): GameCategoryEnum;
export declare function gameCategoryEnumToJSON(object: GameCategoryEnum): string;
export declare const GameStatusEnum: {
    /** @deprecated */
    readonly RELEASED: 0;
    /** @deprecated */
    readonly ALPHA: 2;
    /** @deprecated */
    readonly BETA: 3;
    /** @deprecated */
    readonly EARLY_ACCESS: 4;
    /** @deprecated */
    readonly OFFLINE: 5;
    /** @deprecated */
    readonly CANCELLED: 6;
    /** @deprecated */
    readonly RUMORED: 7;
    /** @deprecated */
    readonly DELISTED: 8;
    readonly UNRECOGNIZED: -1;
};
export type GameStatusEnum = typeof GameStatusEnum[keyof typeof GameStatusEnum];
export declare namespace GameStatusEnum {
    type RELEASED = typeof GameStatusEnum.RELEASED;
    type ALPHA = typeof GameStatusEnum.ALPHA;
    type BETA = typeof GameStatusEnum.BETA;
    type EARLY_ACCESS = typeof GameStatusEnum.EARLY_ACCESS;
    type OFFLINE = typeof GameStatusEnum.OFFLINE;
    type CANCELLED = typeof GameStatusEnum.CANCELLED;
    type RUMORED = typeof GameStatusEnum.RUMORED;
    type DELISTED = typeof GameStatusEnum.DELISTED;
    type UNRECOGNIZED = typeof GameStatusEnum.UNRECOGNIZED;
}
export declare function gameStatusEnumFromJSON(object: any): GameStatusEnum;
export declare function gameStatusEnumToJSON(object: GameStatusEnum): string;
export declare const GameVersionFeatureCategoryEnum: {
    readonly BOOLEAN: 0;
    readonly DESCRIPTION: 1;
    readonly UNRECOGNIZED: -1;
};
export type GameVersionFeatureCategoryEnum = typeof GameVersionFeatureCategoryEnum[keyof typeof GameVersionFeatureCategoryEnum];
export declare namespace GameVersionFeatureCategoryEnum {
    type BOOLEAN = typeof GameVersionFeatureCategoryEnum.BOOLEAN;
    type DESCRIPTION = typeof GameVersionFeatureCategoryEnum.DESCRIPTION;
    type UNRECOGNIZED = typeof GameVersionFeatureCategoryEnum.UNRECOGNIZED;
}
export declare function gameVersionFeatureCategoryEnumFromJSON(object: any): GameVersionFeatureCategoryEnum;
export declare function gameVersionFeatureCategoryEnumToJSON(object: GameVersionFeatureCategoryEnum): string;
export declare const GameVersionFeatureValueIncludedFeatureEnum: {
    readonly NOT_INCLUDED: 0;
    readonly INCLUDED: 1;
    readonly PRE_ORDER_ONLY: 2;
    readonly UNRECOGNIZED: -1;
};
export type GameVersionFeatureValueIncludedFeatureEnum = typeof GameVersionFeatureValueIncludedFeatureEnum[keyof typeof GameVersionFeatureValueIncludedFeatureEnum];
export declare namespace GameVersionFeatureValueIncludedFeatureEnum {
    type NOT_INCLUDED = typeof GameVersionFeatureValueIncludedFeatureEnum.NOT_INCLUDED;
    type INCLUDED = typeof GameVersionFeatureValueIncludedFeatureEnum.INCLUDED;
    type PRE_ORDER_ONLY = typeof GameVersionFeatureValueIncludedFeatureEnum.PRE_ORDER_ONLY;
    type UNRECOGNIZED = typeof GameVersionFeatureValueIncludedFeatureEnum.UNRECOGNIZED;
}
export declare function gameVersionFeatureValueIncludedFeatureEnumFromJSON(object: any): GameVersionFeatureValueIncludedFeatureEnum;
export declare function gameVersionFeatureValueIncludedFeatureEnumToJSON(object: GameVersionFeatureValueIncludedFeatureEnum): string;
export declare const PlatformCategoryEnum: {
    /** @deprecated */
    readonly PLATFORM_CATEGORY_NULL: 0;
    /** @deprecated */
    readonly CONSOLE: 1;
    /** @deprecated */
    readonly ARCADE: 2;
    /** @deprecated */
    readonly PLATFORM: 3;
    /** @deprecated */
    readonly OPERATING_SYSTEM: 4;
    /** @deprecated */
    readonly PORTABLE_CONSOLE: 5;
    /** @deprecated */
    readonly COMPUTER: 6;
    readonly UNRECOGNIZED: -1;
};
export type PlatformCategoryEnum = typeof PlatformCategoryEnum[keyof typeof PlatformCategoryEnum];
export declare namespace PlatformCategoryEnum {
    type PLATFORM_CATEGORY_NULL = typeof PlatformCategoryEnum.PLATFORM_CATEGORY_NULL;
    type CONSOLE = typeof PlatformCategoryEnum.CONSOLE;
    type ARCADE = typeof PlatformCategoryEnum.ARCADE;
    type PLATFORM = typeof PlatformCategoryEnum.PLATFORM;
    type OPERATING_SYSTEM = typeof PlatformCategoryEnum.OPERATING_SYSTEM;
    type PORTABLE_CONSOLE = typeof PlatformCategoryEnum.PORTABLE_CONSOLE;
    type COMPUTER = typeof PlatformCategoryEnum.COMPUTER;
    type UNRECOGNIZED = typeof PlatformCategoryEnum.UNRECOGNIZED;
}
export declare function platformCategoryEnumFromJSON(object: any): PlatformCategoryEnum;
export declare function platformCategoryEnumToJSON(object: PlatformCategoryEnum): string;
export declare const RegionRegionEnum: {
    /** @deprecated */
    readonly REGION_REGION_NULL: 0;
    /** @deprecated */
    readonly EUROPE: 1;
    /** @deprecated */
    readonly NORTH_AMERICA: 2;
    /** @deprecated */
    readonly AUSTRALIA: 3;
    /** @deprecated */
    readonly NEW_ZEALAND: 4;
    /** @deprecated */
    readonly JAPAN: 5;
    /** @deprecated */
    readonly CHINA: 6;
    /** @deprecated */
    readonly ASIA: 7;
    /** @deprecated */
    readonly WORLDWIDE: 8;
    /** @deprecated */
    readonly KOREA: 9;
    /** @deprecated */
    readonly BRAZIL: 10;
    readonly UNRECOGNIZED: -1;
};
export type RegionRegionEnum = typeof RegionRegionEnum[keyof typeof RegionRegionEnum];
export declare namespace RegionRegionEnum {
    type REGION_REGION_NULL = typeof RegionRegionEnum.REGION_REGION_NULL;
    type EUROPE = typeof RegionRegionEnum.EUROPE;
    type NORTH_AMERICA = typeof RegionRegionEnum.NORTH_AMERICA;
    type AUSTRALIA = typeof RegionRegionEnum.AUSTRALIA;
    type NEW_ZEALAND = typeof RegionRegionEnum.NEW_ZEALAND;
    type JAPAN = typeof RegionRegionEnum.JAPAN;
    type CHINA = typeof RegionRegionEnum.CHINA;
    type ASIA = typeof RegionRegionEnum.ASIA;
    type WORLDWIDE = typeof RegionRegionEnum.WORLDWIDE;
    type KOREA = typeof RegionRegionEnum.KOREA;
    type BRAZIL = typeof RegionRegionEnum.BRAZIL;
    type UNRECOGNIZED = typeof RegionRegionEnum.UNRECOGNIZED;
}
export declare function regionRegionEnumFromJSON(object: any): RegionRegionEnum;
export declare function regionRegionEnumToJSON(object: RegionRegionEnum): string;
export declare const PopularitySourcePopularitySourceEnum: {
    /** @deprecated */
    readonly POPULARITYSOURCE_POPULARITY_SOURCE_NULL: 0;
    /** @deprecated */
    readonly IGDB: 121;
    readonly UNRECOGNIZED: -1;
};
export type PopularitySourcePopularitySourceEnum = typeof PopularitySourcePopularitySourceEnum[keyof typeof PopularitySourcePopularitySourceEnum];
export declare namespace PopularitySourcePopularitySourceEnum {
    type POPULARITYSOURCE_POPULARITY_SOURCE_NULL = typeof PopularitySourcePopularitySourceEnum.POPULARITYSOURCE_POPULARITY_SOURCE_NULL;
    type IGDB = typeof PopularitySourcePopularitySourceEnum.IGDB;
    type UNRECOGNIZED = typeof PopularitySourcePopularitySourceEnum.UNRECOGNIZED;
}
export declare function popularitySourcePopularitySourceEnumFromJSON(object: any): PopularitySourcePopularitySourceEnum;
export declare function popularitySourcePopularitySourceEnumToJSON(object: PopularitySourcePopularitySourceEnum): string;
export declare const TestDummyEnumTestEnum: {
    readonly TESTDUMMY_ENUM_TEST_NULL: 0;
    readonly ENUM1: 1;
    readonly ENUM2: 2;
    readonly UNRECOGNIZED: -1;
};
export type TestDummyEnumTestEnum = typeof TestDummyEnumTestEnum[keyof typeof TestDummyEnumTestEnum];
export declare namespace TestDummyEnumTestEnum {
    type TESTDUMMY_ENUM_TEST_NULL = typeof TestDummyEnumTestEnum.TESTDUMMY_ENUM_TEST_NULL;
    type ENUM1 = typeof TestDummyEnumTestEnum.ENUM1;
    type ENUM2 = typeof TestDummyEnumTestEnum.ENUM2;
    type UNRECOGNIZED = typeof TestDummyEnumTestEnum.UNRECOGNIZED;
}
export declare function testDummyEnumTestEnumFromJSON(object: any): TestDummyEnumTestEnum;
export declare function testDummyEnumTestEnumToJSON(object: TestDummyEnumTestEnum): string;
export interface Count {
    count: number;
}
export interface MultiQueryResult {
    name: string;
    results: Uint8Array[];
    count: number;
}
export interface MultiQueryResultArray {
    result: MultiQueryResult[];
}
export interface AgeRatingResult {
    ageratings: AgeRating[];
}
export interface AgeRating {
    id: number;
    /** @deprecated */
    category: AgeRatingCategoryEnum;
    contentDescriptions: AgeRatingContentDescription[];
    /** @deprecated */
    rating: AgeRatingRatingEnum;
    ratingCoverUrl: string;
    synopsis: string;
    checksum: string;
    organization?: AgeRatingOrganization | undefined;
    ratingCategory?: AgeRatingCategory | undefined;
    ratingContentDescriptions: AgeRatingContentDescriptionV2[];
}
export interface AgeRatingCategoryResult {
    ageratingcategories: AgeRatingCategory[];
}
export interface AgeRatingCategory {
    id: number;
    rating: string;
    organization?: AgeRatingOrganization | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface AgeRatingContentDescriptionResult {
    ageratingcontentdescriptions: AgeRatingContentDescription[];
}
export interface AgeRatingContentDescription {
    id: number;
    /** @deprecated */
    category: AgeRatingContentDescriptionCategoryEnum;
    description: string;
    checksum: string;
}
export interface AgeRatingContentDescriptionV2Result {
    ageratingcontentdescriptionsv2: AgeRatingContentDescriptionV2[];
}
export interface AgeRatingContentDescriptionV2 {
    id: number;
    description: string;
    organization?: AgeRatingOrganization | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface AgeRatingOrganizationResult {
    ageratingorganizations: AgeRatingOrganization[];
}
export interface AgeRatingOrganization {
    id: number;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface AlternativeNameResult {
    alternativenames: AlternativeName[];
}
export interface AlternativeName {
    id: number;
    comment: string;
    game?: Game | undefined;
    name: string;
    checksum: string;
}
export interface ArtworkResult {
    artworks: Artwork[];
}
export interface Artwork {
    id: number;
    alphaChannel: boolean;
    animated: boolean;
    game?: Game | undefined;
    height: number;
    imageId: string;
    url: string;
    width: number;
    checksum: string;
}
export interface CharacterResult {
    characters: Character[];
}
export interface Character {
    id: number;
    akas: string[];
    countryName: string;
    createdAt?: Timestamp | undefined;
    description: string;
    games: Game[];
    /** @deprecated */
    gender: GenderGenderEnum;
    mugShot?: CharacterMugShot | undefined;
    name: string;
    slug: string;
    /** @deprecated */
    species: CharacterSpeciesEnum;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
    characterGender?: CharacterGender | undefined;
    characterSpecies?: CharacterSpecie | undefined;
}
export interface CharacterGenderResult {
    charactergenders: CharacterGender[];
}
export interface CharacterGender {
    id: number;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface CharacterMugShotResult {
    charactermugshots: CharacterMugShot[];
}
export interface CharacterMugShot {
    id: number;
    alphaChannel: boolean;
    animated: boolean;
    height: number;
    imageId: string;
    url: string;
    width: number;
    checksum: string;
}
export interface CharacterSpecieResult {
    characterspecies: CharacterSpecie[];
}
export interface CharacterSpecie {
    id: number;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface CollectionResult {
    collections: Collection[];
}
export interface Collection {
    id: number;
    createdAt?: Timestamp | undefined;
    games: Game[];
    name: string;
    slug: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
    type?: CollectionType | undefined;
    asParentRelations: CollectionRelation[];
    asChildRelations: CollectionRelation[];
}
export interface CollectionMembershipResult {
    collectionmemberships: CollectionMembership[];
}
export interface CollectionMembership {
    id: number;
    game?: Game | undefined;
    collection?: Collection | undefined;
    type?: CollectionMembershipType | undefined;
    updatedAt?: Timestamp | undefined;
    createdAt?: Timestamp | undefined;
    checksum: string;
}
export interface CollectionMembershipTypeResult {
    collectionmembershiptypes: CollectionMembershipType[];
}
export interface CollectionMembershipType {
    id: number;
    name: string;
    description: string;
    allowedCollectionType?: CollectionType | undefined;
    updatedAt?: Timestamp | undefined;
    createdAt?: Timestamp | undefined;
    checksum: string;
}
export interface CollectionRelationResult {
    collectionrelations: CollectionRelation[];
}
export interface CollectionRelation {
    id: number;
    childCollection?: Collection | undefined;
    parentCollection?: Collection | undefined;
    type?: CollectionRelationType | undefined;
    updatedAt?: Timestamp | undefined;
    createdAt?: Timestamp | undefined;
    checksum: string;
}
export interface CollectionRelationTypeResult {
    collectionrelationtypes: CollectionRelationType[];
}
export interface CollectionRelationType {
    id: number;
    name: string;
    description: string;
    allowedChildType?: CollectionType | undefined;
    allowedParentType?: CollectionType | undefined;
    updatedAt?: Timestamp | undefined;
    createdAt?: Timestamp | undefined;
    checksum: string;
}
export interface CollectionTypeResult {
    collectiontypes: CollectionType[];
}
export interface CollectionType {
    id: number;
    name: string;
    description: string;
    updatedAt?: Timestamp | undefined;
    createdAt?: Timestamp | undefined;
    checksum: string;
}
export interface CompanyResult {
    companies: Company[];
}
export interface Company {
    id: number;
    changeDate?: Timestamp | undefined;
    /** @deprecated */
    changeDateCategory: DateFormatChangeDateCategoryEnum;
    changedCompanyId?: Company | undefined;
    country: number;
    createdAt?: Timestamp | undefined;
    description: string;
    developed: Game[];
    logo?: CompanyLogo | undefined;
    name: string;
    parent?: Company | undefined;
    published: Game[];
    slug: string;
    startDate?: Timestamp | undefined;
    /** @deprecated */
    startDateCategory: DateFormatChangeDateCategoryEnum;
    updatedAt?: Timestamp | undefined;
    url: string;
    websites: CompanyWebsite[];
    checksum: string;
    status?: CompanyStatus | undefined;
    startDateFormat?: DateFormat | undefined;
    changeDateFormat?: DateFormat | undefined;
}
export interface CompanyLogoResult {
    companylogos: CompanyLogo[];
}
export interface CompanyLogo {
    id: number;
    alphaChannel: boolean;
    animated: boolean;
    height: number;
    imageId: string;
    url: string;
    width: number;
    checksum: string;
}
export interface CompanyStatusResult {
    companystatuses: CompanyStatus[];
}
export interface CompanyStatus {
    id: number;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface CompanyWebsiteResult {
    companywebsites: CompanyWebsite[];
}
export interface CompanyWebsite {
    id: number;
    /** @deprecated */
    category: WebsiteCategoryEnum;
    trusted: boolean;
    url: string;
    checksum: string;
    type?: WebsiteType | undefined;
}
export interface CoverResult {
    covers: Cover[];
}
export interface Cover {
    id: number;
    alphaChannel: boolean;
    animated: boolean;
    game?: Game | undefined;
    height: number;
    imageId: string;
    url: string;
    width: number;
    checksum: string;
    gameLocalization?: GameLocalization | undefined;
}
export interface DateFormatResult {
    dateformats: DateFormat[];
}
export interface DateFormat {
    id: number;
    format: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface EventResult {
    events: Event[];
}
export interface Event {
    id: number;
    name: string;
    description: string;
    slug: string;
    eventLogo?: EventLogo | undefined;
    startTime?: Timestamp | undefined;
    timeZone: string;
    endTime?: Timestamp | undefined;
    liveStreamUrl: string;
    games: Game[];
    videos: GameVideo[];
    eventNetworks: EventNetwork[];
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface EventLogoResult {
    eventlogos: EventLogo[];
}
export interface EventLogo {
    id: number;
    event?: Event | undefined;
    alphaChannel: boolean;
    animated: boolean;
    height: number;
    imageId: string;
    url: string;
    width: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface EventNetworkResult {
    eventnetworks: EventNetwork[];
}
export interface EventNetwork {
    id: number;
    event?: Event | undefined;
    url: string;
    networkType?: NetworkType | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface ExternalGameResult {
    externalgames: ExternalGame[];
}
export interface ExternalGame {
    id: number;
    /** @deprecated */
    category: ExternalGameCategoryEnum;
    createdAt?: Timestamp | undefined;
    game?: Game | undefined;
    name: string;
    uid: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    year: number;
    /** @deprecated */
    media: ExternalGameMediaEnum;
    platform?: Platform | undefined;
    countries: number[];
    checksum: string;
    externalGameSource?: ExternalGameSource | undefined;
    gameReleaseFormat?: GameReleaseFormat | undefined;
}
export interface ExternalGameSourceResult {
    externalgamesources: ExternalGameSource[];
}
export interface ExternalGameSource {
    id: number;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface FranchiseResult {
    franchises: Franchise[];
}
export interface Franchise {
    id: number;
    createdAt?: Timestamp | undefined;
    games: Game[];
    name: string;
    slug: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface GameResult {
    games: Game[];
}
export interface Game {
    id: number;
    ageRatings: AgeRating[];
    aggregatedRating: number;
    aggregatedRatingCount: number;
    alternativeNames: AlternativeName[];
    artworks: Artwork[];
    bundles: Game[];
    /** @deprecated */
    category: GameCategoryEnum;
    /** @deprecated */
    collection?: Collection | undefined;
    cover?: Cover | undefined;
    createdAt?: Timestamp | undefined;
    dlcs: Game[];
    expansions: Game[];
    externalGames: ExternalGame[];
    firstReleaseDate?: Timestamp | undefined;
    /** @deprecated */
    follows: number;
    franchise?: Franchise | undefined;
    franchises: Franchise[];
    gameEngines: GameEngine[];
    gameModes: GameMode[];
    genres: Genre[];
    hypes: number;
    involvedCompanies: InvolvedCompany[];
    keywords: Keyword[];
    multiplayerModes: MultiplayerMode[];
    name: string;
    parentGame?: Game | undefined;
    platforms: Platform[];
    playerPerspectives: PlayerPerspective[];
    rating: number;
    ratingCount: number;
    releaseDates: ReleaseDate[];
    screenshots: Screenshot[];
    similarGames: Game[];
    slug: string;
    standaloneExpansions: Game[];
    /** @deprecated */
    status: GameStatusEnum;
    storyline: string;
    summary: string;
    tags: number[];
    themes: Theme[];
    totalRating: number;
    totalRatingCount: number;
    updatedAt?: Timestamp | undefined;
    url: string;
    versionParent?: Game | undefined;
    versionTitle: string;
    videos: GameVideo[];
    websites: Website[];
    checksum: string;
    remakes: Game[];
    remasters: Game[];
    expandedGames: Game[];
    ports: Game[];
    forks: Game[];
    languageSupports: LanguageSupport[];
    gameLocalizations: GameLocalization[];
    collections: Collection[];
    gameStatus?: GameStatus | undefined;
    gameType?: GameType | undefined;
}
export interface GameEngineResult {
    gameengines: GameEngine[];
}
export interface GameEngine {
    id: number;
    companies: Company[];
    createdAt?: Timestamp | undefined;
    description: string;
    logo?: GameEngineLogo | undefined;
    name: string;
    platforms: Platform[];
    slug: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface GameEngineLogoResult {
    gameenginelogos: GameEngineLogo[];
}
export interface GameEngineLogo {
    id: number;
    alphaChannel: boolean;
    animated: boolean;
    height: number;
    imageId: string;
    url: string;
    width: number;
    checksum: string;
}
export interface GameLocalizationResult {
    gamelocalizations: GameLocalization[];
}
export interface GameLocalization {
    id: number;
    name: string;
    cover?: Cover | undefined;
    game?: Game | undefined;
    region?: Region | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface GameModeResult {
    gamemodes: GameMode[];
}
export interface GameMode {
    id: number;
    createdAt?: Timestamp | undefined;
    name: string;
    slug: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface GameReleaseFormatResult {
    gamereleaseformats: GameReleaseFormat[];
}
export interface GameReleaseFormat {
    id: number;
    format: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface GameStatusResult {
    gamestatuses: GameStatus[];
}
export interface GameStatus {
    id: number;
    status: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface GameTimeToBeatResult {
    gametimetobeats: GameTimeToBeat[];
}
export interface GameTimeToBeat {
    id: number;
    gameId: number;
    hastily: number;
    normally: number;
    completely: number;
    count: number;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface GameTypeResult {
    gametypes: GameType[];
}
export interface GameType {
    id: number;
    type: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface GameVersionResult {
    gameversions: GameVersion[];
}
export interface GameVersion {
    id: number;
    createdAt?: Timestamp | undefined;
    features: GameVersionFeature[];
    game?: Game | undefined;
    games: Game[];
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface GameVersionFeatureResult {
    gameversionfeatures: GameVersionFeature[];
}
export interface GameVersionFeature {
    id: number;
    category: GameVersionFeatureCategoryEnum;
    description: string;
    position: number;
    title: string;
    values: GameVersionFeatureValue[];
    checksum: string;
}
export interface GameVersionFeatureValueResult {
    gameversionfeaturevalues: GameVersionFeatureValue[];
}
export interface GameVersionFeatureValue {
    id: number;
    game?: Game | undefined;
    gameFeature?: GameVersionFeature | undefined;
    includedFeature: GameVersionFeatureValueIncludedFeatureEnum;
    note: string;
    checksum: string;
}
export interface GameVideoResult {
    gamevideos: GameVideo[];
}
export interface GameVideo {
    id: number;
    game?: Game | undefined;
    name: string;
    videoId: string;
    checksum: string;
}
export interface GenreResult {
    genres: Genre[];
}
export interface Genre {
    id: number;
    createdAt?: Timestamp | undefined;
    name: string;
    slug: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface InvolvedCompanyResult {
    involvedcompanies: InvolvedCompany[];
}
export interface InvolvedCompany {
    id: number;
    company?: Company | undefined;
    createdAt?: Timestamp | undefined;
    developer: boolean;
    game?: Game | undefined;
    porting: boolean;
    publisher: boolean;
    supporting: boolean;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface KeywordResult {
    keywords: Keyword[];
}
export interface Keyword {
    id: number;
    createdAt?: Timestamp | undefined;
    name: string;
    slug: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface LanguageResult {
    languages: Language[];
}
export interface Language {
    id: number;
    name: string;
    nativeName: string;
    locale: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface LanguageSupportResult {
    languagesupports: LanguageSupport[];
}
export interface LanguageSupport {
    id: number;
    game?: Game | undefined;
    language?: Language | undefined;
    languageSupportType?: LanguageSupportType | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface LanguageSupportTypeResult {
    languagesupporttypes: LanguageSupportType[];
}
export interface LanguageSupportType {
    id: number;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface MultiplayerModeResult {
    multiplayermodes: MultiplayerMode[];
}
export interface MultiplayerMode {
    id: number;
    campaigncoop: boolean;
    dropin: boolean;
    game?: Game | undefined;
    lancoop: boolean;
    offlinecoop: boolean;
    offlinecoopmax: number;
    offlinemax: number;
    onlinecoop: boolean;
    onlinecoopmax: number;
    onlinemax: number;
    platform?: Platform | undefined;
    splitscreen: boolean;
    splitscreenonline: boolean;
    checksum: string;
}
export interface NetworkTypeResult {
    networktypes: NetworkType[];
}
export interface NetworkType {
    id: number;
    name: string;
    eventNetworks: EventNetwork[];
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface PlatformResult {
    platforms: Platform[];
}
export interface Platform {
    id: number;
    abbreviation: string;
    alternativeName: string;
    /** @deprecated */
    category: PlatformCategoryEnum;
    createdAt?: Timestamp | undefined;
    generation: number;
    name: string;
    platformLogo?: PlatformLogo | undefined;
    platformFamily?: PlatformFamily | undefined;
    slug: string;
    summary: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    versions: PlatformVersion[];
    websites: PlatformWebsite[];
    checksum: string;
    platformType?: PlatformType | undefined;
}
export interface PlatformFamilyResult {
    platformfamilies: PlatformFamily[];
}
export interface PlatformFamily {
    id: number;
    name: string;
    slug: string;
    checksum: string;
}
export interface PlatformLogoResult {
    platformlogos: PlatformLogo[];
}
export interface PlatformLogo {
    id: number;
    alphaChannel: boolean;
    animated: boolean;
    height: number;
    imageId: string;
    url: string;
    width: number;
    checksum: string;
}
export interface PlatformTypeResult {
    platformtypes: PlatformType[];
}
export interface PlatformType {
    id: number;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface PlatformVersionResult {
    platformversions: PlatformVersion[];
}
export interface PlatformVersion {
    id: number;
    companies: PlatformVersionCompany[];
    connectivity: string;
    cpu: string;
    graphics: string;
    mainManufacturer?: PlatformVersionCompany | undefined;
    media: string;
    memory: string;
    name: string;
    os: string;
    output: string;
    platformLogo?: PlatformLogo | undefined;
    platformVersionReleaseDates: PlatformVersionReleaseDate[];
    resolutions: string;
    slug: string;
    sound: string;
    storage: string;
    summary: string;
    url: string;
    checksum: string;
}
export interface PlatformVersionCompanyResult {
    platformversioncompanies: PlatformVersionCompany[];
}
export interface PlatformVersionCompany {
    id: number;
    comment: string;
    company?: Company | undefined;
    developer: boolean;
    manufacturer: boolean;
    checksum: string;
}
export interface PlatformVersionReleaseDateResult {
    platformversionreleasedates: PlatformVersionReleaseDate[];
}
export interface PlatformVersionReleaseDate {
    id: number;
    /** @deprecated */
    category: DateFormatChangeDateCategoryEnum;
    createdAt?: Timestamp | undefined;
    date?: Timestamp | undefined;
    human: string;
    m: number;
    platformVersion?: PlatformVersion | undefined;
    /** @deprecated */
    region: RegionRegionEnum;
    updatedAt?: Timestamp | undefined;
    y: number;
    checksum: string;
    dateFormat?: DateFormat | undefined;
    releaseRegion?: ReleaseDateRegion | undefined;
}
export interface PlatformWebsiteResult {
    platformwebsites: PlatformWebsite[];
}
export interface PlatformWebsite {
    id: number;
    /** @deprecated */
    category: WebsiteCategoryEnum;
    trusted: boolean;
    url: string;
    checksum: string;
    type?: WebsiteType | undefined;
}
export interface PlayerPerspectiveResult {
    playerperspectives: PlayerPerspective[];
}
export interface PlayerPerspective {
    id: number;
    createdAt?: Timestamp | undefined;
    name: string;
    slug: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface PopularityPrimitiveResult {
    popularityprimitives: PopularityPrimitive[];
}
export interface PopularityPrimitive {
    id: number;
    gameId: number;
    popularityType?: PopularityType | undefined;
    /** @deprecated */
    popularitySource: PopularitySourcePopularitySourceEnum;
    value: number;
    calculatedAt?: Timestamp | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
    externalPopularitySource?: ExternalGameSource | undefined;
}
export interface PopularityTypeResult {
    popularitytypes: PopularityType[];
}
export interface PopularityType {
    id: number;
    /** @deprecated */
    popularitySource: PopularitySourcePopularitySourceEnum;
    name: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
    externalPopularitySource?: ExternalGameSource | undefined;
}
export interface RegionResult {
    regions: Region[];
}
export interface Region {
    id: number;
    name: string;
    category: string;
    identifier: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface ReleaseDateResult {
    releasedates: ReleaseDate[];
}
export interface ReleaseDate {
    id: number;
    /** @deprecated */
    category: DateFormatChangeDateCategoryEnum;
    createdAt?: Timestamp | undefined;
    date?: Timestamp | undefined;
    game?: Game | undefined;
    human: string;
    m: number;
    platform?: Platform | undefined;
    /** @deprecated */
    region: RegionRegionEnum;
    updatedAt?: Timestamp | undefined;
    y: number;
    checksum: string;
    status?: ReleaseDateStatus | undefined;
    dateFormat?: DateFormat | undefined;
    releaseRegion?: ReleaseDateRegion | undefined;
}
export interface ReleaseDateRegionResult {
    releasedateregions: ReleaseDateRegion[];
}
export interface ReleaseDateRegion {
    id: number;
    region: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface ReleaseDateStatusResult {
    releasedatestatuses: ReleaseDateStatus[];
}
export interface ReleaseDateStatus {
    id: number;
    name: string;
    description: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export interface ScreenshotResult {
    screenshots: Screenshot[];
}
export interface Screenshot {
    id: number;
    alphaChannel: boolean;
    animated: boolean;
    game?: Game | undefined;
    height: number;
    imageId: string;
    url: string;
    width: number;
    checksum: string;
}
export interface SearchResult {
    searches: Search[];
}
export interface Search {
    id: number;
    alternativeName: string;
    character?: Character | undefined;
    collection?: Collection | undefined;
    company?: Company | undefined;
    description: string;
    game?: Game | undefined;
    name: string;
    platform?: Platform | undefined;
    publishedAt?: Timestamp | undefined;
    testDummy?: TestDummy | undefined;
    theme?: Theme | undefined;
    checksum: string;
}
export interface TestDummyResult {
    testdummies: TestDummy[];
}
export interface TestDummy {
    id: number;
    boolValue: boolean;
    createdAt?: Timestamp | undefined;
    enumTest: TestDummyEnumTestEnum;
    floatValue: number;
    game?: Game | undefined;
    integerArray: number[];
    integerValue: number;
    name: string;
    newIntegerValue: number;
    private: boolean;
    slug: string;
    stringArray: string[];
    testDummies: TestDummy[];
    testDummy?: TestDummy | undefined;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface ThemeResult {
    themes: Theme[];
}
export interface Theme {
    id: number;
    createdAt?: Timestamp | undefined;
    name: string;
    slug: string;
    updatedAt?: Timestamp | undefined;
    url: string;
    checksum: string;
}
export interface WebsiteResult {
    websites: Website[];
}
export interface Website {
    id: number;
    /** @deprecated */
    category: WebsiteCategoryEnum;
    game?: Game | undefined;
    trusted: boolean;
    url: string;
    checksum: string;
    type?: WebsiteType | undefined;
}
export interface WebsiteTypeResult {
    websitetypes: WebsiteType[];
}
export interface WebsiteType {
    id: number;
    type: string;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
    checksum: string;
}
export declare const Count: MessageFns<Count>;
export declare const MultiQueryResult: MessageFns<MultiQueryResult>;
export declare const MultiQueryResultArray: MessageFns<MultiQueryResultArray>;
export declare const AgeRatingResult: MessageFns<AgeRatingResult>;
export declare const AgeRating: MessageFns<AgeRating>;
export declare const AgeRatingCategoryResult: MessageFns<AgeRatingCategoryResult>;
export declare const AgeRatingCategory: MessageFns<AgeRatingCategory>;
export declare const AgeRatingContentDescriptionResult: MessageFns<AgeRatingContentDescriptionResult>;
export declare const AgeRatingContentDescription: MessageFns<AgeRatingContentDescription>;
export declare const AgeRatingContentDescriptionV2Result: MessageFns<AgeRatingContentDescriptionV2Result>;
export declare const AgeRatingContentDescriptionV2: MessageFns<AgeRatingContentDescriptionV2>;
export declare const AgeRatingOrganizationResult: MessageFns<AgeRatingOrganizationResult>;
export declare const AgeRatingOrganization: MessageFns<AgeRatingOrganization>;
export declare const AlternativeNameResult: MessageFns<AlternativeNameResult>;
export declare const AlternativeName: MessageFns<AlternativeName>;
export declare const ArtworkResult: MessageFns<ArtworkResult>;
export declare const Artwork: MessageFns<Artwork>;
export declare const CharacterResult: MessageFns<CharacterResult>;
export declare const Character: MessageFns<Character>;
export declare const CharacterGenderResult: MessageFns<CharacterGenderResult>;
export declare const CharacterGender: MessageFns<CharacterGender>;
export declare const CharacterMugShotResult: MessageFns<CharacterMugShotResult>;
export declare const CharacterMugShot: MessageFns<CharacterMugShot>;
export declare const CharacterSpecieResult: MessageFns<CharacterSpecieResult>;
export declare const CharacterSpecie: MessageFns<CharacterSpecie>;
export declare const CollectionResult: MessageFns<CollectionResult>;
export declare const Collection: MessageFns<Collection>;
export declare const CollectionMembershipResult: MessageFns<CollectionMembershipResult>;
export declare const CollectionMembership: MessageFns<CollectionMembership>;
export declare const CollectionMembershipTypeResult: MessageFns<CollectionMembershipTypeResult>;
export declare const CollectionMembershipType: MessageFns<CollectionMembershipType>;
export declare const CollectionRelationResult: MessageFns<CollectionRelationResult>;
export declare const CollectionRelation: MessageFns<CollectionRelation>;
export declare const CollectionRelationTypeResult: MessageFns<CollectionRelationTypeResult>;
export declare const CollectionRelationType: MessageFns<CollectionRelationType>;
export declare const CollectionTypeResult: MessageFns<CollectionTypeResult>;
export declare const CollectionType: MessageFns<CollectionType>;
export declare const CompanyResult: MessageFns<CompanyResult>;
export declare const Company: MessageFns<Company>;
export declare const CompanyLogoResult: MessageFns<CompanyLogoResult>;
export declare const CompanyLogo: MessageFns<CompanyLogo>;
export declare const CompanyStatusResult: MessageFns<CompanyStatusResult>;
export declare const CompanyStatus: MessageFns<CompanyStatus>;
export declare const CompanyWebsiteResult: MessageFns<CompanyWebsiteResult>;
export declare const CompanyWebsite: MessageFns<CompanyWebsite>;
export declare const CoverResult: MessageFns<CoverResult>;
export declare const Cover: MessageFns<Cover>;
export declare const DateFormatResult: MessageFns<DateFormatResult>;
export declare const DateFormat: MessageFns<DateFormat>;
export declare const EventResult: MessageFns<EventResult>;
export declare const Event: MessageFns<Event>;
export declare const EventLogoResult: MessageFns<EventLogoResult>;
export declare const EventLogo: MessageFns<EventLogo>;
export declare const EventNetworkResult: MessageFns<EventNetworkResult>;
export declare const EventNetwork: MessageFns<EventNetwork>;
export declare const ExternalGameResult: MessageFns<ExternalGameResult>;
export declare const ExternalGame: MessageFns<ExternalGame>;
export declare const ExternalGameSourceResult: MessageFns<ExternalGameSourceResult>;
export declare const ExternalGameSource: MessageFns<ExternalGameSource>;
export declare const FranchiseResult: MessageFns<FranchiseResult>;
export declare const Franchise: MessageFns<Franchise>;
export declare const GameResult: MessageFns<GameResult>;
export declare const Game: MessageFns<Game>;
export declare const GameEngineResult: MessageFns<GameEngineResult>;
export declare const GameEngine: MessageFns<GameEngine>;
export declare const GameEngineLogoResult: MessageFns<GameEngineLogoResult>;
export declare const GameEngineLogo: MessageFns<GameEngineLogo>;
export declare const GameLocalizationResult: MessageFns<GameLocalizationResult>;
export declare const GameLocalization: MessageFns<GameLocalization>;
export declare const GameModeResult: MessageFns<GameModeResult>;
export declare const GameMode: MessageFns<GameMode>;
export declare const GameReleaseFormatResult: MessageFns<GameReleaseFormatResult>;
export declare const GameReleaseFormat: MessageFns<GameReleaseFormat>;
export declare const GameStatusResult: MessageFns<GameStatusResult>;
export declare const GameStatus: MessageFns<GameStatus>;
export declare const GameTimeToBeatResult: MessageFns<GameTimeToBeatResult>;
export declare const GameTimeToBeat: MessageFns<GameTimeToBeat>;
export declare const GameTypeResult: MessageFns<GameTypeResult>;
export declare const GameType: MessageFns<GameType>;
export declare const GameVersionResult: MessageFns<GameVersionResult>;
export declare const GameVersion: MessageFns<GameVersion>;
export declare const GameVersionFeatureResult: MessageFns<GameVersionFeatureResult>;
export declare const GameVersionFeature: MessageFns<GameVersionFeature>;
export declare const GameVersionFeatureValueResult: MessageFns<GameVersionFeatureValueResult>;
export declare const GameVersionFeatureValue: MessageFns<GameVersionFeatureValue>;
export declare const GameVideoResult: MessageFns<GameVideoResult>;
export declare const GameVideo: MessageFns<GameVideo>;
export declare const GenreResult: MessageFns<GenreResult>;
export declare const Genre: MessageFns<Genre>;
export declare const InvolvedCompanyResult: MessageFns<InvolvedCompanyResult>;
export declare const InvolvedCompany: MessageFns<InvolvedCompany>;
export declare const KeywordResult: MessageFns<KeywordResult>;
export declare const Keyword: MessageFns<Keyword>;
export declare const LanguageResult: MessageFns<LanguageResult>;
export declare const Language: MessageFns<Language>;
export declare const LanguageSupportResult: MessageFns<LanguageSupportResult>;
export declare const LanguageSupport: MessageFns<LanguageSupport>;
export declare const LanguageSupportTypeResult: MessageFns<LanguageSupportTypeResult>;
export declare const LanguageSupportType: MessageFns<LanguageSupportType>;
export declare const MultiplayerModeResult: MessageFns<MultiplayerModeResult>;
export declare const MultiplayerMode: MessageFns<MultiplayerMode>;
export declare const NetworkTypeResult: MessageFns<NetworkTypeResult>;
export declare const NetworkType: MessageFns<NetworkType>;
export declare const PlatformResult: MessageFns<PlatformResult>;
export declare const Platform: MessageFns<Platform>;
export declare const PlatformFamilyResult: MessageFns<PlatformFamilyResult>;
export declare const PlatformFamily: MessageFns<PlatformFamily>;
export declare const PlatformLogoResult: MessageFns<PlatformLogoResult>;
export declare const PlatformLogo: MessageFns<PlatformLogo>;
export declare const PlatformTypeResult: MessageFns<PlatformTypeResult>;
export declare const PlatformType: MessageFns<PlatformType>;
export declare const PlatformVersionResult: MessageFns<PlatformVersionResult>;
export declare const PlatformVersion: MessageFns<PlatformVersion>;
export declare const PlatformVersionCompanyResult: MessageFns<PlatformVersionCompanyResult>;
export declare const PlatformVersionCompany: MessageFns<PlatformVersionCompany>;
export declare const PlatformVersionReleaseDateResult: MessageFns<PlatformVersionReleaseDateResult>;
export declare const PlatformVersionReleaseDate: MessageFns<PlatformVersionReleaseDate>;
export declare const PlatformWebsiteResult: MessageFns<PlatformWebsiteResult>;
export declare const PlatformWebsite: MessageFns<PlatformWebsite>;
export declare const PlayerPerspectiveResult: MessageFns<PlayerPerspectiveResult>;
export declare const PlayerPerspective: MessageFns<PlayerPerspective>;
export declare const PopularityPrimitiveResult: MessageFns<PopularityPrimitiveResult>;
export declare const PopularityPrimitive: MessageFns<PopularityPrimitive>;
export declare const PopularityTypeResult: MessageFns<PopularityTypeResult>;
export declare const PopularityType: MessageFns<PopularityType>;
export declare const RegionResult: MessageFns<RegionResult>;
export declare const Region: MessageFns<Region>;
export declare const ReleaseDateResult: MessageFns<ReleaseDateResult>;
export declare const ReleaseDate: MessageFns<ReleaseDate>;
export declare const ReleaseDateRegionResult: MessageFns<ReleaseDateRegionResult>;
export declare const ReleaseDateRegion: MessageFns<ReleaseDateRegion>;
export declare const ReleaseDateStatusResult: MessageFns<ReleaseDateStatusResult>;
export declare const ReleaseDateStatus: MessageFns<ReleaseDateStatus>;
export declare const ScreenshotResult: MessageFns<ScreenshotResult>;
export declare const Screenshot: MessageFns<Screenshot>;
export declare const SearchResult: MessageFns<SearchResult>;
export declare const Search: MessageFns<Search>;
export declare const TestDummyResult: MessageFns<TestDummyResult>;
export declare const TestDummy: MessageFns<TestDummy>;
export declare const ThemeResult: MessageFns<ThemeResult>;
export declare const Theme: MessageFns<Theme>;
export declare const WebsiteResult: MessageFns<WebsiteResult>;
export declare const Website: MessageFns<Website>;
export declare const WebsiteTypeResult: MessageFns<WebsiteTypeResult>;
export declare const WebsiteType: MessageFns<WebsiteType>;
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {
    $case: string;
} ? {
    [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]>;
} & {
    $case: T["$case"];
} : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create(base?: DeepPartial<T>): T;
    fromPartial(object: DeepPartial<T>): T;
}
export {};
