export const PlayerRoundStats = [
    // Round 1: CT win, bomb defused, player1 gets 2 kills
    { 
      winner: "CT", 
      outcome: "bomb-defused", 
      players: [
        { name: "Player1", team: "CT", kills: 2 },
        { name: "Player2", team: "CT", kills: 0 },
        { name: "Player3", team: "T", kills: 1 },
        { name: "Player4", team: "T", kills: 0 },
        { name: "Player5", team: "T", kills: 1 }, 
      ]
    },
    // Round 2: T win, elimination, player4 gets 3 kills
    { 
      winner: "T", 
      outcome: "elimination",
      players: [
        { name: "Player1", team: "CT", kills: 1 },
        { name: "Player2", team: "CT", kills: 1 },
        { name: "Player3", team: "T", kills: 0 },
        { name: "Player4", team: "T", kills: 3 },
        { name: "Player5", team: "T", kills: 0 },
      ]
    },
    // Round 3: CT win, time ran out
    { 
      winner: "CT", 
      outcome: "time-out", // You might need to add this outcome type in your component
      players: [
        { name: "Player1", team: "CT", kills: 0 },
        { name: "Player2", team: "CT", kills: 0 },
        { name: "Player3", team: "T", kills: 0 },
        { name: "Player4", team: "T", kills: 0 },
        { name: "Player5", team: "T", kills: 0 },
      ]
    },
    // Round 4: T win, bomb planted
    {
      winner: "T",
      outcome: "bomb-planted",
      players: [
        // ... Player kill data ...
      ]
    },
    // Round 5: CT win, elimination
    {
      winner: "CT",
      outcome: "elimination",
      players: [
        // ... Player kill data ...
      ]
    },
    // Add more rounds (up to 30) following the same structure
  ];
  