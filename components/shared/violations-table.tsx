import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Money } from "@/components/shared/money";
import type { IssuedViolation } from "@/lib/types";

export function ViolationsTable({
  violations,
}: {
  violations: IssuedViolation[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[38%]">Ordinance / Code</TableHead>
          <TableHead>Violation</TableHead>
          <TableHead className="text-right">Basic Fine</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {violations.map((v, i) => (
          <TableRow key={`${v.catalogCode}-${i}`}>
            <TableCell className="align-top whitespace-normal font-mono text-xs text-muted-foreground">
              {v.catalogCode}
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <div className="font-medium text-foreground">{v.title}</div>
              {v.details ? (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {v.details}
                </div>
              ) : null}
            </TableCell>
            <TableCell className="align-top text-right">
              <Money value={v.basicFine} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
