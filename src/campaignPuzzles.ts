import type { Puzzle } from './types';

/**
 * KnightShift Journey: 120 curated progression levels.
 *
 * These are fixed, BFS-verified templates sorted by optimal solution length.
 * The generator remains available separately as Custom Puzzle; the main game
 * path uses this deterministic roadmap so progress feels intentional.
 */
export const CAMPAIGN_PUZZLES: Puzzle[] = [
  {
    "id": "campaign-001",
    "name": "Level 1: The Fork",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 4,
    "verifiedOptimalMoves": 4,
    "verificationStatus": "confirmed",
    "campaignLevel": 1,
    "campaignZone": "Academy",
    "campaignXp": 41,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d2",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-002",
    "name": "Level 2: The Bridge",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 5,
    "verifiedOptimalMoves": 5,
    "verificationStatus": "confirmed",
    "campaignLevel": 2,
    "campaignZone": "Academy",
    "campaignXp": 52,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-003",
    "name": "Level 3: The Gate",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 5,
    "verifiedOptimalMoves": 5,
    "verificationStatus": "confirmed",
    "campaignLevel": 3,
    "campaignZone": "Academy",
    "campaignXp": 53,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-004",
    "name": "Level 4: The Spire",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 6,
    "verifiedOptimalMoves": 6,
    "verificationStatus": "confirmed",
    "campaignLevel": 4,
    "campaignZone": "Academy",
    "campaignXp": 64,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b2",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c1"
        ]
      }
    ]
  },
  {
    "id": "campaign-005",
    "name": "Level 5: The Orbit",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 7,
    "verifiedOptimalMoves": 7,
    "verificationStatus": "confirmed",
    "campaignLevel": 5,
    "campaignZone": "Academy",
    "campaignXp": 75,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-006",
    "name": "Level 6: The Mirror",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 7,
    "verifiedOptimalMoves": 7,
    "verificationStatus": "confirmed",
    "campaignLevel": 6,
    "campaignZone": "Academy",
    "campaignXp": 76,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-007",
    "name": "Level 7: The Crown",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 8,
    "verifiedOptimalMoves": 8,
    "verificationStatus": "confirmed",
    "campaignLevel": 7,
    "campaignZone": "Academy",
    "campaignXp": 87,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-008",
    "name": "Level 8: The Relay",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 9,
    "verifiedOptimalMoves": 9,
    "verificationStatus": "confirmed",
    "campaignLevel": 8,
    "campaignZone": "Academy",
    "campaignXp": 98,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "a1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c3",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-009",
    "name": "Level 9: The Anchor",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 10,
    "verifiedOptimalMoves": 10,
    "verificationStatus": "confirmed",
    "campaignLevel": 9,
    "campaignZone": "Academy",
    "campaignXp": 109,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c1"
        ]
      }
    ]
  },
  {
    "id": "campaign-010",
    "name": "Level 10: The Nova",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 10,
    "verifiedOptimalMoves": 10,
    "verificationStatus": "confirmed",
    "campaignLevel": 10,
    "campaignZone": "Academy",
    "campaignXp": 110,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-011",
    "name": "Level 11: The Path",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 11,
    "verifiedOptimalMoves": 11,
    "verificationStatus": "confirmed",
    "campaignLevel": 11,
    "campaignZone": "Academy",
    "campaignXp": 121,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-012",
    "name": "Level 12: The Vault",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 12,
    "verifiedOptimalMoves": 12,
    "verificationStatus": "confirmed",
    "campaignLevel": 12,
    "campaignZone": "Academy",
    "campaignXp": 132,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-013",
    "name": "Level 13: The Crescent",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 12,
    "verifiedOptimalMoves": 12,
    "verificationStatus": "confirmed",
    "campaignLevel": 13,
    "campaignZone": "Academy",
    "campaignXp": 133,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b3"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-014",
    "name": "Level 14: The Beacon",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 13,
    "verifiedOptimalMoves": 13,
    "verificationStatus": "confirmed",
    "campaignLevel": 14,
    "campaignZone": "Academy",
    "campaignXp": 144,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-015",
    "name": "Level 15: The Switch",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 14,
    "verifiedOptimalMoves": 14,
    "verificationStatus": "confirmed",
    "campaignLevel": 15,
    "campaignZone": "Academy",
    "campaignXp": 155,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b3"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b2",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-016",
    "name": "Level 16: The Prism",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 14,
    "verifiedOptimalMoves": 14,
    "verificationStatus": "confirmed",
    "campaignLevel": 16,
    "campaignZone": "Academy",
    "campaignXp": 156,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-017",
    "name": "Level 17: The Apex",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 15,
    "verifiedOptimalMoves": 15,
    "verificationStatus": "confirmed",
    "campaignLevel": 17,
    "campaignZone": "Academy",
    "campaignXp": 167,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-018",
    "name": "Level 18: The Harbor",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 16,
    "verifiedOptimalMoves": 16,
    "verificationStatus": "confirmed",
    "campaignLevel": 18,
    "campaignZone": "Academy",
    "campaignXp": 178,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-019",
    "name": "Level 19: The Compass",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 17,
    "verifiedOptimalMoves": 17,
    "verificationStatus": "confirmed",
    "campaignLevel": 19,
    "campaignZone": "Academy",
    "campaignXp": 189,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-020",
    "name": "Level 20: The Rift",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 17,
    "verifiedOptimalMoves": 17,
    "verificationStatus": "confirmed",
    "campaignLevel": 20,
    "campaignZone": "Academy",
    "campaignXp": 190,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "c1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-021",
    "name": "Level 21: The Lattice",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 18,
    "verifiedOptimalMoves": 18,
    "verificationStatus": "confirmed",
    "campaignLevel": 21,
    "campaignZone": "Academy",
    "campaignXp": 201,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "d1"
        ]
      }
    ]
  },
  {
    "id": "campaign-022",
    "name": "Level 22: The Vector",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 19,
    "verifiedOptimalMoves": 19,
    "verificationStatus": "confirmed",
    "campaignLevel": 22,
    "campaignZone": "Academy",
    "campaignXp": 212,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-023",
    "name": "Level 23: The Pulse",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 19,
    "verifiedOptimalMoves": 19,
    "verificationStatus": "confirmed",
    "campaignLevel": 23,
    "campaignZone": "Academy",
    "campaignXp": 213,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b3",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-024",
    "name": "Level 24: The Summit",
    "mode": "no-turns",
    "difficulty": "Easy",
    "optimalMoves": 20,
    "verifiedOptimalMoves": 20,
    "verificationStatus": "confirmed",
    "campaignLevel": 24,
    "campaignZone": "Academy",
    "campaignXp": 224,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "c1"
        ]
      }
    ]
  },
  {
    "id": "campaign-025",
    "name": "Level 25: The Halo",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 21,
    "verifiedOptimalMoves": 21,
    "verificationStatus": "confirmed",
    "campaignLevel": 25,
    "campaignZone": "Crossroads",
    "campaignXp": 235,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b2",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "c1"
        ]
      }
    ]
  },
  {
    "id": "campaign-026",
    "name": "Level 26: The Cipher",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 21,
    "verifiedOptimalMoves": 21,
    "verificationStatus": "confirmed",
    "campaignLevel": 26,
    "campaignZone": "Crossroads",
    "campaignXp": 236,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c3"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-027",
    "name": "Level 27: The Keystone",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 22,
    "verifiedOptimalMoves": 22,
    "verificationStatus": "confirmed",
    "campaignLevel": 27,
    "campaignZone": "Crossroads",
    "campaignXp": 247,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "d1"
        ]
      }
    ]
  },
  {
    "id": "campaign-028",
    "name": "Level 28: The Monolith",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 22,
    "verifiedOptimalMoves": 22,
    "verificationStatus": "confirmed",
    "campaignLevel": 28,
    "campaignZone": "Crossroads",
    "campaignXp": 248,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b3"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-029",
    "name": "Level 29: The Parallax",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 22,
    "verifiedOptimalMoves": 22,
    "verificationStatus": "confirmed",
    "campaignLevel": 29,
    "campaignZone": "Crossroads",
    "campaignXp": 249,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b3"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-030",
    "name": "Level 30: The Zenith",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 23,
    "verifiedOptimalMoves": 23,
    "verificationStatus": "confirmed",
    "campaignLevel": 30,
    "campaignZone": "Crossroads",
    "campaignXp": 260,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-031",
    "name": "Level 31: The Fork",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 23,
    "verifiedOptimalMoves": 23,
    "verificationStatus": "confirmed",
    "campaignLevel": 31,
    "campaignZone": "Crossroads",
    "campaignXp": 261,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-032",
    "name": "Level 32: The Bridge",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 23,
    "verifiedOptimalMoves": 23,
    "verificationStatus": "confirmed",
    "campaignLevel": 32,
    "campaignZone": "Crossroads",
    "campaignXp": 262,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d2",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-033",
    "name": "Level 33: The Gate",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 24,
    "verifiedOptimalMoves": 24,
    "verificationStatus": "confirmed",
    "campaignLevel": 33,
    "campaignZone": "Crossroads",
    "campaignXp": 273,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b2",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-034",
    "name": "Level 34: The Spire",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 24,
    "verifiedOptimalMoves": 24,
    "verificationStatus": "confirmed",
    "campaignLevel": 34,
    "campaignZone": "Crossroads",
    "campaignXp": 274,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-035",
    "name": "Level 35: The Orbit",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 24,
    "verifiedOptimalMoves": 24,
    "verificationStatus": "confirmed",
    "campaignLevel": 35,
    "campaignZone": "Crossroads",
    "campaignXp": 275,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-036",
    "name": "Level 36: The Mirror",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 24,
    "verifiedOptimalMoves": 24,
    "verificationStatus": "confirmed",
    "campaignLevel": 36,
    "campaignZone": "Crossroads",
    "campaignXp": 276,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-037",
    "name": "Level 37: The Crown",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 25,
    "verifiedOptimalMoves": 25,
    "verificationStatus": "confirmed",
    "campaignLevel": 37,
    "campaignZone": "Crossroads",
    "campaignXp": 287,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-038",
    "name": "Level 38: The Relay",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 25,
    "verifiedOptimalMoves": 25,
    "verificationStatus": "confirmed",
    "campaignLevel": 38,
    "campaignZone": "Crossroads",
    "campaignXp": 288,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c3",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-039",
    "name": "Level 39: The Anchor",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 25,
    "verifiedOptimalMoves": 25,
    "verificationStatus": "confirmed",
    "campaignLevel": 39,
    "campaignZone": "Crossroads",
    "campaignXp": 289,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d2",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "c1"
        ]
      }
    ]
  },
  {
    "id": "campaign-040",
    "name": "Level 40: The Nova",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 26,
    "verifiedOptimalMoves": 26,
    "verificationStatus": "confirmed",
    "campaignLevel": 40,
    "campaignZone": "Crossroads",
    "campaignXp": 300,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c3"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-041",
    "name": "Level 41: The Path",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 26,
    "verifiedOptimalMoves": 26,
    "verificationStatus": "confirmed",
    "campaignLevel": 41,
    "campaignZone": "Crossroads",
    "campaignXp": 301,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-042",
    "name": "Level 42: The Vault",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 26,
    "verifiedOptimalMoves": 26,
    "verificationStatus": "confirmed",
    "campaignLevel": 42,
    "campaignZone": "Crossroads",
    "campaignXp": 302,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-043",
    "name": "Level 43: The Crescent",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 27,
    "verifiedOptimalMoves": 27,
    "verificationStatus": "confirmed",
    "campaignLevel": 43,
    "campaignZone": "Crossroads",
    "campaignXp": 313,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "c1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-044",
    "name": "Level 44: The Beacon",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 27,
    "verifiedOptimalMoves": 27,
    "verificationStatus": "confirmed",
    "campaignLevel": 44,
    "campaignZone": "Crossroads",
    "campaignXp": 314,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-045",
    "name": "Level 45: The Switch",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 27,
    "verifiedOptimalMoves": 27,
    "verificationStatus": "confirmed",
    "campaignLevel": 45,
    "campaignZone": "Crossroads",
    "campaignXp": 315,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-046",
    "name": "Level 46: The Prism",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 28,
    "verifiedOptimalMoves": 28,
    "verificationStatus": "confirmed",
    "campaignLevel": 46,
    "campaignZone": "Crossroads",
    "campaignXp": 326,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-047",
    "name": "Level 47: The Apex",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 28,
    "verifiedOptimalMoves": 28,
    "verificationStatus": "confirmed",
    "campaignLevel": 47,
    "campaignZone": "Crossroads",
    "campaignXp": 327,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "a1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-048",
    "name": "Level 48: The Harbor",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 28,
    "verifiedOptimalMoves": 28,
    "verificationStatus": "confirmed",
    "campaignLevel": 48,
    "campaignZone": "Crossroads",
    "campaignXp": 328,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-049",
    "name": "Level 49: The Compass",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 29,
    "verifiedOptimalMoves": 29,
    "verificationStatus": "confirmed",
    "campaignLevel": 49,
    "campaignZone": "Crossroads",
    "campaignXp": 339,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d1"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b2",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-050",
    "name": "Level 50: The Rift",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 29,
    "verifiedOptimalMoves": 29,
    "verificationStatus": "confirmed",
    "campaignLevel": 50,
    "campaignZone": "Crossroads",
    "campaignXp": 340,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b3",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-051",
    "name": "Level 51: The Lattice",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 29,
    "verifiedOptimalMoves": 29,
    "verificationStatus": "confirmed",
    "campaignLevel": 51,
    "campaignZone": "Crossroads",
    "campaignXp": 341,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b3",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-052",
    "name": "Level 52: The Vector",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 29,
    "verifiedOptimalMoves": 29,
    "verificationStatus": "confirmed",
    "campaignLevel": 52,
    "campaignZone": "Crossroads",
    "campaignXp": 342,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b3",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-053",
    "name": "Level 53: The Pulse",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 30,
    "verifiedOptimalMoves": 30,
    "verificationStatus": "confirmed",
    "campaignLevel": 53,
    "campaignZone": "Crossroads",
    "campaignXp": 353,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b3",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-054",
    "name": "Level 54: The Summit",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 30,
    "verifiedOptimalMoves": 30,
    "verificationStatus": "confirmed",
    "campaignLevel": 54,
    "campaignZone": "Crossroads",
    "campaignXp": 354,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b4"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-055",
    "name": "Level 55: The Halo",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 30,
    "verifiedOptimalMoves": 30,
    "verificationStatus": "confirmed",
    "campaignLevel": 55,
    "campaignZone": "Crossroads",
    "campaignXp": 355,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c1"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-056",
    "name": "Level 56: The Cipher",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 31,
    "verifiedOptimalMoves": 31,
    "verificationStatus": "confirmed",
    "campaignLevel": 56,
    "campaignZone": "Crossroads",
    "campaignXp": 366,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b3"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-057",
    "name": "Level 57: The Keystone",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 31,
    "verifiedOptimalMoves": 31,
    "verificationStatus": "confirmed",
    "campaignLevel": 57,
    "campaignZone": "Crossroads",
    "campaignXp": 367,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-058",
    "name": "Level 58: The Monolith",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 31,
    "verifiedOptimalMoves": 31,
    "verificationStatus": "confirmed",
    "campaignLevel": 58,
    "campaignZone": "Crossroads",
    "campaignXp": 368,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-059",
    "name": "Level 59: The Parallax",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 32,
    "verifiedOptimalMoves": 32,
    "verificationStatus": "confirmed",
    "campaignLevel": 59,
    "campaignZone": "Crossroads",
    "campaignXp": 379,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c1"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-060",
    "name": "Level 60: The Zenith",
    "mode": "no-turns",
    "difficulty": "Medium",
    "optimalMoves": 32,
    "verifiedOptimalMoves": 32,
    "verificationStatus": "confirmed",
    "campaignLevel": 60,
    "campaignZone": "Crossroads",
    "campaignXp": 380,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-061",
    "name": "Level 61: The Fork",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 33,
    "verifiedOptimalMoves": 33,
    "verificationStatus": "confirmed",
    "campaignLevel": 61,
    "campaignZone": "Citadel",
    "campaignXp": 391,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-062",
    "name": "Level 62: The Bridge",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 33,
    "verifiedOptimalMoves": 33,
    "verificationStatus": "confirmed",
    "campaignLevel": 62,
    "campaignZone": "Citadel",
    "campaignXp": 392,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d2",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "d1"
        ]
      }
    ]
  },
  {
    "id": "campaign-063",
    "name": "Level 63: The Gate",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 34,
    "verifiedOptimalMoves": 34,
    "verificationStatus": "confirmed",
    "campaignLevel": 63,
    "campaignZone": "Citadel",
    "campaignXp": 403,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-064",
    "name": "Level 64: The Spire",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 34,
    "verifiedOptimalMoves": 34,
    "verificationStatus": "confirmed",
    "campaignLevel": 64,
    "campaignZone": "Citadel",
    "campaignXp": 404,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d2",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-065",
    "name": "Level 65: The Orbit",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 34,
    "verifiedOptimalMoves": 34,
    "verificationStatus": "confirmed",
    "campaignLevel": 65,
    "campaignZone": "Citadel",
    "campaignXp": 405,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b4"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "c2"
        ]
      }
    ]
  },
  {
    "id": "campaign-066",
    "name": "Level 66: The Mirror",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 35,
    "verifiedOptimalMoves": 35,
    "verificationStatus": "confirmed",
    "campaignLevel": 66,
    "campaignZone": "Citadel",
    "campaignXp": 416,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-067",
    "name": "Level 67: The Crown",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 35,
    "verifiedOptimalMoves": 35,
    "verificationStatus": "confirmed",
    "campaignLevel": 67,
    "campaignZone": "Citadel",
    "campaignXp": 417,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-068",
    "name": "Level 68: The Relay",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 35,
    "verifiedOptimalMoves": 35,
    "verificationStatus": "confirmed",
    "campaignLevel": 68,
    "campaignZone": "Citadel",
    "campaignXp": 418,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "d1"
        ]
      }
    ]
  },
  {
    "id": "campaign-069",
    "name": "Level 69: The Anchor",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 36,
    "verifiedOptimalMoves": 36,
    "verificationStatus": "confirmed",
    "campaignLevel": 69,
    "campaignZone": "Citadel",
    "campaignXp": 429,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b3",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-070",
    "name": "Level 70: The Nova",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 36,
    "verifiedOptimalMoves": 36,
    "verificationStatus": "confirmed",
    "campaignLevel": 70,
    "campaignZone": "Citadel",
    "campaignXp": 430,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b4"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-071",
    "name": "Level 71: The Path",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 36,
    "verifiedOptimalMoves": 36,
    "verificationStatus": "confirmed",
    "campaignLevel": 71,
    "campaignZone": "Citadel",
    "campaignXp": 431,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-072",
    "name": "Level 72: The Vault",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 36,
    "verifiedOptimalMoves": 36,
    "verificationStatus": "confirmed",
    "campaignLevel": 72,
    "campaignZone": "Citadel",
    "campaignXp": 432,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-073",
    "name": "Level 73: The Crescent",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 37,
    "verifiedOptimalMoves": 37,
    "verificationStatus": "confirmed",
    "campaignLevel": 73,
    "campaignZone": "Citadel",
    "campaignXp": 443,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-074",
    "name": "Level 74: The Beacon",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 37,
    "verifiedOptimalMoves": 37,
    "verificationStatus": "confirmed",
    "campaignLevel": 74,
    "campaignZone": "Citadel",
    "campaignXp": 444,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "c1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-075",
    "name": "Level 75: The Switch",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 37,
    "verifiedOptimalMoves": 37,
    "verificationStatus": "confirmed",
    "campaignLevel": 75,
    "campaignZone": "Citadel",
    "campaignXp": 445,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-076",
    "name": "Level 76: The Prism",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 38,
    "verifiedOptimalMoves": 38,
    "verificationStatus": "confirmed",
    "campaignLevel": 76,
    "campaignZone": "Citadel",
    "campaignXp": 456,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-077",
    "name": "Level 77: The Apex",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 38,
    "verifiedOptimalMoves": 38,
    "verificationStatus": "confirmed",
    "campaignLevel": 77,
    "campaignZone": "Citadel",
    "campaignXp": 457,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c2",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-078",
    "name": "Level 78: The Harbor",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 38,
    "verifiedOptimalMoves": 38,
    "verificationStatus": "confirmed",
    "campaignLevel": 78,
    "campaignZone": "Citadel",
    "campaignXp": 458,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-079",
    "name": "Level 79: The Compass",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 39,
    "verifiedOptimalMoves": 39,
    "verificationStatus": "confirmed",
    "campaignLevel": 79,
    "campaignZone": "Citadel",
    "campaignXp": 469,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d2",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-080",
    "name": "Level 80: The Rift",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 39,
    "verifiedOptimalMoves": 39,
    "verificationStatus": "confirmed",
    "campaignLevel": 80,
    "campaignZone": "Citadel",
    "campaignXp": 470,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-081",
    "name": "Level 81: The Lattice",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 39,
    "verifiedOptimalMoves": 39,
    "verificationStatus": "confirmed",
    "campaignLevel": 81,
    "campaignZone": "Citadel",
    "campaignXp": 471,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "d1"
        ]
      }
    ]
  },
  {
    "id": "campaign-082",
    "name": "Level 82: The Vector",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 40,
    "verifiedOptimalMoves": 40,
    "verificationStatus": "confirmed",
    "campaignLevel": 82,
    "campaignZone": "Citadel",
    "campaignXp": 482,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-083",
    "name": "Level 83: The Pulse",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 40,
    "verifiedOptimalMoves": 40,
    "verificationStatus": "confirmed",
    "campaignLevel": 83,
    "campaignZone": "Citadel",
    "campaignXp": 483,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-084",
    "name": "Level 84: The Summit",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 40,
    "verifiedOptimalMoves": 40,
    "verificationStatus": "confirmed",
    "campaignLevel": 84,
    "campaignZone": "Citadel",
    "campaignXp": 484,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-085",
    "name": "Level 85: The Halo",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 41,
    "verifiedOptimalMoves": 41,
    "verificationStatus": "confirmed",
    "campaignLevel": 85,
    "campaignZone": "Citadel",
    "campaignXp": 495,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "a1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-086",
    "name": "Level 86: The Cipher",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 41,
    "verifiedOptimalMoves": 41,
    "verificationStatus": "confirmed",
    "campaignLevel": 86,
    "campaignZone": "Citadel",
    "campaignXp": 496,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b3",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-087",
    "name": "Level 87: The Keystone",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 41,
    "verifiedOptimalMoves": 41,
    "verificationStatus": "confirmed",
    "campaignLevel": 87,
    "campaignZone": "Citadel",
    "campaignXp": 497,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-088",
    "name": "Level 88: The Monolith",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 41,
    "verifiedOptimalMoves": 41,
    "verificationStatus": "confirmed",
    "campaignLevel": 88,
    "campaignZone": "Citadel",
    "campaignXp": 498,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-089",
    "name": "Level 89: The Parallax",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 42,
    "verifiedOptimalMoves": 42,
    "verificationStatus": "confirmed",
    "campaignLevel": 89,
    "campaignZone": "Citadel",
    "campaignXp": 509,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "a1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c1"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-090",
    "name": "Level 90: The Zenith",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 42,
    "verifiedOptimalMoves": 42,
    "verificationStatus": "confirmed",
    "campaignLevel": 90,
    "campaignZone": "Citadel",
    "campaignXp": 510,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c1"
        ]
      }
    ]
  },
  {
    "id": "campaign-091",
    "name": "Level 91: The Fork",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 42,
    "verifiedOptimalMoves": 42,
    "verificationStatus": "confirmed",
    "campaignLevel": 91,
    "campaignZone": "Citadel",
    "campaignXp": 511,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "a1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-092",
    "name": "Level 92: The Bridge",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 43,
    "verifiedOptimalMoves": 43,
    "verificationStatus": "confirmed",
    "campaignLevel": 92,
    "campaignZone": "Citadel",
    "campaignXp": 522,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-093",
    "name": "Level 93: The Gate",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 43,
    "verifiedOptimalMoves": 43,
    "verificationStatus": "confirmed",
    "campaignLevel": 93,
    "campaignZone": "Citadel",
    "campaignXp": 523,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-094",
    "name": "Level 94: The Spire",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 43,
    "verifiedOptimalMoves": 43,
    "verificationStatus": "confirmed",
    "campaignLevel": 94,
    "campaignZone": "Citadel",
    "campaignXp": 524,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "c2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c1",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-095",
    "name": "Level 95: The Orbit",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 44,
    "verifiedOptimalMoves": 44,
    "verificationStatus": "confirmed",
    "campaignLevel": 95,
    "campaignZone": "Citadel",
    "campaignXp": 535,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "a1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-096",
    "name": "Level 96: The Mirror",
    "mode": "no-turns",
    "difficulty": "Hard",
    "optimalMoves": 44,
    "verifiedOptimalMoves": 44,
    "verificationStatus": "confirmed",
    "campaignLevel": 96,
    "campaignZone": "Citadel",
    "campaignXp": 536,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "c1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-097",
    "name": "Level 97: The Crown",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 45,
    "verifiedOptimalMoves": 45,
    "verificationStatus": "confirmed",
    "campaignLevel": 97,
    "campaignZone": "Labyrinth",
    "campaignXp": 547,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "a1",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-098",
    "name": "Level 98: The Relay",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 46,
    "verifiedOptimalMoves": 46,
    "verificationStatus": "confirmed",
    "campaignLevel": 98,
    "campaignZone": "Labyrinth",
    "campaignXp": 558,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "d2"
        ]
      }
    ]
  },
  {
    "id": "campaign-099",
    "name": "Level 99: The Anchor",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 46,
    "verifiedOptimalMoves": 46,
    "verificationStatus": "confirmed",
    "campaignLevel": 99,
    "campaignZone": "Labyrinth",
    "campaignXp": 559,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b4"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "b4"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-100",
    "name": "Level 100: The Nova",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 47,
    "verifiedOptimalMoves": 47,
    "verificationStatus": "confirmed",
    "campaignLevel": 100,
    "campaignZone": "Labyrinth",
    "campaignXp": 570,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "b3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-101",
    "name": "Level 101: The Path",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 48,
    "verifiedOptimalMoves": 48,
    "verificationStatus": "confirmed",
    "campaignLevel": 101,
    "campaignZone": "Labyrinth",
    "campaignXp": 581,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-102",
    "name": "Level 102: The Vault",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 48,
    "verifiedOptimalMoves": 48,
    "verificationStatus": "confirmed",
    "campaignLevel": 102,
    "campaignZone": "Labyrinth",
    "campaignXp": 582,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "c1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-103",
    "name": "Level 103: The Crescent",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 49,
    "verifiedOptimalMoves": 49,
    "verificationStatus": "confirmed",
    "campaignLevel": 103,
    "campaignZone": "Labyrinth",
    "campaignXp": 593,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "c3",
          "b4"
        ]
      }
    ]
  },
  {
    "id": "campaign-104",
    "name": "Level 104: The Beacon",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 50,
    "verifiedOptimalMoves": 50,
    "verificationStatus": "confirmed",
    "campaignLevel": 104,
    "campaignZone": "Labyrinth",
    "campaignXp": 604,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "a1",
          "b1"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-105",
    "name": "Level 105: The Switch",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 50,
    "verifiedOptimalMoves": 50,
    "verificationStatus": "confirmed",
    "campaignLevel": 105,
    "campaignZone": "Labyrinth",
    "campaignXp": 605,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-106",
    "name": "Level 106: The Prism",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 51,
    "verifiedOptimalMoves": 51,
    "verificationStatus": "confirmed",
    "campaignLevel": 106,
    "campaignZone": "Labyrinth",
    "campaignXp": 616,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "d2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-107",
    "name": "Level 107: The Apex",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 52,
    "verifiedOptimalMoves": 52,
    "verificationStatus": "confirmed",
    "campaignLevel": 107,
    "campaignZone": "Labyrinth",
    "campaignXp": 627,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "c1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d2",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-108",
    "name": "Level 108: The Harbor",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 53,
    "verifiedOptimalMoves": 53,
    "verificationStatus": "confirmed",
    "campaignLevel": 108,
    "campaignZone": "Labyrinth",
    "campaignXp": 638,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b3",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-109",
    "name": "Level 109: The Compass",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 53,
    "verifiedOptimalMoves": 53,
    "verificationStatus": "confirmed",
    "campaignLevel": 109,
    "campaignZone": "Labyrinth",
    "campaignXp": 639,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "b3"
        ]
      }
    ]
  },
  {
    "id": "campaign-110",
    "name": "Level 110: The Rift",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 54,
    "verifiedOptimalMoves": 54,
    "verificationStatus": "confirmed",
    "campaignLevel": 110,
    "campaignZone": "Labyrinth",
    "campaignXp": 650,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "d2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-111",
    "name": "Level 111: The Lattice",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 54,
    "verifiedOptimalMoves": 54,
    "verificationStatus": "confirmed",
    "campaignLevel": 111,
    "campaignZone": "Labyrinth",
    "campaignXp": 651,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b3"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-112",
    "name": "Level 112: The Vector",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 54,
    "verifiedOptimalMoves": 54,
    "verificationStatus": "confirmed",
    "campaignLevel": 112,
    "campaignZone": "Labyrinth",
    "campaignXp": 652,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b3",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-113",
    "name": "Level 113: The Pulse",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 54,
    "verifiedOptimalMoves": 54,
    "verificationStatus": "confirmed",
    "campaignLevel": 113,
    "campaignZone": "Labyrinth",
    "campaignXp": 653,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-114",
    "name": "Level 114: The Summit",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 54,
    "verifiedOptimalMoves": 54,
    "verificationStatus": "confirmed",
    "campaignLevel": 114,
    "campaignZone": "Labyrinth",
    "campaignXp": 654,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b3"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-115",
    "name": "Level 115: The Halo",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 55,
    "verifiedOptimalMoves": 55,
    "verificationStatus": "confirmed",
    "campaignLevel": 115,
    "campaignZone": "Labyrinth",
    "campaignXp": 665,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d2",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-116",
    "name": "Level 116: The Cipher",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 55,
    "verifiedOptimalMoves": 55,
    "verificationStatus": "confirmed",
    "campaignLevel": 116,
    "campaignZone": "Labyrinth",
    "campaignXp": 666,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d2"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  },
  {
    "id": "campaign-117",
    "name": "Level 117: The Keystone",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 55,
    "verifiedOptimalMoves": 55,
    "verificationStatus": "confirmed",
    "campaignLevel": 117,
    "campaignZone": "Labyrinth",
    "campaignXp": 667,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d2",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-118",
    "name": "Level 118: The Monolith",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 55,
    "verifiedOptimalMoves": 55,
    "verificationStatus": "confirmed",
    "campaignLevel": 118,
    "campaignZone": "Labyrinth",
    "campaignXp": 668,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d2"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-119",
    "name": "Level 119: The Parallax",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 56,
    "verifiedOptimalMoves": 56,
    "verificationStatus": "confirmed",
    "campaignLevel": 119,
    "campaignZone": "Labyrinth",
    "campaignXp": 679,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "b1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "c3"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "d1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "b2"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "d1",
          "b2"
        ]
      },
      {
        "color": "black",
        "cells": [
          "b1",
          "c3"
        ]
      }
    ]
  },
  {
    "id": "campaign-120",
    "name": "Level 120: The Zenith",
    "mode": "no-turns",
    "difficulty": "Very Hard",
    "optimalMoves": 56,
    "verifiedOptimalMoves": 56,
    "verificationStatus": "confirmed",
    "campaignLevel": 120,
    "campaignZone": "Labyrinth",
    "campaignXp": 680,
    "cells": [
      "a1",
      "b1",
      "c1",
      "d1",
      "b2",
      "c2",
      "d2",
      "b3",
      "c3",
      "b4"
    ],
    "initialPieces": [
      {
        "id": "W1",
        "color": "white",
        "cell": "d1"
      },
      {
        "id": "W2",
        "color": "white",
        "cell": "b2"
      },
      {
        "id": "B1",
        "color": "black",
        "cell": "b1"
      },
      {
        "id": "B2",
        "color": "black",
        "cell": "c3"
      }
    ],
    "goalPieces": [
      {
        "color": "white",
        "cells": [
          "b1",
          "c3"
        ]
      },
      {
        "color": "black",
        "cells": [
          "d1",
          "b2"
        ]
      }
    ]
  }
];

export const CAMPAIGN_TOTAL_LEVELS = CAMPAIGN_PUZZLES.length;

export const CAMPAIGN_ZONES = [
  { id: 'Academy', title: 'Academy', range: 'Levels 1–24', description: 'Fast tactical basics and clean knight paths.' },
  { id: 'Crossroads', title: 'Crossroads', range: 'Levels 25–60', description: 'Longer routes, more blocking, fewer obvious moves.' },
  { id: 'Citadel', title: 'Citadel', range: 'Levels 61–96', description: 'Deep optimization puzzles with heavier planning.' },
  { id: 'Labyrinth', title: 'Labyrinth', range: 'Levels 97–120', description: 'Late-game boards with very high move pressure.' },
] as const;

export function getCampaignPuzzle(level: number): Puzzle | undefined {
  return CAMPAIGN_PUZZLES.find(puzzle => puzzle.campaignLevel === level);
}
