/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Timestamp } from "./google/protobuf/timestamp";

export const protobufPackage = "igdb";

export enum AgeRatingCategoryEnum {
  AGERATING_CATEGORY_NULL = 0,
  ESRB = 1,
  PEGI = 2,
  CERO = 3,
  USK = 4,
  GRAC = 5,
  CLASS_IND = 6,
  ACB = 7,
  UNRECOGNIZED = -1,
}

export enum AgeRatingRatingEnum {
  AGERATING_RATING_NULL = 0,
  THREE = 1,
  SEVEN = 2,
  TWELVE = 3,
  SIXTEEN = 4,
  EIGHTEEN = 5,
  RP = 6,
  EC = 7,
  E = 8,
  E10 = 9,
  T = 10,
  M = 11,
  AO = 12,
  CERO_A = 13,
  CERO_B = 14,
  CERO_C = 15,
  CERO_D = 16,
  CERO_Z = 17,
  USK_0 = 18,
  USK_6 = 19,
  USK_12 = 20,
  USK_16 = 21,
  USK_18 = 22,
  GRAC_ALL = 23,
  GRAC_TWELVE = 24,
  GRAC_FIFTEEN = 25,
  GRAC_EIGHTEEN = 26,
  GRAC_TESTING = 27,
  CLASS_IND_L = 28,
  CLASS_IND_TEN = 29,
  CLASS_IND_TWELVE = 30,
  CLASS_IND_FOURTEEN = 31,
  CLASS_IND_SIXTEEN = 32,
  CLASS_IND_EIGHTEEN = 33,
  ACB_G = 34,
  ACB_PG = 35,
  ACB_M = 36,
  ACB_MA15 = 37,
  ACB_R18 = 38,
  ACB_RC = 39,
  UNRECOGNIZED = -1,
}

export enum AgeRatingContentDescriptionCategoryEnum {
  AGERATINGCONTENTDESCRIPTION_CATEGORY_NULL = 0,
  ESRB_ALCOHOL_REFERENCE = 1,
  ESRB_ANIMATED_BLOOD = 2,
  ESRB_BLOOD = 3,
  ESRB_BLOOD_AND_GORE = 4,
  ESRB_CARTOON_VIOLENCE = 5,
  ESRB_COMIC_MISCHIEF = 6,
  ESRB_CRUDE_HUMOR = 7,
  ESRB_DRUG_REFERENCE = 8,
  ESRB_FANTASY_VIOLENCE = 9,
  ESRB_INTENSE_VIOLENCE = 10,
  ESRB_LANGUAGE = 11,
  ESRB_LYRICS = 12,
  ESRB_MATURE_HUMOR = 13,
  ESRB_NUDITY = 14,
  ESRB_PARTIAL_NUDITY = 15,
  ESRB_REAL_GAMBLING = 16,
  ESRB_SEXUAL_CONTENT = 17,
  ESRB_SEXUAL_THEMES = 18,
  ESRB_SEXUAL_VIOLENCE = 19,
  ESRB_SIMULATED_GAMBLING = 20,
  ESRB_STRONG_LANGUAGE = 21,
  ESRB_STRONG_LYRICS = 22,
  ESRB_STRONG_SEXUAL_CONTENT = 23,
  ESRB_SUGGESTIVE_THEMES = 24,
  ESRB_TOBACCO_REFERENCE = 25,
  ESRB_USE_OF_ALCOHOL = 26,
  ESRB_USE_OF_DRUGS = 27,
  ESRB_USE_OF_TOBACCO = 28,
  ESRB_VIOLENCE = 29,
  ESRB_VIOLENT_REFERENCES = 30,
  ESRB_ANIMATED_VIOLENCE = 31,
  ESRB_MILD_LANGUAGE = 32,
  ESRB_MILD_VIOLENCE = 33,
  ESRB_USE_OF_DRUGS_AND_ALCOHOL = 34,
  ESRB_DRUG_AND_ALCOHOL_REFERENCE = 35,
  ESRB_MILD_SUGGESTIVE_THEMES = 36,
  ESRB_MILD_CARTOON_VIOLENCE = 37,
  ESRB_MILD_BLOOD = 38,
  ESRB_REALISTIC_BLOOD_AND_GORE = 39,
  ESRB_REALISTIC_VIOLENCE = 40,
  ESRB_ALCOHOL_AND_TOBACCO_REFERENCE = 41,
  ESRB_MATURE_SEXUAL_THEMES = 42,
  ESRB_MILD_ANIMATED_VIOLENCE = 43,
  ESRB_MILD_SEXUAL_THEMES = 44,
  ESRB_USE_OF_ALCOHOL_AND_TOBACCO = 45,
  ESRB_ANIMATED_BLOOD_AND_GORE = 46,
  ESRB_MILD_FANTASY_VIOLENCE = 47,
  ESRB_MILD_LYRICS = 48,
  ESRB_REALISTIC_BLOOD = 49,
  PEGI_VIOLENCE = 50,
  PEGI_SEX = 51,
  PEGI_DRUGS = 52,
  PEGI_FEAR = 53,
  PEGI_DISCRIMINATION = 54,
  PEGI_BAD_LANGUAGE = 55,
  PEGI_GAMBLING = 56,
  PEGI_ONLINE_GAMEPLAY = 57,
  PEGI_IN_GAME_PURCHASES = 58,
  CERO_LOVE = 59,
  CERO_SEXUAL_CONTENT = 60,
  CERO_VIOLENCE = 61,
  CERO_HORROR = 62,
  CERO_DRINKING_SMOKING = 63,
  CERO_GAMBLING = 64,
  CERO_CRIME = 65,
  CERO_CONTROLLED_SUBSTANCES = 66,
  CERO_LANGUAGES_AND_OTHERS = 67,
  GRAC_SEXUALITY = 68,
  GRAC_VIOLENCE = 69,
  GRAC_FEAR_HORROR_THREATENING = 70,
  GRAC_LANGUAGE = 71,
  GRAC_ALCOHOL_TOBACCO_DRUG = 72,
  GRAC_CRIME_ANTI_SOCIAL = 73,
  GRAC_GAMBLING = 74,
  CLASS_IND_VIOLENCIA = 75,
  CLASS_IND_VIOLENCIA_EXTREMA = 76,
  CLASS_IND_CONTEUDO_SEXUAL = 77,
  CLASS_IND_NUDEZ = 78,
  CLASS_IND_SEXO = 79,
  CLASS_IND_SEXO_EXPLICITO = 80,
  CLASS_IND_DROGAS = 81,
  CLASS_IND_DROGAS_LICITAS = 82,
  CLASS_IND_DROGAS_ILICITAS = 83,
  CLASS_IND_LINGUAGEM_IMPROPRIA = 84,
  CLASS_IND_ATOS_CRIMINOSOS = 85,
  UNRECOGNIZED = -1,
}

export enum GenderGenderEnum {
  MALE = 0,
  FEMALE = 1,
  OTHER = 2,
  UNRECOGNIZED = -1,
}

export enum CharacterSpeciesEnum {
  CHARACTER_SPECIES_NULL = 0,
  HUMAN = 1,
  ALIEN = 2,
  ANIMAL = 3,
  ANDROID = 4,
  UNKNOWN = 5,
  UNRECOGNIZED = -1,
}

export enum DateFormatChangeDateCategoryEnum {
  YYYYMMMMDD = 0,
  YYYYMMMM = 1,
  YYYY = 2,
  YYYYQ1 = 3,
  YYYYQ2 = 4,
  YYYYQ3 = 5,
  YYYYQ4 = 6,
  TBD = 7,
  UNRECOGNIZED = -1,
}

export enum WebsiteCategoryEnum {
  WEBSITE_CATEGORY_NULL = 0,
  WEBSITE_OFFICIAL = 1,
  WEBSITE_WIKIA = 2,
  WEBSITE_WIKIPEDIA = 3,
  WEBSITE_FACEBOOK = 4,
  WEBSITE_TWITTER = 5,
  WEBSITE_TWITCH = 6,
  WEBSITE_INSTAGRAM = 8,
  WEBSITE_YOUTUBE = 9,
  WEBSITE_IPHONE = 10,
  WEBSITE_IPAD = 11,
  WEBSITE_ANDROID = 12,
  WEBSITE_STEAM = 13,
  WEBSITE_REDDIT = 14,
  WEBSITE_ITCH = 15,
  WEBSITE_EPICGAMES = 16,
  WEBSITE_GOG = 17,
  WEBSITE_DISCORD = 18,
  UNRECOGNIZED = -1,
}

export enum ExternalGameCategoryEnum {
  EXTERNALGAME_CATEGORY_NULL = 0,
  EXTERNALGAME_STEAM = 1,
  EXTERNALGAME_GOG = 5,
  EXTERNALGAME_YOUTUBE = 10,
  EXTERNALGAME_MICROSOFT = 11,
  EXTERNALGAME_APPLE = 13,
  EXTERNALGAME_TWITCH = 14,
  EXTERNALGAME_ANDROID = 15,
  EXTERNALGAME_AMAZON_ASIN = 20,
  EXTERNALGAME_AMAZON_LUNA = 22,
  EXTERNALGAME_AMAZON_ADG = 23,
  EXTERNALGAME_EPIC_GAME_STORE = 26,
  EXTERNALGAME_OCULUS = 28,
  EXTERNALGAME_UTOMIK = 29,
  EXTERNALGAME_ITCH_IO = 30,
  EXTERNALGAME_XBOX_MARKETPLACE = 31,
  EXTERNALGAME_KARTRIDGE = 32,
  EXTERNALGAME_PLAYSTATION_STORE_US = 36,
  EXTERNALGAME_FOCUS_ENTERTAINMENT = 37,
  EXTERNALGAME_XBOX_GAME_PASS_ULTIMATE_CLOUD = 54,
  EXTERNALGAME_GAMEJOLT = 55,
  UNRECOGNIZED = -1,
}

export enum ExternalGameMediaEnum {
  EXTERNALGAME_MEDIA_NULL = 0,
  EXTERNALGAME_DIGITAL = 1,
  EXTERNALGAME_PHYSICAL = 2,
  UNRECOGNIZED = -1,
}

export enum GameCategoryEnum {
  MAIN_GAME = 0,
  DLC_ADDON = 1,
  EXPANSION = 2,
  BUNDLE = 3,
  STANDALONE_EXPANSION = 4,
  MOD = 5,
  EPISODE = 6,
  SEASON = 7,
  REMAKE = 8,
  REMASTER = 9,
  EXPANDED_GAME = 10,
  PORT = 11,
  FORK = 12,
  PACK = 13,
  UPDATE = 14,
  UNRECOGNIZED = -1,
}

export enum GameStatusEnum {
  RELEASED = 0,
  ALPHA = 2,
  BETA = 3,
  EARLY_ACCESS = 4,
  OFFLINE = 5,
  CANCELLED = 6,
  RUMORED = 7,
  DELISTED = 8,
  UNRECOGNIZED = -1,
}

export enum GameVersionFeatureCategoryEnum {
  BOOLEAN = 0,
  DESCRIPTION = 1,
  UNRECOGNIZED = -1,
}

export enum GameVersionFeatureValueIncludedFeatureEnum {
  NOT_INCLUDED = 0,
  INCLUDED = 1,
  PRE_ORDER_ONLY = 2,
  UNRECOGNIZED = -1,
}

export enum PlatformCategoryEnum {
  PLATFORM_CATEGORY_NULL = 0,
  CONSOLE = 1,
  ARCADE = 2,
  PLATFORM = 3,
  OPERATING_SYSTEM = 4,
  PORTABLE_CONSOLE = 5,
  COMPUTER = 6,
  UNRECOGNIZED = -1,
}

export enum RegionRegionEnum {
  REGION_REGION_NULL = 0,
  EUROPE = 1,
  NORTH_AMERICA = 2,
  AUSTRALIA = 3,
  NEW_ZEALAND = 4,
  JAPAN = 5,
  CHINA = 6,
  ASIA = 7,
  WORLDWIDE = 8,
  KOREA = 9,
  BRAZIL = 10,
  UNRECOGNIZED = -1,
}

export enum TestDummyEnumTestEnum {
  TESTDUMMY_ENUM_TEST_NULL = 0,
  ENUM1 = 1,
  ENUM2 = 2,
  UNRECOGNIZED = -1,
}

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
  category: AgeRatingCategoryEnum;
  contentDescriptions: AgeRatingContentDescription[];
  rating: AgeRatingRatingEnum;
  ratingCoverUrl: string;
  synopsis: string;
  checksum: string;
}

export interface AgeRatingContentDescriptionResult {
  ageratingcontentdescriptions: AgeRatingContentDescription[];
}

export interface AgeRatingContentDescription {
  id: number;
  category: AgeRatingContentDescriptionCategoryEnum;
  description: string;
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
  createdAt?: Date | undefined;
  description: string;
  games: Game[];
  gender: GenderGenderEnum;
  mugShot?: CharacterMugShot | undefined;
  name: string;
  slug: string;
  species: CharacterSpeciesEnum;
  updatedAt?: Date | undefined;
  url: string;
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

export interface CollectionResult {
  collections: Collection[];
}

export interface Collection {
  id: number;
  createdAt?: Date | undefined;
  games: Game[];
  name: string;
  slug: string;
  updatedAt?: Date | undefined;
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
  updatedAt?: Date | undefined;
  createdAt?: Date | undefined;
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
  updatedAt?: Date | undefined;
  createdAt?: Date | undefined;
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
  updatedAt?: Date | undefined;
  createdAt?: Date | undefined;
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
  updatedAt?: Date | undefined;
  createdAt?: Date | undefined;
  checksum: string;
}

export interface CollectionTypeResult {
  collectiontypes: CollectionType[];
}

export interface CollectionType {
  id: number;
  name: string;
  description: string;
  updatedAt?: Date | undefined;
  createdAt?: Date | undefined;
  checksum: string;
}

export interface CompanyResult {
  companies: Company[];
}

export interface Company {
  id: number;
  changeDate?: Date | undefined;
  changeDateCategory: DateFormatChangeDateCategoryEnum;
  changedCompanyId?: Company | undefined;
  country: number;
  createdAt?: Date | undefined;
  description: string;
  developed: Game[];
  logo?: CompanyLogo | undefined;
  name: string;
  parent?: Company | undefined;
  published: Game[];
  slug: string;
  startDate?: Date | undefined;
  startDateCategory: DateFormatChangeDateCategoryEnum;
  updatedAt?: Date | undefined;
  url: string;
  websites: CompanyWebsite[];
  checksum: string;
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

export interface CompanyWebsiteResult {
  companywebsites: CompanyWebsite[];
}

export interface CompanyWebsite {
  id: number;
  category: WebsiteCategoryEnum;
  trusted: boolean;
  url: string;
  checksum: string;
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

export interface EventResult {
  events: Event[];
}

export interface Event {
  id: number;
  name: string;
  description: string;
  slug: string;
  eventLogo?: EventLogo | undefined;
  startTime?: Date | undefined;
  timeZone: string;
  endTime?: Date | undefined;
  liveStreamUrl: string;
  games: Game[];
  videos: GameVideo[];
  eventNetworks: EventNetwork[];
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
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
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
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
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  checksum: string;
}

export interface ExternalGameResult {
  externalgames: ExternalGame[];
}

export interface ExternalGame {
  id: number;
  category: ExternalGameCategoryEnum;
  createdAt?: Date | undefined;
  game?: Game | undefined;
  name: string;
  uid: string;
  updatedAt?: Date | undefined;
  url: string;
  year: number;
  media: ExternalGameMediaEnum;
  platform?: Platform | undefined;
  countries: number[];
  checksum: string;
}

export interface FranchiseResult {
  franchises: Franchise[];
}

export interface Franchise {
  id: number;
  createdAt?: Date | undefined;
  games: Game[];
  name: string;
  slug: string;
  updatedAt?: Date | undefined;
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
  category: GameCategoryEnum;
  collection?: Collection | undefined;
  cover?: Cover | undefined;
  createdAt?: Date | undefined;
  dlcs: Game[];
  expansions: Game[];
  externalGames: ExternalGame[];
  firstReleaseDate?:
    | Date
    | undefined;
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
  status: GameStatusEnum;
  storyline: string;
  summary: string;
  tags: number[];
  themes: Theme[];
  totalRating: number;
  totalRatingCount: number;
  updatedAt?: Date | undefined;
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
}

export interface GameEngineResult {
  gameengines: GameEngine[];
}

export interface GameEngine {
  id: number;
  companies: Company[];
  createdAt?: Date | undefined;
  description: string;
  logo?: GameEngineLogo | undefined;
  name: string;
  platforms: Platform[];
  slug: string;
  updatedAt?: Date | undefined;
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
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  checksum: string;
}

export interface GameModeResult {
  gamemodes: GameMode[];
}

export interface GameMode {
  id: number;
  createdAt?: Date | undefined;
  name: string;
  slug: string;
  updatedAt?: Date | undefined;
  url: string;
  checksum: string;
}

export interface GameVersionResult {
  gameversions: GameVersion[];
}

export interface GameVersion {
  id: number;
  createdAt?: Date | undefined;
  features: GameVersionFeature[];
  game?: Game | undefined;
  games: Game[];
  updatedAt?: Date | undefined;
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
  createdAt?: Date | undefined;
  name: string;
  slug: string;
  updatedAt?: Date | undefined;
  url: string;
  checksum: string;
}

export interface InvolvedCompanyResult {
  involvedcompanies: InvolvedCompany[];
}

export interface InvolvedCompany {
  id: number;
  company?: Company | undefined;
  createdAt?: Date | undefined;
  developer: boolean;
  game?: Game | undefined;
  porting: boolean;
  publisher: boolean;
  supporting: boolean;
  updatedAt?: Date | undefined;
  checksum: string;
}

export interface KeywordResult {
  keywords: Keyword[];
}

export interface Keyword {
  id: number;
  createdAt?: Date | undefined;
  name: string;
  slug: string;
  updatedAt?: Date | undefined;
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
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
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
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  checksum: string;
}

export interface LanguageSupportTypeResult {
  languagesupporttypes: LanguageSupportType[];
}

export interface LanguageSupportType {
  id: number;
  name: string;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
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
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  checksum: string;
}

export interface PlatformResult {
  platforms: Platform[];
}

export interface Platform {
  id: number;
  abbreviation: string;
  alternativeName: string;
  category: PlatformCategoryEnum;
  createdAt?: Date | undefined;
  generation: number;
  name: string;
  platformLogo?: PlatformLogo | undefined;
  platformFamily?: PlatformFamily | undefined;
  slug: string;
  summary: string;
  updatedAt?: Date | undefined;
  url: string;
  versions: PlatformVersion[];
  websites: PlatformWebsite[];
  checksum: string;
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
  online: string;
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
  category: DateFormatChangeDateCategoryEnum;
  createdAt?: Date | undefined;
  date?: Date | undefined;
  human: string;
  m: number;
  platformVersion?: PlatformVersion | undefined;
  region: RegionRegionEnum;
  updatedAt?: Date | undefined;
  y: number;
  checksum: string;
}

export interface PlatformWebsiteResult {
  platformwebsites: PlatformWebsite[];
}

export interface PlatformWebsite {
  id: number;
  category: WebsiteCategoryEnum;
  trusted: boolean;
  url: string;
  checksum: string;
}

export interface PlayerPerspectiveResult {
  playerperspectives: PlayerPerspective[];
}

export interface PlayerPerspective {
  id: number;
  createdAt?: Date | undefined;
  name: string;
  slug: string;
  updatedAt?: Date | undefined;
  url: string;
  checksum: string;
}

export interface RegionResult {
  regions: Region[];
}

export interface Region {
  id: number;
  name: string;
  category: string;
  identifier: string;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  checksum: string;
}

export interface ReleaseDateResult {
  releasedates: ReleaseDate[];
}

export interface ReleaseDate {
  id: number;
  category: DateFormatChangeDateCategoryEnum;
  createdAt?: Date | undefined;
  date?: Date | undefined;
  game?: Game | undefined;
  human: string;
  m: number;
  platform?: Platform | undefined;
  region: RegionRegionEnum;
  updatedAt?: Date | undefined;
  y: number;
  checksum: string;
  status?: ReleaseDateStatus | undefined;
}

export interface ReleaseDateStatusResult {
  releasedatestatuses: ReleaseDateStatus[];
}

export interface ReleaseDateStatus {
  id: number;
  name: string;
  description: string;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
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
  publishedAt?: Date | undefined;
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
  createdAt?: Date | undefined;
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
  updatedAt?: Date | undefined;
  url: string;
  checksum: string;
}

export interface ThemeResult {
  themes: Theme[];
}

export interface Theme {
  id: number;
  createdAt?: Date | undefined;
  name: string;
  slug: string;
  updatedAt?: Date | undefined;
  url: string;
  checksum: string;
}

export interface WebsiteResult {
  websites: Website[];
}

export interface Website {
  id: number;
  category: WebsiteCategoryEnum;
  game?: Game | undefined;
  trusted: boolean;
  url: string;
  checksum: string;
}

function createBaseCount(): Count {
  return { count: 0 };
}

export const Count = {
  encode(message: Count, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.count !== 0) {
      writer.uint32(8).int64(message.count);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Count {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.count = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Count>): Count {
    return Count.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Count>): Count {
    const message = createBaseCount();
    message.count = object.count ?? 0;
    return message;
  },
};

function createBaseMultiQueryResult(): MultiQueryResult {
  return { name: "", results: [], count: 0 };
}

export const MultiQueryResult = {
  encode(message: MultiQueryResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    for (const v of message.results) {
      writer.uint32(18).bytes(v!);
    }
    if (message.count !== 0) {
      writer.uint32(24).int64(message.count);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MultiQueryResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMultiQueryResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.results.push(reader.bytes());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.count = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<MultiQueryResult>): MultiQueryResult {
    return MultiQueryResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MultiQueryResult>): MultiQueryResult {
    const message = createBaseMultiQueryResult();
    message.name = object.name ?? "";
    message.results = object.results?.map((e) => e) || [];
    message.count = object.count ?? 0;
    return message;
  },
};

function createBaseMultiQueryResultArray(): MultiQueryResultArray {
  return { result: [] };
}

export const MultiQueryResultArray = {
  encode(message: MultiQueryResultArray, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.result) {
      MultiQueryResult.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MultiQueryResultArray {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMultiQueryResultArray();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.result.push(MultiQueryResult.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<MultiQueryResultArray>): MultiQueryResultArray {
    return MultiQueryResultArray.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MultiQueryResultArray>): MultiQueryResultArray {
    const message = createBaseMultiQueryResultArray();
    message.result = object.result?.map((e) => MultiQueryResult.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAgeRatingResult(): AgeRatingResult {
  return { ageratings: [] };
}

export const AgeRatingResult = {
  encode(message: AgeRatingResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.ageratings) {
      AgeRating.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AgeRatingResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAgeRatingResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ageratings.push(AgeRating.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<AgeRatingResult>): AgeRatingResult {
    return AgeRatingResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AgeRatingResult>): AgeRatingResult {
    const message = createBaseAgeRatingResult();
    message.ageratings = object.ageratings?.map((e) => AgeRating.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAgeRating(): AgeRating {
  return { id: 0, category: 0, contentDescriptions: [], rating: 0, ratingCoverUrl: "", synopsis: "", checksum: "" };
}

export const AgeRating = {
  encode(message: AgeRating, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    for (const v of message.contentDescriptions) {
      AgeRatingContentDescription.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.rating !== 0) {
      writer.uint32(32).int32(message.rating);
    }
    if (message.ratingCoverUrl !== "") {
      writer.uint32(42).string(message.ratingCoverUrl);
    }
    if (message.synopsis !== "") {
      writer.uint32(50).string(message.synopsis);
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AgeRating {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAgeRating();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.contentDescriptions.push(AgeRatingContentDescription.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.rating = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.ratingCoverUrl = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.synopsis = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<AgeRating>): AgeRating {
    return AgeRating.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AgeRating>): AgeRating {
    const message = createBaseAgeRating();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.contentDescriptions = object.contentDescriptions?.map((e) => AgeRatingContentDescription.fromPartial(e)) ||
      [];
    message.rating = object.rating ?? 0;
    message.ratingCoverUrl = object.ratingCoverUrl ?? "";
    message.synopsis = object.synopsis ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseAgeRatingContentDescriptionResult(): AgeRatingContentDescriptionResult {
  return { ageratingcontentdescriptions: [] };
}

export const AgeRatingContentDescriptionResult = {
  encode(message: AgeRatingContentDescriptionResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.ageratingcontentdescriptions) {
      AgeRatingContentDescription.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AgeRatingContentDescriptionResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAgeRatingContentDescriptionResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.ageratingcontentdescriptions.push(AgeRatingContentDescription.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<AgeRatingContentDescriptionResult>): AgeRatingContentDescriptionResult {
    return AgeRatingContentDescriptionResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AgeRatingContentDescriptionResult>): AgeRatingContentDescriptionResult {
    const message = createBaseAgeRatingContentDescriptionResult();
    message.ageratingcontentdescriptions =
      object.ageratingcontentdescriptions?.map((e) => AgeRatingContentDescription.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAgeRatingContentDescription(): AgeRatingContentDescription {
  return { id: 0, category: 0, description: "", checksum: "" };
}

export const AgeRatingContentDescription = {
  encode(message: AgeRatingContentDescription, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.checksum !== "") {
      writer.uint32(34).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AgeRatingContentDescription {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAgeRatingContentDescription();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<AgeRatingContentDescription>): AgeRatingContentDescription {
    return AgeRatingContentDescription.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AgeRatingContentDescription>): AgeRatingContentDescription {
    const message = createBaseAgeRatingContentDescription();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.description = object.description ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseAlternativeNameResult(): AlternativeNameResult {
  return { alternativenames: [] };
}

export const AlternativeNameResult = {
  encode(message: AlternativeNameResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.alternativenames) {
      AlternativeName.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AlternativeNameResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAlternativeNameResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.alternativenames.push(AlternativeName.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<AlternativeNameResult>): AlternativeNameResult {
    return AlternativeNameResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AlternativeNameResult>): AlternativeNameResult {
    const message = createBaseAlternativeNameResult();
    message.alternativenames = object.alternativenames?.map((e) => AlternativeName.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAlternativeName(): AlternativeName {
  return { id: 0, comment: "", game: undefined, name: "", checksum: "" };
}

export const AlternativeName = {
  encode(message: AlternativeName, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.comment !== "") {
      writer.uint32(18).string(message.comment);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(26).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(34).string(message.name);
    }
    if (message.checksum !== "") {
      writer.uint32(42).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AlternativeName {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAlternativeName();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.comment = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.name = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<AlternativeName>): AlternativeName {
    return AlternativeName.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AlternativeName>): AlternativeName {
    const message = createBaseAlternativeName();
    message.id = object.id ?? 0;
    message.comment = object.comment ?? "";
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.name = object.name ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseArtworkResult(): ArtworkResult {
  return { artworks: [] };
}

export const ArtworkResult = {
  encode(message: ArtworkResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.artworks) {
      Artwork.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ArtworkResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArtworkResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.artworks.push(Artwork.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ArtworkResult>): ArtworkResult {
    return ArtworkResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ArtworkResult>): ArtworkResult {
    const message = createBaseArtworkResult();
    message.artworks = object.artworks?.map((e) => Artwork.fromPartial(e)) || [];
    return message;
  },
};

function createBaseArtwork(): Artwork {
  return {
    id: 0,
    alphaChannel: false,
    animated: false,
    game: undefined,
    height: 0,
    imageId: "",
    url: "",
    width: 0,
    checksum: "",
  };
}

export const Artwork = {
  encode(message: Artwork, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.alphaChannel !== false) {
      writer.uint32(16).bool(message.alphaChannel);
    }
    if (message.animated !== false) {
      writer.uint32(24).bool(message.animated);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(34).fork()).ldelim();
    }
    if (message.height !== 0) {
      writer.uint32(40).int32(message.height);
    }
    if (message.imageId !== "") {
      writer.uint32(50).string(message.imageId);
    }
    if (message.url !== "") {
      writer.uint32(58).string(message.url);
    }
    if (message.width !== 0) {
      writer.uint32(64).int32(message.width);
    }
    if (message.checksum !== "") {
      writer.uint32(74).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Artwork {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArtwork();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.alphaChannel = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.animated = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.height = reader.int32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.imageId = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.url = reader.string();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Artwork>): Artwork {
    return Artwork.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Artwork>): Artwork {
    const message = createBaseArtwork();
    message.id = object.id ?? 0;
    message.alphaChannel = object.alphaChannel ?? false;
    message.animated = object.animated ?? false;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.height = object.height ?? 0;
    message.imageId = object.imageId ?? "";
    message.url = object.url ?? "";
    message.width = object.width ?? 0;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCharacterResult(): CharacterResult {
  return { characters: [] };
}

export const CharacterResult = {
  encode(message: CharacterResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.characters) {
      Character.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CharacterResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCharacterResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.characters.push(Character.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CharacterResult>): CharacterResult {
    return CharacterResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CharacterResult>): CharacterResult {
    const message = createBaseCharacterResult();
    message.characters = object.characters?.map((e) => Character.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCharacter(): Character {
  return {
    id: 0,
    akas: [],
    countryName: "",
    createdAt: undefined,
    description: "",
    games: [],
    gender: 0,
    mugShot: undefined,
    name: "",
    slug: "",
    species: 0,
    updatedAt: undefined,
    url: "",
    checksum: "",
  };
}

export const Character = {
  encode(message: Character, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    for (const v of message.akas) {
      writer.uint32(18).string(v!);
    }
    if (message.countryName !== "") {
      writer.uint32(26).string(message.countryName);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(34).fork()).ldelim();
    }
    if (message.description !== "") {
      writer.uint32(42).string(message.description);
    }
    for (const v of message.games) {
      Game.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    if (message.gender !== 0) {
      writer.uint32(56).int32(message.gender);
    }
    if (message.mugShot !== undefined) {
      CharacterMugShot.encode(message.mugShot, writer.uint32(66).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(74).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(82).string(message.slug);
    }
    if (message.species !== 0) {
      writer.uint32(88).int32(message.species);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(98).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(106).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(114).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Character {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCharacter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.akas.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.countryName = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.description = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.games.push(Game.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.gender = reader.int32() as any;
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.mugShot = CharacterMugShot.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.name = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.species = reader.int32() as any;
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.url = reader.string();
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Character>): Character {
    return Character.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Character>): Character {
    const message = createBaseCharacter();
    message.id = object.id ?? 0;
    message.akas = object.akas?.map((e) => e) || [];
    message.countryName = object.countryName ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.description = object.description ?? "";
    message.games = object.games?.map((e) => Game.fromPartial(e)) || [];
    message.gender = object.gender ?? 0;
    message.mugShot = (object.mugShot !== undefined && object.mugShot !== null)
      ? CharacterMugShot.fromPartial(object.mugShot)
      : undefined;
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.species = object.species ?? 0;
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCharacterMugShotResult(): CharacterMugShotResult {
  return { charactermugshots: [] };
}

export const CharacterMugShotResult = {
  encode(message: CharacterMugShotResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.charactermugshots) {
      CharacterMugShot.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CharacterMugShotResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCharacterMugShotResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.charactermugshots.push(CharacterMugShot.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CharacterMugShotResult>): CharacterMugShotResult {
    return CharacterMugShotResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CharacterMugShotResult>): CharacterMugShotResult {
    const message = createBaseCharacterMugShotResult();
    message.charactermugshots = object.charactermugshots?.map((e) => CharacterMugShot.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCharacterMugShot(): CharacterMugShot {
  return { id: 0, alphaChannel: false, animated: false, height: 0, imageId: "", url: "", width: 0, checksum: "" };
}

export const CharacterMugShot = {
  encode(message: CharacterMugShot, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.alphaChannel !== false) {
      writer.uint32(16).bool(message.alphaChannel);
    }
    if (message.animated !== false) {
      writer.uint32(24).bool(message.animated);
    }
    if (message.height !== 0) {
      writer.uint32(32).int32(message.height);
    }
    if (message.imageId !== "") {
      writer.uint32(42).string(message.imageId);
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.width !== 0) {
      writer.uint32(56).int32(message.width);
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CharacterMugShot {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCharacterMugShot();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.alphaChannel = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.animated = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.height = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.imageId = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CharacterMugShot>): CharacterMugShot {
    return CharacterMugShot.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CharacterMugShot>): CharacterMugShot {
    const message = createBaseCharacterMugShot();
    message.id = object.id ?? 0;
    message.alphaChannel = object.alphaChannel ?? false;
    message.animated = object.animated ?? false;
    message.height = object.height ?? 0;
    message.imageId = object.imageId ?? "";
    message.url = object.url ?? "";
    message.width = object.width ?? 0;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCollectionResult(): CollectionResult {
  return { collections: [] };
}

export const CollectionResult = {
  encode(message: CollectionResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.collections) {
      Collection.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collections.push(Collection.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionResult>): CollectionResult {
    return CollectionResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionResult>): CollectionResult {
    const message = createBaseCollectionResult();
    message.collections = object.collections?.map((e) => Collection.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCollection(): Collection {
  return {
    id: 0,
    createdAt: undefined,
    games: [],
    name: "",
    slug: "",
    updatedAt: undefined,
    url: "",
    checksum: "",
    type: undefined,
    asParentRelations: [],
    asChildRelations: [],
  };
}

export const Collection = {
  encode(message: Collection, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.games) {
      Game.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(34).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(42).string(message.slug);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(58).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    if (message.type !== undefined) {
      CollectionType.encode(message.type, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.asParentRelations) {
      CollectionRelation.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    for (const v of message.asChildRelations) {
      CollectionRelation.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Collection {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.games.push(Game.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.name = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.url = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.type = CollectionType.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.asParentRelations.push(CollectionRelation.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.asChildRelations.push(CollectionRelation.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Collection>): Collection {
    return Collection.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Collection>): Collection {
    const message = createBaseCollection();
    message.id = object.id ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.games = object.games?.map((e) => Game.fromPartial(e)) || [];
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    message.type = (object.type !== undefined && object.type !== null)
      ? CollectionType.fromPartial(object.type)
      : undefined;
    message.asParentRelations = object.asParentRelations?.map((e) => CollectionRelation.fromPartial(e)) || [];
    message.asChildRelations = object.asChildRelations?.map((e) => CollectionRelation.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCollectionMembershipResult(): CollectionMembershipResult {
  return { collectionmemberships: [] };
}

export const CollectionMembershipResult = {
  encode(message: CollectionMembershipResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.collectionmemberships) {
      CollectionMembership.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionMembershipResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionMembershipResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collectionmemberships.push(CollectionMembership.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionMembershipResult>): CollectionMembershipResult {
    return CollectionMembershipResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionMembershipResult>): CollectionMembershipResult {
    const message = createBaseCollectionMembershipResult();
    message.collectionmemberships = object.collectionmemberships?.map((e) => CollectionMembership.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCollectionMembership(): CollectionMembership {
  return {
    id: 0,
    game: undefined,
    collection: undefined,
    type: undefined,
    updatedAt: undefined,
    createdAt: undefined,
    checksum: "",
  };
}

export const CollectionMembership = {
  encode(message: CollectionMembership, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(18).fork()).ldelim();
    }
    if (message.collection !== undefined) {
      Collection.encode(message.collection, writer.uint32(26).fork()).ldelim();
    }
    if (message.type !== undefined) {
      CollectionMembershipType.encode(message.type, writer.uint32(34).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionMembership {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionMembership();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.collection = Collection.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.type = CollectionMembershipType.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionMembership>): CollectionMembership {
    return CollectionMembership.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionMembership>): CollectionMembership {
    const message = createBaseCollectionMembership();
    message.id = object.id ?? 0;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.collection = (object.collection !== undefined && object.collection !== null)
      ? Collection.fromPartial(object.collection)
      : undefined;
    message.type = (object.type !== undefined && object.type !== null)
      ? CollectionMembershipType.fromPartial(object.type)
      : undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCollectionMembershipTypeResult(): CollectionMembershipTypeResult {
  return { collectionmembershiptypes: [] };
}

export const CollectionMembershipTypeResult = {
  encode(message: CollectionMembershipTypeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.collectionmembershiptypes) {
      CollectionMembershipType.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionMembershipTypeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionMembershipTypeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collectionmembershiptypes.push(CollectionMembershipType.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionMembershipTypeResult>): CollectionMembershipTypeResult {
    return CollectionMembershipTypeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionMembershipTypeResult>): CollectionMembershipTypeResult {
    const message = createBaseCollectionMembershipTypeResult();
    message.collectionmembershiptypes =
      object.collectionmembershiptypes?.map((e) => CollectionMembershipType.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCollectionMembershipType(): CollectionMembershipType {
  return {
    id: 0,
    name: "",
    description: "",
    allowedCollectionType: undefined,
    updatedAt: undefined,
    createdAt: undefined,
    checksum: "",
  };
}

export const CollectionMembershipType = {
  encode(message: CollectionMembershipType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.allowedCollectionType !== undefined) {
      CollectionType.encode(message.allowedCollectionType, writer.uint32(34).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionMembershipType {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionMembershipType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.allowedCollectionType = CollectionType.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionMembershipType>): CollectionMembershipType {
    return CollectionMembershipType.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionMembershipType>): CollectionMembershipType {
    const message = createBaseCollectionMembershipType();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.allowedCollectionType =
      (object.allowedCollectionType !== undefined && object.allowedCollectionType !== null)
        ? CollectionType.fromPartial(object.allowedCollectionType)
        : undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCollectionRelationResult(): CollectionRelationResult {
  return { collectionrelations: [] };
}

export const CollectionRelationResult = {
  encode(message: CollectionRelationResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.collectionrelations) {
      CollectionRelation.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionRelationResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionRelationResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collectionrelations.push(CollectionRelation.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionRelationResult>): CollectionRelationResult {
    return CollectionRelationResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionRelationResult>): CollectionRelationResult {
    const message = createBaseCollectionRelationResult();
    message.collectionrelations = object.collectionrelations?.map((e) => CollectionRelation.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCollectionRelation(): CollectionRelation {
  return {
    id: 0,
    childCollection: undefined,
    parentCollection: undefined,
    type: undefined,
    updatedAt: undefined,
    createdAt: undefined,
    checksum: "",
  };
}

export const CollectionRelation = {
  encode(message: CollectionRelation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.childCollection !== undefined) {
      Collection.encode(message.childCollection, writer.uint32(18).fork()).ldelim();
    }
    if (message.parentCollection !== undefined) {
      Collection.encode(message.parentCollection, writer.uint32(26).fork()).ldelim();
    }
    if (message.type !== undefined) {
      CollectionRelationType.encode(message.type, writer.uint32(34).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionRelation {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionRelation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.childCollection = Collection.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.parentCollection = Collection.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.type = CollectionRelationType.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionRelation>): CollectionRelation {
    return CollectionRelation.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionRelation>): CollectionRelation {
    const message = createBaseCollectionRelation();
    message.id = object.id ?? 0;
    message.childCollection = (object.childCollection !== undefined && object.childCollection !== null)
      ? Collection.fromPartial(object.childCollection)
      : undefined;
    message.parentCollection = (object.parentCollection !== undefined && object.parentCollection !== null)
      ? Collection.fromPartial(object.parentCollection)
      : undefined;
    message.type = (object.type !== undefined && object.type !== null)
      ? CollectionRelationType.fromPartial(object.type)
      : undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCollectionRelationTypeResult(): CollectionRelationTypeResult {
  return { collectionrelationtypes: [] };
}

export const CollectionRelationTypeResult = {
  encode(message: CollectionRelationTypeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.collectionrelationtypes) {
      CollectionRelationType.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionRelationTypeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionRelationTypeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collectionrelationtypes.push(CollectionRelationType.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionRelationTypeResult>): CollectionRelationTypeResult {
    return CollectionRelationTypeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionRelationTypeResult>): CollectionRelationTypeResult {
    const message = createBaseCollectionRelationTypeResult();
    message.collectionrelationtypes =
      object.collectionrelationtypes?.map((e) => CollectionRelationType.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCollectionRelationType(): CollectionRelationType {
  return {
    id: 0,
    name: "",
    description: "",
    allowedChildType: undefined,
    allowedParentType: undefined,
    updatedAt: undefined,
    createdAt: undefined,
    checksum: "",
  };
}

export const CollectionRelationType = {
  encode(message: CollectionRelationType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.allowedChildType !== undefined) {
      CollectionType.encode(message.allowedChildType, writer.uint32(34).fork()).ldelim();
    }
    if (message.allowedParentType !== undefined) {
      CollectionType.encode(message.allowedParentType, writer.uint32(42).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(58).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionRelationType {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionRelationType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.allowedChildType = CollectionType.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.allowedParentType = CollectionType.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionRelationType>): CollectionRelationType {
    return CollectionRelationType.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionRelationType>): CollectionRelationType {
    const message = createBaseCollectionRelationType();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.allowedChildType = (object.allowedChildType !== undefined && object.allowedChildType !== null)
      ? CollectionType.fromPartial(object.allowedChildType)
      : undefined;
    message.allowedParentType = (object.allowedParentType !== undefined && object.allowedParentType !== null)
      ? CollectionType.fromPartial(object.allowedParentType)
      : undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCollectionTypeResult(): CollectionTypeResult {
  return { collectiontypes: [] };
}

export const CollectionTypeResult = {
  encode(message: CollectionTypeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.collectiontypes) {
      CollectionType.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionTypeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionTypeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.collectiontypes.push(CollectionType.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionTypeResult>): CollectionTypeResult {
    return CollectionTypeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionTypeResult>): CollectionTypeResult {
    const message = createBaseCollectionTypeResult();
    message.collectiontypes = object.collectiontypes?.map((e) => CollectionType.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCollectionType(): CollectionType {
  return { id: 0, name: "", description: "", updatedAt: undefined, createdAt: undefined, checksum: "" };
}

export const CollectionType = {
  encode(message: CollectionType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(34).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(50).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CollectionType {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCollectionType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CollectionType>): CollectionType {
    return CollectionType.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CollectionType>): CollectionType {
    const message = createBaseCollectionType();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCompanyResult(): CompanyResult {
  return { companies: [] };
}

export const CompanyResult = {
  encode(message: CompanyResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.companies) {
      Company.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompanyResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompanyResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.companies.push(Company.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CompanyResult>): CompanyResult {
    return CompanyResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CompanyResult>): CompanyResult {
    const message = createBaseCompanyResult();
    message.companies = object.companies?.map((e) => Company.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCompany(): Company {
  return {
    id: 0,
    changeDate: undefined,
    changeDateCategory: 0,
    changedCompanyId: undefined,
    country: 0,
    createdAt: undefined,
    description: "",
    developed: [],
    logo: undefined,
    name: "",
    parent: undefined,
    published: [],
    slug: "",
    startDate: undefined,
    startDateCategory: 0,
    updatedAt: undefined,
    url: "",
    websites: [],
    checksum: "",
  };
}

export const Company = {
  encode(message: Company, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.changeDate !== undefined) {
      Timestamp.encode(toTimestamp(message.changeDate), writer.uint32(18).fork()).ldelim();
    }
    if (message.changeDateCategory !== 0) {
      writer.uint32(24).int32(message.changeDateCategory);
    }
    if (message.changedCompanyId !== undefined) {
      Company.encode(message.changedCompanyId, writer.uint32(34).fork()).ldelim();
    }
    if (message.country !== 0) {
      writer.uint32(40).int32(message.country);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.description !== "") {
      writer.uint32(58).string(message.description);
    }
    for (const v of message.developed) {
      Game.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    if (message.logo !== undefined) {
      CompanyLogo.encode(message.logo, writer.uint32(74).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(82).string(message.name);
    }
    if (message.parent !== undefined) {
      Company.encode(message.parent, writer.uint32(90).fork()).ldelim();
    }
    for (const v of message.published) {
      Game.encode(v!, writer.uint32(98).fork()).ldelim();
    }
    if (message.slug !== "") {
      writer.uint32(106).string(message.slug);
    }
    if (message.startDate !== undefined) {
      Timestamp.encode(toTimestamp(message.startDate), writer.uint32(114).fork()).ldelim();
    }
    if (message.startDateCategory !== 0) {
      writer.uint32(120).int32(message.startDateCategory);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(130).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(138).string(message.url);
    }
    for (const v of message.websites) {
      CompanyWebsite.encode(v!, writer.uint32(146).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(154).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Company {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompany();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.changeDate = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.changeDateCategory = reader.int32() as any;
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.changedCompanyId = Company.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.country = reader.int32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.description = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.developed.push(Game.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.logo = CompanyLogo.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.name = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.parent = Company.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.published.push(Game.decode(reader, reader.uint32()));
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.startDate = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 15:
          if (tag !== 120) {
            break;
          }

          message.startDateCategory = reader.int32() as any;
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.url = reader.string();
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.websites.push(CompanyWebsite.decode(reader, reader.uint32()));
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Company>): Company {
    return Company.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Company>): Company {
    const message = createBaseCompany();
    message.id = object.id ?? 0;
    message.changeDate = object.changeDate ?? undefined;
    message.changeDateCategory = object.changeDateCategory ?? 0;
    message.changedCompanyId = (object.changedCompanyId !== undefined && object.changedCompanyId !== null)
      ? Company.fromPartial(object.changedCompanyId)
      : undefined;
    message.country = object.country ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.description = object.description ?? "";
    message.developed = object.developed?.map((e) => Game.fromPartial(e)) || [];
    message.logo = (object.logo !== undefined && object.logo !== null)
      ? CompanyLogo.fromPartial(object.logo)
      : undefined;
    message.name = object.name ?? "";
    message.parent = (object.parent !== undefined && object.parent !== null)
      ? Company.fromPartial(object.parent)
      : undefined;
    message.published = object.published?.map((e) => Game.fromPartial(e)) || [];
    message.slug = object.slug ?? "";
    message.startDate = object.startDate ?? undefined;
    message.startDateCategory = object.startDateCategory ?? 0;
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.websites = object.websites?.map((e) => CompanyWebsite.fromPartial(e)) || [];
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCompanyLogoResult(): CompanyLogoResult {
  return { companylogos: [] };
}

export const CompanyLogoResult = {
  encode(message: CompanyLogoResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.companylogos) {
      CompanyLogo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompanyLogoResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompanyLogoResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.companylogos.push(CompanyLogo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CompanyLogoResult>): CompanyLogoResult {
    return CompanyLogoResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CompanyLogoResult>): CompanyLogoResult {
    const message = createBaseCompanyLogoResult();
    message.companylogos = object.companylogos?.map((e) => CompanyLogo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCompanyLogo(): CompanyLogo {
  return { id: 0, alphaChannel: false, animated: false, height: 0, imageId: "", url: "", width: 0, checksum: "" };
}

export const CompanyLogo = {
  encode(message: CompanyLogo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.alphaChannel !== false) {
      writer.uint32(16).bool(message.alphaChannel);
    }
    if (message.animated !== false) {
      writer.uint32(24).bool(message.animated);
    }
    if (message.height !== 0) {
      writer.uint32(32).int32(message.height);
    }
    if (message.imageId !== "") {
      writer.uint32(42).string(message.imageId);
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.width !== 0) {
      writer.uint32(56).int32(message.width);
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompanyLogo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompanyLogo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.alphaChannel = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.animated = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.height = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.imageId = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CompanyLogo>): CompanyLogo {
    return CompanyLogo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CompanyLogo>): CompanyLogo {
    const message = createBaseCompanyLogo();
    message.id = object.id ?? 0;
    message.alphaChannel = object.alphaChannel ?? false;
    message.animated = object.animated ?? false;
    message.height = object.height ?? 0;
    message.imageId = object.imageId ?? "";
    message.url = object.url ?? "";
    message.width = object.width ?? 0;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCompanyWebsiteResult(): CompanyWebsiteResult {
  return { companywebsites: [] };
}

export const CompanyWebsiteResult = {
  encode(message: CompanyWebsiteResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.companywebsites) {
      CompanyWebsite.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompanyWebsiteResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompanyWebsiteResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.companywebsites.push(CompanyWebsite.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CompanyWebsiteResult>): CompanyWebsiteResult {
    return CompanyWebsiteResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CompanyWebsiteResult>): CompanyWebsiteResult {
    const message = createBaseCompanyWebsiteResult();
    message.companywebsites = object.companywebsites?.map((e) => CompanyWebsite.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCompanyWebsite(): CompanyWebsite {
  return { id: 0, category: 0, trusted: false, url: "", checksum: "" };
}

export const CompanyWebsite = {
  encode(message: CompanyWebsite, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    if (message.trusted !== false) {
      writer.uint32(24).bool(message.trusted);
    }
    if (message.url !== "") {
      writer.uint32(34).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(42).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CompanyWebsite {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCompanyWebsite();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.trusted = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.url = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CompanyWebsite>): CompanyWebsite {
    return CompanyWebsite.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CompanyWebsite>): CompanyWebsite {
    const message = createBaseCompanyWebsite();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.trusted = object.trusted ?? false;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseCoverResult(): CoverResult {
  return { covers: [] };
}

export const CoverResult = {
  encode(message: CoverResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.covers) {
      Cover.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CoverResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCoverResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.covers.push(Cover.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CoverResult>): CoverResult {
    return CoverResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CoverResult>): CoverResult {
    const message = createBaseCoverResult();
    message.covers = object.covers?.map((e) => Cover.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCover(): Cover {
  return {
    id: 0,
    alphaChannel: false,
    animated: false,
    game: undefined,
    height: 0,
    imageId: "",
    url: "",
    width: 0,
    checksum: "",
    gameLocalization: undefined,
  };
}

export const Cover = {
  encode(message: Cover, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.alphaChannel !== false) {
      writer.uint32(16).bool(message.alphaChannel);
    }
    if (message.animated !== false) {
      writer.uint32(24).bool(message.animated);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(34).fork()).ldelim();
    }
    if (message.height !== 0) {
      writer.uint32(40).int32(message.height);
    }
    if (message.imageId !== "") {
      writer.uint32(50).string(message.imageId);
    }
    if (message.url !== "") {
      writer.uint32(58).string(message.url);
    }
    if (message.width !== 0) {
      writer.uint32(64).int32(message.width);
    }
    if (message.checksum !== "") {
      writer.uint32(74).string(message.checksum);
    }
    if (message.gameLocalization !== undefined) {
      GameLocalization.encode(message.gameLocalization, writer.uint32(82).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Cover {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCover();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.alphaChannel = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.animated = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.height = reader.int32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.imageId = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.url = reader.string();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.checksum = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.gameLocalization = GameLocalization.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Cover>): Cover {
    return Cover.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Cover>): Cover {
    const message = createBaseCover();
    message.id = object.id ?? 0;
    message.alphaChannel = object.alphaChannel ?? false;
    message.animated = object.animated ?? false;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.height = object.height ?? 0;
    message.imageId = object.imageId ?? "";
    message.url = object.url ?? "";
    message.width = object.width ?? 0;
    message.checksum = object.checksum ?? "";
    message.gameLocalization = (object.gameLocalization !== undefined && object.gameLocalization !== null)
      ? GameLocalization.fromPartial(object.gameLocalization)
      : undefined;
    return message;
  },
};

function createBaseEventResult(): EventResult {
  return { events: [] };
}

export const EventResult = {
  encode(message: EventResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.events) {
      Event.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.events.push(Event.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<EventResult>): EventResult {
    return EventResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventResult>): EventResult {
    const message = createBaseEventResult();
    message.events = object.events?.map((e) => Event.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEvent(): Event {
  return {
    id: 0,
    name: "",
    description: "",
    slug: "",
    eventLogo: undefined,
    startTime: undefined,
    timeZone: "",
    endTime: undefined,
    liveStreamUrl: "",
    games: [],
    videos: [],
    eventNetworks: [],
    createdAt: undefined,
    updatedAt: undefined,
    checksum: "",
  };
}

export const Event = {
  encode(message: Event, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.slug !== "") {
      writer.uint32(34).string(message.slug);
    }
    if (message.eventLogo !== undefined) {
      EventLogo.encode(message.eventLogo, writer.uint32(42).fork()).ldelim();
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(toTimestamp(message.startTime), writer.uint32(50).fork()).ldelim();
    }
    if (message.timeZone !== "") {
      writer.uint32(58).string(message.timeZone);
    }
    if (message.endTime !== undefined) {
      Timestamp.encode(toTimestamp(message.endTime), writer.uint32(66).fork()).ldelim();
    }
    if (message.liveStreamUrl !== "") {
      writer.uint32(74).string(message.liveStreamUrl);
    }
    for (const v of message.games) {
      Game.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    for (const v of message.videos) {
      GameVideo.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    for (const v of message.eventNetworks) {
      EventNetwork.encode(v!, writer.uint32(98).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(106).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(114).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(122).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Event {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.eventLogo = EventLogo.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.startTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.timeZone = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.endTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.liveStreamUrl = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.games.push(Game.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.videos.push(GameVideo.decode(reader, reader.uint32()));
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.eventNetworks.push(EventNetwork.decode(reader, reader.uint32()));
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Event>): Event {
    return Event.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Event>): Event {
    const message = createBaseEvent();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.slug = object.slug ?? "";
    message.eventLogo = (object.eventLogo !== undefined && object.eventLogo !== null)
      ? EventLogo.fromPartial(object.eventLogo)
      : undefined;
    message.startTime = object.startTime ?? undefined;
    message.timeZone = object.timeZone ?? "";
    message.endTime = object.endTime ?? undefined;
    message.liveStreamUrl = object.liveStreamUrl ?? "";
    message.games = object.games?.map((e) => Game.fromPartial(e)) || [];
    message.videos = object.videos?.map((e) => GameVideo.fromPartial(e)) || [];
    message.eventNetworks = object.eventNetworks?.map((e) => EventNetwork.fromPartial(e)) || [];
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseEventLogoResult(): EventLogoResult {
  return { eventlogos: [] };
}

export const EventLogoResult = {
  encode(message: EventLogoResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.eventlogos) {
      EventLogo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventLogoResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogoResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.eventlogos.push(EventLogo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<EventLogoResult>): EventLogoResult {
    return EventLogoResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventLogoResult>): EventLogoResult {
    const message = createBaseEventLogoResult();
    message.eventlogos = object.eventlogos?.map((e) => EventLogo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEventLogo(): EventLogo {
  return {
    id: 0,
    event: undefined,
    alphaChannel: false,
    animated: false,
    height: 0,
    imageId: "",
    url: "",
    width: 0,
    createdAt: undefined,
    updatedAt: undefined,
    checksum: "",
  };
}

export const EventLogo = {
  encode(message: EventLogo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.event !== undefined) {
      Event.encode(message.event, writer.uint32(18).fork()).ldelim();
    }
    if (message.alphaChannel !== false) {
      writer.uint32(24).bool(message.alphaChannel);
    }
    if (message.animated !== false) {
      writer.uint32(32).bool(message.animated);
    }
    if (message.height !== 0) {
      writer.uint32(40).int32(message.height);
    }
    if (message.imageId !== "") {
      writer.uint32(50).string(message.imageId);
    }
    if (message.url !== "") {
      writer.uint32(58).string(message.url);
    }
    if (message.width !== 0) {
      writer.uint32(64).int32(message.width);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(74).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(82).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(90).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventLogo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventLogo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.event = Event.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.alphaChannel = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.animated = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.height = reader.int32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.imageId = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.url = reader.string();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<EventLogo>): EventLogo {
    return EventLogo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventLogo>): EventLogo {
    const message = createBaseEventLogo();
    message.id = object.id ?? 0;
    message.event = (object.event !== undefined && object.event !== null) ? Event.fromPartial(object.event) : undefined;
    message.alphaChannel = object.alphaChannel ?? false;
    message.animated = object.animated ?? false;
    message.height = object.height ?? 0;
    message.imageId = object.imageId ?? "";
    message.url = object.url ?? "";
    message.width = object.width ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseEventNetworkResult(): EventNetworkResult {
  return { eventnetworks: [] };
}

export const EventNetworkResult = {
  encode(message: EventNetworkResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.eventnetworks) {
      EventNetwork.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventNetworkResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventNetworkResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.eventnetworks.push(EventNetwork.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<EventNetworkResult>): EventNetworkResult {
    return EventNetworkResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventNetworkResult>): EventNetworkResult {
    const message = createBaseEventNetworkResult();
    message.eventnetworks = object.eventnetworks?.map((e) => EventNetwork.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEventNetwork(): EventNetwork {
  return {
    id: 0,
    event: undefined,
    url: "",
    networkType: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    checksum: "",
  };
}

export const EventNetwork = {
  encode(message: EventNetwork, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.event !== undefined) {
      Event.encode(message.event, writer.uint32(18).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(26).string(message.url);
    }
    if (message.networkType !== undefined) {
      NetworkType.encode(message.networkType, writer.uint32(34).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventNetwork {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventNetwork();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.event = Event.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.url = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.networkType = NetworkType.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<EventNetwork>): EventNetwork {
    return EventNetwork.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<EventNetwork>): EventNetwork {
    const message = createBaseEventNetwork();
    message.id = object.id ?? 0;
    message.event = (object.event !== undefined && object.event !== null) ? Event.fromPartial(object.event) : undefined;
    message.url = object.url ?? "";
    message.networkType = (object.networkType !== undefined && object.networkType !== null)
      ? NetworkType.fromPartial(object.networkType)
      : undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseExternalGameResult(): ExternalGameResult {
  return { externalgames: [] };
}

export const ExternalGameResult = {
  encode(message: ExternalGameResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.externalgames) {
      ExternalGame.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExternalGameResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExternalGameResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.externalgames.push(ExternalGame.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ExternalGameResult>): ExternalGameResult {
    return ExternalGameResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ExternalGameResult>): ExternalGameResult {
    const message = createBaseExternalGameResult();
    message.externalgames = object.externalgames?.map((e) => ExternalGame.fromPartial(e)) || [];
    return message;
  },
};

function createBaseExternalGame(): ExternalGame {
  return {
    id: 0,
    category: 0,
    createdAt: undefined,
    game: undefined,
    name: "",
    uid: "",
    updatedAt: undefined,
    url: "",
    year: 0,
    media: 0,
    platform: undefined,
    countries: [],
    checksum: "",
  };
}

export const ExternalGame = {
  encode(message: ExternalGame, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(26).fork()).ldelim();
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(34).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(42).string(message.name);
    }
    if (message.uid !== "") {
      writer.uint32(50).string(message.uid);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(58).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(66).string(message.url);
    }
    if (message.year !== 0) {
      writer.uint32(72).int32(message.year);
    }
    if (message.media !== 0) {
      writer.uint32(80).int32(message.media);
    }
    if (message.platform !== undefined) {
      Platform.encode(message.platform, writer.uint32(90).fork()).ldelim();
    }
    writer.uint32(98).fork();
    for (const v of message.countries) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.checksum !== "") {
      writer.uint32(106).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExternalGame {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExternalGame();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.name = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.uid = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.url = reader.string();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.year = reader.int32();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.media = reader.int32() as any;
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.platform = Platform.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag === 96) {
            message.countries.push(reader.int32());

            continue;
          }

          if (tag === 98) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.countries.push(reader.int32());
            }

            continue;
          }

          break;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ExternalGame>): ExternalGame {
    return ExternalGame.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ExternalGame>): ExternalGame {
    const message = createBaseExternalGame();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.name = object.name ?? "";
    message.uid = object.uid ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.year = object.year ?? 0;
    message.media = object.media ?? 0;
    message.platform = (object.platform !== undefined && object.platform !== null)
      ? Platform.fromPartial(object.platform)
      : undefined;
    message.countries = object.countries?.map((e) => e) || [];
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseFranchiseResult(): FranchiseResult {
  return { franchises: [] };
}

export const FranchiseResult = {
  encode(message: FranchiseResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.franchises) {
      Franchise.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FranchiseResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFranchiseResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.franchises.push(Franchise.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<FranchiseResult>): FranchiseResult {
    return FranchiseResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FranchiseResult>): FranchiseResult {
    const message = createBaseFranchiseResult();
    message.franchises = object.franchises?.map((e) => Franchise.fromPartial(e)) || [];
    return message;
  },
};

function createBaseFranchise(): Franchise {
  return { id: 0, createdAt: undefined, games: [], name: "", slug: "", updatedAt: undefined, url: "", checksum: "" };
}

export const Franchise = {
  encode(message: Franchise, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.games) {
      Game.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(34).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(42).string(message.slug);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(58).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Franchise {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFranchise();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.games.push(Game.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.name = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.url = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Franchise>): Franchise {
    return Franchise.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Franchise>): Franchise {
    const message = createBaseFranchise();
    message.id = object.id ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.games = object.games?.map((e) => Game.fromPartial(e)) || [];
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGameResult(): GameResult {
  return { games: [] };
}

export const GameResult = {
  encode(message: GameResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.games) {
      Game.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.games.push(Game.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameResult>): GameResult {
    return GameResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameResult>): GameResult {
    const message = createBaseGameResult();
    message.games = object.games?.map((e) => Game.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGame(): Game {
  return {
    id: 0,
    ageRatings: [],
    aggregatedRating: 0,
    aggregatedRatingCount: 0,
    alternativeNames: [],
    artworks: [],
    bundles: [],
    category: 0,
    collection: undefined,
    cover: undefined,
    createdAt: undefined,
    dlcs: [],
    expansions: [],
    externalGames: [],
    firstReleaseDate: undefined,
    follows: 0,
    franchise: undefined,
    franchises: [],
    gameEngines: [],
    gameModes: [],
    genres: [],
    hypes: 0,
    involvedCompanies: [],
    keywords: [],
    multiplayerModes: [],
    name: "",
    parentGame: undefined,
    platforms: [],
    playerPerspectives: [],
    rating: 0,
    ratingCount: 0,
    releaseDates: [],
    screenshots: [],
    similarGames: [],
    slug: "",
    standaloneExpansions: [],
    status: 0,
    storyline: "",
    summary: "",
    tags: [],
    themes: [],
    totalRating: 0,
    totalRatingCount: 0,
    updatedAt: undefined,
    url: "",
    versionParent: undefined,
    versionTitle: "",
    videos: [],
    websites: [],
    checksum: "",
    remakes: [],
    remasters: [],
    expandedGames: [],
    ports: [],
    forks: [],
    languageSupports: [],
    gameLocalizations: [],
    collections: [],
  };
}

export const Game = {
  encode(message: Game, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    for (const v of message.ageRatings) {
      AgeRating.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.aggregatedRating !== 0) {
      writer.uint32(25).double(message.aggregatedRating);
    }
    if (message.aggregatedRatingCount !== 0) {
      writer.uint32(32).int32(message.aggregatedRatingCount);
    }
    for (const v of message.alternativeNames) {
      AlternativeName.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.artworks) {
      Artwork.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.bundles) {
      Game.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (message.category !== 0) {
      writer.uint32(64).int32(message.category);
    }
    if (message.collection !== undefined) {
      Collection.encode(message.collection, writer.uint32(74).fork()).ldelim();
    }
    if (message.cover !== undefined) {
      Cover.encode(message.cover, writer.uint32(82).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(90).fork()).ldelim();
    }
    for (const v of message.dlcs) {
      Game.encode(v!, writer.uint32(98).fork()).ldelim();
    }
    for (const v of message.expansions) {
      Game.encode(v!, writer.uint32(106).fork()).ldelim();
    }
    for (const v of message.externalGames) {
      ExternalGame.encode(v!, writer.uint32(114).fork()).ldelim();
    }
    if (message.firstReleaseDate !== undefined) {
      Timestamp.encode(toTimestamp(message.firstReleaseDate), writer.uint32(122).fork()).ldelim();
    }
    if (message.follows !== 0) {
      writer.uint32(128).int32(message.follows);
    }
    if (message.franchise !== undefined) {
      Franchise.encode(message.franchise, writer.uint32(138).fork()).ldelim();
    }
    for (const v of message.franchises) {
      Franchise.encode(v!, writer.uint32(146).fork()).ldelim();
    }
    for (const v of message.gameEngines) {
      GameEngine.encode(v!, writer.uint32(154).fork()).ldelim();
    }
    for (const v of message.gameModes) {
      GameMode.encode(v!, writer.uint32(162).fork()).ldelim();
    }
    for (const v of message.genres) {
      Genre.encode(v!, writer.uint32(170).fork()).ldelim();
    }
    if (message.hypes !== 0) {
      writer.uint32(176).int32(message.hypes);
    }
    for (const v of message.involvedCompanies) {
      InvolvedCompany.encode(v!, writer.uint32(186).fork()).ldelim();
    }
    for (const v of message.keywords) {
      Keyword.encode(v!, writer.uint32(194).fork()).ldelim();
    }
    for (const v of message.multiplayerModes) {
      MultiplayerMode.encode(v!, writer.uint32(202).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(210).string(message.name);
    }
    if (message.parentGame !== undefined) {
      Game.encode(message.parentGame, writer.uint32(218).fork()).ldelim();
    }
    for (const v of message.platforms) {
      Platform.encode(v!, writer.uint32(226).fork()).ldelim();
    }
    for (const v of message.playerPerspectives) {
      PlayerPerspective.encode(v!, writer.uint32(234).fork()).ldelim();
    }
    if (message.rating !== 0) {
      writer.uint32(241).double(message.rating);
    }
    if (message.ratingCount !== 0) {
      writer.uint32(248).int32(message.ratingCount);
    }
    for (const v of message.releaseDates) {
      ReleaseDate.encode(v!, writer.uint32(258).fork()).ldelim();
    }
    for (const v of message.screenshots) {
      Screenshot.encode(v!, writer.uint32(266).fork()).ldelim();
    }
    for (const v of message.similarGames) {
      Game.encode(v!, writer.uint32(274).fork()).ldelim();
    }
    if (message.slug !== "") {
      writer.uint32(282).string(message.slug);
    }
    for (const v of message.standaloneExpansions) {
      Game.encode(v!, writer.uint32(290).fork()).ldelim();
    }
    if (message.status !== 0) {
      writer.uint32(296).int32(message.status);
    }
    if (message.storyline !== "") {
      writer.uint32(306).string(message.storyline);
    }
    if (message.summary !== "") {
      writer.uint32(314).string(message.summary);
    }
    writer.uint32(322).fork();
    for (const v of message.tags) {
      writer.int32(v);
    }
    writer.ldelim();
    for (const v of message.themes) {
      Theme.encode(v!, writer.uint32(330).fork()).ldelim();
    }
    if (message.totalRating !== 0) {
      writer.uint32(337).double(message.totalRating);
    }
    if (message.totalRatingCount !== 0) {
      writer.uint32(344).int32(message.totalRatingCount);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(354).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(362).string(message.url);
    }
    if (message.versionParent !== undefined) {
      Game.encode(message.versionParent, writer.uint32(370).fork()).ldelim();
    }
    if (message.versionTitle !== "") {
      writer.uint32(378).string(message.versionTitle);
    }
    for (const v of message.videos) {
      GameVideo.encode(v!, writer.uint32(386).fork()).ldelim();
    }
    for (const v of message.websites) {
      Website.encode(v!, writer.uint32(394).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(402).string(message.checksum);
    }
    for (const v of message.remakes) {
      Game.encode(v!, writer.uint32(410).fork()).ldelim();
    }
    for (const v of message.remasters) {
      Game.encode(v!, writer.uint32(418).fork()).ldelim();
    }
    for (const v of message.expandedGames) {
      Game.encode(v!, writer.uint32(426).fork()).ldelim();
    }
    for (const v of message.ports) {
      Game.encode(v!, writer.uint32(434).fork()).ldelim();
    }
    for (const v of message.forks) {
      Game.encode(v!, writer.uint32(442).fork()).ldelim();
    }
    for (const v of message.languageSupports) {
      LanguageSupport.encode(v!, writer.uint32(450).fork()).ldelim();
    }
    for (const v of message.gameLocalizations) {
      GameLocalization.encode(v!, writer.uint32(458).fork()).ldelim();
    }
    for (const v of message.collections) {
      Collection.encode(v!, writer.uint32(466).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Game {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGame();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.ageRatings.push(AgeRating.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.aggregatedRating = reader.double();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.aggregatedRatingCount = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.alternativeNames.push(AlternativeName.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.artworks.push(Artwork.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.bundles.push(Game.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.collection = Collection.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.cover = Cover.decode(reader, reader.uint32());
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.dlcs.push(Game.decode(reader, reader.uint32()));
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.expansions.push(Game.decode(reader, reader.uint32()));
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.externalGames.push(ExternalGame.decode(reader, reader.uint32()));
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.firstReleaseDate = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 16:
          if (tag !== 128) {
            break;
          }

          message.follows = reader.int32();
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.franchise = Franchise.decode(reader, reader.uint32());
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.franchises.push(Franchise.decode(reader, reader.uint32()));
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.gameEngines.push(GameEngine.decode(reader, reader.uint32()));
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.gameModes.push(GameMode.decode(reader, reader.uint32()));
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.genres.push(Genre.decode(reader, reader.uint32()));
          continue;
        case 22:
          if (tag !== 176) {
            break;
          }

          message.hypes = reader.int32();
          continue;
        case 23:
          if (tag !== 186) {
            break;
          }

          message.involvedCompanies.push(InvolvedCompany.decode(reader, reader.uint32()));
          continue;
        case 24:
          if (tag !== 194) {
            break;
          }

          message.keywords.push(Keyword.decode(reader, reader.uint32()));
          continue;
        case 25:
          if (tag !== 202) {
            break;
          }

          message.multiplayerModes.push(MultiplayerMode.decode(reader, reader.uint32()));
          continue;
        case 26:
          if (tag !== 210) {
            break;
          }

          message.name = reader.string();
          continue;
        case 27:
          if (tag !== 218) {
            break;
          }

          message.parentGame = Game.decode(reader, reader.uint32());
          continue;
        case 28:
          if (tag !== 226) {
            break;
          }

          message.platforms.push(Platform.decode(reader, reader.uint32()));
          continue;
        case 29:
          if (tag !== 234) {
            break;
          }

          message.playerPerspectives.push(PlayerPerspective.decode(reader, reader.uint32()));
          continue;
        case 30:
          if (tag !== 241) {
            break;
          }

          message.rating = reader.double();
          continue;
        case 31:
          if (tag !== 248) {
            break;
          }

          message.ratingCount = reader.int32();
          continue;
        case 32:
          if (tag !== 258) {
            break;
          }

          message.releaseDates.push(ReleaseDate.decode(reader, reader.uint32()));
          continue;
        case 33:
          if (tag !== 266) {
            break;
          }

          message.screenshots.push(Screenshot.decode(reader, reader.uint32()));
          continue;
        case 34:
          if (tag !== 274) {
            break;
          }

          message.similarGames.push(Game.decode(reader, reader.uint32()));
          continue;
        case 35:
          if (tag !== 282) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 36:
          if (tag !== 290) {
            break;
          }

          message.standaloneExpansions.push(Game.decode(reader, reader.uint32()));
          continue;
        case 37:
          if (tag !== 296) {
            break;
          }

          message.status = reader.int32() as any;
          continue;
        case 38:
          if (tag !== 306) {
            break;
          }

          message.storyline = reader.string();
          continue;
        case 39:
          if (tag !== 314) {
            break;
          }

          message.summary = reader.string();
          continue;
        case 40:
          if (tag === 320) {
            message.tags.push(reader.int32());

            continue;
          }

          if (tag === 322) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.tags.push(reader.int32());
            }

            continue;
          }

          break;
        case 41:
          if (tag !== 330) {
            break;
          }

          message.themes.push(Theme.decode(reader, reader.uint32()));
          continue;
        case 42:
          if (tag !== 337) {
            break;
          }

          message.totalRating = reader.double();
          continue;
        case 43:
          if (tag !== 344) {
            break;
          }

          message.totalRatingCount = reader.int32();
          continue;
        case 44:
          if (tag !== 354) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 45:
          if (tag !== 362) {
            break;
          }

          message.url = reader.string();
          continue;
        case 46:
          if (tag !== 370) {
            break;
          }

          message.versionParent = Game.decode(reader, reader.uint32());
          continue;
        case 47:
          if (tag !== 378) {
            break;
          }

          message.versionTitle = reader.string();
          continue;
        case 48:
          if (tag !== 386) {
            break;
          }

          message.videos.push(GameVideo.decode(reader, reader.uint32()));
          continue;
        case 49:
          if (tag !== 394) {
            break;
          }

          message.websites.push(Website.decode(reader, reader.uint32()));
          continue;
        case 50:
          if (tag !== 402) {
            break;
          }

          message.checksum = reader.string();
          continue;
        case 51:
          if (tag !== 410) {
            break;
          }

          message.remakes.push(Game.decode(reader, reader.uint32()));
          continue;
        case 52:
          if (tag !== 418) {
            break;
          }

          message.remasters.push(Game.decode(reader, reader.uint32()));
          continue;
        case 53:
          if (tag !== 426) {
            break;
          }

          message.expandedGames.push(Game.decode(reader, reader.uint32()));
          continue;
        case 54:
          if (tag !== 434) {
            break;
          }

          message.ports.push(Game.decode(reader, reader.uint32()));
          continue;
        case 55:
          if (tag !== 442) {
            break;
          }

          message.forks.push(Game.decode(reader, reader.uint32()));
          continue;
        case 56:
          if (tag !== 450) {
            break;
          }

          message.languageSupports.push(LanguageSupport.decode(reader, reader.uint32()));
          continue;
        case 57:
          if (tag !== 458) {
            break;
          }

          message.gameLocalizations.push(GameLocalization.decode(reader, reader.uint32()));
          continue;
        case 58:
          if (tag !== 466) {
            break;
          }

          message.collections.push(Collection.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Game>): Game {
    return Game.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Game>): Game {
    const message = createBaseGame();
    message.id = object.id ?? 0;
    message.ageRatings = object.ageRatings?.map((e) => AgeRating.fromPartial(e)) || [];
    message.aggregatedRating = object.aggregatedRating ?? 0;
    message.aggregatedRatingCount = object.aggregatedRatingCount ?? 0;
    message.alternativeNames = object.alternativeNames?.map((e) => AlternativeName.fromPartial(e)) || [];
    message.artworks = object.artworks?.map((e) => Artwork.fromPartial(e)) || [];
    message.bundles = object.bundles?.map((e) => Game.fromPartial(e)) || [];
    message.category = object.category ?? 0;
    message.collection = (object.collection !== undefined && object.collection !== null)
      ? Collection.fromPartial(object.collection)
      : undefined;
    message.cover = (object.cover !== undefined && object.cover !== null) ? Cover.fromPartial(object.cover) : undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.dlcs = object.dlcs?.map((e) => Game.fromPartial(e)) || [];
    message.expansions = object.expansions?.map((e) => Game.fromPartial(e)) || [];
    message.externalGames = object.externalGames?.map((e) => ExternalGame.fromPartial(e)) || [];
    message.firstReleaseDate = object.firstReleaseDate ?? undefined;
    message.follows = object.follows ?? 0;
    message.franchise = (object.franchise !== undefined && object.franchise !== null)
      ? Franchise.fromPartial(object.franchise)
      : undefined;
    message.franchises = object.franchises?.map((e) => Franchise.fromPartial(e)) || [];
    message.gameEngines = object.gameEngines?.map((e) => GameEngine.fromPartial(e)) || [];
    message.gameModes = object.gameModes?.map((e) => GameMode.fromPartial(e)) || [];
    message.genres = object.genres?.map((e) => Genre.fromPartial(e)) || [];
    message.hypes = object.hypes ?? 0;
    message.involvedCompanies = object.involvedCompanies?.map((e) => InvolvedCompany.fromPartial(e)) || [];
    message.keywords = object.keywords?.map((e) => Keyword.fromPartial(e)) || [];
    message.multiplayerModes = object.multiplayerModes?.map((e) => MultiplayerMode.fromPartial(e)) || [];
    message.name = object.name ?? "";
    message.parentGame = (object.parentGame !== undefined && object.parentGame !== null)
      ? Game.fromPartial(object.parentGame)
      : undefined;
    message.platforms = object.platforms?.map((e) => Platform.fromPartial(e)) || [];
    message.playerPerspectives = object.playerPerspectives?.map((e) => PlayerPerspective.fromPartial(e)) || [];
    message.rating = object.rating ?? 0;
    message.ratingCount = object.ratingCount ?? 0;
    message.releaseDates = object.releaseDates?.map((e) => ReleaseDate.fromPartial(e)) || [];
    message.screenshots = object.screenshots?.map((e) => Screenshot.fromPartial(e)) || [];
    message.similarGames = object.similarGames?.map((e) => Game.fromPartial(e)) || [];
    message.slug = object.slug ?? "";
    message.standaloneExpansions = object.standaloneExpansions?.map((e) => Game.fromPartial(e)) || [];
    message.status = object.status ?? 0;
    message.storyline = object.storyline ?? "";
    message.summary = object.summary ?? "";
    message.tags = object.tags?.map((e) => e) || [];
    message.themes = object.themes?.map((e) => Theme.fromPartial(e)) || [];
    message.totalRating = object.totalRating ?? 0;
    message.totalRatingCount = object.totalRatingCount ?? 0;
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.versionParent = (object.versionParent !== undefined && object.versionParent !== null)
      ? Game.fromPartial(object.versionParent)
      : undefined;
    message.versionTitle = object.versionTitle ?? "";
    message.videos = object.videos?.map((e) => GameVideo.fromPartial(e)) || [];
    message.websites = object.websites?.map((e) => Website.fromPartial(e)) || [];
    message.checksum = object.checksum ?? "";
    message.remakes = object.remakes?.map((e) => Game.fromPartial(e)) || [];
    message.remasters = object.remasters?.map((e) => Game.fromPartial(e)) || [];
    message.expandedGames = object.expandedGames?.map((e) => Game.fromPartial(e)) || [];
    message.ports = object.ports?.map((e) => Game.fromPartial(e)) || [];
    message.forks = object.forks?.map((e) => Game.fromPartial(e)) || [];
    message.languageSupports = object.languageSupports?.map((e) => LanguageSupport.fromPartial(e)) || [];
    message.gameLocalizations = object.gameLocalizations?.map((e) => GameLocalization.fromPartial(e)) || [];
    message.collections = object.collections?.map((e) => Collection.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameEngineResult(): GameEngineResult {
  return { gameengines: [] };
}

export const GameEngineResult = {
  encode(message: GameEngineResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gameengines) {
      GameEngine.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameEngineResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameEngineResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gameengines.push(GameEngine.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameEngineResult>): GameEngineResult {
    return GameEngineResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameEngineResult>): GameEngineResult {
    const message = createBaseGameEngineResult();
    message.gameengines = object.gameengines?.map((e) => GameEngine.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameEngine(): GameEngine {
  return {
    id: 0,
    companies: [],
    createdAt: undefined,
    description: "",
    logo: undefined,
    name: "",
    platforms: [],
    slug: "",
    updatedAt: undefined,
    url: "",
    checksum: "",
  };
}

export const GameEngine = {
  encode(message: GameEngine, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    for (const v of message.companies) {
      Company.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(26).fork()).ldelim();
    }
    if (message.description !== "") {
      writer.uint32(34).string(message.description);
    }
    if (message.logo !== undefined) {
      GameEngineLogo.encode(message.logo, writer.uint32(42).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(50).string(message.name);
    }
    for (const v of message.platforms) {
      Platform.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (message.slug !== "") {
      writer.uint32(66).string(message.slug);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(74).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(82).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(90).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameEngine {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameEngine();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.companies.push(Company.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.description = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.logo = GameEngineLogo.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.name = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.platforms.push(Platform.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.url = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameEngine>): GameEngine {
    return GameEngine.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameEngine>): GameEngine {
    const message = createBaseGameEngine();
    message.id = object.id ?? 0;
    message.companies = object.companies?.map((e) => Company.fromPartial(e)) || [];
    message.createdAt = object.createdAt ?? undefined;
    message.description = object.description ?? "";
    message.logo = (object.logo !== undefined && object.logo !== null)
      ? GameEngineLogo.fromPartial(object.logo)
      : undefined;
    message.name = object.name ?? "";
    message.platforms = object.platforms?.map((e) => Platform.fromPartial(e)) || [];
    message.slug = object.slug ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGameEngineLogoResult(): GameEngineLogoResult {
  return { gameenginelogos: [] };
}

export const GameEngineLogoResult = {
  encode(message: GameEngineLogoResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gameenginelogos) {
      GameEngineLogo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameEngineLogoResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameEngineLogoResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gameenginelogos.push(GameEngineLogo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameEngineLogoResult>): GameEngineLogoResult {
    return GameEngineLogoResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameEngineLogoResult>): GameEngineLogoResult {
    const message = createBaseGameEngineLogoResult();
    message.gameenginelogos = object.gameenginelogos?.map((e) => GameEngineLogo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameEngineLogo(): GameEngineLogo {
  return { id: 0, alphaChannel: false, animated: false, height: 0, imageId: "", url: "", width: 0, checksum: "" };
}

export const GameEngineLogo = {
  encode(message: GameEngineLogo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.alphaChannel !== false) {
      writer.uint32(16).bool(message.alphaChannel);
    }
    if (message.animated !== false) {
      writer.uint32(24).bool(message.animated);
    }
    if (message.height !== 0) {
      writer.uint32(32).int32(message.height);
    }
    if (message.imageId !== "") {
      writer.uint32(42).string(message.imageId);
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.width !== 0) {
      writer.uint32(56).int32(message.width);
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameEngineLogo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameEngineLogo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.alphaChannel = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.animated = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.height = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.imageId = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameEngineLogo>): GameEngineLogo {
    return GameEngineLogo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameEngineLogo>): GameEngineLogo {
    const message = createBaseGameEngineLogo();
    message.id = object.id ?? 0;
    message.alphaChannel = object.alphaChannel ?? false;
    message.animated = object.animated ?? false;
    message.height = object.height ?? 0;
    message.imageId = object.imageId ?? "";
    message.url = object.url ?? "";
    message.width = object.width ?? 0;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGameLocalizationResult(): GameLocalizationResult {
  return { gamelocalizations: [] };
}

export const GameLocalizationResult = {
  encode(message: GameLocalizationResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gamelocalizations) {
      GameLocalization.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameLocalizationResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameLocalizationResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gamelocalizations.push(GameLocalization.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameLocalizationResult>): GameLocalizationResult {
    return GameLocalizationResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameLocalizationResult>): GameLocalizationResult {
    const message = createBaseGameLocalizationResult();
    message.gamelocalizations = object.gamelocalizations?.map((e) => GameLocalization.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameLocalization(): GameLocalization {
  return {
    id: 0,
    name: "",
    cover: undefined,
    game: undefined,
    region: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    checksum: "",
  };
}

export const GameLocalization = {
  encode(message: GameLocalization, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.cover !== undefined) {
      Cover.encode(message.cover, writer.uint32(26).fork()).ldelim();
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(34).fork()).ldelim();
    }
    if (message.region !== undefined) {
      Region.encode(message.region, writer.uint32(42).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(58).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameLocalization {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameLocalization();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.cover = Cover.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.region = Region.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameLocalization>): GameLocalization {
    return GameLocalization.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameLocalization>): GameLocalization {
    const message = createBaseGameLocalization();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.cover = (object.cover !== undefined && object.cover !== null) ? Cover.fromPartial(object.cover) : undefined;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.region = (object.region !== undefined && object.region !== null)
      ? Region.fromPartial(object.region)
      : undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGameModeResult(): GameModeResult {
  return { gamemodes: [] };
}

export const GameModeResult = {
  encode(message: GameModeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gamemodes) {
      GameMode.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameModeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameModeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gamemodes.push(GameMode.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameModeResult>): GameModeResult {
    return GameModeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameModeResult>): GameModeResult {
    const message = createBaseGameModeResult();
    message.gamemodes = object.gamemodes?.map((e) => GameMode.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameMode(): GameMode {
  return { id: 0, createdAt: undefined, name: "", slug: "", updatedAt: undefined, url: "", checksum: "" };
}

export const GameMode = {
  encode(message: GameMode, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(34).string(message.slug);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameMode {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameMode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameMode>): GameMode {
    return GameMode.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameMode>): GameMode {
    const message = createBaseGameMode();
    message.id = object.id ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGameVersionResult(): GameVersionResult {
  return { gameversions: [] };
}

export const GameVersionResult = {
  encode(message: GameVersionResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gameversions) {
      GameVersion.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameVersionResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameVersionResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gameversions.push(GameVersion.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameVersionResult>): GameVersionResult {
    return GameVersionResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameVersionResult>): GameVersionResult {
    const message = createBaseGameVersionResult();
    message.gameversions = object.gameversions?.map((e) => GameVersion.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameVersion(): GameVersion {
  return {
    id: 0,
    createdAt: undefined,
    features: [],
    game: undefined,
    games: [],
    updatedAt: undefined,
    url: "",
    checksum: "",
  };
}

export const GameVersion = {
  encode(message: GameVersion, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.features) {
      GameVersionFeature.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.games) {
      Game.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(58).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameVersion {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameVersion();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.features.push(GameVersionFeature.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.games.push(Game.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.url = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameVersion>): GameVersion {
    return GameVersion.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameVersion>): GameVersion {
    const message = createBaseGameVersion();
    message.id = object.id ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.features = object.features?.map((e) => GameVersionFeature.fromPartial(e)) || [];
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.games = object.games?.map((e) => Game.fromPartial(e)) || [];
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGameVersionFeatureResult(): GameVersionFeatureResult {
  return { gameversionfeatures: [] };
}

export const GameVersionFeatureResult = {
  encode(message: GameVersionFeatureResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gameversionfeatures) {
      GameVersionFeature.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameVersionFeatureResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameVersionFeatureResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gameversionfeatures.push(GameVersionFeature.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameVersionFeatureResult>): GameVersionFeatureResult {
    return GameVersionFeatureResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameVersionFeatureResult>): GameVersionFeatureResult {
    const message = createBaseGameVersionFeatureResult();
    message.gameversionfeatures = object.gameversionfeatures?.map((e) => GameVersionFeature.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameVersionFeature(): GameVersionFeature {
  return { id: 0, category: 0, description: "", position: 0, title: "", values: [], checksum: "" };
}

export const GameVersionFeature = {
  encode(message: GameVersionFeature, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.position !== 0) {
      writer.uint32(32).int32(message.position);
    }
    if (message.title !== "") {
      writer.uint32(42).string(message.title);
    }
    for (const v of message.values) {
      GameVersionFeatureValue.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameVersionFeature {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameVersionFeature();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.position = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.title = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.values.push(GameVersionFeatureValue.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameVersionFeature>): GameVersionFeature {
    return GameVersionFeature.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameVersionFeature>): GameVersionFeature {
    const message = createBaseGameVersionFeature();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.description = object.description ?? "";
    message.position = object.position ?? 0;
    message.title = object.title ?? "";
    message.values = object.values?.map((e) => GameVersionFeatureValue.fromPartial(e)) || [];
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGameVersionFeatureValueResult(): GameVersionFeatureValueResult {
  return { gameversionfeaturevalues: [] };
}

export const GameVersionFeatureValueResult = {
  encode(message: GameVersionFeatureValueResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gameversionfeaturevalues) {
      GameVersionFeatureValue.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameVersionFeatureValueResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameVersionFeatureValueResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gameversionfeaturevalues.push(GameVersionFeatureValue.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameVersionFeatureValueResult>): GameVersionFeatureValueResult {
    return GameVersionFeatureValueResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameVersionFeatureValueResult>): GameVersionFeatureValueResult {
    const message = createBaseGameVersionFeatureValueResult();
    message.gameversionfeaturevalues =
      object.gameversionfeaturevalues?.map((e) => GameVersionFeatureValue.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameVersionFeatureValue(): GameVersionFeatureValue {
  return { id: 0, game: undefined, gameFeature: undefined, includedFeature: 0, note: "", checksum: "" };
}

export const GameVersionFeatureValue = {
  encode(message: GameVersionFeatureValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(18).fork()).ldelim();
    }
    if (message.gameFeature !== undefined) {
      GameVersionFeature.encode(message.gameFeature, writer.uint32(26).fork()).ldelim();
    }
    if (message.includedFeature !== 0) {
      writer.uint32(32).int32(message.includedFeature);
    }
    if (message.note !== "") {
      writer.uint32(42).string(message.note);
    }
    if (message.checksum !== "") {
      writer.uint32(50).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameVersionFeatureValue {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameVersionFeatureValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.gameFeature = GameVersionFeature.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.includedFeature = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.note = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameVersionFeatureValue>): GameVersionFeatureValue {
    return GameVersionFeatureValue.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameVersionFeatureValue>): GameVersionFeatureValue {
    const message = createBaseGameVersionFeatureValue();
    message.id = object.id ?? 0;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.gameFeature = (object.gameFeature !== undefined && object.gameFeature !== null)
      ? GameVersionFeature.fromPartial(object.gameFeature)
      : undefined;
    message.includedFeature = object.includedFeature ?? 0;
    message.note = object.note ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGameVideoResult(): GameVideoResult {
  return { gamevideos: [] };
}

export const GameVideoResult = {
  encode(message: GameVideoResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.gamevideos) {
      GameVideo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameVideoResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameVideoResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.gamevideos.push(GameVideo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameVideoResult>): GameVideoResult {
    return GameVideoResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameVideoResult>): GameVideoResult {
    const message = createBaseGameVideoResult();
    message.gamevideos = object.gamevideos?.map((e) => GameVideo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGameVideo(): GameVideo {
  return { id: 0, game: undefined, name: "", videoId: "", checksum: "" };
}

export const GameVideo = {
  encode(message: GameVideo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.videoId !== "") {
      writer.uint32(34).string(message.videoId);
    }
    if (message.checksum !== "") {
      writer.uint32(42).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GameVideo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGameVideo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.videoId = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GameVideo>): GameVideo {
    return GameVideo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GameVideo>): GameVideo {
    const message = createBaseGameVideo();
    message.id = object.id ?? 0;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.name = object.name ?? "";
    message.videoId = object.videoId ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseGenreResult(): GenreResult {
  return { genres: [] };
}

export const GenreResult = {
  encode(message: GenreResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.genres) {
      Genre.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenreResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenreResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.genres.push(Genre.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GenreResult>): GenreResult {
    return GenreResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GenreResult>): GenreResult {
    const message = createBaseGenreResult();
    message.genres = object.genres?.map((e) => Genre.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGenre(): Genre {
  return { id: 0, createdAt: undefined, name: "", slug: "", updatedAt: undefined, url: "", checksum: "" };
}

export const Genre = {
  encode(message: Genre, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(34).string(message.slug);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Genre {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenre();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Genre>): Genre {
    return Genre.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Genre>): Genre {
    const message = createBaseGenre();
    message.id = object.id ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseInvolvedCompanyResult(): InvolvedCompanyResult {
  return { involvedcompanies: [] };
}

export const InvolvedCompanyResult = {
  encode(message: InvolvedCompanyResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.involvedcompanies) {
      InvolvedCompany.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InvolvedCompanyResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInvolvedCompanyResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.involvedcompanies.push(InvolvedCompany.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<InvolvedCompanyResult>): InvolvedCompanyResult {
    return InvolvedCompanyResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<InvolvedCompanyResult>): InvolvedCompanyResult {
    const message = createBaseInvolvedCompanyResult();
    message.involvedcompanies = object.involvedcompanies?.map((e) => InvolvedCompany.fromPartial(e)) || [];
    return message;
  },
};

function createBaseInvolvedCompany(): InvolvedCompany {
  return {
    id: 0,
    company: undefined,
    createdAt: undefined,
    developer: false,
    game: undefined,
    porting: false,
    publisher: false,
    supporting: false,
    updatedAt: undefined,
    checksum: "",
  };
}

export const InvolvedCompany = {
  encode(message: InvolvedCompany, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.company !== undefined) {
      Company.encode(message.company, writer.uint32(18).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(26).fork()).ldelim();
    }
    if (message.developer !== false) {
      writer.uint32(32).bool(message.developer);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(42).fork()).ldelim();
    }
    if (message.porting !== false) {
      writer.uint32(48).bool(message.porting);
    }
    if (message.publisher !== false) {
      writer.uint32(56).bool(message.publisher);
    }
    if (message.supporting !== false) {
      writer.uint32(64).bool(message.supporting);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(74).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(82).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InvolvedCompany {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInvolvedCompany();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.company = Company.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.developer = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.porting = reader.bool();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.publisher = reader.bool();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.supporting = reader.bool();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<InvolvedCompany>): InvolvedCompany {
    return InvolvedCompany.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<InvolvedCompany>): InvolvedCompany {
    const message = createBaseInvolvedCompany();
    message.id = object.id ?? 0;
    message.company = (object.company !== undefined && object.company !== null)
      ? Company.fromPartial(object.company)
      : undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.developer = object.developer ?? false;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.porting = object.porting ?? false;
    message.publisher = object.publisher ?? false;
    message.supporting = object.supporting ?? false;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseKeywordResult(): KeywordResult {
  return { keywords: [] };
}

export const KeywordResult = {
  encode(message: KeywordResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.keywords) {
      Keyword.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): KeywordResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseKeywordResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.keywords.push(Keyword.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<KeywordResult>): KeywordResult {
    return KeywordResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<KeywordResult>): KeywordResult {
    const message = createBaseKeywordResult();
    message.keywords = object.keywords?.map((e) => Keyword.fromPartial(e)) || [];
    return message;
  },
};

function createBaseKeyword(): Keyword {
  return { id: 0, createdAt: undefined, name: "", slug: "", updatedAt: undefined, url: "", checksum: "" };
}

export const Keyword = {
  encode(message: Keyword, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(34).string(message.slug);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Keyword {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseKeyword();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Keyword>): Keyword {
    return Keyword.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Keyword>): Keyword {
    const message = createBaseKeyword();
    message.id = object.id ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseLanguageResult(): LanguageResult {
  return { languages: [] };
}

export const LanguageResult = {
  encode(message: LanguageResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.languages) {
      Language.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LanguageResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLanguageResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.languages.push(Language.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<LanguageResult>): LanguageResult {
    return LanguageResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LanguageResult>): LanguageResult {
    const message = createBaseLanguageResult();
    message.languages = object.languages?.map((e) => Language.fromPartial(e)) || [];
    return message;
  },
};

function createBaseLanguage(): Language {
  return { id: 0, name: "", nativeName: "", locale: "", createdAt: undefined, updatedAt: undefined, checksum: "" };
}

export const Language = {
  encode(message: Language, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.nativeName !== "") {
      writer.uint32(26).string(message.nativeName);
    }
    if (message.locale !== "") {
      writer.uint32(34).string(message.locale);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Language {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLanguage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.nativeName = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.locale = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Language>): Language {
    return Language.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Language>): Language {
    const message = createBaseLanguage();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.nativeName = object.nativeName ?? "";
    message.locale = object.locale ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseLanguageSupportResult(): LanguageSupportResult {
  return { languagesupports: [] };
}

export const LanguageSupportResult = {
  encode(message: LanguageSupportResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.languagesupports) {
      LanguageSupport.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LanguageSupportResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLanguageSupportResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.languagesupports.push(LanguageSupport.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<LanguageSupportResult>): LanguageSupportResult {
    return LanguageSupportResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LanguageSupportResult>): LanguageSupportResult {
    const message = createBaseLanguageSupportResult();
    message.languagesupports = object.languagesupports?.map((e) => LanguageSupport.fromPartial(e)) || [];
    return message;
  },
};

function createBaseLanguageSupport(): LanguageSupport {
  return {
    id: 0,
    game: undefined,
    language: undefined,
    languageSupportType: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    checksum: "",
  };
}

export const LanguageSupport = {
  encode(message: LanguageSupport, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(18).fork()).ldelim();
    }
    if (message.language !== undefined) {
      Language.encode(message.language, writer.uint32(26).fork()).ldelim();
    }
    if (message.languageSupportType !== undefined) {
      LanguageSupportType.encode(message.languageSupportType, writer.uint32(34).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LanguageSupport {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLanguageSupport();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.language = Language.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.languageSupportType = LanguageSupportType.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<LanguageSupport>): LanguageSupport {
    return LanguageSupport.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LanguageSupport>): LanguageSupport {
    const message = createBaseLanguageSupport();
    message.id = object.id ?? 0;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.language = (object.language !== undefined && object.language !== null)
      ? Language.fromPartial(object.language)
      : undefined;
    message.languageSupportType = (object.languageSupportType !== undefined && object.languageSupportType !== null)
      ? LanguageSupportType.fromPartial(object.languageSupportType)
      : undefined;
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseLanguageSupportTypeResult(): LanguageSupportTypeResult {
  return { languagesupporttypes: [] };
}

export const LanguageSupportTypeResult = {
  encode(message: LanguageSupportTypeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.languagesupporttypes) {
      LanguageSupportType.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LanguageSupportTypeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLanguageSupportTypeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.languagesupporttypes.push(LanguageSupportType.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<LanguageSupportTypeResult>): LanguageSupportTypeResult {
    return LanguageSupportTypeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LanguageSupportTypeResult>): LanguageSupportTypeResult {
    const message = createBaseLanguageSupportTypeResult();
    message.languagesupporttypes = object.languagesupporttypes?.map((e) => LanguageSupportType.fromPartial(e)) || [];
    return message;
  },
};

function createBaseLanguageSupportType(): LanguageSupportType {
  return { id: 0, name: "", createdAt: undefined, updatedAt: undefined, checksum: "" };
}

export const LanguageSupportType = {
  encode(message: LanguageSupportType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(26).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(34).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(42).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LanguageSupportType {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLanguageSupportType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<LanguageSupportType>): LanguageSupportType {
    return LanguageSupportType.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LanguageSupportType>): LanguageSupportType {
    const message = createBaseLanguageSupportType();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseMultiplayerModeResult(): MultiplayerModeResult {
  return { multiplayermodes: [] };
}

export const MultiplayerModeResult = {
  encode(message: MultiplayerModeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.multiplayermodes) {
      MultiplayerMode.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MultiplayerModeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMultiplayerModeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.multiplayermodes.push(MultiplayerMode.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<MultiplayerModeResult>): MultiplayerModeResult {
    return MultiplayerModeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MultiplayerModeResult>): MultiplayerModeResult {
    const message = createBaseMultiplayerModeResult();
    message.multiplayermodes = object.multiplayermodes?.map((e) => MultiplayerMode.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMultiplayerMode(): MultiplayerMode {
  return {
    id: 0,
    campaigncoop: false,
    dropin: false,
    game: undefined,
    lancoop: false,
    offlinecoop: false,
    offlinecoopmax: 0,
    offlinemax: 0,
    onlinecoop: false,
    onlinecoopmax: 0,
    onlinemax: 0,
    platform: undefined,
    splitscreen: false,
    splitscreenonline: false,
    checksum: "",
  };
}

export const MultiplayerMode = {
  encode(message: MultiplayerMode, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.campaigncoop !== false) {
      writer.uint32(16).bool(message.campaigncoop);
    }
    if (message.dropin !== false) {
      writer.uint32(24).bool(message.dropin);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(34).fork()).ldelim();
    }
    if (message.lancoop !== false) {
      writer.uint32(40).bool(message.lancoop);
    }
    if (message.offlinecoop !== false) {
      writer.uint32(48).bool(message.offlinecoop);
    }
    if (message.offlinecoopmax !== 0) {
      writer.uint32(56).int32(message.offlinecoopmax);
    }
    if (message.offlinemax !== 0) {
      writer.uint32(64).int32(message.offlinemax);
    }
    if (message.onlinecoop !== false) {
      writer.uint32(72).bool(message.onlinecoop);
    }
    if (message.onlinecoopmax !== 0) {
      writer.uint32(80).int32(message.onlinecoopmax);
    }
    if (message.onlinemax !== 0) {
      writer.uint32(88).int32(message.onlinemax);
    }
    if (message.platform !== undefined) {
      Platform.encode(message.platform, writer.uint32(98).fork()).ldelim();
    }
    if (message.splitscreen !== false) {
      writer.uint32(104).bool(message.splitscreen);
    }
    if (message.splitscreenonline !== false) {
      writer.uint32(112).bool(message.splitscreenonline);
    }
    if (message.checksum !== "") {
      writer.uint32(122).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MultiplayerMode {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMultiplayerMode();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.campaigncoop = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.dropin = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.lancoop = reader.bool();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.offlinecoop = reader.bool();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.offlinecoopmax = reader.int32();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.offlinemax = reader.int32();
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.onlinecoop = reader.bool();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.onlinecoopmax = reader.int32();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.onlinemax = reader.int32();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.platform = Platform.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 104) {
            break;
          }

          message.splitscreen = reader.bool();
          continue;
        case 14:
          if (tag !== 112) {
            break;
          }

          message.splitscreenonline = reader.bool();
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<MultiplayerMode>): MultiplayerMode {
    return MultiplayerMode.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MultiplayerMode>): MultiplayerMode {
    const message = createBaseMultiplayerMode();
    message.id = object.id ?? 0;
    message.campaigncoop = object.campaigncoop ?? false;
    message.dropin = object.dropin ?? false;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.lancoop = object.lancoop ?? false;
    message.offlinecoop = object.offlinecoop ?? false;
    message.offlinecoopmax = object.offlinecoopmax ?? 0;
    message.offlinemax = object.offlinemax ?? 0;
    message.onlinecoop = object.onlinecoop ?? false;
    message.onlinecoopmax = object.onlinecoopmax ?? 0;
    message.onlinemax = object.onlinemax ?? 0;
    message.platform = (object.platform !== undefined && object.platform !== null)
      ? Platform.fromPartial(object.platform)
      : undefined;
    message.splitscreen = object.splitscreen ?? false;
    message.splitscreenonline = object.splitscreenonline ?? false;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseNetworkTypeResult(): NetworkTypeResult {
  return { networktypes: [] };
}

export const NetworkTypeResult = {
  encode(message: NetworkTypeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.networktypes) {
      NetworkType.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NetworkTypeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNetworkTypeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.networktypes.push(NetworkType.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NetworkTypeResult>): NetworkTypeResult {
    return NetworkTypeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NetworkTypeResult>): NetworkTypeResult {
    const message = createBaseNetworkTypeResult();
    message.networktypes = object.networktypes?.map((e) => NetworkType.fromPartial(e)) || [];
    return message;
  },
};

function createBaseNetworkType(): NetworkType {
  return { id: 0, name: "", eventNetworks: [], createdAt: undefined, updatedAt: undefined, checksum: "" };
}

export const NetworkType = {
  encode(message: NetworkType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    for (const v of message.eventNetworks) {
      EventNetwork.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(34).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(50).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): NetworkType {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNetworkType();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.eventNetworks.push(EventNetwork.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<NetworkType>): NetworkType {
    return NetworkType.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<NetworkType>): NetworkType {
    const message = createBaseNetworkType();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.eventNetworks = object.eventNetworks?.map((e) => EventNetwork.fromPartial(e)) || [];
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBasePlatformResult(): PlatformResult {
  return { platforms: [] };
}

export const PlatformResult = {
  encode(message: PlatformResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platforms) {
      Platform.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platforms.push(Platform.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformResult>): PlatformResult {
    return PlatformResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformResult>): PlatformResult {
    const message = createBasePlatformResult();
    message.platforms = object.platforms?.map((e) => Platform.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlatform(): Platform {
  return {
    id: 0,
    abbreviation: "",
    alternativeName: "",
    category: 0,
    createdAt: undefined,
    generation: 0,
    name: "",
    platformLogo: undefined,
    platformFamily: undefined,
    slug: "",
    summary: "",
    updatedAt: undefined,
    url: "",
    versions: [],
    websites: [],
    checksum: "",
  };
}

export const Platform = {
  encode(message: Platform, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.abbreviation !== "") {
      writer.uint32(18).string(message.abbreviation);
    }
    if (message.alternativeName !== "") {
      writer.uint32(26).string(message.alternativeName);
    }
    if (message.category !== 0) {
      writer.uint32(32).int32(message.category);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.generation !== 0) {
      writer.uint32(48).int32(message.generation);
    }
    if (message.name !== "") {
      writer.uint32(58).string(message.name);
    }
    if (message.platformLogo !== undefined) {
      PlatformLogo.encode(message.platformLogo, writer.uint32(66).fork()).ldelim();
    }
    if (message.platformFamily !== undefined) {
      PlatformFamily.encode(message.platformFamily, writer.uint32(74).fork()).ldelim();
    }
    if (message.slug !== "") {
      writer.uint32(82).string(message.slug);
    }
    if (message.summary !== "") {
      writer.uint32(90).string(message.summary);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(98).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(106).string(message.url);
    }
    for (const v of message.versions) {
      PlatformVersion.encode(v!, writer.uint32(114).fork()).ldelim();
    }
    for (const v of message.websites) {
      PlatformWebsite.encode(v!, writer.uint32(122).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(130).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Platform {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatform();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.abbreviation = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.alternativeName = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.generation = reader.int32();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.name = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.platformLogo = PlatformLogo.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.platformFamily = PlatformFamily.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.summary = reader.string();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.url = reader.string();
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.versions.push(PlatformVersion.decode(reader, reader.uint32()));
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.websites.push(PlatformWebsite.decode(reader, reader.uint32()));
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Platform>): Platform {
    return Platform.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Platform>): Platform {
    const message = createBasePlatform();
    message.id = object.id ?? 0;
    message.abbreviation = object.abbreviation ?? "";
    message.alternativeName = object.alternativeName ?? "";
    message.category = object.category ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.generation = object.generation ?? 0;
    message.name = object.name ?? "";
    message.platformLogo = (object.platformLogo !== undefined && object.platformLogo !== null)
      ? PlatformLogo.fromPartial(object.platformLogo)
      : undefined;
    message.platformFamily = (object.platformFamily !== undefined && object.platformFamily !== null)
      ? PlatformFamily.fromPartial(object.platformFamily)
      : undefined;
    message.slug = object.slug ?? "";
    message.summary = object.summary ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.versions = object.versions?.map((e) => PlatformVersion.fromPartial(e)) || [];
    message.websites = object.websites?.map((e) => PlatformWebsite.fromPartial(e)) || [];
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBasePlatformFamilyResult(): PlatformFamilyResult {
  return { platformfamilies: [] };
}

export const PlatformFamilyResult = {
  encode(message: PlatformFamilyResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platformfamilies) {
      PlatformFamily.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformFamilyResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformFamilyResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platformfamilies.push(PlatformFamily.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformFamilyResult>): PlatformFamilyResult {
    return PlatformFamilyResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformFamilyResult>): PlatformFamilyResult {
    const message = createBasePlatformFamilyResult();
    message.platformfamilies = object.platformfamilies?.map((e) => PlatformFamily.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlatformFamily(): PlatformFamily {
  return { id: 0, name: "", slug: "", checksum: "" };
}

export const PlatformFamily = {
  encode(message: PlatformFamily, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(26).string(message.slug);
    }
    if (message.checksum !== "") {
      writer.uint32(34).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformFamily {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformFamily();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformFamily>): PlatformFamily {
    return PlatformFamily.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformFamily>): PlatformFamily {
    const message = createBasePlatformFamily();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBasePlatformLogoResult(): PlatformLogoResult {
  return { platformlogos: [] };
}

export const PlatformLogoResult = {
  encode(message: PlatformLogoResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platformlogos) {
      PlatformLogo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformLogoResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformLogoResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platformlogos.push(PlatformLogo.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformLogoResult>): PlatformLogoResult {
    return PlatformLogoResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformLogoResult>): PlatformLogoResult {
    const message = createBasePlatformLogoResult();
    message.platformlogos = object.platformlogos?.map((e) => PlatformLogo.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlatformLogo(): PlatformLogo {
  return { id: 0, alphaChannel: false, animated: false, height: 0, imageId: "", url: "", width: 0, checksum: "" };
}

export const PlatformLogo = {
  encode(message: PlatformLogo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.alphaChannel !== false) {
      writer.uint32(16).bool(message.alphaChannel);
    }
    if (message.animated !== false) {
      writer.uint32(24).bool(message.animated);
    }
    if (message.height !== 0) {
      writer.uint32(32).int32(message.height);
    }
    if (message.imageId !== "") {
      writer.uint32(42).string(message.imageId);
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.width !== 0) {
      writer.uint32(56).int32(message.width);
    }
    if (message.checksum !== "") {
      writer.uint32(66).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformLogo {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformLogo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.alphaChannel = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.animated = reader.bool();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.height = reader.int32();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.imageId = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformLogo>): PlatformLogo {
    return PlatformLogo.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformLogo>): PlatformLogo {
    const message = createBasePlatformLogo();
    message.id = object.id ?? 0;
    message.alphaChannel = object.alphaChannel ?? false;
    message.animated = object.animated ?? false;
    message.height = object.height ?? 0;
    message.imageId = object.imageId ?? "";
    message.url = object.url ?? "";
    message.width = object.width ?? 0;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBasePlatformVersionResult(): PlatformVersionResult {
  return { platformversions: [] };
}

export const PlatformVersionResult = {
  encode(message: PlatformVersionResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platformversions) {
      PlatformVersion.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformVersionResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformVersionResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platformversions.push(PlatformVersion.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformVersionResult>): PlatformVersionResult {
    return PlatformVersionResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformVersionResult>): PlatformVersionResult {
    const message = createBasePlatformVersionResult();
    message.platformversions = object.platformversions?.map((e) => PlatformVersion.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlatformVersion(): PlatformVersion {
  return {
    id: 0,
    companies: [],
    connectivity: "",
    cpu: "",
    graphics: "",
    mainManufacturer: undefined,
    media: "",
    memory: "",
    name: "",
    online: "",
    os: "",
    output: "",
    platformLogo: undefined,
    platformVersionReleaseDates: [],
    resolutions: "",
    slug: "",
    sound: "",
    storage: "",
    summary: "",
    url: "",
    checksum: "",
  };
}

export const PlatformVersion = {
  encode(message: PlatformVersion, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    for (const v of message.companies) {
      PlatformVersionCompany.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.connectivity !== "") {
      writer.uint32(26).string(message.connectivity);
    }
    if (message.cpu !== "") {
      writer.uint32(34).string(message.cpu);
    }
    if (message.graphics !== "") {
      writer.uint32(42).string(message.graphics);
    }
    if (message.mainManufacturer !== undefined) {
      PlatformVersionCompany.encode(message.mainManufacturer, writer.uint32(50).fork()).ldelim();
    }
    if (message.media !== "") {
      writer.uint32(58).string(message.media);
    }
    if (message.memory !== "") {
      writer.uint32(66).string(message.memory);
    }
    if (message.name !== "") {
      writer.uint32(74).string(message.name);
    }
    if (message.online !== "") {
      writer.uint32(82).string(message.online);
    }
    if (message.os !== "") {
      writer.uint32(90).string(message.os);
    }
    if (message.output !== "") {
      writer.uint32(98).string(message.output);
    }
    if (message.platformLogo !== undefined) {
      PlatformLogo.encode(message.platformLogo, writer.uint32(106).fork()).ldelim();
    }
    for (const v of message.platformVersionReleaseDates) {
      PlatformVersionReleaseDate.encode(v!, writer.uint32(114).fork()).ldelim();
    }
    if (message.resolutions !== "") {
      writer.uint32(122).string(message.resolutions);
    }
    if (message.slug !== "") {
      writer.uint32(130).string(message.slug);
    }
    if (message.sound !== "") {
      writer.uint32(138).string(message.sound);
    }
    if (message.storage !== "") {
      writer.uint32(146).string(message.storage);
    }
    if (message.summary !== "") {
      writer.uint32(154).string(message.summary);
    }
    if (message.url !== "") {
      writer.uint32(162).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(170).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformVersion {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformVersion();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.companies.push(PlatformVersionCompany.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.connectivity = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.cpu = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.graphics = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.mainManufacturer = PlatformVersionCompany.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.media = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.memory = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.name = reader.string();
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.online = reader.string();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.os = reader.string();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.output = reader.string();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.platformLogo = PlatformLogo.decode(reader, reader.uint32());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.platformVersionReleaseDates.push(PlatformVersionReleaseDate.decode(reader, reader.uint32()));
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.resolutions = reader.string();
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.sound = reader.string();
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.storage = reader.string();
          continue;
        case 19:
          if (tag !== 154) {
            break;
          }

          message.summary = reader.string();
          continue;
        case 20:
          if (tag !== 162) {
            break;
          }

          message.url = reader.string();
          continue;
        case 21:
          if (tag !== 170) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformVersion>): PlatformVersion {
    return PlatformVersion.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformVersion>): PlatformVersion {
    const message = createBasePlatformVersion();
    message.id = object.id ?? 0;
    message.companies = object.companies?.map((e) => PlatformVersionCompany.fromPartial(e)) || [];
    message.connectivity = object.connectivity ?? "";
    message.cpu = object.cpu ?? "";
    message.graphics = object.graphics ?? "";
    message.mainManufacturer = (object.mainManufacturer !== undefined && object.mainManufacturer !== null)
      ? PlatformVersionCompany.fromPartial(object.mainManufacturer)
      : undefined;
    message.media = object.media ?? "";
    message.memory = object.memory ?? "";
    message.name = object.name ?? "";
    message.online = object.online ?? "";
    message.os = object.os ?? "";
    message.output = object.output ?? "";
    message.platformLogo = (object.platformLogo !== undefined && object.platformLogo !== null)
      ? PlatformLogo.fromPartial(object.platformLogo)
      : undefined;
    message.platformVersionReleaseDates =
      object.platformVersionReleaseDates?.map((e) => PlatformVersionReleaseDate.fromPartial(e)) || [];
    message.resolutions = object.resolutions ?? "";
    message.slug = object.slug ?? "";
    message.sound = object.sound ?? "";
    message.storage = object.storage ?? "";
    message.summary = object.summary ?? "";
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBasePlatformVersionCompanyResult(): PlatformVersionCompanyResult {
  return { platformversioncompanies: [] };
}

export const PlatformVersionCompanyResult = {
  encode(message: PlatformVersionCompanyResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platformversioncompanies) {
      PlatformVersionCompany.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformVersionCompanyResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformVersionCompanyResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platformversioncompanies.push(PlatformVersionCompany.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformVersionCompanyResult>): PlatformVersionCompanyResult {
    return PlatformVersionCompanyResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformVersionCompanyResult>): PlatformVersionCompanyResult {
    const message = createBasePlatformVersionCompanyResult();
    message.platformversioncompanies =
      object.platformversioncompanies?.map((e) => PlatformVersionCompany.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlatformVersionCompany(): PlatformVersionCompany {
  return { id: 0, comment: "", company: undefined, developer: false, manufacturer: false, checksum: "" };
}

export const PlatformVersionCompany = {
  encode(message: PlatformVersionCompany, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.comment !== "") {
      writer.uint32(18).string(message.comment);
    }
    if (message.company !== undefined) {
      Company.encode(message.company, writer.uint32(26).fork()).ldelim();
    }
    if (message.developer !== false) {
      writer.uint32(32).bool(message.developer);
    }
    if (message.manufacturer !== false) {
      writer.uint32(40).bool(message.manufacturer);
    }
    if (message.checksum !== "") {
      writer.uint32(50).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformVersionCompany {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformVersionCompany();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.comment = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.company = Company.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.developer = reader.bool();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.manufacturer = reader.bool();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformVersionCompany>): PlatformVersionCompany {
    return PlatformVersionCompany.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformVersionCompany>): PlatformVersionCompany {
    const message = createBasePlatformVersionCompany();
    message.id = object.id ?? 0;
    message.comment = object.comment ?? "";
    message.company = (object.company !== undefined && object.company !== null)
      ? Company.fromPartial(object.company)
      : undefined;
    message.developer = object.developer ?? false;
    message.manufacturer = object.manufacturer ?? false;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBasePlatformVersionReleaseDateResult(): PlatformVersionReleaseDateResult {
  return { platformversionreleasedates: [] };
}

export const PlatformVersionReleaseDateResult = {
  encode(message: PlatformVersionReleaseDateResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platformversionreleasedates) {
      PlatformVersionReleaseDate.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformVersionReleaseDateResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformVersionReleaseDateResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platformversionreleasedates.push(PlatformVersionReleaseDate.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformVersionReleaseDateResult>): PlatformVersionReleaseDateResult {
    return PlatformVersionReleaseDateResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformVersionReleaseDateResult>): PlatformVersionReleaseDateResult {
    const message = createBasePlatformVersionReleaseDateResult();
    message.platformversionreleasedates =
      object.platformversionreleasedates?.map((e) => PlatformVersionReleaseDate.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlatformVersionReleaseDate(): PlatformVersionReleaseDate {
  return {
    id: 0,
    category: 0,
    createdAt: undefined,
    date: undefined,
    human: "",
    m: 0,
    platformVersion: undefined,
    region: 0,
    updatedAt: undefined,
    y: 0,
    checksum: "",
  };
}

export const PlatformVersionReleaseDate = {
  encode(message: PlatformVersionReleaseDate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(26).fork()).ldelim();
    }
    if (message.date !== undefined) {
      Timestamp.encode(toTimestamp(message.date), writer.uint32(34).fork()).ldelim();
    }
    if (message.human !== "") {
      writer.uint32(42).string(message.human);
    }
    if (message.m !== 0) {
      writer.uint32(48).int32(message.m);
    }
    if (message.platformVersion !== undefined) {
      PlatformVersion.encode(message.platformVersion, writer.uint32(58).fork()).ldelim();
    }
    if (message.region !== 0) {
      writer.uint32(64).int32(message.region);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(74).fork()).ldelim();
    }
    if (message.y !== 0) {
      writer.uint32(80).int32(message.y);
    }
    if (message.checksum !== "") {
      writer.uint32(90).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformVersionReleaseDate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformVersionReleaseDate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.date = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.human = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.m = reader.int32();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.platformVersion = PlatformVersion.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.region = reader.int32() as any;
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.y = reader.int32();
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformVersionReleaseDate>): PlatformVersionReleaseDate {
    return PlatformVersionReleaseDate.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformVersionReleaseDate>): PlatformVersionReleaseDate {
    const message = createBasePlatformVersionReleaseDate();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.date = object.date ?? undefined;
    message.human = object.human ?? "";
    message.m = object.m ?? 0;
    message.platformVersion = (object.platformVersion !== undefined && object.platformVersion !== null)
      ? PlatformVersion.fromPartial(object.platformVersion)
      : undefined;
    message.region = object.region ?? 0;
    message.updatedAt = object.updatedAt ?? undefined;
    message.y = object.y ?? 0;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBasePlatformWebsiteResult(): PlatformWebsiteResult {
  return { platformwebsites: [] };
}

export const PlatformWebsiteResult = {
  encode(message: PlatformWebsiteResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.platformwebsites) {
      PlatformWebsite.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformWebsiteResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformWebsiteResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.platformwebsites.push(PlatformWebsite.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformWebsiteResult>): PlatformWebsiteResult {
    return PlatformWebsiteResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformWebsiteResult>): PlatformWebsiteResult {
    const message = createBasePlatformWebsiteResult();
    message.platformwebsites = object.platformwebsites?.map((e) => PlatformWebsite.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlatformWebsite(): PlatformWebsite {
  return { id: 0, category: 0, trusted: false, url: "", checksum: "" };
}

export const PlatformWebsite = {
  encode(message: PlatformWebsite, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    if (message.trusted !== false) {
      writer.uint32(24).bool(message.trusted);
    }
    if (message.url !== "") {
      writer.uint32(34).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(42).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlatformWebsite {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlatformWebsite();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.trusted = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.url = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlatformWebsite>): PlatformWebsite {
    return PlatformWebsite.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlatformWebsite>): PlatformWebsite {
    const message = createBasePlatformWebsite();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.trusted = object.trusted ?? false;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBasePlayerPerspectiveResult(): PlayerPerspectiveResult {
  return { playerperspectives: [] };
}

export const PlayerPerspectiveResult = {
  encode(message: PlayerPerspectiveResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.playerperspectives) {
      PlayerPerspective.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlayerPerspectiveResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayerPerspectiveResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.playerperspectives.push(PlayerPerspective.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlayerPerspectiveResult>): PlayerPerspectiveResult {
    return PlayerPerspectiveResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlayerPerspectiveResult>): PlayerPerspectiveResult {
    const message = createBasePlayerPerspectiveResult();
    message.playerperspectives = object.playerperspectives?.map((e) => PlayerPerspective.fromPartial(e)) || [];
    return message;
  },
};

function createBasePlayerPerspective(): PlayerPerspective {
  return { id: 0, createdAt: undefined, name: "", slug: "", updatedAt: undefined, url: "", checksum: "" };
}

export const PlayerPerspective = {
  encode(message: PlayerPerspective, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(34).string(message.slug);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlayerPerspective {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayerPerspective();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<PlayerPerspective>): PlayerPerspective {
    return PlayerPerspective.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<PlayerPerspective>): PlayerPerspective {
    const message = createBasePlayerPerspective();
    message.id = object.id ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseRegionResult(): RegionResult {
  return { regions: [] };
}

export const RegionResult = {
  encode(message: RegionResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.regions) {
      Region.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegionResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegionResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.regions.push(Region.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<RegionResult>): RegionResult {
    return RegionResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RegionResult>): RegionResult {
    const message = createBaseRegionResult();
    message.regions = object.regions?.map((e) => Region.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRegion(): Region {
  return { id: 0, name: "", category: "", identifier: "", createdAt: undefined, updatedAt: undefined, checksum: "" };
}

export const Region = {
  encode(message: Region, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.category !== "") {
      writer.uint32(26).string(message.category);
    }
    if (message.identifier !== "") {
      writer.uint32(34).string(message.identifier);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(50).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Region {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegion();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.category = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.identifier = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Region>): Region {
    return Region.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Region>): Region {
    const message = createBaseRegion();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.category = object.category ?? "";
    message.identifier = object.identifier ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseReleaseDateResult(): ReleaseDateResult {
  return { releasedates: [] };
}

export const ReleaseDateResult = {
  encode(message: ReleaseDateResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.releasedates) {
      ReleaseDate.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReleaseDateResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReleaseDateResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.releasedates.push(ReleaseDate.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ReleaseDateResult>): ReleaseDateResult {
    return ReleaseDateResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ReleaseDateResult>): ReleaseDateResult {
    const message = createBaseReleaseDateResult();
    message.releasedates = object.releasedates?.map((e) => ReleaseDate.fromPartial(e)) || [];
    return message;
  },
};

function createBaseReleaseDate(): ReleaseDate {
  return {
    id: 0,
    category: 0,
    createdAt: undefined,
    date: undefined,
    game: undefined,
    human: "",
    m: 0,
    platform: undefined,
    region: 0,
    updatedAt: undefined,
    y: 0,
    checksum: "",
    status: undefined,
  };
}

export const ReleaseDate = {
  encode(message: ReleaseDate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(26).fork()).ldelim();
    }
    if (message.date !== undefined) {
      Timestamp.encode(toTimestamp(message.date), writer.uint32(34).fork()).ldelim();
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(42).fork()).ldelim();
    }
    if (message.human !== "") {
      writer.uint32(50).string(message.human);
    }
    if (message.m !== 0) {
      writer.uint32(56).int32(message.m);
    }
    if (message.platform !== undefined) {
      Platform.encode(message.platform, writer.uint32(66).fork()).ldelim();
    }
    if (message.region !== 0) {
      writer.uint32(72).int32(message.region);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(82).fork()).ldelim();
    }
    if (message.y !== 0) {
      writer.uint32(88).int32(message.y);
    }
    if (message.checksum !== "") {
      writer.uint32(98).string(message.checksum);
    }
    if (message.status !== undefined) {
      ReleaseDateStatus.encode(message.status, writer.uint32(106).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReleaseDate {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReleaseDate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.date = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.human = reader.string();
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.m = reader.int32();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.platform = Platform.decode(reader, reader.uint32());
          continue;
        case 9:
          if (tag !== 72) {
            break;
          }

          message.region = reader.int32() as any;
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.y = reader.int32();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.checksum = reader.string();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.status = ReleaseDateStatus.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ReleaseDate>): ReleaseDate {
    return ReleaseDate.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ReleaseDate>): ReleaseDate {
    const message = createBaseReleaseDate();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.date = object.date ?? undefined;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.human = object.human ?? "";
    message.m = object.m ?? 0;
    message.platform = (object.platform !== undefined && object.platform !== null)
      ? Platform.fromPartial(object.platform)
      : undefined;
    message.region = object.region ?? 0;
    message.updatedAt = object.updatedAt ?? undefined;
    message.y = object.y ?? 0;
    message.checksum = object.checksum ?? "";
    message.status = (object.status !== undefined && object.status !== null)
      ? ReleaseDateStatus.fromPartial(object.status)
      : undefined;
    return message;
  },
};

function createBaseReleaseDateStatusResult(): ReleaseDateStatusResult {
  return { releasedatestatuses: [] };
}

export const ReleaseDateStatusResult = {
  encode(message: ReleaseDateStatusResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.releasedatestatuses) {
      ReleaseDateStatus.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReleaseDateStatusResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReleaseDateStatusResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.releasedatestatuses.push(ReleaseDateStatus.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ReleaseDateStatusResult>): ReleaseDateStatusResult {
    return ReleaseDateStatusResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ReleaseDateStatusResult>): ReleaseDateStatusResult {
    const message = createBaseReleaseDateStatusResult();
    message.releasedatestatuses = object.releasedatestatuses?.map((e) => ReleaseDateStatus.fromPartial(e)) || [];
    return message;
  },
};

function createBaseReleaseDateStatus(): ReleaseDateStatus {
  return { id: 0, name: "", description: "", createdAt: undefined, updatedAt: undefined, checksum: "" };
}

export const ReleaseDateStatus = {
  encode(message: ReleaseDateStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(34).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(50).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReleaseDateStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReleaseDateStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ReleaseDateStatus>): ReleaseDateStatus {
    return ReleaseDateStatus.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ReleaseDateStatus>): ReleaseDateStatus {
    const message = createBaseReleaseDateStatus();
    message.id = object.id ?? 0;
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseScreenshotResult(): ScreenshotResult {
  return { screenshots: [] };
}

export const ScreenshotResult = {
  encode(message: ScreenshotResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.screenshots) {
      Screenshot.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ScreenshotResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseScreenshotResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.screenshots.push(Screenshot.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ScreenshotResult>): ScreenshotResult {
    return ScreenshotResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ScreenshotResult>): ScreenshotResult {
    const message = createBaseScreenshotResult();
    message.screenshots = object.screenshots?.map((e) => Screenshot.fromPartial(e)) || [];
    return message;
  },
};

function createBaseScreenshot(): Screenshot {
  return {
    id: 0,
    alphaChannel: false,
    animated: false,
    game: undefined,
    height: 0,
    imageId: "",
    url: "",
    width: 0,
    checksum: "",
  };
}

export const Screenshot = {
  encode(message: Screenshot, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.alphaChannel !== false) {
      writer.uint32(16).bool(message.alphaChannel);
    }
    if (message.animated !== false) {
      writer.uint32(24).bool(message.animated);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(34).fork()).ldelim();
    }
    if (message.height !== 0) {
      writer.uint32(40).int32(message.height);
    }
    if (message.imageId !== "") {
      writer.uint32(50).string(message.imageId);
    }
    if (message.url !== "") {
      writer.uint32(58).string(message.url);
    }
    if (message.width !== 0) {
      writer.uint32(64).int32(message.width);
    }
    if (message.checksum !== "") {
      writer.uint32(74).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Screenshot {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseScreenshot();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.alphaChannel = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.animated = reader.bool();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.height = reader.int32();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.imageId = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.url = reader.string();
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.width = reader.int32();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Screenshot>): Screenshot {
    return Screenshot.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Screenshot>): Screenshot {
    const message = createBaseScreenshot();
    message.id = object.id ?? 0;
    message.alphaChannel = object.alphaChannel ?? false;
    message.animated = object.animated ?? false;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.height = object.height ?? 0;
    message.imageId = object.imageId ?? "";
    message.url = object.url ?? "";
    message.width = object.width ?? 0;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseSearchResult(): SearchResult {
  return { searches: [] };
}

export const SearchResult = {
  encode(message: SearchResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.searches) {
      Search.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.searches.push(Search.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchResult>): SearchResult {
    return SearchResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchResult>): SearchResult {
    const message = createBaseSearchResult();
    message.searches = object.searches?.map((e) => Search.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSearch(): Search {
  return {
    id: 0,
    alternativeName: "",
    character: undefined,
    collection: undefined,
    company: undefined,
    description: "",
    game: undefined,
    name: "",
    platform: undefined,
    publishedAt: undefined,
    testDummy: undefined,
    theme: undefined,
    checksum: "",
  };
}

export const Search = {
  encode(message: Search, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.alternativeName !== "") {
      writer.uint32(18).string(message.alternativeName);
    }
    if (message.character !== undefined) {
      Character.encode(message.character, writer.uint32(26).fork()).ldelim();
    }
    if (message.collection !== undefined) {
      Collection.encode(message.collection, writer.uint32(34).fork()).ldelim();
    }
    if (message.company !== undefined) {
      Company.encode(message.company, writer.uint32(42).fork()).ldelim();
    }
    if (message.description !== "") {
      writer.uint32(50).string(message.description);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(58).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(66).string(message.name);
    }
    if (message.platform !== undefined) {
      Platform.encode(message.platform, writer.uint32(74).fork()).ldelim();
    }
    if (message.publishedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.publishedAt), writer.uint32(82).fork()).ldelim();
    }
    if (message.testDummy !== undefined) {
      TestDummy.encode(message.testDummy, writer.uint32(90).fork()).ldelim();
    }
    if (message.theme !== undefined) {
      Theme.encode(message.theme, writer.uint32(98).fork()).ldelim();
    }
    if (message.checksum !== "") {
      writer.uint32(106).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Search {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearch();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.alternativeName = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.character = Character.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.collection = Collection.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.company = Company.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.description = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.name = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.platform = Platform.decode(reader, reader.uint32());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.publishedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 11:
          if (tag !== 90) {
            break;
          }

          message.testDummy = TestDummy.decode(reader, reader.uint32());
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.theme = Theme.decode(reader, reader.uint32());
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Search>): Search {
    return Search.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Search>): Search {
    const message = createBaseSearch();
    message.id = object.id ?? 0;
    message.alternativeName = object.alternativeName ?? "";
    message.character = (object.character !== undefined && object.character !== null)
      ? Character.fromPartial(object.character)
      : undefined;
    message.collection = (object.collection !== undefined && object.collection !== null)
      ? Collection.fromPartial(object.collection)
      : undefined;
    message.company = (object.company !== undefined && object.company !== null)
      ? Company.fromPartial(object.company)
      : undefined;
    message.description = object.description ?? "";
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.name = object.name ?? "";
    message.platform = (object.platform !== undefined && object.platform !== null)
      ? Platform.fromPartial(object.platform)
      : undefined;
    message.publishedAt = object.publishedAt ?? undefined;
    message.testDummy = (object.testDummy !== undefined && object.testDummy !== null)
      ? TestDummy.fromPartial(object.testDummy)
      : undefined;
    message.theme = (object.theme !== undefined && object.theme !== null) ? Theme.fromPartial(object.theme) : undefined;
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseTestDummyResult(): TestDummyResult {
  return { testdummies: [] };
}

export const TestDummyResult = {
  encode(message: TestDummyResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.testdummies) {
      TestDummy.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TestDummyResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTestDummyResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.testdummies.push(TestDummy.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<TestDummyResult>): TestDummyResult {
    return TestDummyResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TestDummyResult>): TestDummyResult {
    const message = createBaseTestDummyResult();
    message.testdummies = object.testdummies?.map((e) => TestDummy.fromPartial(e)) || [];
    return message;
  },
};

function createBaseTestDummy(): TestDummy {
  return {
    id: 0,
    boolValue: false,
    createdAt: undefined,
    enumTest: 0,
    floatValue: 0,
    game: undefined,
    integerArray: [],
    integerValue: 0,
    name: "",
    newIntegerValue: 0,
    private: false,
    slug: "",
    stringArray: [],
    testDummies: [],
    testDummy: undefined,
    updatedAt: undefined,
    url: "",
    checksum: "",
  };
}

export const TestDummy = {
  encode(message: TestDummy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.boolValue !== false) {
      writer.uint32(16).bool(message.boolValue);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(26).fork()).ldelim();
    }
    if (message.enumTest !== 0) {
      writer.uint32(32).int32(message.enumTest);
    }
    if (message.floatValue !== 0) {
      writer.uint32(41).double(message.floatValue);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(50).fork()).ldelim();
    }
    writer.uint32(58).fork();
    for (const v of message.integerArray) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.integerValue !== 0) {
      writer.uint32(64).int32(message.integerValue);
    }
    if (message.name !== "") {
      writer.uint32(74).string(message.name);
    }
    if (message.newIntegerValue !== 0) {
      writer.uint32(80).int32(message.newIntegerValue);
    }
    if (message.private !== false) {
      writer.uint32(88).bool(message.private);
    }
    if (message.slug !== "") {
      writer.uint32(98).string(message.slug);
    }
    for (const v of message.stringArray) {
      writer.uint32(106).string(v!);
    }
    for (const v of message.testDummies) {
      TestDummy.encode(v!, writer.uint32(114).fork()).ldelim();
    }
    if (message.testDummy !== undefined) {
      TestDummy.encode(message.testDummy, writer.uint32(122).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(130).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(138).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(146).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TestDummy {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTestDummy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.boolValue = reader.bool();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.enumTest = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 41) {
            break;
          }

          message.floatValue = reader.double();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag === 56) {
            message.integerArray.push(reader.int32());

            continue;
          }

          if (tag === 58) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.integerArray.push(reader.int32());
            }

            continue;
          }

          break;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.integerValue = reader.int32();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.name = reader.string();
          continue;
        case 10:
          if (tag !== 80) {
            break;
          }

          message.newIntegerValue = reader.int32();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.private = reader.bool();
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 13:
          if (tag !== 106) {
            break;
          }

          message.stringArray.push(reader.string());
          continue;
        case 14:
          if (tag !== 114) {
            break;
          }

          message.testDummies.push(TestDummy.decode(reader, reader.uint32()));
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.testDummy = TestDummy.decode(reader, reader.uint32());
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.url = reader.string();
          continue;
        case 18:
          if (tag !== 146) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<TestDummy>): TestDummy {
    return TestDummy.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<TestDummy>): TestDummy {
    const message = createBaseTestDummy();
    message.id = object.id ?? 0;
    message.boolValue = object.boolValue ?? false;
    message.createdAt = object.createdAt ?? undefined;
    message.enumTest = object.enumTest ?? 0;
    message.floatValue = object.floatValue ?? 0;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.integerArray = object.integerArray?.map((e) => e) || [];
    message.integerValue = object.integerValue ?? 0;
    message.name = object.name ?? "";
    message.newIntegerValue = object.newIntegerValue ?? 0;
    message.private = object.private ?? false;
    message.slug = object.slug ?? "";
    message.stringArray = object.stringArray?.map((e) => e) || [];
    message.testDummies = object.testDummies?.map((e) => TestDummy.fromPartial(e)) || [];
    message.testDummy = (object.testDummy !== undefined && object.testDummy !== null)
      ? TestDummy.fromPartial(object.testDummy)
      : undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseThemeResult(): ThemeResult {
  return { themes: [] };
}

export const ThemeResult = {
  encode(message: ThemeResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.themes) {
      Theme.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ThemeResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseThemeResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.themes.push(Theme.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ThemeResult>): ThemeResult {
    return ThemeResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ThemeResult>): ThemeResult {
    const message = createBaseThemeResult();
    message.themes = object.themes?.map((e) => Theme.fromPartial(e)) || [];
    return message;
  },
};

function createBaseTheme(): Theme {
  return { id: 0, createdAt: undefined, name: "", slug: "", updatedAt: undefined, url: "", checksum: "" };
}

export const Theme = {
  encode(message: Theme, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(18).fork()).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.slug !== "") {
      writer.uint32(34).string(message.slug);
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(42).fork()).ldelim();
    }
    if (message.url !== "") {
      writer.uint32(50).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(58).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Theme {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTheme();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.slug = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.url = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Theme>): Theme {
    return Theme.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Theme>): Theme {
    const message = createBaseTheme();
    message.id = object.id ?? 0;
    message.createdAt = object.createdAt ?? undefined;
    message.name = object.name ?? "";
    message.slug = object.slug ?? "";
    message.updatedAt = object.updatedAt ?? undefined;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

function createBaseWebsiteResult(): WebsiteResult {
  return { websites: [] };
}

export const WebsiteResult = {
  encode(message: WebsiteResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.websites) {
      Website.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebsiteResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebsiteResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.websites.push(Website.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<WebsiteResult>): WebsiteResult {
    return WebsiteResult.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<WebsiteResult>): WebsiteResult {
    const message = createBaseWebsiteResult();
    message.websites = object.websites?.map((e) => Website.fromPartial(e)) || [];
    return message;
  },
};

function createBaseWebsite(): Website {
  return { id: 0, category: 0, game: undefined, trusted: false, url: "", checksum: "" };
}

export const Website = {
  encode(message: Website, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.category !== 0) {
      writer.uint32(16).int32(message.category);
    }
    if (message.game !== undefined) {
      Game.encode(message.game, writer.uint32(26).fork()).ldelim();
    }
    if (message.trusted !== false) {
      writer.uint32(32).bool(message.trusted);
    }
    if (message.url !== "") {
      writer.uint32(42).string(message.url);
    }
    if (message.checksum !== "") {
      writer.uint32(50).string(message.checksum);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Website {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebsite();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = longToNumber(reader.uint64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.category = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.game = Game.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.trusted = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.url = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.checksum = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Website>): Website {
    return Website.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Website>): Website {
    const message = createBaseWebsite();
    message.id = object.id ?? 0;
    message.category = object.category ?? 0;
    message.game = (object.game !== undefined && object.game !== null) ? Game.fromPartial(object.game) : undefined;
    message.trusted = object.trusted ?? false;
    message.url = object.url ?? "";
    message.checksum = object.checksum ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function toTimestamp(date: Date): Timestamp {
  const seconds = Math.trunc(date.getTime() / 1_000);
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (t.seconds || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new globalThis.Date(millis);
}

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
