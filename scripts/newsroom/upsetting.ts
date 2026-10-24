/**
 * House rule (owner, 24 Oct 2026): we don't publish news that could upset or harm people.
 * Stories about accusations, crimes or court cases against people, deaths and violence,
 * abuse, war and elections are left to other newsrooms. Checked on the headline and
 * excerpts before any paid call, and again on the finished article.
 */
const RULES: [RegExp, string][] = [
  [/\b(accus\w*|alleg\w*|lawsuits?|sued|sues|suing|charged|charges against|arrest\w*|police|crimes?|criminal|fraud\w*|scandals?|misconduct|harass\w*|defam\w*|guilty|convict\w*|jail\w*|prison\w*|spy|spies|espionage|indict\w*)\b/i, "accusations, crime or courts"],
  [/\b(death|deaths|died|dies|dying|killed|kills?|murder\w*|suicid\w*|self-harm|shooting|fatal\w*)\b/i, "death or violence"],
  [/\b(abuse\w*|csam|grooming|predator\w*|exploitation)\b/i, "abuse"],
  [/\b(wars?|terror\w*|bomb\w*|airstrikes?|drone strikes?|massacre\w*|genocide)\b/i, "war or terror"],
  [/\b(elections?|ballots?|candidates?|referendum\w*|vote rigging)\b/i, "elections"],
];

export function upsettingReasons(text: string): string[] {
  return [...new Set(RULES.filter(([re]) => re.test(text)).map(([, why]) => why))];
}
