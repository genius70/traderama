
export type OptionType = "Call" | "Put";
export type BuySell = "Buy" | "Sell";

export interface TradingLeg {
  id?: string;
  strike: string;
  type: OptionType;
  expiration: string;
  buySell: BuySell;
  size: number;
  price: string;
  underlying: string;
  epic: string;
}

export interface ContractRow {
  strike: string;
  type: OptionType;
  expiry: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  iv: number;
  pmp: number;
  pop: number;
}
