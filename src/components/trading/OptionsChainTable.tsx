
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ContractRow } from "./types";

export interface OptionsChainTableProps {
  contracts: ContractRow[];
  loading: boolean;
  onSelectContract?: (contract: ContractRow) => void;
}

const OptionsChainTable: React.FC<OptionsChainTableProps> = ({
  contracts,
  loading,
  onSelectContract,
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Type</TableHead>
        <TableHead>Strike</TableHead>
        <TableHead>Bid</TableHead>
        <TableHead>Ask</TableHead>
        <TableHead>Volume</TableHead>
        <TableHead>Open Int</TableHead>
        <TableHead>IV</TableHead>
        <TableHead>PMP</TableHead>
        <TableHead>POP</TableHead>
        <TableHead>Expiry</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={11} className="text-center py-5">Loading live contracts...</TableCell>
        </TableRow>
      ) : (
        contracts.map((c, idx) => (
          <TableRow key={idx} className={c.type === "Call" ? "bg-blue-50" : "bg-pink-50"}>
            <TableCell className="font-medium">{c.type}</TableCell>
            <TableCell>{c.strike}</TableCell>
            <TableCell>${c.bid.toFixed(2)}</TableCell>
            <TableCell>${c.ask.toFixed(2)}</TableCell>
            <TableCell>{c.volume}</TableCell>
            <TableCell>{c.openInterest}</TableCell>
            <TableCell>{(c.iv * 100).toFixed(1)}%</TableCell>
            <TableCell>{(c.pmp * 100).toFixed(0)}%</TableCell>
            <TableCell>{(c.pop * 100).toFixed(0)}%</TableCell>
            <TableCell>{c.expiry}</TableCell>
            <TableCell>
              {onSelectContract && (
                <Button size="sm" variant="ghost" onClick={() => onSelectContract(c)}>
                  Select
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

export default OptionsChainTable;
