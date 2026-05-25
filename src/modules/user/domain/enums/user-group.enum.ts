export enum UserGroup {
  KWON_SOON_YOUNG_AND_LIM_KANG_MI_M = '권수영&임강미M',
  NOH_SI_EUN_AND_YOON_SEUNG_O_M = '노시은&윤승오M',
  BAE_YOON_HEE_AND_KIM_JUN_YOUNG_M = '배윤희&김준영M',
  BRIDGE = '브릿지',
  ETC = '기타',
}

export const USER_GROUP_OPTIONS = Object.values(UserGroup).map((group) => ({
  value: group,
  label: group,
}));
