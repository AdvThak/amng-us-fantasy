// Small, attributed factual snapshot; not a mirror of the source spreadsheet.
// Rows: [canonical ID, display name, short name, older career video appearances, archived rounds, archived wins].
// The career and round snapshots have different cutoffs. Null means unknown, not zero.
export const marketSources = {
  appearances: "https://sidemen.fandom.com/wiki/Among_Us",
  performance: "https://www.sdmn-stats.uk/players",
  episodeIndex: "https://www.thetvdb.com/series/sidemen-among-us/seasons/official/2026",
  originalTracker: 'https://docs.google.com/spreadsheets/d/1g3Esmr1-Z5jt5_mqOv9-f9fvyFezgT_2Z-8G7w5ChSU/edit',
  accessed: '2026-11-27',
};
export const marketWindow = { start: '2025-11-27', end: '2026-11-27' };
export const careerRows = [
  [
    "simon",
    "Miniminter",
    "Simon",
    113,
    338,
    183
  ],
  [
    "vik",
    "Vikkstar123",
    "Vik",
    119,
    350,
    177
  ],
  [
    "harry",
    "W2S",
    "Harry",
    109,
    312,
    138
  ],
  [
    "josh",
    "Zerkaa",
    "Josh",
    123,
    365,
    159
  ],
  [
    "ethan",
    "Behzinga",
    "Ethan",
    116,
    352,
    153
  ],
  [
    "jj",
    "KSI",
    "JJ",
    95,
    289,
    121
  ],
  [
    "tobi",
    "TBJZL",
    "Tobi",
    116,
    356,
    161
  ],
  [
    "randolph",
    "Randolph",
    "Randy",
    52,
    166,
    61
  ],
  [
    "lazar",
    "LazarBeam",
    "Lazar",
    62,
    213,
    103
  ],
  [
    "deji",
    "Deji",
    "Deji",
    57,
    227,
    98
  ],
  [
    "ginge",
    "AngryGinge",
    "Ginge",
    12,
    39,
    11
  ],
  [
    "ellum",
    "Ellum",
    "Ellum",
    17,
    54,
    26
  ],
  [
    "guest-dannyaarons",
    "Danny Aarons",
    "Danny",
    42,
    133,
    58
  ],
  [
    "guest-calfreezy",
    "Calfreezy",
    "Freezy",
    11,
    29,
    10
  ],
  [
    "guest-courage",
    "CouRageJD",
    "Courage",
    4,
    3,
    1
  ],
  [
    "guest-ab",
    "AB",
    "AB",
    3,
    13,
    5
  ],
  [
    "guest-ninja",
    "Ninja",
    "Ninja",
    4,
    3,
    2
  ],
  [
    "guest-chip",
    "TheBurntChip",
    "Chip",
    7,
    14,
    6
  ],
  [
    "guest-jacksucksatlife",
    "JackSucksAtLife",
    "Jack",
    5,
    7,
    7
  ],
  [
    "guest-louu",
    "Louu",
    "Lou",
    2,
    null,
    null
  ],
  [
    "guest-theburntpeanut",
    "TheBurntPeanut",
    "Peanut",
    2,
    null,
    null
  ],
  [
    "guest-georgeclarkey",
    "George Clarkey",
    "George",
    6,
    25,
    9
  ],
  [
    "guest-lachlan",
    "Lachlan",
    "Lachlan",
    50,
    158,
    60
  ],
  [
    "guest-viz",
    "VizuaLizah",
    "Viz",
    42,
    158,
    75
  ],
  [
    "guest-pieface",
    "PieFace",
    "Pie",
    23,
    79,
    36
  ],
  [
    "guest-jme",
    "JME",
    "JME",
    15,
    35,
    18
  ],
  [
    "guest-callux",
    "Callux",
    "Callux",
    8,
    34,
    16
  ],
  [
    "guest-chrismd",
    "ChrisMD",
    "Chris",
    14,
    34,
    13
  ],
  [
    "guest-maxfosh",
    "Max Fosh",
    "Max",
    7,
    32,
    15
  ],
  [
    "guest-arthurtv",
    "ArthurTV",
    "Arthur",
    4,
    22,
    10
  ],
  [
    "guest-willne",
    "WillNE",
    "Will",
    6,
    20,
    10
  ],
  [
    "guest-theo",
    "Theo Baker",
    "Theo",
    8,
    18,
    7
  ],
  [
    "guest-memeulous",
    "Memeulous",
    "Memeulous",
    2,
    null,
    null
  ]
];
export const completeRosters = [
  {
    "date": "2025-12-09",
    "title": "Tomahawk role",
    "ids": [
      "josh",
      "vik",
      "ethan",
      "tobi",
      "lazar",
      "guest-calfreezy",
      "guest-courage",
      "guest-ab",
      "guest-ninja",
      "guest-dannyaarons",
      "guest-chip"
    ],
    "source": "https://sidemen.fandom.com/wiki/Among_Us"
  },
  {
    "date": "2025-12-18",
    "title": "Peanut role",
    "ids": [
      "simon",
      "josh",
      "vik",
      "ethan",
      "harry",
      "jj",
      "guest-jacksucksatlife",
      "deji",
      "guest-louu",
      "guest-theburntpeanut"
    ],
    "source": "https://sidemen.fandom.com/wiki/Among_Us"
  },
  {
    "date": "2025-12-23",
    "title": "Dumper role",
    "ids": [
      "simon",
      "josh",
      "vik",
      "ethan",
      "harry",
      "jj",
      "guest-jacksucksatlife",
      "deji",
      "guest-louu",
      "guest-theburntpeanut"
    ],
    "source": "https://sidemen.fandom.com/wiki/Among_Us"
  }
];
export const partialRosters = [
  {
    "date": "2026-02-16",
    "title": "Among Us is back",
    "ids": [
      "jj",
      "vik",
      "tobi",
      "ethan",
      "josh",
      "guest-ninja",
      "guest-calfreezy",
      "guest-dannyaarons",
      "guest-courage",
      "guest-chip",
      "guest-georgeclarkey",
      "guest-ab"
    ],
    "source": "https://sidemen.fandom.com/wiki/Among_Us",
    "video": "https://www.youtube.com/watch?v=w50J1jWfC2o",
    "additionalSource": "https://www.reddit.com/r/Sidemen/comments/1r6j00f/finally_new_among_us/",
    "note": "Wiki roster and independent AB appearance evidence disagree; union is positive evidence only, not a complete cast."
  },
  {
    "date": "2026-05-09",
    "ids": [
      "jj",
      "simon",
      "josh",
      "vik",
      "guest-georgeclarkey"
    ],
    "source": "https://www.cockatoo.com/content/miniminter-reacts-to-sidemen-among-us-15-man-special-ultra-chaos-mode"
  },
  {
    "date": "2026-11-02",
    "ids": [
      "lazar",
      "harry",
      "guest-chip",
      "tobi",
      "guest-dannyaarons",
      "simon",
      "ethan",
      "guest-lachlan",
      "guest-georgeclarkey",
      "josh"
    ],
    "source": "https://trari.com/en/story/moresidemen-25182/",
    "note": "Recap names these participants; Chipfat is treated as Chip's alias per research. Not assumed to be complete."
  }
];
export const uncheckedEpisodes = [
  [
    "2026-02-16",
    "Among Us is back (conflicting cast sources)"
  ],
  [
    "2026-03-21",
    "Explosive episode"
  ],
  [
    "2026-04-08",
    "Harry Potter edition"
  ],
  [
    "2026-04-25",
    "Unknown impostor teammate"
  ],
  [
    "2026-05-09",
    "15-player ultra chaos"
  ],
  [
    "2026-05-30",
    "Harry Potter chaos"
  ],
  [
    "2026-06-13",
    "World Cup edition"
  ],
  [
    "2026-07-11",
    "Ultimate draft mode"
  ],
  [
    "2026-08-15",
    "Report a body and die"
  ],
  [
    "2026-09-01",
    "Buy power ups"
  ],
  [
    "2026-09-19",
    "Everything on fire"
  ],
  [
    "2026-10-03",
    "Megamind role"
  ],
  [
    "2026-11-02",
    "Impostor chat returns"
  ],
  [
    "2026-11-21",
    "GTA 6 edition"
  ]
];
// Dated positive evidence without a verified exact episode upload date.
export const individualAppearanceEvidence = [
  {
    "id": "guest-viz",
    "date": "2026-08-18",
    "source": "https://www.youtube.com/watch?v=KBDQTXZQIAs",
    "note": "Creator's return video publication date, not the exact MoreSidemen upload date."
  },
  {
    "id": "guest-viz",
    "date": "2026-10-04",
    "source": "https://www.reddit.com/r/Sidemen/comments/1wxfaig/bro_that_head_was_getting_mad_viz_another_fav/",
    "note": "Date of discussion about the head-grows-and-explodes episode, not the exact upload date."
  }
];
export const rankingSources = {
  "tierList": "https://www.reddit.com/r/Sidemen/comments/1vraybu/sidemen_among_us_tier_list_with_comments/",
  "mayRanking": "https://www.reddit.com/r/Sidemen/comments/1t978vn/new_among_us_ranking/",
  "rolePoll": "https://www.reddit.com/r/Sidemen/comments/1q2vueo/tobi_wins_who_is_a_good_crewmate_and_an_elite/",
  "roleDiscussion": "https://www.reddit.com/r/Sidemen/comments/1q94287/behz_and_harry_have_been_swapped_lachlan_has_also/",
  "febDiscussion": "https://www.reddit.com/r/Sidemen/comments/1r6j00f/finally_new_among_us/"
};
export const vetoedIds = new Set(['jj', 'ellum']);
// The research report's proposed weights are design guidance, not a fitted model.
export const pricingWeights = { communitySkill: 0.45, appearance: 0.30, performanceProxy: 0.25 };
// Explicit, reviewable research recommendations (not calculated fantasy points).
// [canonical ID, price in millions, community skill tier, appearance assessment, uncertainty]
export const priceRecommendations = [
  [
    "simon",
    19,
    "S",
    "high",
    "low"
  ],
  [
    "lazar",
    18,
    "S",
    "high/recent",
    "low"
  ],
  [
    "vik",
    16.5,
    "A",
    "high",
    "low"
  ],
  [
    "guest-viz",
    15.5,
    "S/A",
    "medium",
    "medium"
  ],
  [
    "tobi",
    15,
    "A/B (disputed)",
    "high",
    "medium"
  ],
  [
    "josh",
    13.5,
    "B",
    "high",
    "low"
  ],
  [
    "deji",
    13.5,
    "B (improving)",
    "medium-high",
    "medium"
  ],
  [
    "harry",
    13,
    "C/B",
    "high",
    "medium"
  ],
  [
    "ethan",
    12.5,
    "C/B",
    "high",
    "medium"
  ],
  [
    "guest-dannyaarons",
    11,
    "C",
    "medium-high",
    "medium"
  ],
  [
    "guest-ab",
    10.5,
    "C",
    "medium",
    "high"
  ],
  [
    "guest-georgeclarkey",
    10,
    "C",
    "medium",
    "medium"
  ],
  [
    "guest-lachlan",
    9.5,
    "D/C",
    "medium-high",
    "medium"
  ],
  [
    "guest-calfreezy",
    9,
    "C",
    "medium",
    "medium"
  ],
  [
    "guest-jacksucksatlife",
    8.5,
    "C",
    "low-medium",
    "high"
  ],
  [
    "guest-ninja",
    8.5,
    null,
    "low",
    "high"
  ],
  [
    "guest-courage",
    8,
    null,
    "low",
    "high"
  ],
  [
    "guest-chip",
    7.5,
    "F/D",
    "medium",
    "medium"
  ],
  [
    "guest-louu",
    7,
    null,
    "low",
    "high"
  ],
  [
    "guest-theburntpeanut",
    6.5,
    null,
    "low",
    "very high"
  ]
];
const priceById = new Map(priceRecommendations.map(([id, price, skill, appearance, uncertainty]) => [
  String(id), { price: Number(price), communitySkill: skill == null ? null : String(skill), appearance: String(appearance), uncertainty: String(uncertainty) },
]));
export function marketRecord(row) {
  const [id, name, tag, appearances, rounds, wins] = row;
  const recent = completeRosters.filter((e) => e.ids.includes(id));
  const partial = partialRosters.filter((e) => e.ids.includes(id));
  const individual = individualAppearanceEvidence.filter((e) => e.id === id);
  const latest = [...recent, ...partial].map((e) => e.date).sort().at(-1) ?? null;
  const latestEvidenceDate = [...recent, ...partial, ...individual].map((e) => e.date).sort().at(-1) ?? null;
  const recommendation = priceById.get(String(id));
  const vetoed = vetoedIds.has(String(id));
  const eligible = !vetoed && latestEvidenceDate !== null && recommendation !== undefined;
  return {
    id: String(id), name: String(name), tag: String(tag),
    careerAppearances: Number(appearances),
    rounds: rounds == null ? null : Number(rounds),
    wins: wins == null ? null : Number(wins),
    recentCount: recent.length, reviewedCount: completeRosters.length,
    latestConfirmed: latest, latestEvidenceDate, eligible, vetoed,
    exclusionReason: vetoed ? 'owner_veto' : eligible ? null : 'recent_appearance_unverified',
    price: eligible ? recommendation?.price ?? null : null,
    communitySkill: recommendation?.communitySkill ?? null,
    appearanceAssessment: recommendation?.appearance ?? null,
    priceUncertainty: recommendation?.uncertainty ?? null,
  };
}
