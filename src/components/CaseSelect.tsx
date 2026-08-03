import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CaseRow } from "@/hooks/useCases";

export function CaseSelect({
  cases,
  value,
  onChange,
}: {
  cases: CaseRow[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  if (cases.length <= 1) return null;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a case" />
      </SelectTrigger>
      <SelectContent>
        {cases.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.reference} · {c.status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function EmptyCase({ what }: { what: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
      <p className="font-display text-lg">No active case yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {what} becomes available once a match is accepted and your case is opened.
      </p>
    </div>
  );
}
