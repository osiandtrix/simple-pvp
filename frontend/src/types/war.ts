export type War = {
  attacker: string;
  attackerId: number;
  attackerKills: number;
  defender: string;
  defenderId: number;
  defenderKills: number;
  skip?: boolean;
  timestamp?: number;
};

export type Warlist = Array<War>;
